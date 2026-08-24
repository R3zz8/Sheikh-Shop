'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import type { BmwCarouselSlide } from '../views/BmwCarouselDashboardView';

interface BmwCarouselFormProps {
  slide?: BmwCarouselSlide | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BmwCarouselForm({ slide, onClose, onSuccess }: BmwCarouselFormProps) {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(slide?.title || '');
  const [sortOrder, setSortOrder] = useState<number>(slide?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState<boolean>(slide?.isActive ?? true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(slide?.imageUrl || null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('فرمت فایل نامعتبر است. فقط JPG، PNG و WEBP مجاز هستند.');
      toast.error('فرمت فایل نامعتبر است');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('حجم فایل بیش از حد مجاز است. حداکثر حجم ۲ مگابایت می‌باشد.');
      toast.error('حجم فایل بیش از ۲ مگابایت است');
      return;
    }

    setUploadError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      setUploadError(null);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('sortOrder', sortOrder.toString());
      formData.append('isActive', isActive ? 'true' : 'false');

      if (selectedFile) {
        formData.append('file', selectedFile);
      } else if (!slide && !previewUrl) {
        throw new Error('انتخاب تصویر الزامی است');
      }

      const url = slide ? `/api/admin/bmw-carousel/${slide.id}` : '/api/admin/bmw-carousel';
      const method = slide ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'خطا در ذخیره‌سازی اسلاید کروسل ۳بعدی');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bmwCarouselSlides'] });
      queryClient.invalidateQueries({ queryKey: ['bmwCarouselData'] });
      toast.success(slide ? 'تصویر کروسل ۳بعدی بروزرسانی شد' : 'تصویر جدید با موفقیت اضافه شد');
      onSuccess();
    },
    onError: (err: Error) => {
      setUploadError(err.message);
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-vazirmatn text-right" dir="rtl">
      {/* Upload area */}
      <div className="space-y-2">
        <Label className="text-amber-200 font-bold text-sm">تصویر اسلاید کروسل ۳بعدی</Label>
        <div className="relative border-2 border-dashed border-stone-800 hover:border-amber-500/50 rounded-2xl p-4 text-center bg-stone-900/40 transition-colors">
          {previewUrl ? (
            <div className="relative w-full h-48 rounded-xl overflow-hidden bg-stone-950 flex items-center justify-center border border-amber-500/20">
              <img src={previewUrl} alt="پیش‌نمایش" className="w-full h-full object-contain p-2" />
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-2 left-2 p-1.5 rounded-full bg-stone-900/80 text-stone-300 hover:text-white hover:bg-rose-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center cursor-pointer py-6">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
                <ImageIcon className="w-6 h-6" />
              </div>
              <span className="text-amber-200 text-xs font-bold mb-1">برای آپلود تصویر کلیک کنید یا فایل را بکشید</span>
              <span className="text-stone-400 text-[11px]">فرمت‌های JPG، PNG، WEBP (حداکثر ۲ مگابایت)</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
        {uploadError && <p className="text-rose-400 text-xs mt-1 font-bold">{uploadError}</p>}
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-amber-200 text-xs font-bold">
          عنوان اسلاید (اختیاری)
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: Class A"
          className="bg-stone-900 border-stone-800 text-stone-100 placeholder:text-stone-600 text-sm focus:border-amber-500"
        />
      </div>

      {/* Sort Order */}
      <div className="space-y-1.5">
        <Label htmlFor="sortOrder" className="text-amber-200 text-xs font-bold">
          ترتیب نمایش (Sort Order)
        </Label>
        <Input
          id="sortOrder"
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
          className="bg-stone-900 border-stone-800 text-stone-100 text-sm focus:border-amber-500"
        />
      </div>

      {/* Is Active */}
      <div className="flex items-center space-x-2 space-x-reverse pt-2">
        <Checkbox
          id="isActive"
          checked={isActive}
          onCheckedChange={(checked) => setIsActive(Boolean(checked))}
          className="border-stone-700 data-[state=checked]:bg-amber-500 data-[state=checked]:text-stone-950"
        />
        <Label htmlFor="isActive" className="text-stone-200 text-xs font-bold cursor-pointer">
          نمایش در کروسل ۳بعدی صفحه اصلی (فعال)
        </Label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="border-stone-700 text-stone-300 hover:bg-stone-800"
        >
          انصراف
        </Button>
        <Button
          type="submit"
          disabled={saveMutation.isPending}
          className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-bold"
        >
          {saveMutation.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> در حال ذخیره...
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Upload className="w-4 h-4" /> {slide ? 'بروزرسانی تصویر' : 'ذخیره تصویر جدید'}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
