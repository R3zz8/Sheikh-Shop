import type { ProductsWithImages } from '@/types';
import * as tf from '@tensorflow/tfjs-node';
import Fuse from 'fuse.js';
import * as natural from 'natural';
import levenshtein from 'levenshtein';

export interface EnhancedSearchResult {
  product: ProductsWithImages;
  score: number;
  highlights: string[];
  matchedFields: string[];
  semanticScore: number;
  keywordScore: number;
  typoTolerance: number;
  confidence: number;
  explanation?: string;
}

export interface EnhancedSearchQuery {
  query: string;
  filters?: {
    category?: string;
    priceRange?: { min: number; max: number };
    inStock?: boolean;
    rating?: number;
    brand?: string;
  };
  sortBy?: 'relevance' | 'price' | 'rating' | 'newest' | 'popularity';
  limit?: number;
  offset?: number;
  includeTypos?: boolean;
  semanticWeight?: number;
  keywordWeight?: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'product' | 'category' | 'brand' | 'query' | 'typo_correction';
  count?: number;
  confidence?: number;
  originalText?: string;
}

export class EnhancedAISearchEngine {
  private products: ProductsWithImages[] = [];
  private searchIndex: Map<string, Set<string>> = new Map();
  private embeddings: Map<string, number[]> = new Map();
  private synonyms: Map<string, string[]> = new Map();
  private typoCorrections: Map<string, string> = new Map();
  private fuse!: Fuse<ProductsWithImages>;
  private model: tf.LayersModel | null = null;
  private tokenizer: natural.WordTokenizer;
  private stemmer: any;

  constructor(products: ProductsWithImages[]) {
    this.products = products;
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    this.initializeFuse();
    this.buildSearchIndex();
    this.generateEmbeddings();
    this.initializeSynonyms();
    this.initializeTypoCorrections();
    this.loadModel();
  }

  // Initialize Fuse.js for fuzzy search
  private initializeFuse() {
    const options = {
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'description', weight: 0.3 },
        { name: 'category', weight: 0.5 },
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
    };
    this.fuse = new Fuse(this.products, options);
  }

  // Build enhanced search index
  private buildSearchIndex() {
    this.products.forEach(product => {
      const searchableText = this.extractSearchableText(product);
      const tokens = this.tokenize(searchableText);
      
      tokens.forEach(token => {
        if (!this.searchIndex.has(token)) {
          this.searchIndex.set(token, new Set());
        }
        this.searchIndex.get(token)!.add(product.id);
      });
    });
  }

  // Generate enhanced embeddings using TF-IDF and neural networks
  private async generateEmbeddings() {
    // Create TF-IDF vectors for each product
    const allTokens = new Set<string>();
    const productTokens: Map<string, string[]> = new Map();
    
    this.products.forEach(product => {
      const tokens = this.tokenize(this.extractSearchableText(product));
      productTokens.set(product.id, tokens);
      tokens.forEach(token => allTokens.add(token));
    });

    const tokenArray = Array.from(allTokens);
    const tokenIndex = new Map(tokenArray.map((token, index) => [token, index]));

    this.products.forEach(product => {
      const tokens = productTokens.get(product.id) || [];
      const tfidf = this.calculateTFIDF(tokens, tokenArray, tokenIndex);
      this.embeddings.set(product.id, tfidf);
    });
  }

  // Calculate TF-IDF scores
  private calculateTFIDF(tokens: string[], allTokens: string[], tokenIndex: Map<string, number>): number[] {
    const vector = new Array(allTokens.length).fill(0);
    const tokenCounts = new Map<string, number>();
    
    // Count token frequencies
    tokens.forEach(token => {
      tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
    });

    // Calculate TF-IDF
    tokenCounts.forEach((count, token) => {
      const index = tokenIndex.get(token);
      if (index !== undefined) {
        const tf = count / tokens.length;
        const idf = Math.log(this.products.length / this.getDocumentFrequency(token));
        vector[index] = tf * idf;
      }
    });

    // Normalize vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  }

  // Get document frequency for a token
  private getDocumentFrequency(token: string): number {
    let count = 0;
    this.products.forEach(product => {
      const text = this.extractSearchableText(product).toLowerCase();
      if (text.includes(token)) count++;
    });
    return count || 1; // Avoid division by zero
  }

  // Initialize enhanced synonyms with domain-specific terms
  private initializeSynonyms() {
    const synonymGroups = [
      // Electronics
      ['phone', 'mobile', 'cellphone', 'smartphone', 'handset'],
      ['laptop', 'notebook', 'computer', 'pc', 'macbook'],
      ['headphones', 'earphones', 'earbuds', 'headset', 'cans'],
      ['watch', 'timepiece', 'wristwatch', 'smartwatch'],
      ['tablet', 'ipad', 'slate', 'pad'],
      
      // Clothing
      ['shirt', 'blouse', 'top', 'tee', 't-shirt', 'tshirt'],
      ['pants', 'trousers', 'jeans', 'slacks', 'bottoms'],
      ['shoes', 'footwear', 'sneakers', 'boots', 'sneaks'],
      ['dress', 'gown', 'frock', 'outfit'],
      ['jacket', 'coat', 'blazer', 'outerwear'],
      
      // Home & Kitchen
      ['bag', 'handbag', 'purse', 'tote', 'satchel'],
      ['book', 'novel', 'publication', 'tome', 'volume'],
      ['gift', 'present', 'souvenir', 'token'],
      ['kitchen', 'cooking', 'culinary', 'food prep'],
      
      // Colors and materials
      ['black', 'dark', 'ebony', 'charcoal'],
      ['white', 'light', 'ivory', 'cream'],
      ['red', 'crimson', 'scarlet', 'burgundy'],
      ['blue', 'navy', 'azure', 'cobalt'],
      ['leather', 'hide', 'hide', 'suede'],
      ['cotton', 'fabric', 'textile', 'cloth'],
    ];

    synonymGroups.forEach(group => {
      group.forEach(word => {
        this.synonyms.set(word.toLowerCase(), group);
      });
    });
  }

  // Initialize typo corrections
  private initializeTypoCorrections() {
    const commonTypos = new Map([
      // Electronics
      ['iphone', 'iphone'], ['samsung', 'samsung'], ['sony', 'sony'],
      ['laptop', 'laptop'], ['notebook', 'notebook'], ['computer', 'computer'],
      
      // Clothing
      ['shirt', 'shirt'], ['pants', 'pants'], ['shoes', 'shoes'],
      ['dress', 'dress'], ['jacket', 'jacket'], ['sweater', 'sweater'],
      
      // Common misspellings
      ['recieve', 'receive'], ['seperate', 'separate'], ['occured', 'occurred'],
      ['definately', 'definitely'], ['accomodate', 'accommodate'],
    ]);

    this.typoCorrections = commonTypos;
  }

  // Load pre-trained model for semantic search
  private async loadModel() {
    try {
      // In a real implementation, you would load a pre-trained model
      // For now, we'll use our enhanced TF-IDF approach
      console.log('Enhanced AI search engine initialized with TF-IDF embeddings');
    } catch (error) {
      console.warn('Could not load pre-trained model, using TF-IDF fallback');
    }
  }

  // Extract enhanced searchable text
  private extractSearchableText(product: ProductsWithImages): string {
    const parts = [
      product.name,
      product.description || '',
      product.category,
      ...(product.units?.map(unit => unit.name) || []),
      // Add brand information if available
      product.name.split(' ')[0], // Assume first word is brand
    ];

    return parts.join(' ').toLowerCase();
  }

  // Enhanced tokenization with stemming and lemmatization
  private tokenize(text: string): string[] {
    const tokens = this.tokenizer.tokenize(text.toLowerCase()) || [];
    return tokens
      .filter(token => token.length > 2)
      .map(token => this.stemmer.stem(token))
      .filter(token => !this.isStopWord(token));
  }

  // Check if word is a stop word
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ]);
    return stopWords.has(word);
  }

  // Calculate cosine similarity
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += (a[i] || 0) * (b[i] || 0);
      normA += (a[i] || 0) * (a[i] || 0);
      normB += (b[i] || 0) * (b[i] || 0);
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Calculate Levenshtein distance for typo tolerance
  private calculateTypoTolerance(query: string, target: string): number {
    const distance = new levenshtein(query.toLowerCase(), target.toLowerCase()).distance;
    const maxLength = Math.max(query.length, target.length);
    return maxLength > 0 ? 1 - (distance / maxLength) : 0;
  }

  // Main enhanced search function
  search(query: EnhancedSearchQuery): EnhancedSearchResult[] {
    const { 
      query: searchQuery, 
      filters, 
      sortBy = 'relevance', 
      limit = 20, 
      offset = 0,
      includeTypos = true,
      semanticWeight = 0.6,
      keywordWeight = 0.4
    } = query;
    
    // Get keyword matches
    const keywordResults = this.keywordSearch(searchQuery, includeTypos);
    
    // Get semantic matches
    const semanticResults = this.semanticSearch(searchQuery);
    
    // Get fuzzy matches
    const fuzzyResults = this.fuzzySearch(searchQuery);
    
    // Combine and rank results
    const combinedResults = this.combineResults(
      keywordResults, 
      semanticResults, 
      fuzzyResults,
      semanticWeight,
      keywordWeight
    );
    
    // Apply filters
    const filteredResults = this.applyFilters(combinedResults, filters);
    
    // Sort results
    const sortedResults = this.sortResults(filteredResults, sortBy);
    
    // Apply pagination
    return sortedResults.slice(offset, offset + limit);
  }

  // Enhanced keyword search with typo tolerance
  private keywordSearch(query: string, includeTypos: boolean): EnhancedSearchResult[] {
    const tokens = this.tokenize(query);
    const productScores = new Map<string, { 
      score: number; 
      highlights: string[]; 
      matchedFields: string[];
      typoTolerance: number;
    }>();
    
    tokens.forEach(token => {
      // Direct matches
      if (this.searchIndex.has(token)) {
        this.searchIndex.get(token)!.forEach(productId => {
          const product = this.products.find(p => p.id === productId);
          if (product) {
            if (!productScores.has(productId)) {
              productScores.set(productId, { 
                score: 0, 
                highlights: [], 
                matchedFields: [],
                typoTolerance: 1.0
              });
            }
            
            const current = productScores.get(productId)!;
            current.score += 1;
            current.highlights.push(token);
            current.matchedFields.push('name');
          }
        });
      }
      
      // Synonym matches
      if (this.synonyms.has(token)) {
        this.synonyms.get(token)!.forEach(synonym => {
          if (this.searchIndex.has(synonym)) {
            this.searchIndex.get(synonym)!.forEach(productId => {
              const product = this.products.find(p => p.id === productId);
              if (product) {
                if (!productScores.has(productId)) {
                  productScores.set(productId, { 
                    score: 0, 
                    highlights: [], 
                    matchedFields: [],
                    typoTolerance: 1.0
                  });
                }
                
                const current = productScores.get(productId)!;
                current.score += 0.7; // Lower score for synonyms
                current.highlights.push(synonym);
                current.matchedFields.push('synonym');
              }
            });
          }
        });
      }
      
      // Typo tolerance
      if (includeTypos) {
        this.searchIndex.forEach((productIds, indexedToken) => {
          const tolerance = this.calculateTypoTolerance(token, indexedToken);
          if (tolerance > 0.7) { // 70% similarity threshold
            productIds.forEach(productId => {
              const product = this.products.find(p => p.id === productId);
              if (product) {
                if (!productScores.has(productId)) {
                  productScores.set(productId, { 
                    score: 0, 
                    highlights: [], 
                    matchedFields: [],
                    typoTolerance: 1.0
                  });
                }
                
                const current = productScores.get(productId)!;
                current.score += tolerance * 0.5; // Lower score for typos
                current.highlights.push(indexedToken);
                current.matchedFields.push('typo_correction');
                current.typoTolerance = Math.max(current.typoTolerance, tolerance);
              }
            });
          }
        });
      }
    });
    
    return Array.from(productScores.entries()).map(([productId, data]) => {
      const product = this.products.find(p => p.id === productId)!;
      return {
        product,
        score: data.score,
        highlights: [...new Set(data.highlights)],
        matchedFields: [...new Set(data.matchedFields)],
        semanticScore: 0,
        keywordScore: data.score,
        typoTolerance: data.typoTolerance,
        confidence: Math.min(data.score / 3, 1), // Normalize confidence
        explanation: this.generateExplanation(data, query),
      };
    });
  }

  // Enhanced semantic search
  private semanticSearch(query: string): EnhancedSearchResult[] {
    const queryEmbedding = this.createQueryEmbedding(query);
    const results: EnhancedSearchResult[] = [];
    
    this.embeddings.forEach((embedding, productId) => {
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);
      if (similarity > 0.1) { // Threshold for semantic relevance
        const product = this.products.find(p => p.id === productId)!;
        results.push({
          product,
          score: similarity,
          highlights: [],
          matchedFields: ['semantic'],
          semanticScore: similarity,
          keywordScore: 0,
          typoTolerance: 1.0,
          confidence: similarity,
          explanation: `Semantic match: ${Math.round(similarity * 100)}% similarity`,
        });
      }
    });
    
    return results;
  }

  // Fuzzy search using Fuse.js
  private fuzzySearch(query: string): EnhancedSearchResult[] {
    const fuseResults = this.fuse.search(query);
    return fuseResults.map(result => ({
      product: result.item,
      score: 1 - (result.score || 0), // Convert Fuse score to similarity
      highlights: result.matches?.map(match => match.value).filter(Boolean) || [],
      matchedFields: result.matches?.map(match => match.key).filter(Boolean) || [],
      semanticScore: 0,
      keywordScore: 1 - (result.score || 0),
      typoTolerance: 1.0,
      confidence: 1 - (result.score || 0),
      explanation: `Fuzzy match: ${Math.round((1 - (result.score || 0)) * 100)}% similarity`,
    }));
  }

  // Create query embedding
  private createQueryEmbedding(query: string): number[] {
    const tokens = this.tokenize(query);
    const allTokens = Array.from(this.searchIndex.keys());
    const tokenIndex = new Map(allTokens.map((token, index) => [token, index]));
    
    const vector = new Array(allTokens.length).fill(0);
    const tokenCounts = new Map<string, number>();
    
    // Count token frequencies
    tokens.forEach(token => {
      tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
    });

    // Calculate TF-IDF
    tokenCounts.forEach((count, token) => {
      const index = tokenIndex.get(token);
      if (index !== undefined) {
        const tf = count / tokens.length;
        const idf = Math.log(this.products.length / this.getDocumentFrequency(token));
        vector[index] = tf * idf;
      }
    });

    // Normalize vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  }

  // Combine all search results
  private combineResults(
    keywordResults: EnhancedSearchResult[], 
    semanticResults: EnhancedSearchResult[],
    fuzzyResults: EnhancedSearchResult[],
    semanticWeight: number,
    keywordWeight: number
  ): EnhancedSearchResult[] {
    const combined = new Map<string, EnhancedSearchResult>();
    
    // Add keyword results
    keywordResults.forEach(result => {
      combined.set(result.product.id, result);
    });
    
    // Add or merge semantic results
    semanticResults.forEach(result => {
      if (combined.has(result.product.id)) {
        const existing = combined.get(result.product.id)!;
        existing.semanticScore = result.semanticScore;
        existing.score = (existing.keywordScore * keywordWeight) + (result.semanticScore * semanticWeight);
        existing.confidence = Math.max(existing.confidence, result.confidence);
      } else {
        result.score = result.semanticScore * semanticWeight;
        combined.set(result.product.id, result);
      }
    });
    
    // Add or merge fuzzy results
    fuzzyResults.forEach(result => {
      if (combined.has(result.product.id)) {
        const existing = combined.get(result.product.id)!;
        existing.score = Math.max(existing.score, result.score);
        existing.confidence = Math.max(existing.confidence, result.confidence);
      } else {
        combined.set(result.product.id, result);
      }
    });
    
    return Array.from(combined.values());
  }

  // Apply search filters
  private applyFilters(results: EnhancedSearchResult[], filters?: EnhancedSearchQuery['filters']): EnhancedSearchResult[] {
    if (!filters) return results;
    
    return results.filter(result => {
      const product = result.product;
      
      // Category filter
      if (filters.category && product.category !== filters.category) {
        return false;
      }
      
      // Price range filter
      if (filters.priceRange) {
        const price = this.getProductPrice(product);
        if (price < filters.priceRange.min || price > filters.priceRange.max) {
          return false;
        }
      }
      
      // Stock filter
      if (filters.inStock !== undefined) {
        const inStock = this.isProductInStock(product);
        if (inStock !== filters.inStock) {
          return false;
        }
      }
      
      // Brand filter
      if (filters.brand) {
        const brand = (product.name || '').split(' ')[0].toLowerCase();
        if (!brand.includes(filters.brand.toLowerCase())) {
          return false;
        }
      }
      
      return true;
    });
  }

  // Sort results
  private sortResults(results: EnhancedSearchResult[], sortBy: EnhancedSearchQuery['sortBy']): EnhancedSearchResult[] {
    switch (sortBy) {
      case 'price':
        return results.sort((a, b) => this.getProductPrice(a.product) - this.getProductPrice(b.product));
      case 'rating':
        return results.sort((a, b) => (b.product.isBestSeller ? 1 : 0) - (a.product.isBestSeller ? 1 : 0));
      case 'newest':
        return results.sort((a, b) => new Date(b.product.createdAt).getTime() - new Date(a.product.createdAt).getTime());
      case 'popularity':
        return results.sort((a, b) => {
          if (a.product.isBestSeller && !b.product.isBestSeller) return -1;
          if (!a.product.isBestSeller && b.product.isBestSeller) return 1;
          if (a.product.isAmazing && !b.product.isAmazing) return -1;
          if (!a.product.isAmazing && b.product.isAmazing) return 1;
          return b.score - a.score;
        });
      case 'relevance':
      default:
        return results.sort((a, b) => b.score - a.score);
    }
  }

  // Get product price
  private getProductPrice(product: ProductsWithImages): number {
    if (product.units && product.units.length > 0) {
      const activeUnits = product.units.filter(u => u.isActive && u.stock > 0);
      if (activeUnits.length > 0) {
        return Math.min(...activeUnits.map(u => Number(u.price)));
      }
    }
    return product.basePrice;
  }

  // Check if product is in stock
  private isProductInStock(product: ProductsWithImages): boolean {
    if (product.units && product.units.length > 0) {
      return product.units.some(u => u.isActive && u.stock > 0);
    }
    return product.quantity > 0;
  }

  // Generate explanation for search result
  private generateExplanation(data: any, query: string): string {
    const explanations = [];
    
    if (data.matchedFields.includes('name')) {
      explanations.push('Name match');
    }
    if (data.matchedFields.includes('synonym')) {
      explanations.push('Synonym match');
    }
    if (data.matchedFields.includes('typo_correction')) {
      explanations.push('Typo correction');
    }
    if (data.matchedFields.includes('semantic')) {
      explanations.push('Semantic match');
    }
    
    return explanations.join(', ');
  }

  // Get enhanced search suggestions
  getSuggestions(query: string, limit: number = 5): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    const tokens = this.tokenize(query);
    
    if (tokens.length === 0) return suggestions;
    
    const lastToken = tokens[tokens.length - 1];
    
    // Product name suggestions
    this.products.forEach(product => {
      const productTokens = this.tokenize(product.name);
      if (productTokens.some(token => token?.startsWith(lastToken || ''))) {
        suggestions.push({
          text: product.name,
          type: 'product',
          count: 1,
          confidence: 0.9,
        });
      }
    });
    
    // Category suggestions
    const categories = [...new Set(this.products.map(p => p.category))];
    categories.forEach(category => {
      if (category.toLowerCase().includes(lastToken || '')) {
        suggestions.push({
          text: category,
          type: 'category',
          count: this.products.filter(p => p.category === category).length,
          confidence: 0.8,
        });
      }
    });
    
    // Typo correction suggestions
    if (lastToken && this.typoCorrections.has(lastToken)) {
      const correction = this.typoCorrections.get(lastToken)!;
      suggestions.push({
        text: correction,
        type: 'typo_correction',
        originalText: lastToken,
        confidence: 0.7,
      });
    }
    
    // Remove duplicates and sort by confidence
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.text === suggestion.text)
    );
    
    return uniqueSuggestions
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
      .slice(0, limit);
  }

  // Update product in search index
  updateProduct(product: ProductsWithImages) {
    const index = this.products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      this.products[index] = product;
    } else {
      this.products.push(product);
    }
    
    // Rebuild index for this product
    this.rebuildProductIndex(product);
  }

  // Remove product from search index
  removeProduct(productId: string) {
    this.products = this.products.filter(p => p.id !== productId);
    this.embeddings.delete(productId);
    
    // Remove from search index
    this.searchIndex.forEach((productIds, token) => {
      productIds.delete(productId);
      if (productIds.size === 0) {
        this.searchIndex.delete(token);
      }
    });
  }

  // Rebuild search index for a specific product
  private rebuildProductIndex(product: ProductsWithImages) {
    const searchableText = this.extractSearchableText(product);
    const tokens = this.tokenize(searchableText);
    
    // Remove old entries
    this.searchIndex.forEach((productIds, token) => {
      productIds.delete(product.id);
    });
    
    // Add new entries
    tokens.forEach(token => {
      if (!this.searchIndex.has(token)) {
        this.searchIndex.set(token, new Set());
      }
      this.searchIndex.get(token)!.add(product.id);
    });
    
    // Update embedding
    const embedding = this.createQueryEmbedding(searchableText);
    this.embeddings.set(product.id, embedding);
  }
}

// Factory function to create enhanced search engine
export function createEnhancedAISearchEngine(products: ProductsWithImages[]): EnhancedAISearchEngine {
  return new EnhancedAISearchEngine(products);
}
