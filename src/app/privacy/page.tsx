'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Lock, Shield, Eye, Database, Clock, Share2, Users, Cookie, Key, UserCheck, AlertCircle, Mail } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const privacySections = [
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: Database,
      content: `We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.

**Personal Information:**
- Name, email address, phone number, and billing address
- Payment information (processed securely through our payment partners)
- Account credentials and preferences
- Communication history with our support team

**Usage Information:**
- Website usage patterns and preferences
- Device information and browser type
- IP address and location data
- Cookies and similar tracking technologies

**Content Information:**
- Product reviews and ratings
- Customer service communications
- Survey responses and feedback

We collect this information to provide, maintain, and improve our services, process transactions, and communicate with you about your account and our services.`
    },
    {
      id: 'how-we-use',
      title: 'How We Use Your Information',
      icon: Eye,
      content: `We use the information we collect for various business purposes, including:

**Service Provision:**
- Processing and fulfilling your orders
- Managing your account and preferences
- Providing customer support and technical assistance
- Personalizing your shopping experience

**Communication:**
- Sending order confirmations and shipping updates
- Responding to your inquiries and support requests
- Sending marketing communications (with your consent)
- Notifying you about important changes to our services

**Business Operations:**
- Analyzing website usage and customer behavior
- Improving our products and services
- Conducting research and analytics
- Preventing fraud and ensuring security

**Legal Compliance:**
- Complying with applicable laws and regulations
- Responding to legal requests and court orders
- Protecting our rights and interests

We will only use your personal information for the purposes described in this policy or as otherwise disclosed to you at the time of collection.`
    },
    {
      id: 'data-retention',
      title: 'Data Retention',
      icon: Clock,
      content: `We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.

**Retention Periods:**
- Account information: Until you delete your account or request deletion
- Order information: 7 years for tax and accounting purposes
- Marketing communications: Until you unsubscribe or opt out
- Customer support records: 3 years after the last interaction
- Website analytics: 2 years from collection

**Deletion Process:**
- You may request deletion of your personal information at any time
- We will delete your information within 30 days of receiving your request
- Some information may be retained for legal or business purposes
- Anonymized data may be retained for analytics and research

**Secure Disposal:**
- All personal information is securely deleted using industry-standard methods
- Physical records are shredded and disposed of securely
- Electronic data is permanently erased from all systems

We will notify you if we need to retain your information for longer than the standard retention period.`
    },
    {
      id: 'information-sharing',
      title: 'Information Sharing',
      icon: Share2,
      content: `We do not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:

**Service Providers:**
- Payment processors for transaction processing
- Shipping companies for order fulfillment
- Email service providers for communications
- Analytics providers for website improvement
- Cloud storage providers for data hosting

**Business Transfers:**
- In connection with a merger, acquisition, or sale of assets
- As part of a corporate restructuring
- With your explicit consent

**Legal Requirements:**
- To comply with applicable laws and regulations
- To respond to legal requests and court orders
- To protect our rights and interests
- To prevent fraud or illegal activities

**Protection of Rights:**
- To protect the safety and security of our users
- To investigate potential violations of our terms
- To defend against legal claims

All third parties with whom we share information are required to maintain the confidentiality and security of your personal information and use it only for the purposes for which it was shared.`
    },
    {
      id: 'minors-privacy',
      title: 'Privacy of Minors',
      icon: Users,
      content: `Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.

**Age Verification:**
- We require users to be at least 13 years old to create an account
- We do not knowingly collect information from children under 13
- If we learn we have collected information from a child under 13, we will delete it immediately

**Parental Rights:**
- Parents may review, update, or delete their child's information
- Parents may refuse to permit further collection of their child's information
- Parents may contact us to exercise these rights

**Teen Privacy (13-17):**
- We may collect limited information from users aged 13-17
- We require parental consent for certain activities
- We provide additional protections for teen users

**Reporting Concerns:**
- If you believe we have collected information from a child under 13, please contact us immediately
- We will investigate and take appropriate action
- We will notify parents if we discover we have collected information from their child

We are committed to protecting the privacy of children and complying with applicable laws regarding children's privacy.`
    },
    {
      id: 'cookies-tracking',
      title: 'Cookies and Tracking Technologies',
      icon: Cookie,
      content: `We use cookies and similar tracking technologies to enhance your experience on our website.

**Types of Cookies:**
- Essential cookies: Required for basic website functionality
- Performance cookies: Help us understand how visitors use our website
- Functionality cookies: Remember your preferences and settings
- Marketing cookies: Used to deliver relevant advertisements

**Cookie Management:**
- You can control cookies through your browser settings
- You can opt out of non-essential cookies
- Disabling cookies may affect website functionality
- We provide clear information about our cookie usage

**Third-Party Tracking:**
- We use Google Analytics to understand website usage
- We may use social media pixels for advertising
- We work with advertising partners to show relevant ads
- You can opt out of personalized advertising

**Data Collection:**
- We collect information about your browsing behavior
- We track which pages you visit and how long you stay
- We monitor your interactions with our website
- We use this information to improve our services

We are transparent about our use of cookies and provide you with control over your privacy preferences.`
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: Shield,
      content: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

**Security Measures:**
- Encryption of data in transit and at rest
- Regular security assessments and updates
- Access controls and authentication systems
- Secure data centers and infrastructure

**Employee Training:**
- Regular privacy and security training for all employees
- Strict confidentiality agreements
- Limited access to personal information on a need-to-know basis
- Regular audits of data handling practices

**Incident Response:**
- We have procedures in place to respond to security incidents
- We will notify affected users of any data breaches
- We work with law enforcement when necessary
- We continuously monitor for potential security threats

**Third-Party Security:**
- We carefully vet all third-party service providers
- We require security certifications from our partners
- We regularly review third-party security practices
- We have contracts in place to ensure data protection

While we strive to protect your personal information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security but are committed to maintaining the highest standards of data protection.`
    },
    {
      id: 'your-rights',
      title: 'Your Rights',
      icon: UserCheck,
      content: `You have certain rights regarding your personal information, which may vary depending on your location.

**Access Rights:**
- Request access to your personal information
- Receive a copy of the data we hold about you
- Understand how we use your information
- Verify the accuracy of your data

**Correction Rights:**
- Request correction of inaccurate information
- Update your personal details
- Complete incomplete information
- Ensure data accuracy and completeness

**Deletion Rights:**
- Request deletion of your personal information
- Right to be forgotten (where applicable)
- Withdraw consent for data processing
- Object to certain types of processing

**Portability Rights:**
- Receive your data in a structured format
- Transfer your data to another service provider
- Export your account information
- Maintain control over your data

**Objection Rights:**
- Object to processing for marketing purposes
- Opt out of automated decision-making
- Withdraw consent at any time
- Request restriction of processing

To exercise these rights, please contact us using the information provided in the Contact Us section. We will respond to your request within 30 days.`
    },
    {
      id: 'policy-changes',
      title: 'Changes to This Policy',
      icon: AlertCircle,
      content: `We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws.

**Notification of Changes:**
- We will notify you of material changes via email
- We will post the updated policy on our website
- We will update the "Last Updated" date at the top of this policy
- We will provide a summary of significant changes

**Your Continued Use:**
- Your continued use of our services after changes constitutes acceptance
- You may withdraw consent if you disagree with changes
- You may contact us with questions about changes
- We will honor your previous consent until you update your preferences

**Version Control:**
- We maintain a history of policy changes
- Previous versions are available upon request
- We track when and why changes were made
- We document the impact of changes on your rights

**Effective Date:**
- Changes become effective immediately upon posting
- We will provide reasonable notice for material changes
- We will give you time to review changes before they take effect
- We will respect your right to opt out of new practices

We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.`
    },
    {
      id: 'contact-us',
      title: 'Contact Us',
      icon: Mail,
      content: `If you have any questions about this Privacy Policy or our data practices, please contact us:

**Privacy Officer:**
Sheikh Shop Privacy Team
Email: privacy@sheikhshops.com
Phone: +1 (555) 123-4567
Address: 123 Luxury Lane, Premium District, CA 90210

**Data Protection Officer:**
For EU residents and GDPR-related inquiries
Email: dpo@sheikhshops.com
Phone: +1 (555) 123-4568

**Response Times:**
- General inquiries: Within 48 hours
- Privacy requests: Within 30 days
- Security incidents: Within 24 hours
- Legal requests: As required by law

**Languages:**
- English (primary)
- Arabic (available upon request)
- Spanish (available upon request)
- French (available upon request)

**Office Hours:**
Monday - Friday: 9:00 AM - 6:00 PM PST
Saturday: 10:00 AM - 4:00 PM PST
Sunday: Closed

We are committed to addressing your privacy concerns promptly and professionally.`
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
              <Lock className="w-12 h-12 text-amber-400" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="text-gray-300 text-lg max-w-3xl mx-auto"
            >
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
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
                {privacySections.map((section, index) => {
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
              Protecting your privacy is our commitment
            </p>
          </div>
        </motion.footer>
        </div>
    </div>
  );
}