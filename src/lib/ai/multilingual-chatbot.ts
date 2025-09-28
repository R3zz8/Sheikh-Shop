import type { ProductsWithImages } from '@/types';
import { createShoppingAssistant, type ChatContext, type ChatMessage, type ChatResponse } from './chatbot';

export interface MultilingualChatContext extends ChatContext {
  language: 'en' | 'ar';
  translations: Map<string, string>;
}

export class MultilingualShoppingAssistant {
  private assistant: any;
  private translations: Map<string, Map<string, string>> = new Map();

  constructor(products: ProductsWithImages[]) {
    this.assistant = createShoppingAssistant(products);
    this.initializeTranslations();
  }

  // Initialize translations for English and Arabic
  private initializeTranslations() {
    // English translations
    const enTranslations = new Map([
      // Greetings
      ['greeting', 'Hello! I\'m your AI shopping assistant. How can I help you today?'],
      ['welcome', 'Welcome to Sheikh Shop! I can help you find products, make recommendations, and answer questions.'],
      
      // Search responses
      ['search_found', 'I found {count} products matching your search:'],
      ['search_not_found', 'I couldn\'t find any products matching "{query}". Could you try different keywords?'],
      ['search_suggestions', 'Here are some suggestions:'],
      
      // Recommendations
      ['recommendations', 'Based on your preferences, I recommend these products:'],
      ['no_recommendations', 'I\'d be happy to recommend products! What are you interested in?'],
      
      // Price responses
      ['price_range', 'Here are products in your price range (${min} - ${max}):'],
      ['price_not_found', 'I couldn\'t find products in that price range. Our products range from ${min} to ${max}.'],
      
      // Availability
      ['stock_status', 'Here\'s our current stock status:'],
      ['in_stock', '{count} products in stock'],
      ['out_of_stock', '{count} products out of stock'],
      
      // Cart
      ['add_to_cart', 'I can help you add products to your cart! Which product would you like to add?'],
      ['cart_help', 'I can help you with your cart. What would you like to do?'],
      
      // Help
      ['help_capabilities', 'I can help you with:'],
      ['help_search', '🔍 Search for products'],
      ['help_recommend', '💡 Make recommendations'],
      ['help_price', '💰 Find products by price'],
      ['help_availability', '📦 Check availability'],
      ['help_cart', '🛒 Help with your cart'],
      
      // Goodbye
      ['goodbye', 'Thank you for shopping with us! Have a great day!'],
      
      // Error
      ['error', 'I\'m sorry, I\'m having trouble understanding. Could you try rephrasing that?'],
      
      // Common phrases
      ['try_again', 'Try again'],
      ['ask_else', 'Ask something else'],
      ['show_products', 'Show me products'],
      ['get_help', 'Get help'],
      ['more_results', 'Show me more results'],
      ['filter_price', 'Filter by price'],
      ['in_stock_only', 'Show only in-stock items'],
      ['sort_popularity', 'Sort by popularity'],
    ]);

    // Arabic translations
    const arTranslations = new Map([
      // Greetings
      ['greeting', 'مرحباً! أنا مساعد التسوق الذكي. كيف يمكنني مساعدتك اليوم؟'],
      ['welcome', 'أهلاً وسهلاً في متجر الشيخ! يمكنني مساعدتك في العثور على المنتجات والتوصيات والإجابة على الأسئلة.'],
      
      // Search responses
      ['search_found', 'وجدت {count} منتج يطابق بحثك:'],
      ['search_not_found', 'لم أتمكن من العثور على منتجات تطابق "{query}". هل يمكنك تجربة كلمات مفتاحية أخرى؟'],
      ['search_suggestions', 'إليك بعض الاقتراحات:'],
      
      // Recommendations
      ['recommendations', 'بناءً على تفضيلاتك، أنصح بهذه المنتجات:'],
      ['no_recommendations', 'سأكون سعيداً لتقديم التوصيات! ما الذي تهتم به؟'],
      
      // Price responses
      ['price_range', 'إليك المنتجات في نطاق السعر الخاص بك (${min} - ${max}):'],
      ['price_not_found', 'لم أتمكن من العثور على منتجات في هذا النطاق السعري. منتجاتنا تتراوح من ${min} إلى ${max}.'],
      
      // Availability
      ['stock_status', 'إليك حالة المخزون الحالية:'],
      ['in_stock', '{count} منتج متوفر'],
      ['out_of_stock', '{count} منتج غير متوفر'],
      
      // Cart
      ['add_to_cart', 'يمكنني مساعدتك في إضافة المنتجات إلى السلة! أي منتج تريد إضافته؟'],
      ['cart_help', 'يمكنني مساعدتك مع سلة التسوق. ماذا تريد أن تفعل؟'],
      
      // Help
      ['help_capabilities', 'يمكنني مساعدتك في:'],
      ['help_search', '🔍 البحث عن المنتجات'],
      ['help_recommend', '💡 تقديم التوصيات'],
      ['help_price', '💰 العثور على المنتجات حسب السعر'],
      ['help_availability', '📦 التحقق من التوفر'],
      ['help_cart', '🛒 المساعدة مع سلة التسوق'],
      
      // Goodbye
      ['goodbye', 'شكراً لتسوقك معنا! أتمنى لك يوماً رائعاً!'],
      
      // Error
      ['error', 'أعتذر، لدي مشكلة في الفهم. هل يمكنك إعادة صياغة ذلك؟'],
      
      // Common phrases
      ['try_again', 'حاول مرة أخرى'],
      ['ask_else', 'اسأل شيئاً آخر'],
      ['show_products', 'أظهر لي المنتجات'],
      ['get_help', 'احصل على مساعدة'],
      ['more_results', 'أظهر المزيد من النتائج'],
      ['filter_price', 'فلترة حسب السعر'],
      ['in_stock_only', 'أظهر المنتجات المتوفرة فقط'],
      ['sort_popularity', 'ترتيب حسب الشعبية'],
    ]);

    this.translations.set('en', enTranslations);
    this.translations.set('ar', arTranslations);
  }

  // Detect language from message
  private detectLanguage(message: string): 'en' | 'ar' {
    // Simple language detection based on character patterns
    const arabicPattern = /[\u0600-\u06FF]/;
    const hasArabic = arabicPattern.test(message);
    
    if (hasArabic) {
      return 'ar';
    }
    
    // Default to English
    return 'en';
  }

  // Translate text
  private translate(key: string, language: 'en' | 'ar', params: Record<string, any> = {}): string {
    const translations = this.translations.get(language) || this.translations.get('en')!;
    let text = translations.get(key) || key;
    
    // Replace parameters
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(`{${param}}`, String(value));
    });
    
    return text;
  }

  // Process message with multilingual support
  async processMessage(context: MultilingualChatContext, userMessage: string): Promise<ChatResponse> {
    // Detect language
    const detectedLanguage = this.detectLanguage(userMessage);
    const language = context.language || detectedLanguage;
    
    // Update context with detected language
    const updatedContext = { ...context, language };
    
    // Process with base assistant
    const response = await this.assistant.processMessage(updatedContext, userMessage);
    
    // Translate response if needed
    if (language === 'ar') {
      response.message.content = this.translateResponse(response.message.content, language);
      
      if (response.suggestions) {
        response.suggestions = response.suggestions.map((suggestion: any) => 
          this.translateSuggestion(suggestion, language)
        );
      }
    }
    
    return response;
  }

  // Translate response content
  private translateResponse(content: string, language: 'en' | 'ar'): string {
    if (language === 'en') return content;
    
    // Simple translation mapping for common responses
    const translations: Record<string, string> = {
      // Greetings
      "Hello! I'm your shopping assistant. How can I help you find the perfect products today?": 
        "مرحباً! أنا مساعد التسوق الخاص بك. كيف يمكنني مساعدتك في العثور على المنتجات المثالية اليوم؟",
      
      "Hi there! I'm here to help you discover amazing products. What are you looking for?":
        "أهلاً! أنا هنا لمساعدتك في اكتشاف منتجات رائعة. ماذا تبحث عنه؟",
      
      "Welcome! I can help you search for products, make recommendations, or answer questions. What would you like to do?":
        "أهلاً وسهلاً! يمكنني مساعدتك في البحث عن المنتجات أو تقديم التوصيات أو الإجابة على الأسئلة. ماذا تريد أن تفعل؟",
      
      // Search responses
      "I found": "وجدت",
      "products matching your search:": "منتج يطابق بحثك:",
      "I couldn't find any products matching": "لم أتمكن من العثور على منتجات تطابق",
      "Could you try different keywords or be more specific?": "هل يمكنك تجربة كلمات مفتاحية أخرى أو أن تكون أكثر تحديداً؟",
      
      // Recommendations
      "Based on your preferences, I recommend these products:": "بناءً على تفضيلاتك، أنصح بهذه المنتجات:",
      "These are popular items that match your interests!": "هذه منتجات شائعة تطابق اهتماماتك!",
      
      // Price responses
      "Here are products in your price range": "إليك المنتجات في نطاق السعر الخاص بك",
      "Would you like to see more options?": "هل تريد رؤية المزيد من الخيارات؟",
      
      // Availability
      "Here's our current stock status:": "إليك حالة المخزون الحالية:",
      "products in stock": "منتج متوفر",
      "products out of stock": "منتج غير متوفر",
      
      // Help
      "I'm here to help you shop! I can:": "أنا هنا لمساعدتك في التسوق! يمكنني:",
      "Search for products": "البحث عن المنتجات",
      "Make recommendations": "تقديم التوصيات",
      "Find products by price": "العثور على المنتجات حسب السعر",
      "Check availability": "التحقق من التوفر",
      "Help with your cart": "المساعدة مع سلة التسوق",
      
      // Goodbye
      "Thank you for shopping with us! Have a great day!": "شكراً لتسوقك معنا! أتمنى لك يوماً رائعاً!",
      "Goodbye! Feel free to come back anytime for more shopping assistance.": "وداعاً! لا تتردد في العودة في أي وقت للحصول على المزيد من المساعدة في التسوق.",
      
      // Error
      "I'm not sure I understand. Could you try rephrasing that?": "لست متأكداً من فهمي. هل يمكنك إعادة صياغة ذلك؟",
    };
    
    let translatedContent = content;
    
    // Apply translations
    Object.entries(translations).forEach(([en, ar]) => {
      translatedContent = translatedContent.replace(new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), ar);
    });
    
    return translatedContent;
  }

  // Translate suggestions
  private translateSuggestion(suggestion: string, language: 'en' | 'ar'): string {
    if (language === 'en') return suggestion;
    
    const translations: Record<string, string> = {
      "Show me popular products": "أظهر لي المنتجات الشائعة",
      "Find products under $50": "ابحث عن منتجات تحت $50",
      "Recommend something for me": "انصحني بشيء",
      "What's new in electronics?": "ما الجديد في الإلكترونيات؟",
      "Show me all products": "أظهر لي جميع المنتجات",
      "What categories do you have?": "ما هي الفئات المتوفرة؟",
      "Find popular items": "ابحث عن العناصر الشائعة",
      "Search for electronics": "ابحث في الإلكترونيات",
      "Show me more results": "أظهر المزيد من النتائج",
      "Filter by price": "فلترة حسب السعر",
      "Show only in-stock items": "أظهر المنتجات المتوفرة فقط",
      "Sort by popularity": "ترتيب حسب الشعبية",
      "Try again": "حاول مرة أخرى",
      "Ask something else": "اسأل شيئاً آخر",
      "Show me products": "أظهر لي المنتجات",
      "Get help": "احصل على مساعدة",
    };
    
    return translations[suggestion] || suggestion;
  }

  // Get language-specific suggestions
  getSuggestions(language: 'en' | 'ar' = 'en'): string[] {
    const suggestions = {
      en: [
        "Show me popular products",
        "Find products under $100",
        "What's new in electronics?",
        "Recommend something for me",
        "Help me find a gift"
      ],
      ar: [
        "أظهر لي المنتجات الشائعة",
        "ابحث عن منتجات تحت $100",
        "ما الجديد في الإلكترونيات؟",
        "انصحني بشيء",
        "ساعدني في العثور على هدية"
      ]
    };
    
    return suggestions[language] || suggestions.en;
  }
}

// Factory function to create multilingual shopping assistant
export function createMultilingualShoppingAssistant(products: ProductsWithImages[]): MultilingualShoppingAssistant {
  return new MultilingualShoppingAssistant(products);
}
