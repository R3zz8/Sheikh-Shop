'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Easing } from 'framer-motion';
import { Lock, Database, User, Mail } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function PrivacyPolicyPage() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setProgress(pct);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const easeOut: Easing = [0, 0, 0.2, 1];
  const fadeIn = {
  	initial: { opacity: 0, y: 12 },
  	animate: { opacity: 1, y: 0 },
  	transition: { duration: 0.4, ease: easeOut },
  } as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#0f0a07] to-black text-amber-50 relative overflow-x-hidden">
      {/* Reading progress bar */}
      <div className="sticky top-0 z-50 h-1 w-full bg-black/40 backdrop-blur">
        <div
          className="h-1 bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.7)] transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <motion.header
        {...fadeIn}
        className="container mx-auto px-6 pt-12 pb-6 max-w-3xl"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-full p-2 bg-gradient-to-br from-amber-600 to-amber-500 text-black shadow-md shadow-amber-800/40">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-amber-300">
            Privacy Policy
          </h1>
        </div>
        <p className="mt-4 text-sm text-amber-200/80">
          Effective date: January 2025 — www.sheikhshops.com
        </p>
      </motion.header>

      <main className="container mx-auto px-6 pb-20 max-w-3xl">
        <motion.div {...fadeIn} className="rounded-2xl border border-amber-900/30 bg-neutral-900/50 backdrop-blur-md p-4 md:p-6 shadow-xl shadow-black/40">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="collect">
              <AccordionTrigger className="text-left">
                <div className="inline-flex items-center gap-2 text-amber-300">
                  <Database className="h-5 w-5" />
                  <span>Information We Collect</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-invert max-w-none text-amber-100/90">
                  <p>We may collect the following types of information when you use our website:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <span className="font-medium">Personal Information:</span> Name, email address, phone number, and shipping address.
                    </li>
                    <li>
                      <span className="font-medium">Order & Payment Information:</span> Details necessary to process your purchases. Payment information is handled securely by third-party payment providers and is not stored on our servers.
                    </li>
                    <li>
                      <span className="font-medium">Technical Data:</span> IP address, browser type, device information, and cookies to enhance user experience.
                    </li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="use">
              <AccordionTrigger className="text-left">
                <div className="inline-flex items-center gap-2 text-amber-300">
                  <Lock className="h-5 w-5" />
                  <span>How We Use Your Information</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-invert max-w-none text-amber-100/90">
                  <p>We use the information collected for purposes such as:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Processing and fulfilling your orders.</li>
                    <li>Providing customer support and responding to inquiries.</li>
                    <li>Improving our website, products, and overall shopping experience.</li>
                    <li>Sending promotional offers, newsletters, or updates (only if you opt-in).</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="retention">
              <AccordionTrigger className="text-left">
                <div className="inline-flex items-center gap-2 text-amber-300">
                  <Database className="h-5 w-5" />
                  <span>Data Retention</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-invert max-w-none text-amber-100/90">
                  <p>
                    When you place an order through our website, we will maintain your order information in our records unless and until you
                    request that we delete it.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sharing">
              <AccordionTrigger className="text-left">
                <div className="inline-flex items-center gap-2 text-amber-300">
                  <Lock className="h-5 w-5" />
                  <span>Sharing of Information</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-invert max-w-none text-amber-100/90">
                  <p>We do not sell or rent your personal data to third parties. Information may only be shared with:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Service providers such as shipping companies and payment processors, solely for completing your order.</li>
                    <li>Legal authorities, if required to comply with applicable laws and regulations.</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="minors">
              <AccordionTrigger className="text-left">
                <div className="inline-flex items-center gap-2 text-amber-300">
                  <User className="h-5 w-5" />
                  <span>Minors</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-invert max-w-none text-amber-100/90">
                  <p>
                    Our website is not intended for individuals under the age of 18. If we discover that we have collected personal information
                    from a minor, we will take steps to delete it immediately.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cookies">
              <AccordionTrigger className="text-left">
                <div className="inline-flex items-center gap-2 text-amber-300">
                  <Lock className="h-5 w-5" />
                  <span>Cookies and Tracking Technologies</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-invert max-w-none text-amber-100/90">
                  <p>Sheikh Shop uses cookies and similar technologies to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Improve website functionality and user experience.</li>
                    <li>Analyze traffic and usage trends.</li>
                    <li>Provide personalized content and promotions.</li>
                  </ul>
                  <p>
                    You may disable cookies in your browser settings, but some parts of the site may not function properly as a result.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="security">
              <AccordionTrigger className="text-left">
                <div className="inline-flex items-center gap-2 text-amber-300">
                  <Lock className="h-5 w-5" />
                  <span>Security of Your Data</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-invert max-w-none text-amber-100/90">
                  <p>
                    We implement strict technical and organizational measures to protect your personal information against unauthorized access,
                    alteration, disclosure, or destruction. While we take all reasonable precautions, please note that no method of transmission
                    over the internet is 100% secure.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rights">
              <AccordionTrigger className="text-left">
                <div className="inline-flex items-center gap-2 text-amber-300">
                  <Lock className="h-5 w-5" />
                  <span>Your Rights</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-invert max-w-none text-amber-100/90">
                  <p>As a user, you have the right to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Access and request a copy of the personal data we hold about you.</li>
                    <li>Request correction or deletion of your personal information.</li>
                    <li>
                      Opt out of receiving promotional emails at any time by following the unsubscribe link provided.
                    </li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="changes">
              <AccordionTrigger className="text-left">
                <div className="inline-flex items-center gap-2 text-amber-300">
                  <Lock className="h-5 w-5" />
                  <span>Changes to This Policy</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-invert max-w-none text-amber-100/90">
                  <p>
                    We may update this Privacy Policy from time to time to reflect changes in our practices, operational requirements, or for
                    legal and regulatory reasons. Updates will be posted on this page with the “last updated” date revised.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contact">
              <AccordionTrigger className="text-left">
                <div className="inline-flex items-center gap-2 text-amber-300">
                  <Mail className="h-5 w-5" />
                  <span>Contact Us</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-invert max-w-none text-amber-100/90">
                  <p>For more information about our privacy practices, questions, or complaints, please contact us at:</p>
                  <ul className="list-none pl-0 space-y-1">
                    <li>📧 Email: sheikhshops.com@gmail.com</li>
                    <li>🌐 Website: www.sheikhshops.com</li>
                  </ul>
                  <p className="mt-2">📌 Last Updated: January 2025</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      </main>

      <footer className="mt-auto">
        <div className="bg-amber-400 text-black text-center py-6 font-medium tracking-wide">
          Sheikh Shop © 2025 | All Rights Reserved
        </div>
      </footer>
    </div>
  );
}


