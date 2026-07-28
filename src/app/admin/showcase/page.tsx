'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Settings,
  Grid,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Info
} from 'lucide-react';
import RoyalShowcase from '@/components/royal-showcase/RoyalShowcase';

interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  categoryType: string;
  basePrice: number;
}

interface FeaturedProductConfig {
  id?: string;
  productId: string;
  badgeType: string;
  categoryEffect: string;
  ctaText: string;
  ctaLink?: string;
}

export default function ShowcaseAdminPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [config, setConfig] = useState({
    isEnabled: true,
    loopMode: true,
    autoplayInterval: 5000,
    animationSpeed: 1000,
    backgroundGlow: '#fbbf24',
    maxProducts: 8,
  });

  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProductConfig[]>([]);
  const [allProducts, setAllProducts] = useState<CatalogProduct[]>([]);
  const [selectedProductIdToAdd, setSelectedProductIdToAdd] = useState('');

  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    setMounted(true);

    const loadData = async () => {
      try {
        const res = await fetch('/api/admin/showcase-config');
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setConfig(data.config);
          }
          if (Array.isArray(data.featuredProducts)) {
            setFeaturedProducts(data.featuredProducts);
          }
          if (Array.isArray(data.allProducts)) {
            setAllProducts(data.allProducts);
            if (data.allProducts.length > 0) {
              setSelectedProductIdToAdd(data.allProducts[0].id);
            }
          }
        }
      } catch (error) {
        toast.error('خطا در دریافت اطلاعات تنظیمات');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/showcase-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          featuredProducts,
        }),
      });

      if (res.ok) {
        toast.success('تنظیمات ویترین سلطنتی با موفقیت ذخیره شد');
        setPreviewKey(prev => prev + 1);
      } else {
        toast.error('خطا در ذخیره‌سازی تنظیمات ویترین');
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setSaving(false);
    }
  };

  const handleAddProduct = () => {
    if (!selectedProductIdToAdd) return;

    if (featuredProducts.length >= config.maxProducts) {
      toast.error(`حداکثر ظرفیت محصولات ویژه (${config.maxProducts} عدد) پر شده است`);
      return;
    }

    if (featuredProducts.some(p => p.productId === selectedProductIdToAdd)) {
      toast.error('این محصول قبلاً اضافه شده است');
      return;
    }

    const newFP: FeaturedProductConfig = {
      productId: selectedProductIdToAdd,
      badgeType: 'BEST_SELLER',
      categoryEffect: 'SPEAKER',
      ctaText: 'مشاهده محصول',
      ctaLink: `/products/${selectedProductIdToAdd}`,
    };

    setFeaturedProducts([...featuredProducts, newFP]);
    toast.success('محصول به لیست محصولات ویژه اضافه شد');
  };

  const handleRemoveProduct = (index: number) => {
    const updated = featuredProducts.filter((_, i) => i !== index);
    setFeaturedProducts(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...featuredProducts];
    const temp = updated[index];
    if (temp) {
      updated[index] = updated[index - 1]!;
      updated[index - 1] = temp;
      setFeaturedProducts(updated);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index === featuredProducts.length - 1) return;
    const updated = [...featuredProducts];
    const temp = updated[index];
    if (temp) {
      updated[index] = updated[index + 1]!;
      updated[index + 1] = temp;
      setFeaturedProducts(updated);
    }
  };

  const handleFieldChange = (index: number, field: keyof FeaturedProductConfig, value: string) => {
    const updated = [...featuredProducts];
    const item = updated[index];
    if (item) {
      updated[index] = { ...item, [field]: value };
      setFeaturedProducts(updated);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-vazirmatn pb-16" style={{ direction: 'rtl' }}>
      <div className="border-b border-amber-500/10 bg-stone-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-amber-50 leading-tight">مدیریت ویترین ۳بعدی سلطنتی</h1>
              <p className="text-xs text-stone-400">ویترین تعاملی اختصاصی صفحه نخست فروشگاه شیخ</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5 shrink-0" />
            <span>{saving ? 'در حال ذخیره‌سازی...' : 'ذخیره کل تغییرات'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="bg-stone-900/40 border border-stone-800 rounded-3xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-black text-amber-400 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-500" />
              تنظیمات عمومی ویترین
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-stone-950/40 border border-stone-800/80 rounded-2xl">
                <div>
                  <label className="text-sm font-bold text-stone-200">نمایش ویترین</label>
                  <p className="text-[11px] text-stone-400 mt-1">فعال یا غیرفعال کردن کل بخش ویترین سلطنتی در صفحه اصلی</p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, isEnabled: !config.isEnabled })}
                  className="text-amber-400 hover:scale-105 transition-transform"
                >
                  {config.isEnabled ? (
                    <ToggleRight className="w-12 h-12" />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-stone-500" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-stone-950/40 border border-stone-800/80 rounded-2xl">
                <div>
                  <label className="text-sm font-bold text-stone-200">چرخش بی‌نهایت (Loop)</label>
                  <p className="text-[11px] text-stone-400 mt-1">امکان چرخش تکرارشونده محصولات به صورت نامحدود</p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, loopMode: !config.loopMode })}
                  className="text-amber-400 hover:scale-105 transition-transform"
                >
                  {config.loopMode ? (
                    <ToggleRight className="w-12 h-12" />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-stone-500" />
                  )}
                </button>
              </div>

              <div>
                <label className="text-xs font-black text-stone-300">مدت زمان مکث هر محصول (میلی‌ثانیه)</label>
                <input
                  type="number"
                  value={config.autoplayInterval}
                  onChange={(e) => setConfig({ ...config, autoplayInterval: Number(e.target.value) || 3000 })}
                  className="w-full mt-2 bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-stone-200 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-black text-stone-300">رنگ هاله نوری پس‌زمینه (Glow)</label>
                <div className="flex gap-3 mt-2">
                  <input
                    type="color"
                    value={config.backgroundGlow}
                    onChange={(e) => setConfig({ ...config, backgroundGlow: e.target.value })}
                    className="w-12 h-12 rounded-xl bg-transparent border border-stone-800 cursor-pointer overflow-hidden p-0.5"
                  />
                  <input
                    type="text"
                    value={config.backgroundGlow}
                    onChange={(e) => setConfig({ ...config, backgroundGlow: e.target.value })}
                    className="flex-1 bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-xl px-4 text-sm text-stone-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-stone-300">حداکثر تعداد مجاز محصولات ویترین</label>
                <input
                  type="number"
                  value={config.maxProducts}
                  onChange={(e) => setConfig({ ...config, maxProducts: Number(e.target.value) || 8 })}
                  className="w-full mt-2 bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-stone-200 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-stone-900/40 border border-stone-800 rounded-3xl p-6 backdrop-blur-sm flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-5">
              <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
                <Grid className="w-5 h-5 text-amber-500" />
                محصولات ویژه ویترین سلطنتی
              </h2>

              <div className="flex items-center gap-3">
                <select
                  value={selectedProductIdToAdd}
                  onChange={(e) => setSelectedProductIdToAdd(e.target.value)}
                  className="bg-stone-950 border border-stone-800 text-stone-200 rounded-xl px-3 py-2 text-xs outline-none max-w-[200px]"
                >
                  {allProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 font-bold px-4 py-2 rounded-xl text-xs active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>افزودن</span>
                </button>
              </div>
            </div>

            {featuredProducts.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-stone-800 rounded-2xl bg-stone-950/20">
                <Info className="w-10 h-10 text-stone-500 mx-auto mb-3" />
                <p className="text-sm text-stone-400">هیچ محصولی به ویترین اضافه نشده است. یک محصول انتخاب کنید و دکمه افزودن را بزنید.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {featuredProducts.map((fp, i) => {
                  const detailed = allProducts.find(p => p.id === fp.productId);
                  return (
                    <div
                      key={fp.productId + i}
                      className="p-4 bg-stone-950/60 border border-stone-800/80 rounded-2xl flex flex-col gap-4"
                    >
                      <div className="flex items-center justify-between border-b border-stone-800/50 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xs font-black text-amber-400">
                            {i + 1}
                          </span>
                          <span className="text-sm font-black text-amber-5">{detailed?.name || 'محصول بارگذاری نشده'}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(i)}
                            disabled={i === 0}
                            className="p-1.5 hover:bg-stone-900 border border-stone-800 rounded-lg text-stone-400 hover:text-amber-400 transition-colors disabled:opacity-20"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(i)}
                            disabled={i === featuredProducts.length - 1}
                            className="p-1.5 hover:bg-stone-900 border border-stone-800 rounded-lg text-stone-400 hover:text-amber-400 transition-colors disabled:opacity-20"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(i)}
                            className="p-1.5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 rounded-lg text-stone-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-bold text-stone-400">انتخاب برچسب محصول</label>
                          <select
                            value={fp.badgeType}
                            onChange={(e) => handleFieldChange(i, 'badgeType', e.target.value)}
                            className="w-full mt-1.5 bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                          >
                            <option value="BEST_SELLER">پرفروش‌ترین محصولات (Best Seller)</option>
                            <option value="NEW">محصول جدید (New Product)</option>
                            <option value="DISCOUNT">تخفیف ویژه (Discount Selection)</option>
                            <option value="FEATURED">پیشنهاد انحصاری شیخ (Featured Spec)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-stone-400">افکت پس‌زمینه دسته بندی</label>
                          <select
                            value={fp.categoryEffect}
                            onChange={(e) => handleFieldChange(i, 'categoryEffect', e.target.value)}
                            className="w-full mt-1.5 bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                          >
                            <option value="SPEAKER">اسپیکر: امواج صوتی طلایی</option>
                            <option value="HEADPHONES">هدفون: ذرات موسیقی شناور</option>
                            <option value="HONEY">عسل: قطرات طلایی عسل</option>
                            <option value="DATES">خرما: ذرات برگ درخت نخل</option>
                            <option value="SAFFRON">زعفران: غبار زعفران رویال</option>
                            <option value="PERFUME">عطر: بخار و مه‌ طلایی</option>
                            <option value="DIGITAL">دیجیتال: مدارهای الکترونیکی کهربایی</option>
                            <option value="CAR_ACCESSORIES">خودرو: بازتاب فلزی کروم</option>
                            <option value="LIGHTING">نورپردازی: بوکه‌های نوری گرم</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-stone-400">متن دکمه خرید/مشاهده (CTA)</label>
                          <input
                            type="text"
                            value={fp.ctaText}
                            onChange={(e) => handleFieldChange(i, 'ctaText', e.target.value)}
                            className="w-full mt-1.5 bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-stone-400">لینک سفارشی هدایت کاربر (دلخواه)</label>
                          <input
                            type="text"
                            value={fp.ctaLink || ''}
                            onChange={(e) => handleFieldChange(i, 'ctaLink', e.target.value)}
                            className="w-full mt-1.5 bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                            placeholder={`/products/${fp.productId}`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-stone-900/40 border border-stone-800 rounded-3xl p-6 backdrop-blur-sm sticky top-[95px]">
            <div className="flex items-center gap-2 border-b border-stone-800 pb-4 mb-5">
              <Eye className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-black text-amber-400">پیش‌نمایش زنده و لحظه‌ای</h2>
            </div>

            <p className="text-xs text-stone-400 mb-4 leading-relaxed">
              این پیش‌نمایش به صورت کاملاً زنده تغییرات اعمال شده روی افکت‌ها، هاله نوری و ترتیب محصولات را شبیه‌سازی می‌کند. جهت اعمال نهایی در سایت بر روی دکمه ذخیره کلیک کنید.
            </p>

            <div className="relative border border-amber-500/10 rounded-2xl overflow-hidden bg-stone-950 bg-gradient-radial from-amber-500/5 to-transparent h-[380px] md:h-[480px]">
              <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-lg text-[10px] font-black">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span>شبیه‌ساز ویترین سه بعدی</span>
              </div>

              <div className="absolute inset-0 scale-[0.82] origin-center flex items-center justify-center">
                <RoyalShowcase key={previewKey} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
