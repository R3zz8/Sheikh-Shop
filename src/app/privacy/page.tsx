'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  Cookie,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const sections = [
    {
      id: 'collection',
      title: 'نحوه جمع‌آوری اطلاعات',
      subtitle: 'جمع‌آوری هوشمندانه و اصولی داده‌ها جهت ارتقای خدمات',
      icon: Database,
      content: [
        {
          label: 'اطلاعات هویتی و تماسی شما',
          desc: 'هنگام ثبت‌نام، سفارش یا ارتباط با ما، اطلاعاتی چون نام، نشانی، ایمیل و شماره تلفن همراه با نهایت دقت و امنیت ثبت می‌شوند.'
        },
        {
          label: 'داده‌های ترجیحی و رفتار خرید',
          desc: 'علاقه‌مندی‌ها، نظرات و الگوهای جستجوی شما برای ارائه پیشنهادهای هوشمندانه‌تر ثبت و تحلیل می‌شوند.'
        },
        {
          label: 'اطلاعات فنی و ناوبری',
          desc: 'نوع دستگاه، سیستم‌عامل، آدرس IP و صفحات مورد بازدید جهت بهینه‌سازی فنی ساختار وب‌سایت ثبت می‌گردند.'
        }
      ]
    },
    {
      id: 'usage',
      title: 'نحوه استفاده از اطلاعات',
      subtitle: 'استفاده هدفمند تنها برای تسهیل تجربه خرید ممتاز شما',
      icon: Eye,
      content: [
        {
          label: 'پردازش دقیق و ارسال هوشمند سفارش‌ها',
          desc: 'اطلاعات مکانی و تماسی شما صرفاً جهت تضمین تحویل سریع و بدون نقص محموله‌های لوکس استفاده می‌شود.'
        },
        {
          label: 'پشتیبانی اختصاصی و شخصی‌سازی‌شده',
          desc: 'سوابق ارتباطی شما به کارشناسان ما کمک می‌کند تا در کوتاه‌ترین زمان، پاسخگوی درخواست‌های شما باشند.'
        },
        {
          label: 'اطلاع‌رسانی‌های ارزشمند و هوشمند',
          desc: 'با رضایت قبلی شما، آخرین اخبار محصولات ممتاز، نسخه‌های محدود و پیشنهادهای ویژه به دستتان خواهد رسید.'
        }
      ]
    },
    {
      id: 'security',
      title: 'امنیت اطلاعات',
      subtitle: 'دژ استوار حفاظت از حریم شخصی شما در دنیای مجازی',
      icon: Lock,
      content: [
        {
          label: 'رمزنگاری پیشرفته داده‌ها (SSL)',
          desc: 'تمامی اطلاعات ورودی و ترکنش‌ها با پروتکل‌های رمزنگاری لایه انتقال به صورت کاملاً غیرقابل نفوذ جابه‌جا می‌شوند.'
        },
        {
          label: 'محدودیت دسترسی‌های داخلی',
          desc: 'دسترسی همکاران ما به داده‌های مشتریان بر اساس بالاترین استانداردهای امنیتی و طبقه‌بندی‌های اداری مدیریت می‌شود.'
        },
        {
          label: 'پایش مستمر و مانیتورینگ هوشمند',
          desc: 'سیستم‌های امنیتی شیخ به صورت ۲۴ ساعته در برابر تلاش‌های نفوذ پایش شده و به‌روزرسانی می‌شوند.'
        }
      ]
    },
    {
      id: 'cookies',
      title: 'کوکی‌ها',
      subtitle: 'فناوری‌های کوچک برای ایجاد هماهنگی بزرگ در مرور سایت',
      icon: Cookie,
      content: [
        {
          label: 'شخصی‌سازی خودکار ترجیحات شما',
          desc: 'کوکی‌ها به ما اجازه می‌دهند اولویت‌های زبانی، حالت تاریک و سبد خرید شما را در مراجعات بعدی حفظ کنیم.'
        },
        {
          label: 'تحلیل آماری و بهبود ساختار فرآیندها',
          desc: 'با جمع‌آوری آمارهای کلی ترافیک بدون شناسایی هویت فردی، تجربه ناوبری وب‌سایت را بهبود می‌بخشیم.'
        },
        {
          label: 'مدیریت آزادانه کوکی‌ها',
          desc: 'شما می‌توانید از طریق تنظیمات مرورگر خود در هر زمان استفاده از کوکی‌ها را محدود یا غیرفعال سازید.'
        }
      ]
    },
    {
      id: 'rights',
      title: 'حقوق کاربران',
      subtitle: 'مالکیت تمام و کمال شما بر داده‌های شخصیتان در شیخ',
      icon: UserCheck,
      content: [
        {
          label: 'حق دسترسی و آگاهی کامل',
          desc: 'شما در هر زمان می‌توانید یک نسخه کامل از اطلاعات هویتی و سوابق سفارش‌های خود را دریافت نمایید.'
        },
        {
          label: 'حق ویرایش و به‌روزرسانی فوری',
          desc: 'هرگونه تغییر در آدرس، شماره تلفن یا مشخصات هویتی به سادگی و از طریق پنل کاربری قابل ویرایش است.'
        },
        {
          label: 'حق فراموشی و حذف دائمی حساب',
          desc: 'شما می‌توانید درخواست حذف کامل و برگشت‌ناپذیر تمامی داده‌های خود را به تیم حریم خصوصی ما ارسال نمایید.'
        }
      ]
    },
    {
      id: 'contact',
      title: 'ارتباط با ما',
      subtitle: 'تیم اختصاصی حریم خصوصی همواره پاسخگوی سوالات شماست',
      icon: Mail,
      isContact: true,
      content: []
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-black relative overflow-hidden font-vazirmatn text-right" dir="rtl">
      {/* Premium Background Ambient Effects */}
      <div className="absolute inset-0 bg-[url('/assets/pattern.png')] opacity-5 pointer-events-none"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-orange-500/5 blur-[150px] pointer-events-none" />

      {/* Floating Sparkles Background Anim */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400 rounded-full opacity-30"
            style={{
              top: `${15 + i * 15}%`,
              left: `${10 + (i * 17) % 80}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.7, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 5 + i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 z-50"
        style={{ width: progressWidth }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 pt-28 pb-24">
        {/* Premium Hero Section */}
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
            <ShieldCheck className="w-12 h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] relative z-10" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent mb-4 tracking-tight">
            حریم خصوصی
          </h1>

          <p className="text-gray-300 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
            حفظ امنیت و حریم خصوصی کاربران، یکی از مهم‌ترین تعهدات فروشگاه شیخ است.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-amber-300/80 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            <span>آخرین به‌روزرسانی: دی‌ماه ۱۴۰۳</span>
          </motion.div>
        </motion.div>

        {/* Beautiful Glass Card Container */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isOpen = activeSection === section.id;

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
              >
                <div
                  className={`bg-gradient-to-br from-amber-950/20 via-stone-900/30 to-black/40 backdrop-blur-md rounded-2xl border transition-all duration-500 shadow-xl overflow-hidden ${
                    isOpen
                      ? 'border-amber-500/40 shadow-amber-900/15 scale-[1.01]'
                      : 'border-amber-200/10 hover:border-amber-500/25 shadow-black/30'
                  }`}
                >
                  {/* Card Header Trigger */}
                  <button
                    onClick={() => setActiveSection(isOpen ? null : section.id)}
                    className="w-full px-6 py-5 flex items-center justify-between gap-4 text-right cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-amber-300 transition-colors duration-300">
                          {section.title}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-400 mt-0.5 font-light">
                          {section.subtitle}
                        </p>
                      </div>
                    </div>

                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-amber-400"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>

                  {/* Card Body Content */}
                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 border-t border-amber-200/10 bg-black/20">
                      {section.isContact ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition-all duration-300">
                            <Mail className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="text-sm font-bold text-white mb-1">پست الکترونیک</h4>
                              <p className="text-xs text-gray-300 select-all">privacy@sheikhshops.com</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition-all duration-300">
                            <Phone className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="text-sm font-bold text-white mb-1">تلفن تماس مستقیم</h4>
                              <p className="text-xs text-gray-300 select-all [direction:ltr] inline-block">+98 917 876 9556</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition-all duration-300">
                            <MapPin className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="text-sm font-bold text-white mb-1">نشانی دفتر مرکزی</h4>
                              <p className="text-xs text-gray-300">ایران، بوشهر، مرکز شهر</p>
                            </div>
                          </div>

                          <div className="md:col-span-3 flex flex-col md:flex-row items-center justify-between p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 mt-2 gap-4">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-5 h-5 text-amber-400 flex-shrink-0" />
                              <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                                زمان پاسخگویی کارشناسان حریم خصوصی شنبه تا چهارشنبه از ساعت ۹:۰۰ الی ۱۷:۰۰ می‌باشد.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6 pt-4">
                          {section.content.map((item, idx) => (
                            <div key={idx} className="relative pr-5 group">
                              <div className="absolute right-0 top-2 w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform duration-300" />
                              <h4 className="text-sm md:text-base font-bold text-amber-100 mb-1.5">
                                {item.label}
                              </h4>
                              <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-light">
                                {item.desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Luxury Localized Footer */}
      <footer className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border-t border-amber-200/10 py-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-amber-100 font-medium text-base md:text-lg">
            فروشگاه شیخ © {new Date().getFullYear()} | تمامی حقوق محفوظ است
          </p>
          <p className="text-gray-400 text-xs md:text-sm mt-2 font-light">
            تعهد ما، حفظ امنیت کامل و آرامش خاطر شما در خرید اینترنتی است
          </p>
        </div>
      </footer>
    </div>
  );
}
