'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import ImageUpload from '@/components/ui/ImageUpload';
import type { MarketingShowcaseSlide } from '../views/MarketingShowcaseDashboardView';

type MarketingShowcaseFormProps = {
  slide?: MarketingShowcaseSlide | null;
  onClose: () => void;
  onSuccess: () => void;
};

interface ProductItem {
  id: string;
  name: string;
  slug: string | null;
  status: string;
}

export default function MarketingShowcaseForm({ slide, onClose, onSuccess }: MarketingShowcaseFormProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(slide);

  const [title, setTitle] = useState(slide?.title || '');
  const [imageUrl, setImageUrl] = useState(slide?.imageUrl || '');
  const [imagePublicId, setImagePublicId] = useState<string | null>(slide?.imagePublicId || null);
  const [productId, setProductId] = useState(slide?.productId || '');
  const [sortOrder, setSortOrder] = useState<number>(slide?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState<boolean>(slide?.isActive ?? true);

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Fetch product list for selection
  useEffect(() => {
    async function loadProducts() {
      setIsLoadingProducts(true);
      try {
        const res = await fetch('/api/dashboard/products?limit=100');
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            setProducts(json.data);
          }
        }
      } catch (err) {
        console.error('Failed to load products list:', err);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const url = isEditing ? `/api/admin/marketing-showcase/${slide!.id}` : '/api/admin/marketing-showcase';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'خطا در ذخیره‌سازی اسلاید ویترین');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketingShowcaseSlides'] });
      toast.success(isEditing ? 'اسلاید با موفقیت ویرایش شد' : 'اسلاید جدید با موفقیت اضافه شد');
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('لطفاً عنوان ویترین تبلیغاتی را وارد کنید');
      return;
    }

    if (!imageUrl) {
      toast.error('لطفاً تصویر ویترین تبلیغاتی را بارگذاری کنید');
      return;
    }

    if (!productId) {
      toast.error('لطفاً محصول مرتبط را انتخاب کنید');
      return;
    }

    saveMutation.mutate({
      title: title.trim(),
      imageUrl,
      imagePublicId,
      productId,
      sortOrder: Number(sortOrder),
      isActive,
    });
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-right font-vazirmatn pt-2" dir="rtl">
      {/* Title */}
      <div>
        <Label htmlFor="title" className="text-amber-200 text-sm font-bold mb-1.5 block">
          عنوان ویترین تبلیغاتی <span className="text-rose-400">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: عروسک خرس خوابالو و سیستم صوتی لوکس"
          className="bg-stone-900 border-amber-500/20 text-stone-100 placeholder:text-stone-500 focus:border-amber-400"
          required
        />
        <p className="text-[11px] text-stone-400 mt-1">این عنوان دقیقاً زیر تصویر کاراکتر تبلیغاتی نمایش داده می‌شود.</p>
      </div>

      {/* Linked Product Selector */}
      <div>
        <Label htmlFor="product" className="text-amber-200 text-sm font-bold mb-1.5 block">
          محصول مرتبط با اسلاید <span className="text-rose-400">*</span>
        </Label>

        {isLoadingProducts ? (
          <div className="text-stone-400 text-xs py-2">در حال بارگذاری لیست محصولات...</div>
        ) : (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="جستجوی محصول..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="bg-stone-900/60 border-stone-800 text-xs text-stone-200 h-8"
            />
            <select
              id="product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full bg-stone-900 border border-amber-500/20 text-stone-100 rounded-md px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
              required
            >
              <option value="" disabled>-- یک محصول انتخاب کنید --</option>
              {filteredProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.status === 'ACTIVE' ? 'فعال' : 'غیرفعال'})
                </option>
              ))}
            </select>
          </div>
        )}
        <p className="text-[11px] text-stone-400 mt-1">با کلیک کاربر روی تصویر یا عنوان، به صفحه جزئیات این محصول منتقل خواهد شد.</p>
      </div>

      {/* Image Upload */}
      <div>
        <Label className="text-amber-200 text-sm font-bold mb-1.5 block">
          تصویر کاراکتر تبلیغاتی (AI Marketer) <span className="text-rose-400">*</span>
        </Label>
        <ImageUpload
          value={imageUrl}
          onChange={(url) => {
            setImageUrl(url);
            // If url contains cloudinary public ID
            if (url.includes('cloudinary.com')) {
              const parts = url.split('/');
              const fileWithExt = parts[parts.length - 1];
              const publicIdWithoutExt = fileWithExt?.split('.')[0];
              const folder = parts[parts.length - 2];
              if (folder && publicIdWithoutExt) {
                setImagePublicId(`${folder}/${publicIdWithoutExt}`);
              }
            }
          }}
          onRemove={() => {
            setImageUrl('');
            setImagePublicId(null);
          }}
          disabled={saveMutation.isPending}
        />
      </div>

      {/* Sort Order & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sortOrder" className="text-amber-200 text-sm font-bold mb-1 block">
            ترتیب نمایش
          </Label>
          <Input
            id="sortOrder"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
            className="bg-stone-900 border-amber-500/20 text-stone-100 font-mono"
          />
        </div>

        <div>
          <Label htmlFor="isActive" className="text-amber-200 text-sm font-bold mb-1 block">
            وضعیت اسلاید
          </Label>
          <select
            id="isActive"
            value={isActive ? 'true' : 'false'}
            onChange={(e) => setIsActive(e.target.value === 'true')}
            className="w-full bg-stone-900 border border-amber-500/20 text-stone-100 rounded-md px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
          >
            <option value="true">فعال (نمایش در صفحه اصلی)</option>
            <option value="false">غیرفعال (مخفی)</option>
          </select>
        </div>
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
          className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-stone-950 font-bold hover:from-amber-600 hover:to-orange-600 shadow-md"
        >
          {saveMutation.isPending ? 'در حال ذخیره‌سازی...' : isEditing ? 'ویرایش اسلاید' : 'افزودن اسلاید'}
        </Button>
      </div>
    </form>
  );
}
