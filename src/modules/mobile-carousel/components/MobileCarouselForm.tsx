'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import type { CarouselSlide } from '../views/MobileCarouselDashboardView';

const slideSchema = z.object({
  topTitle: z.string().optional(),
  subtitle: z.string().optional(),
  title: z.string().min(1, 'متن اصلی تبلیغاتی الزامی است'),
  ctaText: z.string().optional(),
  image: z.string().optional(),
  link: z.string().min(1, 'لینک مقصد الزامی است'),
  order: z.coerce.number().int().min(0, 'ترتیب باید عدد غیرمنفی باشد'),
});

type SlideFormValues = z.infer<typeof slideSchema>;

const createCarouselSlide = async (newSlide: Omit<CarouselSlide, 'id'>) => {
  const res = await fetch('/api/admin/mobile-carousel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newSlide),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'خطا در ایجاد اسلاید');
  }
  return data;
};

const updateCarouselSlide = async (updatedSlide: Partial<CarouselSlide> & { id: string }) => {
  const res = await fetch(`/api/admin/mobile-carousel/${updatedSlide.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedSlide),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'خطا در بروزرسانی اسلاید');
  }
  return data;
};

type MobileCarouselFormProps = {
  slide: CarouselSlide | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function MobileCarouselForm({ slide, onClose, onSuccess }: MobileCarouselFormProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SlideFormValues>({
    resolver: zodResolver(slideSchema),
    defaultValues: {
      topTitle: slide?.topTitle || 'فروشگاه شیخ',
      subtitle: slide?.subtitle || 'international store',
      title: slide?.title || '',
      ctaText: slide?.ctaText || 'مشاهده فروشگاه',
      image: slide?.image || '',
      link: slide?.link || '/products',
      order: slide?.order ?? 0,
    },
  });

  const [uploading, setUploading] = useState(false);
  const imageUrl = watch('image');

  const createMutation = useMutation({
    mutationFn: createCarouselSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carouselSlides'] });
      toast.success('اسلاید با موفقیت ایجاد شد');
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCarouselSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carouselSlides'] });
      toast.success('اسلاید با موفقیت بروزرسانی شد');
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (slide) {
      setValue('topTitle', slide.topTitle || 'فروشگاه شیخ');
      setValue('subtitle', slide.subtitle || 'international store');
      setValue('title', slide.title);
      setValue('ctaText', slide.ctaText || 'مشاهده فروشگاه');
      setValue('image', slide.image || '');
      setValue('link', slide.link || '/products');
      setValue('order', slide.order ?? 0);
    }
  }, [slide, setValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || (!data.url && !data.secure_url)) {
        throw new Error(data.error || data.message || 'خطا در آپلود تصویر');
      }

      const uploadedUrl = data.url || data.secure_url;
      setValue('image', uploadedUrl, { shouldValidate: true });
      toast.success('تصویر با موفقیت آپلود شد');
    } catch (error: any) {
      toast.error(error.message || 'خطا در آپلود تصویر');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setValue('image', '', { shouldValidate: true });
    toast.info('تصویر حذف شد');
  };

  const onFormSubmit = (data: SlideFormValues) => {
    const payload = {
      topTitle: data.topTitle || 'فروشگاه شیخ',
      subtitle: data.subtitle || 'international store',
      title: data.title,
      ctaText: data.ctaText || 'مشاهده فروشگاه',
      image: data.image || '',
      link: data.link,
      order: data.order ?? 0,
    };

    if (slide) {
      updateMutation.mutate({ ...payload, id: slide.id });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 text-right font-vazirmatn" dir="rtl">
      {/* Top Small Title */}
      <div>
        <Label htmlFor="topTitle" className="text-stone-200 text-sm font-semibold">
          عنوان بالای تیتر (کوچک)
        </Label>
        <Input
          id="topTitle"
          placeholder="مثلاً: فروشگاه شیخ"
          {...register('topTitle')}
          className="mt-1 bg-stone-900 border-stone-700 text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:ring-amber-500"
        />
        {errors.topTitle && <p className="text-rose-400 text-xs mt-1">{errors.topTitle.message}</p>}
      </div>

      {/* English Subtitle */}
      <div>
        <Label htmlFor="subtitle" className="text-stone-200 text-sm font-semibold">
          زیرعنوان انگلیسی / فرعی
        </Label>
        <Input
          id="subtitle"
          placeholder="مثلاً: international store"
          {...register('subtitle')}
          className="mt-1 bg-stone-900 border-stone-700 text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:ring-amber-500 text-left"
          dir="ltr"
        />
        {errors.subtitle && <p className="text-rose-400 text-xs mt-1">{errors.subtitle.message}</p>}
      </div>

      {/* Main Promotional Text */}
      <div>
        <Label htmlFor="title" className="text-stone-200 text-sm font-semibold">
          متن اصلی تبلیغاتی <span className="text-rose-400">*</span>
        </Label>
        <Input
          id="title"
          placeholder="مثلاً: کیفیت و اصالت بی‌نظیر را با ما تجربه کنید"
          {...register('title')}
          className="mt-1 bg-stone-900 border-stone-700 text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:ring-amber-500"
        />
        {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title.message}</p>}
      </div>

      {/* CTA Button Text */}
      <div>
        <Label htmlFor="ctaText" className="text-stone-200 text-sm font-semibold">
          متن دکمه (CTA)
        </Label>
        <Input
          id="ctaText"
          placeholder="مثلاً: مشاهده فروشگاه"
          {...register('ctaText')}
          className="mt-1 bg-stone-900 border-stone-700 text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:ring-amber-500"
        />
        {errors.ctaText && <p className="text-rose-400 text-xs mt-1">{errors.ctaText.message}</p>}
      </div>

      {/* CTA Destination Link */}
      <div>
        <Label htmlFor="link" className="text-stone-200 text-sm font-semibold">
          لینک مقصد دکمه <span className="text-rose-400">*</span>
        </Label>
        <Input
          id="link"
          placeholder="مثلاً: /products یا https://..."
          {...register('link')}
          className="mt-1 bg-stone-900 border-stone-700 text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:ring-amber-500 text-left"
          dir="ltr"
        />
        {errors.link && <p className="text-rose-400 text-xs mt-1">{errors.link.message}</p>}
      </div>

      {/* Promotional Image Upload & Preview */}
      <div>
        <Label className="text-stone-200 text-sm font-semibold mb-1 block">
          تصویر تبلیغاتی اسلایدر
        </Label>

        {imageUrl ? (
          <div className="relative group rounded-xl overflow-hidden border border-amber-500/30 bg-stone-900 p-2 max-w-xs">
            <img
              src={imageUrl}
              alt="پیش‌نمایش تصویر"
              className="w-full h-32 object-contain rounded-lg"
            />
            <div className="flex items-center gap-2 mt-2">
              <label
                htmlFor="image-replace-upload"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>جایگزینی تصویر</span>
              </label>
              <input
                id="image-replace-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading || isSaving}
                className="hidden"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                disabled={uploading || isSaving}
                className="px-2.5 py-1.5 h-auto text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-stone-700 hover:border-amber-500/50 rounded-xl p-4 text-center bg-stone-900/50 transition-colors">
            <ImageIcon className="w-8 h-8 mx-auto text-stone-500 mb-2" />
            <label
              htmlFor="image-file-upload"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs cursor-pointer transition-all shadow-md shadow-amber-500/10"
            >
              <Upload className="w-4 h-4" />
              <span>انتخاب و آپلود تصویر</span>
            </label>
            <input
              id="image-file-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading || isSaving}
              className="hidden"
            />
            <p className="text-stone-500 text-xs mt-2">فرمت‌های مجاز: JPG, PNG, WebP (حداکثر ۱۰ مگابایت)</p>
          </div>
        )}

        {uploading && (
          <p className="text-amber-300 text-xs mt-1 animate-pulse">در حال آپلود تصویر...</p>
        )}
        {errors.image && <p className="text-rose-400 text-xs mt-1">{errors.image.message}</p>}
        <Input id="image" type="hidden" {...register('image')} />
      </div>

      {/* Sort Order */}
      <div>
        <Label htmlFor="order" className="text-stone-200 text-sm font-semibold">
          ترتیب نمایش
        </Label>
        <Input
          id="order"
          type="number"
          {...register('order')}
          className="mt-1 bg-stone-900 border-stone-700 text-stone-100 focus:border-amber-500 focus:ring-amber-500"
        />
        {errors.order && <p className="text-rose-400 text-xs mt-1">{errors.order.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSaving || uploading}
          className="border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white"
        >
          انصراف
        </Button>
        <Button
          type="submit"
          disabled={isSaving || uploading}
          className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-bold px-6 shadow-lg shadow-amber-500/10"
        >
          {isSaving ? 'در حال ذخیره‌سازی...' : 'ذخیره تغییرات'}
        </Button>
      </div>
    </form>
  );
}
