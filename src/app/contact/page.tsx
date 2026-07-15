'use client';

import { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Brand SVG icons for luxury visual continuity
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function ContactPage() {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const contactInfos = [
    {
      name: 'تلفن همراه',
      value: '+98 917 876 9556',
      label: 'پاسخگویی مستقیم و اختصاصی',
      icon: Phone,
      dirLtr: true,
      href: 'tel:+989178769556',
    },
    {
      name: 'پست الکترونیک',
      value: 'sheikhshops.com@gmail.com',
      label: 'مکاتبات اداری و همکاری تجاری',
      icon: Mail,
      dirLtr: true,
      href: 'mailto:sheikhshops.com@gmail.com',
    },
    {
      name: 'نشانی مرکزی',
      value: 'ایران، بوشهر، مرکز شهر',
      label: 'پذیرای حضور شما با هماهنگی قبلی',
      icon: MapPin,
      dirLtr: false,
    },
    {
      name: 'ساعات پاسخگویی',
      value: 'شنبه تا پنج‌شنبه: ۹ الی ۲۱',
      label: 'تعطیلات رسمی: پشتیبانی پیام‌رسان‌ها',
      icon: Clock,
      dirLtr: false,
    },
  ];

  const socialItems = [
    {
      name: 'اینستاگرام',
      desc: 'مجموعه‌های جدید را دنبال کنید',
      href: 'https://www.instagram.com/sheikh._.shops?igsh=cnZ2b3owZTUxYng1',
      Icon: InstagramIcon,
      color: 'from-pink-600 to-amber-500',
    },
    {
      name: 'تیک‌تاک',
      desc: 'ویدیوهای کوتاه محصولات لوکس',
      href: 'https://tiktok.com/@sheikh_shop2025',
      Icon: TiktokIcon,
      color: 'from-stone-800 to-amber-700',
    },
    {
      name: 'یوتیوب',
      desc: 'بررسی دقیق محصولات ممتاز',
      href: 'https://www.youtube.com/@Fuzzel_Fun',
      Icon: YoutubeIcon,
      color: 'from-red-600 to-orange-500',
    },
    {
      name: 'فیس‌بوک',
      desc: 'به جامعه جهانی ما بپیوندید',
      href: 'https://www.facebook.com/share/1CJBL7zcbf/',
      Icon: FacebookIcon,
      color: 'from-blue-600 to-amber-600',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setSubmitStatus('error');
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus('idle');

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setForm({ name: '', email: '', message: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-black relative overflow-hidden font-vazirmatn text-right" dir="rtl">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/assets/pattern.png')] opacity-5 pointer-events-none"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-orange-500/5 blur-[130px] pointer-events-none" />

      {/* Floating Star Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400 rounded-full opacity-30"
            style={{
              top: `${20 + i * 15}%`,
              right: `${15 + (i * 19) % 70}%`,
            }}
            animate={{
              y: [0, -25, 0],
              opacity: [0.15, 0.6, 0.15],
            }}
            transition={{
              duration: 6 + i * 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pt-28 pb-24">
        {/* Premium Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
            className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-amber-500/15 to-orange-500/5 border border-amber-500/20 mb-6 relative group"
          >
            <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-md group-hover:bg-amber-500/15 transition-all duration-300" />
            <MessageSquare className="w-12 h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] relative z-10" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent mb-4 tracking-tight">
            تماس با ما
          </h1>

          <p className="text-gray-300 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
            همیشه آماده پاسخگویی به سوالات، پیشنهادات و درخواست‌های شما هستیم.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-amber-300/80 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>پشتیبانی VIP مشتریان طراز اول</span>
          </motion.div>
        </motion.div>

        {/* 4-Grid Premium Information Cards */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {contactInfos.map((info) => {
            const Icon = info.icon;
            return (
              <motion.div key={info.name} variants={itemVariants} className="h-full">
                {info.href ? (
                  <a
                    href={info.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full group bg-gradient-to-br from-amber-950/20 via-stone-900/40 to-black/50 backdrop-blur-md border border-amber-200/10 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300 shadow-lg hover:shadow-amber-900/10 hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="flex flex-col items-center text-center gap-4 h-full justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 group-hover:border-amber-500/40 transition-all duration-300">
                        <Icon className="w-7 h-7 text-amber-400 group-hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]" />
                      </div>
                      <div>
                        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
                          {info.name}
                        </h3>
                        <p
                          className={`text-white font-bold text-base tracking-wide leading-snug ${
                            info.dirLtr ? '[direction:ltr] inline-block' : ''
                          }`}
                        >
                          {info.value}
                        </p>
                      </div>
                      <p className="text-gray-400 text-xs font-light">{info.label}</p>
                    </div>
                  </a>
                ) : (
                  <div className="block h-full group bg-gradient-to-br from-amber-950/20 via-stone-900/40 to-black/50 backdrop-blur-md border border-amber-200/10 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300 shadow-lg hover:shadow-amber-900/10 hover:-translate-y-1">
                    <div className="flex flex-col items-center text-center gap-4 h-full justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 group-hover:border-amber-500/40 transition-all duration-300">
                        <Icon className="w-7 h-7 text-amber-400 group-hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]" />
                      </div>
                      <div>
                        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
                          {info.name}
                        </h3>
                        <p
                          className={`text-white font-bold text-base tracking-wide leading-snug ${
                            info.dirLtr ? '[direction:ltr] inline-block' : ''
                          }`}
                        >
                          {info.value}
                        </p>
                      </div>
                      <p className="text-gray-400 text-xs font-light">{info.label}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.section>

        {/* Form and Social Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Send us a message form */}
          <motion.section
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 h-full"
          >
            <div className="bg-gradient-to-br from-amber-950/20 via-stone-900/40 to-black/50 backdrop-blur-md border border-amber-200/10 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="w-2.5 h-6 rounded-full bg-amber-500" />
                ارسال پیام مستقیم
              </h2>
              <p className="text-gray-400 text-sm font-light mb-6">
                کارشناسان ما همواره مشتاق دریافت دیدگاه‌ها، سوالات و پیشنهادات شما هستند.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300 text-sm font-medium">نام و نام خانوادگی</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                      className="bg-white/5 border-amber-200/10 text-white placeholder-gray-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl py-5 text-right font-vazirmatn"
                      placeholder="نام شریف شما"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300 text-sm font-medium">نشانی پست الکترونیک</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                      className="bg-white/5 border-amber-200/10 text-white placeholder-gray-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl py-5 text-left [direction:ltr] font-vazirmatn"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-300 text-sm font-medium">متن پیام شما</Label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
                    className="min-h-[150px] bg-white/5 border-amber-200/10 text-white placeholder-gray-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl p-4 text-right leading-relaxed font-vazirmatn resize-none"
                    placeholder="پرسش، پیشنهاد یا سفارش ویژه خود را با ما در میان بگذارید..."
                  />
                </div>

                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
                  >
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p>پیام شما با موفقیت به دست ما رسید. کارشناسان ما به زودی با شما تماس خواهند گرفت.</p>
                  </motion.div>
                )}

                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>لطفاً تمامی فیلدهای فرم را با دقت تکمیل نمایید.</p>
                  </motion.div>
                )}

                <div className="flex justify-end pt-2">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700 text-white font-bold px-8 py-5 rounded-xl border border-amber-500/20 shadow-lg hover:shadow-amber-500/20 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>ارسال پیام</span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </form>
            </div>
          </motion.section>

          {/* Social and premium message section */}
          <motion.section
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            {/* Social Links Cards */}
            <div className="bg-gradient-to-br from-amber-950/20 via-stone-900/40 to-black/50 backdrop-blur-md border border-amber-200/10 rounded-3xl p-6 shadow-xl flex-1">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-2.5 h-6 rounded-full bg-yellow-500" />
                شبکه‌های اجتماعی شیخ
              </h2>

              <div className="space-y-4">
                {socialItems.map(({ name, desc, href, Icon, color }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all duration-300 hover:bg-amber-950/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors duration-300">
                          {name}
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5 font-light">
                          {desc}
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-all duration-300">
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Premium Note */}
            <div className="bg-gradient-to-br from-amber-900/30 to-amber-950/40 backdrop-blur-md border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
              <h3 className="text-amber-300 font-bold text-base mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-pulse" />
                اصالت و تعهد بی‌مرز
              </h3>
              <p className="text-gray-300 text-xs md:text-sm leading-relaxed font-light">
                فروشگاه شیخ تنها ارائه‌دهنده نیست؛ ما پاسداران اصالت و میراثی ارزشمند در قلب بوشهر هستیم. تمامی فرآیندهای ارتباطی شما مستقیماً تحت نظارت مدیران ارشد برند پیگیری می‌شود.
              </p>
            </div>
          </motion.section>
        </div>
      </div>

      {/* Luxury Footer */}
      <footer className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border-t border-amber-200/10 py-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-amber-100 font-medium text-base md:text-lg">
            فروشگاه شیخ © {new Date().getFullYear()} | تمامی حقوق محفوظ است
          </p>
          <p className="text-gray-400 text-xs md:text-sm mt-2 font-light">
            همیشه آماده شنیدن آوای پرمهر شما هستیم
          </p>
        </div>
      </footer>
    </div>
  );
}
