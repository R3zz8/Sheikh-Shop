'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Save,
  RotateCcw,
  Sparkles,
  Settings,
  Eye,
  Sliders,
  Volume2,
  VolumeX,
  Palette,
  Layers,
  Heart,
  ShoppingCart,
  Play,
  FileCode,
  AlertTriangle,
  Clock,
  Camera,
  Wind
} from 'lucide-react';
import LuxuryGiftBox from '@/components/3d/LuxuryGiftBox';

interface CatalogProduct {
  id: string;
  name: string;
  slug?: string | null;
  basePrice: number;
  images?: Array<{ image?: string | null; secureUrl?: string | null }> | null;
}

export default function LuxuryUnboxingAdminPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Unboxing configurations state including all extended luxury properties
  const [config, setConfig] = useState({
    isEnabled: true,
    animationSpeed: 1.0,
    particleDensity: 1.0,
    lightIntensity: 1.0,
    cameraDistance: 5.0,
    enableAudio: true,
    ribbonColor: '#d97706',
    goldenGlow: '#f59e0b',
    backgroundStyle: 'dark-ambient',
    openingDuration: 3.0,
    featuredProductMode: 'pedestal',
    autoPreview: false,
    introDuration: 2.0,
    cameraSpeed: 1.0,
    fogIntensity: 1.0,
    audioVolume: 0.5,
    animationPreset: 'classic',
    autoClose: false,
    ctaStyle: 'luxury',
    themePreset: 'gold-chocolate',
  });

  const [allProducts, setAllProducts] = useState<CatalogProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);

  // Interactive preview simulator states
  const [previewStatus, setPreviewStatus] = useState<'closed' | 'opening' | 'open'>('closed');
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    setMounted(true);

    const loadData = async () => {
      try {
        const res = await fetch('/api/admin/luxury-unboxing');
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setConfig({
              isEnabled: data.config.isEnabled ?? true,
              animationSpeed: Number(data.config.animationSpeed) || 1.0,
              particleDensity: Number(data.config.particleDensity) || 1.0,
              lightIntensity: Number(data.config.lightIntensity) || 1.0,
              cameraDistance: Number(data.config.cameraDistance) || 5.0,
              enableAudio: data.config.enableAudio ?? true,
              ribbonColor: data.config.ribbonColor || '#d97706',
              goldenGlow: data.config.goldenGlow || '#f59e0b',
              backgroundStyle: data.config.backgroundStyle || 'dark-ambient',
              openingDuration: Number(data.config.openingDuration) || 3.0,
              featuredProductMode: data.config.featuredProductMode || 'pedestal',
              autoPreview: data.config.autoPreview ?? false,
              introDuration: Number(data.config.introDuration) ?? 2.0,
              cameraSpeed: Number(data.config.cameraSpeed) ?? 1.0,
              fogIntensity: Number(data.config.fogIntensity) ?? 1.0,
              audioVolume: Number(data.config.audioVolume) ?? 0.5,
              animationPreset: data.config.animationPreset || 'classic',
              autoClose: data.config.autoClose ?? false,
              ctaStyle: data.config.ctaStyle || 'luxury',
              themePreset: data.config.themePreset || 'gold-chocolate',
            });
          }
          if (Array.isArray(data.allProducts) && data.allProducts.length > 0) {
            setAllProducts(data.allProducts);
            setSelectedProduct(data.allProducts[0] ?? null);
          }
        }
      } catch (error) {
        toast.error('خطا در بارگذاری اطلاعات تنظیمات جعبه گشایی');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/luxury-unboxing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });

      if (res.ok) {
        toast.success('تنظیمات افکت سینمایی جعبه گشایی لوکس با موفقیت ذخیره شد');
        setPreviewKey(prev => prev + 1);
      } else {
        const errData = await res.json();
        toast.error(errData.error || 'خطا در ذخیره‌سازی تنظیمات');
      }
    } catch (error) {
      toast.error('خطا در برقراری ارتباط با سرور');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm('آیا مایل به بازنشانی تمامی مقادیر به حالت پیش‌فرض کارخانه هستید؟')) return;
    setResetting(true);
    try {
      const res = await fetch('/api/admin/luxury-unboxing', {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig({
            ...data.config,
            introDuration: Number(data.config.introDuration) ?? 2.0,
            cameraSpeed: Number(data.config.cameraSpeed) ?? 1.0,
            fogIntensity: Number(data.config.fogIntensity) ?? 1.0,
            audioVolume: Number(data.config.audioVolume) ?? 0.5,
            animationPreset: data.config.animationPreset || 'classic',
            autoClose: data.config.autoClose ?? false,
            ctaStyle: data.config.ctaStyle || 'luxury',
            themePreset: data.config.themePreset || 'gold-chocolate',
          });
          toast.success('تنظیمات با موفقیت به حالت پیش‌فرض بازنشانی شد');
          setPreviewKey(prev => prev + 1);
          setPreviewStatus('closed');
        }
      } else {
        toast.error('خطا در بازنشانی تنظیمات');
      }
    } catch (error) {
      toast.error('خطا در برقراری ارتباط با سرور');
    } finally {
      setResetting(false);
    }
  };

  const triggerOnloadPreset = (preset: string) => {
    if (preset === 'gold-chocolate') {
      setConfig({
        ...config,
        ribbonColor: '#d97706',
        goldenGlow: '#f59e0b',
        backgroundStyle: 'dark-ambient',
        themePreset: 'gold-chocolate',
        lightIntensity: 1.2,
      });
      toast.info('پوسته شکلات و طلای ۲۴ عیار انتخاب شد');
    } else if (preset === 'royal-blue') {
      setConfig({
        ...config,
        ribbonColor: '#2563eb',
        goldenGlow: '#60a5fa',
        backgroundStyle: 'coffee',
        themePreset: 'royal-blue',
        lightIntensity: 1.0,
      });
      toast.info('پوسته رویال سلطنتی آبی کبالت انتخاب شد');
    } else if (preset === 'emerald-dark') {
      setConfig({
        ...config,
        ribbonColor: '#059669',
        goldenGlow: '#34d399',
        backgroundStyle: 'chocolate',
        themePreset: 'emerald-dark',
        lightIntensity: 1.1,
      });
      toast.info('پوسته عمیق سبز زمردی انتخاب شد');
    }
  };

  const triggerSimulation = () => {
    setPreviewStatus('closed');
    setTimeout(() => {
      setPreviewStatus('opening');
    }, 300);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-vazirmatn pb-20 select-none" style={{ direction: 'rtl' }}>
      {/* Immersive Dark top navigation header */}
      <div className="border-b border-amber-500/10 bg-stone-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-amber-500/10 to-amber-500/20 rounded-2xl border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/5 animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-amber-50 leading-tight">پیکربندی پیشرفته انیمیشن سینمایی جعبه گشایی</h1>
              <p className="text-xs text-stone-400">سیستم انحصاری برندینگ، افکت‌های صوتی، نورپردازی سه‌بعدی و سینماتیک شیخ شاپ</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDefaults}
              disabled={resetting || loading}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-850 text-stone-300 border border-stone-800 font-bold px-4 py-2.5 rounded-xl text-xs active:scale-95 transition-all disabled:opacity-40"
            >
              <RotateCcw className="w-4 h-4 shrink-0 text-stone-400" />
              <span>بازنشانی پیش‌فرض</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50 text-sm"
            >
              <Save className="w-4 h-4 shrink-0" />
              <span>{saving ? 'در حال ذخیره‌سازی...' : 'ذخیره نهایی تنظیمات'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Side: Control Toggles and Sliders */}
        <div className="lg:col-span-7 flex flex-col gap-8">

          {/* Section 1: Activation */}
          <div className="bg-stone-900/40 border border-stone-800/80 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-stone-800/60">
              <Settings className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-black text-amber-400">تنظیمات اصلی و نحوه فعال‌سازی</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Enable toggle */}
              <div className="flex items-center justify-between p-4 bg-stone-950/40 border border-stone-800/50 rounded-2xl">
                <div>
                  <span className="text-sm font-bold text-stone-200 block">فعال‌سازی کل بخش جعبه گشایی</span>
                  <span className="text-[10px] text-stone-400 mt-1 block leading-normal">نمایش بخش کادو لوکس در صفحه کاتالوگ و جزییات کالا</span>
                </div>
                <button
                  onClick={() => setConfig({ ...config, isEnabled: !config.isEnabled })}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${config.isEnabled ? 'bg-amber-500' : 'bg-stone-800'}`}
                  aria-label="تغییر وضعیت فعال بودن"
                >
                  <div className={`w-4 h-4 rounded-full bg-stone-950 transition-transform ${config.isEnabled ? '-translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Audio toggle */}
              <div className="flex items-center justify-between p-4 bg-stone-950/40 border border-stone-800/50 rounded-2xl">
                <div>
                  <span className="text-sm font-bold text-stone-200 block">پخش افکت‌های صوتی ملایم</span>
                  <span className="text-[10px] text-stone-400 mt-1 block leading-normal">شامل صدای باز شدن قفل طلایی، روبان ابریشمی و چیمز طلا</span>
                </div>
                <button
                  onClick={() => setConfig({ ...config, enableAudio: !config.enableAudio })}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${config.enableAudio ? 'bg-amber-500' : 'bg-stone-800'}`}
                  aria-label="تغییر وضعیت صوتی"
                >
                  <div className={`w-4 h-4 rounded-full bg-stone-950 transition-transform ${config.enableAudio ? '-translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Auto Close toggle */}
              <div className="flex items-center justify-between p-4 bg-stone-950/40 border border-stone-800/50 rounded-2xl">
                <div>
                  <span className="text-sm font-bold text-stone-200 block">بستن خودکار پس از پایان</span>
                  <span className="text-[10px] text-stone-400 mt-1 block leading-normal">بسته شدن پنجره به صورت اتوماتیک ۳ ثانیه پس از پایان انیمیشن</span>
                </div>
                <button
                  onClick={() => setConfig({ ...config, autoClose: !config.autoClose })}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${config.autoClose ? 'bg-amber-500' : 'bg-stone-800'}`}
                  aria-label="تغییر وضعیت بستن خودکار"
                >
                  <div className={`w-4 h-4 rounded-full bg-stone-950 transition-transform ${config.autoClose ? '-translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Auto Preview toggle */}
              <div className="flex items-center justify-between p-4 bg-stone-950/40 border border-stone-800/50 rounded-2xl">
                <div>
                  <span className="text-sm font-bold text-stone-200 block">پیش‌نمایش خودکار (Auto Play)</span>
                  <span className="text-[10px] text-stone-400 mt-1 block leading-normal">شروع انیمیشن کادو بدون نیاز به ضربه زدن اولیه کاربر</span>
                </div>
                <button
                  onClick={() => setConfig({ ...config, autoPreview: !config.autoPreview })}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${config.autoPreview ? 'bg-amber-500' : 'bg-stone-800'}`}
                  aria-label="تغییر وضعیت پیش نمایش خودکار"
                >
                  <div className={`w-4 h-4 rounded-full bg-stone-950 transition-transform ${config.autoPreview ? '-translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Cinematic parameters */}
          <div className="bg-stone-900/40 border border-stone-800/80 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-stone-800/60">
              <Sliders className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-black text-amber-400">پارامترهای انیمیشن، سرعت و ذرات معلق سه‌بعدی</h2>
            </div>

            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Intro Duration */}
                <div className="bg-stone-950/20 p-4 border border-stone-900 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      مدت زمان فید مقدماتی (ثانیه)
                    </span>
                    <span className="text-xs font-bold text-amber-400">{config.introDuration}s</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="6.0"
                    step="0.5"
                    value={config.introDuration}
                    onChange={(e) => setConfig({ ...config, introDuration: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-full outline-none"
                  />
                </div>

                {/* Camera Speed */}
                <div className="bg-stone-950/20 p-4 border border-stone-900 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-300 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-stone-400" />
                      سرعت حرکت دوربین سه‌بعدی
                    </span>
                    <span className="text-xs font-bold text-amber-400">{config.cameraSpeed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.1"
                    value={config.cameraSpeed}
                    onChange={(e) => setConfig({ ...config, cameraSpeed: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-full outline-none"
                  />
                </div>

                {/* Fog Intensity */}
                <div className="bg-stone-950/20 p-4 border border-stone-900 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-300 flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5 text-stone-400" />
                      شدت مه حجمی و دود کهربایی (Fog)
                    </span>
                    <span className="text-xs font-bold text-amber-400">{(config.fogIntensity * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3.0"
                    step="0.2"
                    value={config.fogIntensity}
                    onChange={(e) => setConfig({ ...config, fogIntensity: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-full outline-none"
                  />
                </div>

                {/* Audio Volume */}
                <div className="bg-stone-950/20 p-4 border border-stone-900 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-300 flex items-center gap-1">
                      {config.audioVolume > 0 ? <Volume2 className="w-3.5 h-3.5 text-stone-400" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
                      ولوم صدای موسیقی و چایمز
                    </span>
                    <span className="text-xs font-bold text-amber-400">{(config.audioVolume * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.05"
                    value={config.audioVolume}
                    onChange={(e) => setConfig({ ...config, audioVolume: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-full outline-none"
                  />
                </div>
              </div>

              {/* Animation Speed */}
              <div className="bg-stone-950/20 p-4 border border-stone-900 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-300">سرعت عمومی اجرای انیمیشن جعبه گشایی</span>
                  <span className="text-xs font-bold text-amber-400">{config.animationSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={config.animationSpeed}
                  onChange={(e) => setConfig({ ...config, animationSpeed: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-full outline-none"
                />
              </div>

              {/* Particle Density */}
              <div className="bg-stone-950/20 p-4 border border-stone-900 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-300">تراکم غبار طلایی و ذرات معلق (Particles)</span>
                  <span className="text-xs font-bold text-amber-400">{(config.particleDensity * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3.0"
                  step="0.1"
                  value={config.particleDensity}
                  onChange={(e) => setConfig({ ...config, particleDensity: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-full outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Branding & Presets */}
          <div className="bg-stone-900/40 border border-stone-800/80 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-stone-800/60">
              <Palette className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-black text-amber-400">تم‌ها و پالت‌های پیش‌فرض انحصاری (Branding)</h2>
            </div>

            {/* Quick theme preset buttons */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => triggerOnloadPreset('gold-chocolate')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-black ${config.themePreset === 'gold-chocolate' ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-md' : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:text-white'}`}
              >
                <span className="text-xl">🍫</span>
                <span>طلای شکلاتی</span>
              </button>
              <button
                onClick={() => triggerOnloadPreset('royal-blue')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-black ${config.themePreset === 'royal-blue' ? 'bg-blue-500/15 border-blue-500 text-blue-400 shadow-md' : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:text-white'}`}
              >
                <span className="text-xl">👑</span>
                <span>آبی رویال</span>
              </button>
              <button
                onClick={() => triggerOnloadPreset('emerald-dark')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-black ${config.themePreset === 'emerald-dark' ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-md' : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:text-white'}`}
              >
                <span className="text-xl">🌿</span>
                <span>سبز زمردین</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Ribbon Color */}
              <div className="bg-stone-950/20 p-4 border border-stone-900 rounded-2xl">
                <label className="text-xs font-bold text-stone-300 block mb-2">رنگ روبان ابریشمی جعبه</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={config.ribbonColor}
                    onChange={(e) => setConfig({ ...config, ribbonColor: e.target.value })}
                    className="w-12 h-12 rounded-xl bg-transparent border border-stone-800 cursor-pointer overflow-hidden p-0.5"
                  />
                  <input
                    type="text"
                    value={config.ribbonColor}
                    onChange={(e) => setConfig({ ...config, ribbonColor: e.target.value })}
                    className="flex-1 bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-xl px-4 text-xs font-mono text-stone-200 outline-none"
                  />
                </div>
              </div>

              {/* Golden Glow */}
              <div className="bg-stone-950/20 p-4 border border-stone-900 rounded-2xl">
                <label className="text-xs font-bold text-stone-300 block mb-2">رنگ هاله و درخشش درونی</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={config.goldenGlow}
                    onChange={(e) => setConfig({ ...config, goldenGlow: e.target.value })}
                    className="w-12 h-12 rounded-xl bg-transparent border border-stone-800 cursor-pointer overflow-hidden p-0.5"
                  />
                  <input
                    type="text"
                    value={config.goldenGlow}
                    onChange={(e) => setConfig({ ...config, goldenGlow: e.target.value })}
                    className="flex-1 bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-xl px-4 text-xs font-mono text-stone-200 outline-none"
                  />
                </div>
              </div>

              {/* Background style */}
              <div className="bg-stone-950/20 p-4 border border-stone-900 rounded-2xl">
                <label className="text-xs font-bold text-stone-300 block mb-2">سبک دکوراسیون و محیط پس‌زمینه</label>
                <select
                  value={config.backgroundStyle}
                  onChange={(e) => setConfig({ ...config, backgroundStyle: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-xs text-stone-200 outline-none"
                >
                  <option value="dark-ambient">تاریک ملایم و لوکس (Dark Ambient)</option>
                  <option value="coffee">قهوه اسپرسو (Deep Coffee)</option>
                  <option value="chocolate">شکلات تلخ عربی (Dark Chocolate)</option>
                </select>
              </div>

              {/* Showcase Pedestal style */}
              <div className="bg-stone-950/20 p-4 border border-stone-900 rounded-2xl">
                <label className="text-xs font-bold text-stone-300 block mb-2">سبک نمایش محصول درون جعبه</label>
                <select
                  value={config.featuredProductMode}
                  onChange={(e) => setConfig({ ...config, featuredProductMode: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-xs text-stone-200 outline-none"
                >
                  <option value="pedestal">پایه بلورین شیشه‌ای (Pedestal Showcase)</option>
                  <option value="3d">معلق سه‌بعدی آزاد (Floating 3D)</option>
                  <option value="floating">درخشش گلس‌مورفیسم (Glassmorphic Glow)</option>
                </select>
              </div>

              {/* Animation Preset */}
              <div className="bg-stone-950/20 p-4 border border-stone-900 rounded-2xl">
                <label className="text-xs font-bold text-stone-300 block mb-2">الگوی انیمیشن و شتاب حرکتی</label>
                <select
                  value={config.animationPreset}
                  onChange={(e) => setConfig({ ...config, animationPreset: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-xs text-stone-200 outline-none"
                >
                  <option value="classic">شتاب ملایم و باوقار (Classic Elegance)</option>
                  <option value="cinematic">حرکت نرم آهسته دوربین (Cinematic Float)</option>
                  <option value="energetic">پرانرژی و هیجان‌انگیز (Energetic Pop)</option>
                </select>
              </div>

              {/* CTA style */}
              <div className="bg-stone-950/20 p-4 border border-stone-900 rounded-2xl">
                <label className="text-xs font-bold text-stone-300 block mb-2">سبک دکمه‌ها و اکشن‌های نهایی</label>
                <select
                  value={config.ctaStyle}
                  onChange={(e) => setConfig({ ...config, ctaStyle: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-xs text-stone-200 outline-none"
                >
                  <option value="luxury">فول گلس‌مورف طلایی (Gold Glassmorphism)</option>
                  <option value="modern-gold">طلای شیب‌رنگ تخت (Modern Solid Gold)</option>
                  <option value="minimalist">مینیمال تیره (Sleek Minimalist)</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Interactive Preview Simulator */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-stone-900/40 border border-stone-800/80 rounded-3xl p-6 backdrop-blur-sm sticky top-[95px] shadow-xl">

            <div className="flex items-center justify-between border-b border-stone-800/60 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-500 animate-pulse" />
                <h2 className="text-base font-black text-amber-400">تست شبیه‌ساز جعبه گشایی</h2>
              </div>

              {/* Dropdown to pick product for preview */}
              <select
                value={selectedProduct?.id || ''}
                onChange={(e) => {
                  const p = allProducts.find(item => item.id === e.target.value);
                  if (p) setSelectedProduct(p);
                }}
                className="bg-stone-950 border border-stone-800 text-stone-200 rounded-lg px-2.5 py-1.5 text-[11px] outline-none max-w-[160px]"
              >
                {allProducts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-stone-400 mb-4 leading-relaxed">
              پارامترهای بالا را ویرایش کنید و با کلیک روی وضعیت‌های زیر یا دکمه شبیه‌ساز بازگشایی، عملکرد افکت‌های سه‌بعدی را فوراً تست و ارزیابی نمایید.
            </p>

            {/* Quick unboxing states controllers */}
            <div className="flex items-center justify-center gap-2 mb-4 bg-stone-950/80 p-1.5 rounded-xl border border-stone-850">
              <button
                onClick={() => setPreviewStatus('closed')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${previewStatus === 'closed' ? 'bg-amber-500 text-stone-950 font-black shadow-md' : 'text-stone-400 hover:text-white'}`}
              >
                بسته 🔒
              </button>
              <button
                onClick={() => setPreviewStatus('opening')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${previewStatus === 'opening' ? 'bg-amber-500 text-stone-950 font-black shadow-md' : 'text-stone-400 hover:text-white'}`}
              >
                در حال بازگشایی ✨
              </button>
              <button
                onClick={() => setPreviewStatus('open')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${previewStatus === 'open' ? 'bg-amber-500 text-stone-950 font-black shadow-md' : 'text-stone-400 hover:text-white'}`}
              >
                باز شده 🎁
              </button>
            </div>

            {/* Visualizer Frame */}
            <div className="relative border border-amber-500/10 rounded-2xl overflow-hidden bg-[#0c0706] h-[340px]">

              {selectedProduct ? (
                <LuxuryGiftBox
                  key={previewKey}
                  status={previewStatus}
                  product={selectedProduct}
                  config={config}
                  height="h-full"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-stone-500 text-xs">
                  در حال بارگذاری اطلاعات شبیه‌ساز...
                </div>
              )}

              {/* Play simulation action button */}
              <button
                onClick={triggerSimulation}
                className="absolute bottom-3 right-3 z-30 bg-amber-500 hover:bg-amber-400 text-stone-950 p-2.5 rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold"
                aria-label="اجرای انیمیشن"
              >
                <Play className="w-4 h-4 fill-current text-stone-950" />
                <span>اجرای کامل دمو</span>
              </button>
            </div>

            {/* Additional info notice */}
            <div className="mt-4 p-3.5 bg-amber-950/20 border border-amber-500/15 rounded-xl flex gap-2.5 items-start">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-[10px] text-amber-400/90 leading-relaxed">
                در صورتی که مرورگر شما یا دستگاه شبیه‌ساز فاقد شتاب‌دهنده گرافیکی WebGL باشد، سیستم به صورت کاملاً خودکار به نسخه 2D گلس‌مورفیسم گلد تریم شبیه‌سازی را هدایت می‌کند تا هیچ تداخلی ایجاد نشود.
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
