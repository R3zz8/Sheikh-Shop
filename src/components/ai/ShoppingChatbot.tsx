// src/components/ai/ShoppingChatbot.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  ShoppingCart, 
  Search, 
  Heart, 
  Star,
  Sparkles,
  Loader2,
  RefreshCw
} from 'lucide-react';
import type { ProductsWithImages } from '@/types';
import { formatPrice, convertCurrency } from '@/lib/currency';
import { useCurrencySafe } from '@/providers/CurrencyProvider';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    productId?: string;
    category?: string;
    action?: 'search' | 'recommend' | 'add_to_cart' | 'help';
    confidence?: number;
  };
  suggestions?: string[];
  products?: ProductsWithImages[];
  isTyping?: boolean;
}

interface ShoppingChatbotProps {
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  showProductCards?: boolean;
  maxMessages?: number;
}

export default function ShoppingChatbot({
  className = '',
  theme = 'auto',
  showProductCards = true,
  maxMessages = 50
}: ShoppingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [userPreferences, setUserPreferences] = useState({
    preferredCategories: [] as string[],
    priceRange: { min: 0, max: 10000 },
    recentSearches: [] as string[],
    cartItems: [] as string[],
  });

  const { currency } = useCurrencySafe();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: `welcome_${Date.now()}`,
        type: 'assistant',
        content: "Hello! I'm your AI shopping assistant. I can help you find products, make recommendations, check prices, and answer questions about our store. How can I assist you today?",
        timestamp: new Date(),
        metadata: { action: 'help' },
        suggestions: [
          "Show me popular products",
          "Find products under $100",
          "What's new in electronics?",
          "Recommend something for me",
          "Help me find a gift"
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: message.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const typingMessage: ChatMessage = {
      id: `typing_${Date.now()}`,
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          sessionId,
          userPreferences,
          conversationHistory: messages.slice(-10),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => prev.filter(msg => !msg.isTyping));
        
        const assistantMessage: ChatMessage = {
          id: `assistant_${Date.now()}`,
          type: 'assistant',
          content: data.message.content,
          timestamp: new Date(),
          metadata: data.message.metadata,
          suggestions: data.suggestions,
          products: data.products,
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        if (data.userPreferences) {
          setUserPreferences(prev => ({ ...prev, ...data.userPreferences }));
        }
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'assistant',
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again or rephrase your question.",
        timestamp: new Date(),
        metadata: { action: 'help' },
        suggestions: ["Try again", "Ask something else", "Show me products", "Get help"]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    sendMessage(suggestion);
  };

  const handleProductClick = (product: ProductsWithImages) => {
    window.location.href = `/products/${product.slug || product.id}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const clearConversation = () => {
    setMessages([]);
    setUserPreferences({
      preferredCategories: [],
      priceRange: { min: 0, max: 10000 },
      recentSearches: [],
      cartItems: [],
    });
  };

  // موقعیت ثابت: بالای Profile
  const getPositionClasses = () => {
    return 'bottom-24 left-4';
  };

  const getThemeClasses = () => {
    if (theme === 'dark') return 'bg-gray-900 text-white border-gray-700';
    if (theme === 'light') return 'bg-white text-gray-900 border-gray-200';
    return 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700';
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50 ${className}`}>
      {/* دکمه چت‌بات بزرگ‌تر + آیکون ربات + انیمیشن */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ 
            scale: 1,
            y: [0, -10, 0]  // تکون می‌خوره
          }}
          transition={{ 
            y: { repeat: Infinity, duration: 3, ease: "easeInOut" }
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-2xl hover:shadow-green-500/50 transition-all duration-200 flex items-center justify-center border-4 border-white/30"
        >
          <Bot className="w-9 h-9" />
        </motion.button>
      )}

      {/* پنجره چت */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`w-96 h-[500px] ${getThemeClasses()} rounded-lg shadow-2xl border flex flex-col`}
          >
            {/* هدر */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Shopping Assistant</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={clearConversation} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="Clear">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* پیام‌ها */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.type === 'user'
                      ? 'bg-green-500 text-white'
                      : message.type === 'system'
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-center'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}>
                    {message.isTyping ? (
                      <div className="flex items-center gap-1">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start gap-2">
                          {message.type === 'assistant' && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                          {message.type === 'user' && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {message.metadata?.confidence && (
                              <div className="text-xs text-gray-500 mt-1">
                                Confidence: {Math.round(message.metadata.confidence * 100)}%
                              </div>
                            )}
                          </div>
                        </div>

                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="block w-full text-left text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}

                        {message.products && message.products.length > 0 && showProductCards && (
                          <div className="mt-3 space-y-2">
                            {message.products.map((product) => (
                              <div
                                key={product.id}
                                onClick={() => handleProductClick(product)}
                                className="bg-white dark:bg-gray-700 rounded-lg p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 dark:bg-gray-600">
                                    {product.images && product.images.length > 0 ? (
                                      <img src={product.images[0]?.image || ''} alt={product.name || 'Product'} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-gray-400 text-xs">No Image</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatPrice(convertCurrency(product.basePrice, 'EUR', currency), currency)}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {product.isBestSeller && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                                    {product.isAmazing && <Sparkles className="w-3 h-3 text-purple-500" />}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* ورودی */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}