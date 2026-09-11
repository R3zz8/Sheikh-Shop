'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, CheckCircle2, XCircle, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ProductItem {
  id: string;
  name: string;
  slug: string | null;
  isBestSeller: boolean;
  status: string;
  basePrice: number;
  category: string;
  images: {
    id: string;
    secureUrl: string | null;
    image: string | null;
    isFeatured: boolean;
  }[];
}

export default function BestSellersDashboardView() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/best-sellers');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data || []);
      } else {
        toast.error('خطا در دریافت لیست محصولات');
      }
    } catch (err) {
      toast.error('خطا در برقراری ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleBestSeller = async (productId: string, currentStatus: boolean) => {
    try {
      setUpdatingId(productId);
      const res = await fetch('/api/admin/best-sellers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, isBestSeller: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          !currentStatus
            ? 'محصول با موفقیت به پرفروش‌ترین‌ها اضافه شد ✦'
            : 'محصول از لیست پرفروش‌ترین‌ها حذف شد'
        );
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, isBestSeller: !currentStatus } : p))
        );
      } else {
        toast.error('خطا در به‌روزرسانی وضعیت محصول');
      }
    } catch (err) {
      toast.error('خطا در برقراری ارتباط');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const bestSellerCount = products.filter((p) => p.isBestSeller).length;

  return (
    <div className="p-6 font-vazirmatn text-stone-100 min-h-screen" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-stone-900/60 p-6 rounded-2xl border border-amber-500/20 backdrop-blur-md shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              مدیریت محصولات پرفروش (محبوب‌ترین انتخاب‌های شیخ)
            </h1>
          </div>
          <p className="text-sm text-stone-400">
            محصولاتی که علامت پرفروش (Best Seller) دارند در حلقه طلایی «محبوب‌ترین انتخاب‌های شیخ» نمایش داده می‌شوند.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-stone-950/80 px-4 py-2.5 rounded-xl border border-amber-500/30">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-semibold">تعداد محصولات منتخب:</span>
          <span className="text-lg font-bold text-amber-400">{bestSellerCount}</span>
        </div>
      </div>

      {/* Search & Bar */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجوی نام یا دسته‌بندی محصول..."
          className="w-full pr-10 pl-4 py-2.5 bg-stone-900/80 border border-stone-800 rounded-xl text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/50 transition-colors"
        />
      </div>

      {/* Content Table */}
      {loading ? (
        <div className="p-12 text-center text-amber-200/70 font-medium">
          در حال بارگذاری لیست محصولات...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center text-stone-400 bg-stone-900/30 rounded-2xl border border-stone-800">
          هیچ محصولی یافت نشد.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-800 bg-stone-900/40 backdrop-blur-md">
          <table className="w-full text-right text-sm">
            <thead className="bg-stone-950/80 text-stone-400 border-b border-stone-800">
              <tr>
                <th className="py-3.5 px-4">تصویر</th>
                <th className="py-3.5 px-4">نام محصول</th>
                <th className="py-3.5 px-4">دسته‌بندی</th>
                <th className="py-3.5 px-4">قیمت (تومان)</th>
                <th className="py-3.5 px-4">وضعیت</th>
                <th className="py-3.5 px-4 text-center">پرفروش ترین</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredProducts.map((product) => {
                const imgUrl =
                  product.images?.[0]?.secureUrl || product.images?.[0]?.image || '/placeholder.png';

                return (
                  <tr key={product.id} className="hover:bg-stone-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-amber-500/20 bg-stone-950">
                        <Image
                          src={imgUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-200">{product.name}</td>
                    <td className="py-3 px-4 text-stone-400">{product.category}</td>
                    <td className="py-3 px-4 text-amber-300 font-mono">
                      {product.basePrice.toLocaleString('fa-IR')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {product.status === 'ACTIVE' ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleBestSeller(product.id, product.isBestSeller)}
                        disabled={updatingId === product.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-md ${
                          product.isBestSeller
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-amber-500/20 hover:brightness-110'
                            : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200'
                        }`}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            product.isBestSeller ? 'fill-stone-950' : 'text-stone-400'
                          }`}
                        />
                        {product.isBestSeller ? 'پرفروش ✦' : 'افزودن به پرفروش‌ها'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
