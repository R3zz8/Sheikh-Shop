'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Upload, Trash2, Save, RefreshCw, Eye, Sparkles, CheckCircle2, Globe, Layers, AlertTriangle } from 'lucide-react';
import type { WebDesignShowcaseItem } from '@/lib/services/getWebDesignShowcase';

export default function WebDesignShowcaseForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
  const [showcase, setShowcase] = useState<WebDesignShowcaseItem | null>(null);

  // Form State
  const [title, setTitle] = useState('شیخ وب؛ جایی که ایده‌ها تبدیل به وب‌سایت می‌شوند.');
  const [description, setDescription] = useState(
    'طراحی و توسعه وب‌سایت‌های فروشگاهی، شرکتی، خدماتی و اختصاصی با تکنولوژی‌های مدرن، طراحی حرفه‌ای و تمرکز بر سرعت و تجربه کاربری.'
  );
  const [servicesInput, setServicesInput] = useState('فروشگاهی، شرکتی، خدماتی، شخصی، اختصاصی');
  const [ctaText, setCtaText] = useState('مشاهده خدمات طراحی سایت');
  const [ctaUrl, setCtaUrl] = useState('/services/web-design');
  const [isEnabled, setIsEnabled] = useState(true);

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchShowcase = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/web-design-showcase');
      if (res.ok) {
        const data: WebDesignShowcaseItem | null = await res.json();
        if (data) {
          setShowcase(data);
          setTitle(data.title || '');
          setDescription(data.description || '');
          setServicesInput(Array.isArray(data.services) ? data.services.join('، ') : '');
          setCtaText(data.ctaText || 'مشاهده خدمات طراحی سایت');
          setCtaUrl(data.ctaUrl || '/services/web-design');
          setIsEnabled(data.isEnabled !== false);
          setPreviewUrl(data.imageUrl || null);
        }
      }
    } catch (error) {
      console.error('[FETCH_WEB_DESIGN_SHOWCASE_ERROR]', error);
      toast.error('خطا در دریافت اطلاعات خدمات طراحی سایت');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowcase();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
        toast.error('فرمت تصویر نامعتبر است. فقط JPG، PNG، WEBP و AVIF مجاز هستند.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم تصویر بیش از حد مجاز ۵ مگابایت است.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('عنوان و توضیحات الزامی هستند');
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());

      const servicesArray = servicesInput
        .split(/[،,]/)
        .map((s) => s.trim())
        .filter(Boolean);
      formData.append('services', JSON.stringify(servicesArray));
      formData.append('ctaText', ctaText.trim());
      formData.append('ctaUrl', ctaUrl.trim());
      formData.append('isEnabled', String(isEnabled));

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetch('/api/admin/web-design-showcase', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'خطا در ثبت اطلاعات');
      }

      toast.success('تنظیمات کارت خدمات طراحی سایت با موفقیت به روز شد');
      setShowcase(data);
      setSelectedFile(null);
      setPreviewUrl(data.imageUrl || null);
    } catch (error: any) {
      console.error('[SUBMIT_WEB_DESIGN_SHOWCASE_ERROR]', error);
      toast.error(error.message || 'خطا در ثبت اطلاعات');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!confirm('آیا از حذف تصویر کارت اطمینان دارید؟')) return;

    try {
      setDeletingImage(true);
      const res = await fetch('/api/admin/web-design-showcase', {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'خطا در حذف تصویر');
      }

      toast.success('تصویر کارت با موفقیت حذف شد');
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchShowcase();
    } catch (error: any) {
      console.error('[DELETE_WEB_DESIGN_IMAGE_ERROR]', error);
      toast.error(error.message || 'خطا در حذف تصویر');
    } finally {
      setDeletingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
          <p className="text-stone-400 font-medium text-sm font-vazirmatn">
            در حال بارگذاری اطلاعات مدیریت خدمات طراحی سایت...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-vazirmatn text-right" dir="rtl">
      {/* Overview Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-950 to-amber-950/60 border border-amber-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">مدیریت خدمات طراحی سایت (شیخ وب)</h2>
          </div>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            در این بخش می‌توانید تصویر و محتوای تبلیغاتی کارت اختصاصی طراحی وب‌سایت در صفحه اصلی را مدیریت نمایید.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            <span className="mr-3 text-xs font-bold text-stone-200">
              {isEnabled ? 'بخش فعال است' : 'بخش غیرفعال است'}
            </span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left/Main Column: Settings Form */}
        <div className="lg:col-span-7 bg-stone-900/60 border border-amber-500/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-bold text-amber-100 pb-3 border-b border-stone-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>محتوا و تنظیمات متنی</span>
            </h3>

            {/* Title Field */}
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-2">
                عنوان اصلی مارکتینگ <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="«شیخ وب؛ جایی که ایده‌ها تبدیل به وب‌سایت می‌شوند.»"
                className="w-full bg-stone-950 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors"
                required
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-2">
                توضیحات تکمیلی <span className="text-amber-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="توضیحات مربوط به طراحی و توسعه وب‌سایت‌های اختصاصی..."
                className="w-full bg-stone-950 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors leading-relaxed"
                required
              />
            </div>

            {/* Service Labels Field */}
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-2">
                لیست خدمات (با «،» جدا کنید)
              </label>
              <input
                type="text"
                value={servicesInput}
                onChange={(e) => setServicesInput(e.target.value)}
                placeholder="فروشگاهی، شرکتی، خدماتی، شخصی، اختصاصی"
                className="w-full bg-stone-950 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                برچسب‌های نمایش داده شده در کارت خدمات صفحه اصلی
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CTA Text */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-2">
                  متن دکمه CTA
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="مشاهده خدمات طراحی سایت"
                  className="w-full bg-stone-950 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {/* CTA Destination URL */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-2">
                  لینک مقصد دکمه CTA
                </label>
                <input
                  type="text"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="/services/web-design یا https://..."
                  className="w-full bg-stone-950 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors dir-ltr text-left"
                />
              </div>
            </div>

            {/* Image Upload Block */}
            <div className="pt-4 border-t border-stone-800">
              <label className="block text-xs font-bold text-stone-300 mb-2">
                تصویر کارت اختصاصی (ترجیحاً PNG شفاف یا WebP)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>{previewUrl ? 'جایگزینی تصویر جدید' : 'انتخاب و آپلود تصویر'}</span>
                </button>

                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    disabled={deletingImage}
                    className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span>حذف تصویر کارت</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-stone-400 mt-2">
                برای نمایش عالی با جلوه شعاعی پشت کاراکتر، استفاده از فایل PNG با پس‌زمینه شفاف پیشنهاد می‌شود.
              </p>
            </div>

            {/* Submit Actions */}
            <div className="pt-6 border-t border-stone-800 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-stone-950 font-bold text-sm shadow-lg hover:shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>در حال ذخیره‌سازی...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>ذخیره تغییرات</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Card Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-stone-900/60 border border-amber-500/10 rounded-3xl p-6 backdrop-blur-md shadow-xl">
            <h3 className="text-base font-bold text-amber-100 mb-4 flex items-center gap-2 pb-3 border-b border-stone-800">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>پیش‌نمایش زنده کارت صفحه اصلی</span>
            </h3>

            {/* Mini Render of WebDesignServiceCard */}
            <div className="relative rounded-2xl bg-gradient-to-b from-stone-900 via-stone-950 to-amber-950/80 border border-amber-500/20 p-4 overflow-hidden">
              <div className="relative aspect-[3/4] w-full rounded-t-3xl rounded-b-2xl bg-gradient-to-b from-amber-950/40 via-stone-900 to-stone-950 border border-amber-500/30 p-4 flex flex-col justify-end items-center overflow-hidden mb-4">
                <div className="absolute top-3 z-20 bg-stone-950/80 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-200 text-[10px] font-bold">
                    Sheikh Web Ecosystem
                  </span>
                </div>

                {previewUrl ? (
                  <div className="relative w-full h-full flex items-end justify-center z-10 pt-8">
                    <Image
                      src={previewUrl}
                      alt="پیش‌نمایش"
                      fill
                      sizes="300px"
                      className="object-contain object-bottom drop-shadow-lg"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-2">
                      <span className="text-3xl">👑</span>
                    </div>
                    <p className="text-amber-100 text-xs font-bold mb-1">
                      هنوز تصویری اضافه نشده است
                    </p>
                    <p className="text-stone-400 text-[10px]">
                      کارت به صورت فالبک لوکس بدون تصویر نمایش داده خواهد شد.
                    </p>
                  </div>
                )}
              </div>

              <div className="text-right space-y-2">
                <h4 className="text-sm font-bold text-amber-100 leading-snug">
                  {title || 'عنوان پیش‌فرض'}
                </h4>
                <p className="text-stone-300 text-xs line-clamp-3 leading-relaxed">
                  {description || 'توضیحات پیش‌فرض...'}
                </p>

                {servicesInput && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {servicesInput
                      .split(/[،,]/)
                      .slice(0, 3)
                      .map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-stone-900 border border-amber-500/20 text-amber-200 text-[10px]"
                        >
                          {s.trim()}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {!previewUrl && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-0.5">هنوز تصویری برای بخش خدمات طراحی سایت اضافه نشده است.</p>
                <p className="text-amber-300/80 text-[11px]">
                  برای افزودن تصویر و تکمیل هماهنگی بصری، از دکمه «انتخاب و آپلود تصویر» در فرم بالا استفاده نمایید.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
