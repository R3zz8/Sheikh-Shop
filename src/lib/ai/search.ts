import type { ProductsWithImages } from '@/types';

export interface SearchResult {
  product: ProductsWithImages;
  score: number;
  highlights: string[];
  matchedFields: string[];
  semanticScore: number;
  keywordScore: number;
}

export interface SearchQuery {
  query: string;
  filters?: {
    category?: string;
    priceRange?: { min: number; max: number };
    inStock?: boolean;
    rating?: number;
  };
  sortBy?: 'relevance' | 'price' | 'rating' | 'newest';
  limit?: number;
  offset?: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'product' | 'category' | 'brand' | 'query';
  count?: number;
}

export class AISearchEngine {
  private products: ProductsWithImages[] = [];
  private searchIndex: Map<string, Set<string>> = new Map();
  private embeddings: Map<string, number[]> = new Map();
  private synonyms: Map<string, string[]> = new Map();

  constructor(products: ProductsWithImages[]) {
    this.products = products;
    this.buildSearchIndex();
    this.generateEmbeddings();
    this.initializeSynonyms();
  }

  // Build search index for fast keyword matching
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

  // Generate simple embeddings for semantic search
  private generateEmbeddings() {
    this.products.forEach(product => {
      const text = this.extractSearchableText(product);
      const embedding = this.createSimpleEmbedding(text);
      this.embeddings.set(product.id, embedding);
    });
  }

  // Initialize synonym dictionary
  private initializeSynonyms() {
    const synonymGroups = [
      ['phone', 'mobile', 'cellphone', 'smartphone'],
      ['laptop', 'notebook', 'computer'],
      ['headphones', 'earphones', 'earbuds'],
      ['watch', 'timepiece', 'wristwatch'],
      ['bag', 'handbag', 'purse', 'tote'],
      ['shoes', 'footwear', 'sneakers', 'boots'],
      ['shirt', 'blouse', 'top', 'tee'],
      ['pants', 'trousers', 'jeans'],
      ['book', 'novel', 'publication'],
      ['gift', 'present', 'souvenir'],
    ];

    synonymGroups.forEach(group => {
      group.forEach(word => {
        this.synonyms.set(word.toLowerCase(), group);
      });
    });
  }

  // Extract searchable text from product
  private extractSearchableText(product: ProductsWithImages): string {
    const parts = [
      product.name,
      product.description || '',
      product.category,
      // Add unit names for better search
      ...(product.units?.map(unit => unit.name) || []),
    ];

    return parts.join(' ').toLowerCase();
  }

  // Tokenize text for indexing
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2)
      .map(token => this.stem(token));
  }

  // Simple stemming algorithm
  private stem(word: string): string {
    if (word.length <= 3) return word;
    
    // Remove common suffixes
    const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 's', 'es'];
    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        return word.slice(0, -suffix.length);
      }
    }
    
    return word;
  }

  // Create simple embedding using TF-IDF-like approach
  private createSimpleEmbedding(text: string): number[] {
    const tokens = this.tokenize(text);
    const embedding = new Array(50).fill(0); // 50-dimensional embedding
    
    // Simple hash-based embedding
    tokens.forEach(token => {
      const hash = this.hashString(token);
      const index = Math.abs(hash) % 50;
      embedding[index] += 1;
    });
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
  }

  // Hash string to number
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  // Calculate cosine similarity between embeddings
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

  // Main search function
  search(query: SearchQuery): SearchResult[] {
    const { query: searchQuery, filters, sortBy = 'relevance', limit = 20, offset = 0 } = query;
    
    // Get keyword matches
    const keywordResults = this.keywordSearch(searchQuery);
    
    // Get semantic matches
    const semanticResults = this.semanticSearch(searchQuery);
    
    // Combine and rank results
    const combinedResults = this.combineResults(keywordResults, semanticResults);
    
    // Apply filters
    const filteredResults = this.applyFilters(combinedResults, filters);
    
    // Sort results
    const sortedResults = this.sortResults(filteredResults, sortBy);
    
    // Apply pagination
    return sortedResults.slice(offset, offset + limit);
  }

  // Keyword-based search
  private keywordSearch(query: string): SearchResult[] {
    const tokens = this.tokenize(query);
    const productScores = new Map<string, { score: number; highlights: string[]; matchedFields: string[] }>();
    
    tokens.forEach(token => {
      // Direct matches
      if (this.searchIndex.has(token)) {
        this.searchIndex.get(token)!.forEach(productId => {
          const product = this.products.find(p => p.id === productId);
          if (product) {
            if (!productScores.has(productId)) {
              productScores.set(productId, { score: 0, highlights: [], matchedFields: [] });
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
                  productScores.set(productId, { score: 0, highlights: [], matchedFields: [] });
                }
                
                const current = productScores.get(productId)!;
                current.score += 0.5; // Lower score for synonyms
                current.highlights.push(synonym);
                current.matchedFields.push('synonym');
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
      };
    });
  }

  // Semantic search using embeddings
  private semanticSearch(query: string): SearchResult[] {
    const queryEmbedding = this.createSimpleEmbedding(query);
    const results: SearchResult[] = [];
    
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
        });
      }
    });
    
    return results;
  }

  // Combine keyword and semantic results
  private combineResults(keywordResults: SearchResult[], semanticResults: SearchResult[]): SearchResult[] {
    const combined = new Map<string, SearchResult>();
    
    // Add keyword results
    keywordResults.forEach(result => {
      combined.set(result.product.id, result);
    });
    
    // Add or merge semantic results
    semanticResults.forEach(result => {
      if (combined.has(result.product.id)) {
        const existing = combined.get(result.product.id)!;
        existing.semanticScore = result.semanticScore;
        existing.score = Math.max(existing.score, result.semanticScore);
      } else {
        combined.set(result.product.id, result);
      }
    });
    
    return Array.from(combined.values());
  }

  // Apply search filters
  private applyFilters(results: SearchResult[], filters?: SearchQuery['filters']): SearchResult[] {
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
      
      return true;
    });
  }

  // Sort results
  private sortResults(results: SearchResult[], sortBy: SearchQuery['sortBy']): SearchResult[] {
    switch (sortBy) {
      case 'price':
        return results.sort((a, b) => this.getProductPrice(a.product) - this.getProductPrice(b.product));
      case 'rating':
        return results.sort((a, b) => (b.product.isBestSeller ? 1 : 0) - (a.product.isBestSeller ? 1 : 0));
      case 'newest':
        return results.sort((a, b) => new Date(b.product.createdAt).getTime() - new Date(a.product.createdAt).getTime());
      case 'relevance':
      default:
        return results.sort((a, b) => b.score - a.score);
    }
  }

  // Get product price (lowest from units or base price)
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

  // Get search suggestions
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
        });
      }
    });
    
    // Remove duplicates and sort by relevance
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.text === suggestion.text)
    );
    
    return uniqueSuggestions
      .sort((a, b) => (b.count || 0) - (a.count || 0))
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
    const embedding = this.createSimpleEmbedding(searchableText);
    this.embeddings.set(product.id, embedding);
  }
}

// Factory function to create search engine
export function createAISearchEngine(products: ProductsWithImages[]): AISearchEngine {
  return new AISearchEngine(products);
}

