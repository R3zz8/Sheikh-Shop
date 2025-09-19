'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Mail,
  ArrowRight,
  Send,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Brand SVG icons (since lucide-react does not ship official brand icons)
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 4.999 3.657 9.142 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.506 1.492-3.89 3.775-3.89 1.094 0 2.238.195 2.238.195v2.47h-1.26c-1.243 0-1.63.774-1.63 1.568v1.88h2.773l-.443 2.91h-2.33V22c4.78-.798 8.438-4.941 8.438-9.94Z" />
    </svg>
  );
}
function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M23.5 6.2a4.8 4.8 0 0 0-3.4-3.4C18.3 2.3 12 2.3 12 2.3s-6.3 0-8.1.5A4.8 4.8 0 0 0 .5 6.2 50 50 0 0 0 0 12a50 50 0 0 0 .5 5.8 4.8 4.8 0 0 0 3.4 3.4c1.8.5 8.1.5 8.1.5s6.3 0 8.1-.5a4.8 4.8 0 0 0 3.4-3.4A50 50 0 0 0 24 12a50 50 0 0 0-.5-5.8ZM9.7 15.6V8.4l6.3 3.6-6.3 3.6Z" />
    </svg>
  );
}
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.2 2.3.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.3 1.1.4 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.9-.4 2.3-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.3-2.3.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.2-2.3-.4a3.5 3.5 0 0 1-1.4-.9 3.5 3.5 0 0 1-.9-1.4c-.2-.4-.3-1.1-.4-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.9.4-2.3.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.3 2.3-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.1-1 0-1.6.2-2 .3-.5.2-.8.4-1.1.8-.3.3-.6.7-.8 1.1-.1.4-.3 1-.3 2-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c0 1 .2 1.6.3 2 .2.5.4.8.8 1.1.3.3.7.6 1.1.8.4.1 1 .3 2 .3 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1 0 1.6-.2 2-.3.5-.2.8-.4 1.1-.8.3-.3.6-.7.8-1.1.1-.4.3-1 .3-2 .1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c0-1-.2-1.6-.3-2-.2-.5-.4-.8-.8-1.1-.3-.3-.7-.6-1.1-.8-.4-.1-1-.3-2-.3-1.2-.1-1.6-.1-4.7-.1Zm0 3.3a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4Zm0 1.8a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Zm5.9-2.1a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z" />
    </svg>
  );
}
function TiktokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.6 8.2a6.6 6.6 0 0 1-4.6-1.9v7.2c0 3.7-3 6.7-6.7 6.7S3.6 17.2 3.6 13.5s3-6.7 6.7-6.7c.3 0 .6 0 .9.1v3a3.8 3.8 0 0 0-.9-.1 3.7 3.7 0 1 0 3.7 3.7V2.7h3a6.6 6.6 0 0 0 4.6 1.9v3.6Z" />
    </svg>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ContactPage() {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const socialItems = [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/share/1CJBL7zcbf/',
      Icon: FacebookIcon,
    },
    {
      name: 'YouTube',
      href: 'https://www.youtube.com/@Fuzzel_Fun',
      Icon: YoutubeIcon,
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/energyup_._?igsh=cnZ2b3owZTUxYng1',
      Icon: InstagramIcon,
    },
    {
      name: 'TikTok',
      href: 'https://tiktok.com/@sheikh_shop2025',
      Icon: TiktokIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/public/assets/pattern.png')] opacity-5"></div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="pt-20 pb-10"
        >
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
              className="flex items-center justify-center gap-4 mb-4"
            >
              <MessageSquare className="w-12 h-12 text-amber-400" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
                Contact Us
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              className="text-gray-300 max-w-2xl mx-auto"
            >
              We’d love to hear from you. Reach out via social media or email.
            </motion.p>
          </div>
        </motion.div>

        {/* Social Media Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="container mx-auto px-4 pb-10"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {socialItems.map(({ name, href, Icon }, idx) => (
              <motion.div key={name} variants={itemVariants}>
                <Card className="bg-white/6 backdrop-blur-sm border border-amber-200/20 rounded-2xl h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-white font-semibold text-lg">{name}</div>
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-black font-semibold shadow-lg hover:shadow-amber-500/25 transition-all duration-300 group"
                    >
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        Visit {name}
                        <ArrowRight className="w-4 h-4 ml-2 inline-block group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Email Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 pb-10"
        >
          <Card className="bg-white/6 backdrop-blur-sm border border-amber-200/20 rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3 text-white">
                <Mail className="w-6 h-6 text-amber-400" /> Email Us Directly
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <p className="text-gray-300">Have a question? We typically respond within 24–48 hours.</p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-black font-semibold shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
                >
                  <a href="mailto:sheikhshops.com@gmail.com">
                    sheikhshops.com@gmail.com
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Optional Contact Form */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 pb-16"
        >
          <Card className="bg-white/6 backdrop-blur-sm border border-amber-200/20 rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Send us a message</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // For now, just log. Could integrate API later.
                  console.log('Contact form submit', form);
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <Label htmlFor="name" className="text-gray-300">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    className="mt-1 bg-white/10 border-amber-200/20 text-white placeholder-gray-400 focus:border-amber-400"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                    className="mt-1 bg-white/10 border-amber-200/20 text-white placeholder-gray-400 focus:border-amber-400"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="message" className="text-gray-300">Message</Label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
                    className="mt-1 min-h-32 bg-white/10 border-amber-200/20 text-white placeholder-gray-400 focus:border-amber-400"
                    placeholder="How can we help you?"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-black font-semibold shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </motion.div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 py-8"
        >
          <div className="container mx-auto px-4 text-center">
            <p className="text-black font-semibold text-lg">
              Sheikh Shop © 2025 | All Rights Reserved
            </p>
            <p className="text-black/80 text-sm mt-2">
              Committed to connecting with our customers.
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
