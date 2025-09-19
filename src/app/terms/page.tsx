'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Scale, 
  FileText, 
  Globe, 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  RotateCcw, 
  Shield, 
  Gavel, 
  AlertCircle, 
  Mail,
  Calendar,
  Users,
  Lock
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsConditionsPage() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const termsSections = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: FileText,
      content: `Welcome to Sheikh Shop ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of our website, products, and services.

**Agreement to Terms:**
By accessing or using our website, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.

**Updates to Terms:**
We may update these Terms from time to time. We will notify you of any material changes by posting the new Terms on our website. Your continued use of our services after such changes constitutes acceptance of the new Terms.

**Eligibility:**
You must be at least 18 years old to use our services. By using our services, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into this agreement.

**Contact Information:**
If you have any questions about these Terms, please contact us at legal@sheikhshops.com or through our customer service channels.

These Terms constitute a legally binding agreement between you and Sheikh Shop. Please read them carefully before using our services.`
    },
    {
      id: 'use-of-site',
      title: 'Use of Site',
      icon: Globe,
      content: `Our website is provided for your personal, non-commercial use. You agree to use our site in accordance with these Terms and all applicable laws and regulations.

**Permitted Uses:**
- Browse and view our products and services
- Make purchases for personal use
- Create and manage your account
- Contact our customer service team
- Read our content and information

**Prohibited Uses:**
You may not use our website for any unlawful purpose or in any way that could damage, disable, overburden, or impair our servers or networks. Specifically, you agree not to:
- Use our website for any commercial purpose without our express written consent
- Attempt to gain unauthorized access to any part of our website
- Interfere with or disrupt our website or servers
- Use any automated system to access our website
- Copy, modify, or distribute our content without permission
- Use our website to transmit any harmful or malicious code

**Intellectual Property:**
All content on our website, including text, graphics, logos, images, and software, is the property of Sheikh Shop or its licensors and is protected by copyright and other intellectual property laws.

**User-Generated Content:**
If you submit any content to our website (such as reviews or comments), you grant us a non-exclusive, royalty-free license to use, modify, and distribute such content.`
    },
    {
      id: 'orders',
      title: 'Orders and Purchases',
      icon: ShoppingCart,
      content: `When you place an order through our website, you are making an offer to purchase products. We reserve the right to accept or decline your order for any reason.

**Order Process:**
1. You select products and add them to your cart
2. You proceed to checkout and provide required information
3. You review your order and confirm the purchase
4. We process your payment and confirm your order
5. We prepare and ship your order

**Order Acceptance:**
We reserve the right to refuse or cancel any order at any time, including but not limited to:
- Orders that appear to be fraudulent
- Orders for products that are out of stock
- Orders that violate these Terms
- Orders with incorrect pricing information

**Pricing and Availability:**
- All prices are subject to change without notice
- Product availability is subject to change
- We reserve the right to limit quantities
- Prices do not include applicable taxes, which will be calculated at checkout

**Order Modifications:**
Once an order is placed, modifications may not be possible. If you need to make changes, please contact our customer service team immediately.

**Order Confirmation:**
You will receive an email confirmation when your order is placed. Please keep this confirmation for your records.`
    },
    {
      id: 'payments',
      title: 'Payments',
      icon: CreditCard,
      content: `We accept various payment methods to provide you with convenient and secure payment options.

**Accepted Payment Methods:**
- Credit cards (Visa, Mastercard, American Express)
- Debit cards
- PayPal
- Bank transfers (for certain orders)
- Other payment methods as specified at checkout

**Payment Processing:**
- All payments are processed securely through our payment partners
- We do not store your complete payment information
- Your payment information is encrypted and protected
- We use industry-standard security measures

**Payment Terms:**
- Payment is due at the time of order placement
- We reserve the right to verify payment information
- Failed payments may result in order cancellation
- Refunds will be processed to the original payment method

**Currency and Pricing:**
- All prices are displayed in US Dollars (USD)
- International orders may be subject to currency conversion
- Additional fees may apply for international transactions
- We reserve the right to adjust prices for currency fluctuations

**Billing:**
- You will receive an invoice for your purchase
- All charges are clearly itemized
- Taxes are calculated based on your location
- We are not responsible for any additional bank fees

**Payment Security:**
We take payment security seriously and use industry-standard encryption and security measures to protect your payment information.`
    },
    {
      id: 'shipping',
      title: 'Shipping and Delivery',
      icon: Truck,
      content: `We strive to deliver your orders quickly and safely. Please review our shipping policies carefully.

**Shipping Methods:**
- Standard shipping (5-7 business days)
- Express shipping (2-3 business days)
- Overnight shipping (1 business day)
- International shipping (7-14 business days)

**Shipping Costs:**
- Shipping costs are calculated at checkout
- Free shipping may be available for orders over a certain amount
- International shipping costs vary by destination
- Additional fees may apply for remote locations

**Delivery Times:**
- Delivery times are estimates and not guarantees
- Actual delivery times may vary due to factors beyond our control
- We are not responsible for delays caused by shipping carriers
- Weather and other external factors may affect delivery

**Shipping Restrictions:**
- Some products may not be available for international shipping
- Certain items may require special handling
- We reserve the right to refuse shipping to certain locations
- Additional documentation may be required for international orders

**Order Tracking:**
- You will receive tracking information once your order ships
- You can track your order using the provided tracking number
- Contact us if you have questions about your shipment

**Delivery Issues:**
- If your package is damaged during shipping, contact us immediately
- We will work with you to resolve any delivery issues
- Claims must be filed within 30 days of delivery
- We may require photos or other documentation

**International Shipping:**
- International orders may be subject to customs duties and taxes
- These additional charges are the responsibility of the recipient
- We are not responsible for customs delays or additional fees
- Please check your local customs regulations before ordering.`
    },
    {
      id: 'returns-refunds',
      title: 'Returns and Refunds',
      icon: RotateCcw,
      content: `We want you to be completely satisfied with your purchase. Please review our return and refund policy.

**Return Policy:**
- Returns must be initiated within 30 days of delivery
- Items must be in original condition with tags attached
- Some items may not be eligible for return (e.g., personalized items)
- Return shipping costs are the responsibility of the customer

**Return Process:**
1. Contact our customer service team to initiate a return
2. We will provide you with a return authorization number
3. Package the item securely with the return label
4. Ship the item back to us
5. We will process your refund once the item is received

**Refund Policy:**
- Refunds will be processed within 5-7 business days of receiving the returned item
- Refunds will be issued to the original payment method
- Original shipping costs are non-refundable
- Return shipping costs are not refunded unless the return is due to our error

**Exchange Policy:**
- Exchanges are subject to product availability
- You may exchange an item for a different size or color
- Price differences will be charged or refunded accordingly
- Exchange shipping costs are the responsibility of the customer

**Defective Products:**
- If you receive a defective product, contact us immediately
- We will provide a prepaid return label
- We will send a replacement or provide a full refund
- We apologize for any inconvenience caused by defective products

**Return Restrictions:**
- Personalized or custom items cannot be returned
- Items that have been used or damaged by the customer cannot be returned
- Items returned after 30 days may be refused
- We reserve the right to refuse returns that do not meet our criteria

**Refund Processing:**
- Refunds are processed to the original payment method
- Processing time may vary depending on your bank
- Contact us if you have not received your refund within 10 business days
- We are not responsible for delays caused by your bank or payment processor.`
    },
    {
      id: 'limitation-liability',
      title: 'Limitation of Liability',
      icon: Shield,
      content: `To the fullest extent permitted by law, Sheikh Shop's liability is limited as described below.

**General Limitation:**
In no event shall Sheikh Shop, its officers, directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising out of or relating to your use of our services.

**Maximum Liability:**
Our total liability to you for any claims arising out of or relating to these Terms or your use of our services shall not exceed the amount you paid us for the specific product or service giving rise to the claim.

**Exclusions:**
We are not liable for:
- Damages caused by your misuse of our products or services
- Damages caused by third parties
- Damages caused by events beyond our reasonable control
- Consequential or indirect damages
- Loss of profits or business opportunities

**Force Majeure:**
We are not liable for any failure or delay in performance due to circumstances beyond our reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, or government actions.

**Product Liability:**
- We are not liable for damages caused by misuse of our products
- We are not liable for damages caused by failure to follow product instructions
- We are not liable for damages caused by third-party modifications to our products
- Our liability is limited to the purchase price of the product

**Service Interruptions:**
We are not liable for any damages caused by temporary interruptions to our services, including but not limited to website downtime, server issues, or maintenance periods.

**Third-Party Services:**
We are not liable for any damages caused by third-party services, including but not limited to payment processors, shipping carriers, or other service providers.

**Jurisdictional Limitations:**
Some jurisdictions do not allow the limitation of liability, so the above limitations may not apply to you. In such cases, our liability will be limited to the fullest extent permitted by law.`
    },
    {
      id: 'governing-law',
      title: 'Governing Law and Disputes',
      icon: Gavel,
      content: `These Terms are governed by and construed in accordance with the laws of the State of California, United States.

**Governing Law:**
- These Terms are governed by California law
- Any disputes will be resolved in California courts
- We do not represent that our services are appropriate for use in other jurisdictions
- You are responsible for compliance with local laws

**Dispute Resolution:**
Before filing any legal action, you agree to first contact us to attempt to resolve the dispute informally. If we cannot resolve the dispute within 60 days, either party may proceed with legal action.

**Arbitration:**
Any disputes arising out of or relating to these Terms or your use of our services will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.

**Class Action Waiver:**
You agree that any arbitration or legal action will be conducted on an individual basis and not as a class action or representative action.

**Jurisdiction:**
You consent to the exclusive jurisdiction of the courts located in California for any legal action arising out of or relating to these Terms or your use of our services.

**Severability:**
If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.

**Waiver:**
Our failure to enforce any provision of these Terms does not constitute a waiver of that provision or any other provision.

**Entire Agreement:**
These Terms, together with our Privacy Policy, constitute the entire agreement between you and Sheikh Shop regarding your use of our services.

**Modifications:**
We reserve the right to modify these Terms at any time. Your continued use of our services after such modifications constitutes acceptance of the new Terms.

**Contact for Legal Matters:**
For any legal matters or disputes, please contact us at legal@sheikhshops.com or through our registered business address.`
    },
    {
      id: 'changes',
      title: 'Changes to Terms',
      icon: AlertCircle,
      content: `We may update these Terms from time to time to reflect changes in our business practices or applicable laws.

**Notification of Changes:**
- We will notify you of material changes via email
- We will post the updated Terms on our website
- We will update the "Last Updated" date at the top of these Terms
- We will provide a summary of significant changes

**Your Continued Use:**
- Your continued use of our services after changes constitutes acceptance
- You may discontinue use if you disagree with changes
- You may contact us with questions about changes
- We will honor your previous agreement until you update your preferences

**Version Control:**
- We maintain a history of Terms changes
- Previous versions are available upon request
- We track when and why changes were made
- We document the impact of changes on your rights

**Effective Date:**
- Changes become effective immediately upon posting
- We will provide reasonable notice for material changes
- We will give you time to review changes before they take effect
- We will respect your right to opt out of new practices

**Material Changes:**
Material changes include but are not limited to:
- Changes to our refund or return policy
- Changes to our pricing structure
- Changes to our service offerings
- Changes to our liability limitations

**Minor Changes:**
Minor changes include but are not limited to:
- Typographical corrections
- Clarifications of existing terms
- Updates to contact information
- Administrative changes

**Your Rights:**
- You have the right to review all changes
- You have the right to discontinue use if you disagree
- You have the right to contact us with questions
- You have the right to request previous versions

We encourage you to review these Terms periodically to stay informed about any changes.`
    },
    {
      id: 'contact-us',
      title: 'Contact Us',
      icon: Mail,
      content: `If you have any questions about these Terms or our services, please contact us:

**Legal Department:**
Sheikh Shop Legal Team
Email: legal@sheikhshops.com
Phone: +1 (555) 123-4567
Address: 123 Luxury Lane, Premium District, CA 90210

**Customer Service:**
For general inquiries and support
Email: support@sheikhshops.com
Phone: +1 (555) 123-4568
Live Chat: Available on our website

**Business Hours:**
Monday - Friday: 9:00 AM - 6:00 PM PST
Saturday: 10:00 AM - 4:00 PM PST
Sunday: Closed

**Response Times:**
- General inquiries: Within 24 hours
- Legal matters: Within 48 hours
- Urgent issues: Within 4 hours
- Business days only for non-urgent matters

**Languages:**
- English (primary)
- Arabic (available upon request)
- Spanish (available upon request)
- French (available upon request)

**Mailing Address:**
Sheikh Shop Legal Department
123 Luxury Lane
Premium District, CA 90210
United States

**Online Contact:**
- Website contact form
- Live chat support
- Email support
- Phone support

**Legal Notices:**
For formal legal notices, please send them to our registered business address with "Legal Notice" in the subject line.

**Privacy Inquiries:**
For privacy-related questions, please contact our Privacy Officer at privacy@sheikhshops.com.

We are committed to addressing your concerns promptly and professionally.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/public/assets/pattern.png')] opacity-5"></div>
      
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 z-50"
        style={{ width: progressWidth }}
      />

      <div className="relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="pt-20 pb-12"
        >
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="flex items-center justify-center gap-4 mb-6"
            >
              <Scale className="w-12 h-12 text-amber-400" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
                Terms & Conditions
              </h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="text-gray-300 text-lg max-w-3xl mx-auto"
            >
              Please read these terms and conditions carefully before using our services.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              className="mt-6 text-sm text-gray-400"
            >
              Last Updated: January 1, 2025
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="container mx-auto px-4 pb-20"
        >
          <Card className="bg-white/5 backdrop-blur-sm border border-amber-200/20 rounded-2xl overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <Accordion type="single" collapsible className="space-y-4">
                {termsSections.map((section, index) => {
                  const Icon = section.icon;
                  return (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 * index, ease: "easeOut" }}
                    >
                      <AccordionItem
                        value={section.id}
                        className="border border-amber-200/20 rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm"
                      >
                        <AccordionTrigger className="px-6 py-4 hover:bg-white/10 transition-colors duration-300">
                          <div className="flex items-center gap-4 text-left">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-semibold text-white">
                              {section.title}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          <div className="prose prose-invert max-w-none">
                            <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                              {section.content}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
          className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 py-8"
        >
          <div className="container mx-auto px-4 text-center">
            <p className="text-black font-semibold text-lg">
              Sheikh Shop © 2025 | All Rights Reserved
            </p>
            <p className="text-black/80 text-sm mt-2">
              Your trust and satisfaction are our priorities
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
