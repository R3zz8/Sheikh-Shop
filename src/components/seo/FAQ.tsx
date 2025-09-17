'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FAQJsonLd } from './JsonLd';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  faqs: FAQItem[];
  title?: string;
  className?: string;
}

export default function FAQ({ faqs, title = 'Frequently Asked Questions', className = '' }: FAQProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <>
      <FAQJsonLd faqs={faqs} />
      <div className={`space-y-4 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-inset transition-colors duration-200"
                aria-expanded={openItems.has(index)}
                aria-controls={`faq-answer-${index}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  {openItems.has(index) ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </div>
              </button>
              {openItems.has(index) && (
                <div
                  id={`faq-answer-${index}`}
                  className="px-6 py-4 bg-gray-50 border-t border-gray-200"
                >
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// Pre-defined FAQ data for different sections
export const shippingFAQs: FAQItem[] = [
  {
    question: 'How long does shipping take?',
    answer: 'We offer worldwide shipping with delivery times of 3-7 business days for domestic orders and 7-14 business days for international orders. Express shipping options are available for faster delivery.',
  },
  {
    question: 'What are the shipping costs?',
    answer: 'Shipping is free for orders over $100. For orders under $100, standard shipping costs $9.99. Express shipping is available for $19.99.',
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Yes, we ship to over 50 countries worldwide. International shipping costs vary by destination and are calculated at checkout.',
  },
  {
    question: 'How is my order packaged?',
    answer: 'All products are carefully packaged in premium, eco-friendly materials to ensure they arrive in perfect condition. Fragile items receive extra protection.',
  },
];

export const productFAQs: FAQItem[] = [
  {
    question: 'Are your products authentic?',
    answer: 'Yes, all our products are 100% authentic and sourced directly from trusted suppliers. We guarantee the authenticity and quality of every item.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy for unopened products in their original packaging. Returns are free and we provide a full refund.',
  },
  {
    question: 'How should I store my products?',
    answer: 'Store products in a cool, dry place away from direct sunlight. Specific storage instructions are provided with each product.',
  },
  {
    question: 'Do you offer bulk discounts?',
    answer: 'Yes, we offer volume discounts for orders over 10 units. Contact our customer service team for custom pricing.',
  },
];

export const paymentFAQs: FAQItem[] = [
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers.',
  },
  {
    question: 'Is my payment information secure?',
    answer: 'Yes, we use industry-standard SSL encryption and PCI-compliant payment processing to ensure your payment information is secure.',
  },
  {
    question: 'Do you offer payment plans?',
    answer: 'Yes, we offer flexible payment plans through Klarna and Afterpay for orders over $50.',
  },
  {
    question: 'Can I pay in different currencies?',
    answer: 'Yes, we accept payments in USD, EUR, GBP, AED, and SAR. Currency conversion is handled automatically at checkout.',
  },
];


