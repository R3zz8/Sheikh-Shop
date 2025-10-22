'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  FileText, 
  Edit, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb,
  Target,
  BarChart3,
  Globe,
  PenTool,
  Zap,
  RefreshCw
} from 'lucide-react';
import type { ProductsWithImages } from '@/types';
import { createSEOContentGenerator, type SEOContent, type BlogPost, type ContentSuggestion } from '@/lib/ai/seo-content';

interface SEOContentManagerProps {
  products: ProductsWithImages[];
  className?: string;
}

export default function SEOContentManager({ products, className = '' }: SEOContentManagerProps) {
  const [seoGenerator] = useState(() => createSEOContentGenerator(products));
  const [selectedProduct, setSelectedProduct] = useState<ProductsWithImages | null>(null);
  const [seoContent, setSeoContent] = useState<SEOContent | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'blog' | 'analysis'>('products');
  const [blogTopic, setBlogTopic] = useState('');
  const [blogCategory, setBlogCategory] = useState('General');

  useEffect(() => {
    if (selectedProduct) {
      setLoading(true);
      setTimeout(() => {
        const content = seoGenerator.generateProductSEO(selectedProduct);
        setSeoContent(content);
        setLoading(false);
      }, 1000);
    }
  }, [selectedProduct, seoGenerator]);

  const handleProductSelect = (product: ProductsWithImages) => {
    setSelectedProduct(product);
  };

  const generateBlogPost = () => {
    if (!blogTopic.trim()) return;
    
    setLoading(true);
    setTimeout(() => {
      const newPost = seoGenerator.generateBlogPost(blogTopic, blogCategory);
      setBlogPosts(prev => [newPost, ...prev]);
      setBlogTopic('');
      setLoading(false);
    }, 2000);
  };

  const analyzeContent = (content: string) => {
    const targetKeywords = seoContent?.keywords || [];
    const analysis = seoGenerator.analyzeContent(content, targetKeywords);
    setSuggestions(analysis);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'title':
        return <FileText className="w-4 h-4" />;
      case 'description':
        return <Edit className="w-4 h-4" />;
      case 'keywords':
        return <Target className="w-4 h-4" />;
      case 'content':
        return <PenTool className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getSuggestionColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-900">AI SEO Content Manager</h2>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">Powered by AI</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'products', label: 'Product SEO', icon: Search },
          { id: 'blog', label: 'Blog Generator', icon: PenTool },
          { id: 'analysis', label: 'Content Analysis', icon: BarChart3 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product SEO Tab */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Product</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedProduct?.id === product.id
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]?.image || ''}
                          alt={product.name || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SEO Content */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated SEO Content</h3>
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ) : seoContent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                    {seoContent.title}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                    {seoContent.metaDescription}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                  <div className="flex flex-wrap gap-1">
                    {seoContent.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">H1 Tag</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                    {seoContent.h1}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                    {seoContent.altText}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Select a product to generate SEO content</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blog Generator Tab */}
      {activeTab === 'blog' && (
        <div className="space-y-6">
          {/* Blog Post Generator */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Blog Post</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blog Topic
                </label>
                <input
                  type="text"
                  value={blogTopic}
                  onChange={(e) => setBlogTopic(e.target.value)}
                  placeholder="Enter blog topic (e.g., 'Best Electronics for 2024')"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={blogCategory}
                  onChange={(e) => setBlogCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="General">General</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home">Home</option>
                  <option value="Technology">Technology</option>
                </select>
              </div>
              
              <button
                onClick={generateBlogPost}
                disabled={!blogTopic.trim() || loading}
                className="w-full bg-amber-500 text-white py-2 px-4 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                Generate Blog Post
              </button>
            </div>
          </div>

          {/* Generated Blog Posts */}
          {blogPosts.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Blog Posts</h3>
              <div className="space-y-4">
                {blogPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{post.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          SEO: {post.seoScore}%
                        </span>
                        <span className="text-xs text-gray-500">
                          {post.wordCount} words
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {post.category}
                      </span>
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Generated: {post.publishedAt.toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content Analysis Tab */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Analysis</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content to Analyze
                </label>
                <textarea
                  rows={6}
                  placeholder="Paste your content here for SEO analysis..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  onChange={(e) => analyzeContent(e.target.value)}
                />
              </div>
              
              {suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">AI Suggestions</h4>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-3 rounded-lg border ${getSuggestionColor(suggestion.impact)}`}
                      >
                        <div className="flex items-start gap-2">
                          {getSuggestionIcon(suggestion.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                suggestion.impact === 'high' ? 'bg-red-100 text-red-700' :
                                suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {suggestion.impact} impact
                              </span>
                              <span className="text-xs text-gray-500">
                                {Math.round(suggestion.confidence * 100)}% confidence
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-1">{suggestion.reason}</p>
                            <p className="text-sm text-gray-600">
                              <strong>Suggestion:</strong> {suggestion.suggestion}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
