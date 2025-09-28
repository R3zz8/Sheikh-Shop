import type { ProductsWithImages } from '@/types';

export interface SEOContent {
  title: string;
  metaDescription: string;
  keywords: string[];
  structuredData: any;
  altText: string;
  h1: string;
  h2: string[];
  content: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  keywords: string[];
  category: string;
  tags: string[];
  publishedAt: Date;
  seoScore: number;
  wordCount: number;
}

export interface ContentSuggestion {
  type: 'title' | 'description' | 'keywords' | 'content' | 'alt_text';
  original: string;
  suggestion: string;
  reason: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
}

export class SEOContentGenerator {
  private products: ProductsWithImages[] = [];
  private keywordDatabase: Map<string, number> = new Map();
  private competitorKeywords: string[] = [];

  constructor(products: ProductsWithImages[]) {
    this.products = products;
    this.initializeKeywordDatabase();
  }

  private initializeKeywordDatabase() {
    // Initialize with common e-commerce keywords
    const commonKeywords = [
      'buy', 'shop', 'online', 'store', 'product', 'price', 'sale', 'discount',
      'quality', 'premium', 'luxury', 'best', 'top', 'review', 'rating',
      'free shipping', 'fast delivery', 'secure payment', 'warranty',
      'electronics', 'clothing', 'home', 'books', 'sports', 'fashion',
      'deals', 'offers', 'new', 'trending', 'popular', 'bestseller'
    ];

    commonKeywords.forEach(keyword => {
      this.keywordDatabase.set(keyword, Math.random() * 1000 + 100);
    });

    // Add product-specific keywords
    this.products.forEach(product => {
      const productKeywords = this.extractKeywords(product.name + ' ' + (product.description || ''));
      productKeywords.forEach(keyword => {
        const currentCount = this.keywordDatabase.get(keyword) || 0;
        this.keywordDatabase.set(keyword, currentCount + 1);
      });
    });
  }

  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !this.isStopWord(word));
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ]);
    return stopWords.has(word);
  }

  // Generate SEO content for a product
  generateProductSEO(product: ProductsWithImages): SEOContent {
    const keywords = this.generateKeywords(product);
    const primaryKeyword = keywords[0];
    
    return {
      title: this.generateTitle(product, primaryKeyword),
      metaDescription: this.generateMetaDescription(product, primaryKeyword, keywords),
      keywords: keywords,
      structuredData: this.generateStructuredData(product),
      altText: this.generateAltText(product),
      h1: this.generateH1(product, primaryKeyword),
      h2: this.generateH2s(product, keywords),
      content: this.generateContent(product, keywords)
    };
  }

  private generateTitle(product: ProductsWithImages, primaryKeyword: string): string {
    const brand = product.name.split(' ')[0];
    const productName = product.name;
    const price = product.basePrice;
    
    const templates = [
      `${productName} - ${primaryKeyword} | ${brand} Store`,
      `Buy ${productName} Online - Best ${primaryKeyword} Deals`,
      `${productName} - Premium ${primaryKeyword} | Free Shipping`,
      `Best ${productName} - ${primaryKeyword} Reviews & Price`,
      `${productName} - ${primaryKeyword} | ${brand} Official Store`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateMetaDescription(product: ProductsWithImages, primaryKeyword: string, keywords: string[]): string {
    const productName = product.name;
    const price = product.basePrice;
    const category = product.category;
    const keyFeatures = keywords.slice(0, 3).join(', ');
    
    const templates = [
      `Shop ${productName} - ${primaryKeyword} at best price. ${keyFeatures}. Free shipping, secure payment. Buy now!`,
      `Best ${productName} - ${primaryKeyword} online. ${keyFeatures}. ${category} category. Fast delivery!`,
      `Premium ${productName} - ${primaryKeyword}. ${keyFeatures}. Quality guaranteed. Order now!`,
      `Buy ${productName} - ${primaryKeyword} online. ${keyFeatures}. Best deals & offers available!`
    ];
    
    const description = templates[Math.floor(Math.random() * templates.length)];
    return description.length > 160 ? description.substring(0, 157) + '...' : description;
  }

  private generateKeywords(product: ProductsWithImages): string[] {
    const keywords = new Set<string>();
    
    // Add product name words
    const productWords = this.extractKeywords(product.name);
    productWords.forEach(word => keywords.add(word));
    
    // Add category
    keywords.add(product.category.toLowerCase());
    
    // Add brand
    const brand = product.name.split(' ')[0].toLowerCase();
    keywords.add(brand);
    
    // Add price-related keywords
    if (product.basePrice < 50) {
      keywords.add('cheap');
      keywords.add('affordable');
    } else if (product.basePrice > 200) {
      keywords.add('premium');
      keywords.add('luxury');
    }
    
    // Add quality indicators
    if (product.isBestSeller) {
      keywords.add('bestseller');
      keywords.add('popular');
    }
    
    if (product.isAmazing) {
      keywords.add('amazing');
      keywords.add('excellent');
    }
    
    // Add generic e-commerce keywords
    keywords.add('buy');
    keywords.add('shop');
    keywords.add('online');
    keywords.add('store');
    
    return Array.from(keywords).slice(0, 10);
  }

  private generateStructuredData(product: ProductsWithImages): any {
    return {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "description": product.description || '',
      "image": product.images?.[0]?.image || '',
      "brand": {
        "@type": "Brand",
        "name": product.name.split(' ')[0]
      },
      "offers": {
        "@type": "Offer",
        "price": product.basePrice,
        "priceCurrency": "EUR",
        "availability": product.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "reviewCount": "100"
      }
    };
  }

  private generateAltText(product: ProductsWithImages): string {
    const productName = product.name;
    const category = product.category.toLowerCase();
    const brand = product.name.split(' ')[0];
    
    return `${productName} - ${brand} ${category} product image`;
  }

  private generateH1(product: ProductsWithImages, primaryKeyword: string): string {
    return `${product.name} - ${primaryKeyword}`;
  }

  private generateH2s(product: ProductsWithImages, keywords: string[]): string[] {
    const h2s = [
      `Why Choose ${product.name}?`,
      'Product Features',
      'Specifications',
      'Customer Reviews',
      'Shipping & Returns'
    ];
    
    return h2s.slice(0, 3);
  }

  private generateContent(product: ProductsWithImages, keywords: string[]): string {
    const productName = product.name;
    const category = product.category;
    const price = product.basePrice;
    const primaryKeyword = keywords[0];
    
    return `
      <h2>Why Choose ${productName}?</h2>
      <p>Discover the ${primaryKeyword} that's perfect for your needs. Our ${productName} combines quality, performance, and value in the ${category} category.</p>
      
      <h2>Product Features</h2>
      <ul>
        <li>High-quality ${category.toLowerCase()} design</li>
        <li>Competitive pricing at $${price}</li>
        <li>Fast and secure shipping</li>
        <li>30-day money-back guarantee</li>
      </ul>
      
      <h2>Customer Reviews</h2>
      <p>Our customers love the ${productName}. With an average rating of 4.5 stars, it's one of our most popular ${category.toLowerCase()} products.</p>
    `;
  }

  // Generate blog post
  generateBlogPost(topic: string, category: string = 'General'): BlogPost {
    const slug = this.generateSlug(topic);
    const keywords = this.extractKeywords(topic);
    const content = this.generateBlogContent(topic, keywords);
    
    return {
      id: `blog_${Date.now()}`,
      title: topic,
      slug,
      excerpt: this.generateExcerpt(content),
      content,
      keywords,
      category,
      tags: keywords.slice(0, 5),
      publishedAt: new Date(),
      seoScore: this.calculateSEOScore(content, keywords),
      wordCount: content.split(' ').length
    };
  }

  private generateSlug(topic: string): string {
    return topic
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  private generateBlogContent(topic: string, keywords: string[]): string {
    const primaryKeyword = keywords[0];
    
    return `
      <h1>${topic}</h1>
      
      <p>In this comprehensive guide, we'll explore everything you need to know about ${primaryKeyword} and how it can benefit you.</p>
      
      <h2>What is ${primaryKeyword}?</h2>
      <p>${primaryKeyword} is an essential concept in today's market. Understanding its benefits and applications can help you make informed decisions.</p>
      
      <h2>Key Benefits</h2>
      <ul>
        <li>Improved performance and efficiency</li>
        <li>Cost-effective solutions</li>
        <li>Easy to implement and use</li>
        <li>Proven results and reliability</li>
      </ul>
      
      <h2>How to Choose the Right ${primaryKeyword}</h2>
      <p>When selecting ${primaryKeyword}, consider factors like quality, price, and compatibility with your specific needs.</p>
      
      <h2>Conclusion</h2>
      <p>${primaryKeyword} offers numerous advantages for both beginners and experts. By following this guide, you'll be well-equipped to make the best choice for your requirements.</p>
    `;
  }

  private generateExcerpt(content: string): string {
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.substring(0, 150) + '...';
  }

  private calculateSEOScore(content: string, keywords: string[]): number {
    let score = 0;
    
    // Check for keyword density
    const wordCount = content.split(' ').length;
    const keywordCount = keywords.reduce((count, keyword) => {
      return count + (content.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
    }, 0);
    
    const keywordDensity = (keywordCount / wordCount) * 100;
    if (keywordDensity >= 1 && keywordDensity <= 3) score += 30;
    
    // Check for heading structure
    if (content.includes('<h1>')) score += 20;
    if (content.includes('<h2>')) score += 20;
    
    // Check for content length
    if (wordCount >= 300) score += 20;
    
    // Check for internal links (simplified)
    if (content.includes('href=')) score += 10;
    
    return Math.min(100, score);
  }

  // Analyze and suggest improvements
  analyzeContent(content: string, targetKeywords: string[]): ContentSuggestion[] {
    const suggestions: ContentSuggestion[] = [];
    
    // Check title length
    const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (titleMatch) {
      const title = titleMatch[1];
      if (title.length < 30) {
        suggestions.push({
          type: 'title',
          original: title,
          suggestion: `${title} - Complete Guide & Best Practices`,
          reason: 'Title is too short for optimal SEO',
          confidence: 0.8,
          impact: 'high'
        });
      }
    }
    
    // Check meta description
    const metaMatch = content.match(/<meta name="description" content="(.*?)"/i);
    if (metaMatch) {
      const description = metaMatch[1];
      if (description.length < 120) {
        suggestions.push({
          type: 'description',
          original: description,
          suggestion: `${description} Learn more about our products and services.`,
          reason: 'Meta description should be 120-160 characters',
          confidence: 0.9,
          impact: 'medium'
        });
      }
    }
    
    // Check keyword density
    const wordCount = content.split(' ').length;
    targetKeywords.forEach(keyword => {
      const keywordCount = (content.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
      const density = (keywordCount / wordCount) * 100;
      
      if (density < 1) {
        suggestions.push({
          type: 'keywords',
          original: keyword,
          suggestion: `Increase usage of "${keyword}" in content`,
          reason: `Keyword density is ${density.toFixed(2)}%, should be 1-3%`,
          confidence: 0.85,
          impact: 'high'
        });
      }
    });
    
    return suggestions;
  }

  // Generate sitemap data
  generateSitemapData(): any[] {
    const urls = [];
    
    // Add product pages
    this.products.forEach(product => {
      urls.push({
        url: `/product/${product.id}`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.8
      });
    });
    
    // Add category pages
    const categories = [...new Set(this.products.map(p => p.category))];
    categories.forEach(category => {
      urls.push({
        url: `/categories/${category.toLowerCase()}`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.6
      });
    });
    
    // Add static pages
    const staticPages = ['/', '/about-us', '/contact', '/privacy', '/terms'];
    staticPages.forEach(page => {
      urls.push({
        url: page,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: page === '/' ? 1.0 : 0.5
      });
    });
    
    return urls;
  }
}

// Factory function
export function createSEOContentGenerator(products: ProductsWithImages[]): SEOContentGenerator {
  return new SEOContentGenerator(products);
}
