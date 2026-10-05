'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Save, Package, Tag, ArrowRight, RefreshCw, CheckCircle, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';
import { formatToToman } from '@/lib/currency';
import { toast } from 'sonner';

export interface PricingProduct {
  id: string;
  name: string;
  sku: string | null;
  basePrice: number;
  quantity: number;
  inventoryStatus: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'COMING_SOON' | 'DISCONTINUED';
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  category: string;
  categoryType: string;
  slug: string | null;
  brand: string | null;
  image: string | null;
  updatedAt: string;
}

interface UpdateLog {
  id: string;
  productName: string;
  sku: string | null;
  oldPrice: number;
  newPrice: number;
  oldStatus: string;
  newStatus: string;
  timestamp: string;
}

export default function PricingDashboardView() {
  const [searchCode, setSearchCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [product, setProduct] = useState<PricingProduct | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Form states for editing
  const [editPrice, setEditPrice] = useState<string>('');
  const [editQuantity, setEditQuantity] = useState<string>('');
  const [editInventoryStatus, setEditInventoryStatus] = useState<PricingProduct['inventoryStatus']>('AVAILABLE');
  const [editStatus, setEditStatus] = useState<PricingProduct['status']>('ACTIVE');
  const [isSaving, setIsSaving] = useState(false);

  // Recent update logs in this session
  const [logs, setLogs] = useState<UpdateLog[]>([]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const codeToSearch = searchCode.trim();
    if (!codeToSearch) {
      toast.error('لطفاً کد محصول را وارد کنید.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const res = await fetch(`/api/admin/pricing?code=${encodeURIComponent(codeToSearch)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setProduct(null);
        setSearchError(data.error || 'محصولی پیدا نشد.');
        toast.error(data.error || 'محصولی با این کد یافت نشد.');
      } else {
        const found: PricingProduct = data.product;
        setProduct(found);
        setEditPrice(String(found.basePrice));
        setEditQuantity(String(found.quantity));
        setEditInventoryStatus(found.inventoryStatus);
        setEditStatus(found.status);
        toast.success(`محصول "${found.name}" یافت شد.`);
      }
    } catch (err: any) {
      console.error('Search pricing product error:', err);
      setSearchError('خطا در برقراری ارتباط با سرور.');
      toast.error('خطا در برقراری ارتباط با سرور.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const parsedPrice = parseFloat(editPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error('لطفاً قیمت معتبر وارد کنید.');
      return;
    }

    const parsedQty = parseInt(editQuantity, 10);
    if (isNaN(parsedQty) || parsedQty < 0) {
      toast.error('لطفاً موجودی معتبر وارد کنید.');
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          basePrice: parsedPrice,
          quantity: parsedQty,
          inventoryStatus: editInventoryStatus,
          status: editStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || 'خطا در ثبت تغییرات.');
      } else {
        const updated: PricingProduct = data.product;

        // Log previous state
        const newLog: UpdateLog = {
          id: String(Date.now()),
          productName: product.name,
          sku: product.sku,
          oldPrice: product.basePrice,
          newPrice: updated.basePrice,
          oldStatus: product.inventoryStatus,
          newStatus: updated.inventoryStatus,
          timestamp: new Date().toLocaleTimeString('fa-IR'),
        };

        setLogs(prev => [newLog, ...prev]);
        setProduct(updated);
        setEditPrice(String(updated.basePrice));
        setEditQuantity(String(updated.quantity));
        setEditInventoryStatus(updated.inventoryStatus);
        setEditStatus(updated.status);

        toast.success('قیمت و موجودی با موفقیت به‌روزرسانی شد.');
      }
    } catch (err: any) {
      console.error('Save pricing error:', err);
      toast.error('خطا در ثبت تغییرات قیمت.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4 sm:p-6 lg:p-8 font-vazirmatn dir-rtl">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-amber-500/80 mb-2">
              <Link href="/dashboard" className="hover:text-amber-400 transition-colors">داشبورد مدیریت</Link>
              <span>/</span>
              <span className="text-stone-400">قیمت‌گذاری سریع</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-100 flex items-center gap-3">
              <Tag className="w-8 h-8 text-amber-500" />
              سیستم قیمت‌گذاری و موجودی محصولات
            </h1>
            <p className="text-stone-400 text-sm mt-1">
              جستجوی مستقیم بر اساس کد محصول (SKU) و به‌روزرسانی لحظه‌ای قیمت و وضعیت فروشگاه
            </p>
          </div>

          <Link
            href="/dashboard/products"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-amber-400 transition-all text-sm font-medium shrink-0"
          >
            <Package className="w-4 h-4" />
            <span>مدیریت کامل محصولات</span>
          </Link>
        </div>

        {/* Search Bar Section */}
        <div className="bg-stone-900/80 backdrop-blur-md border border-amber-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <form onSubmit={handleSearch} className="space-y-4">
            <label className="block text-sm font-medium text-amber-400/90 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              کد اختصاصی محصول (SKU / Product Code) را وارد کنید:
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="مثال: 6761 یا SH-SPK-X9"
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 placeholder-stone-500 rounded-xl px-4 py-3.5 pl-11 focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-left font-mono tracking-wider text-base transition-all"
                  dir="ltr"
                  autoFocus
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
              </div>

              <button
                type="submit"
                disabled={isSearching || !searchCode.trim()}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>در حال جستجو...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>جستجوی کد محصول</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {searchError && (
            <div className="mt-4 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </div>

        {/* Product Editor Form (Rendered when product is loaded) */}
        {product && (
          <div className="bg-stone-900/90 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">

            {/* Product Meta Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-stone-800 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-stone-950 border border-amber-500/30 p-2 relative flex items-center justify-center overflow-hidden shrink-0">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-1"
                      unoptimized
                    />
                  ) : (
                    <Package className="w-8 h-8 text-stone-600" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {product.sku && (
                      <span className="bg-amber-500/10 text-amber-400 text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border border-amber-500/20">
                        کد: {product.sku}
                      </span>
                    )}
                    <span className="bg-stone-800 text-stone-300 text-xs px-2.5 py-0.5 rounded-md">
                      {product.brand || 'برند شیخ'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-stone-100">{product.name}</h2>
                  <p className="text-xs text-stone-400 mt-1">
                    شناسه یکتا: <span className="font-mono text-stone-300">{product.id}</span>
                  </p>
                </div>
              </div>

              {product.slug && (
                <Link
                  href={`/products/${product.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 hover:underline bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800"
                >
                  <span>مشاهده در فروشگاه</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Editable Controls */}
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Base Price */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-stone-300">
                    قیمت پایه (تومان):
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    min="0"
                    step="1000"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 text-amber-400 text-lg font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                  />
                  <p className="text-xs text-stone-400 font-medium">
                    نمایش: {formatToToman(parseFloat(editPrice) || 0)}
                  </p>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-stone-300">
                    موجودی انبار (تعداد):
                  </label>
                  <input
                    type="number"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    min="0"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 text-lg font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                  />
                  <p className="text-xs text-stone-500">
                    عدد صحیح موجود در انبار
                  </p>
                </div>

                {/* Inventory Status */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-stone-300">
                    وضعیت موجودی انبار:
                  </label>
                  <select
                    value={editInventoryStatus}
                    onChange={(e) => setEditInventoryStatus(e.target.value as PricingProduct['inventoryStatus'])}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-sm font-medium"
                  >
                    <option value="AVAILABLE">موجود در انبار (AVAILABLE)</option>
                    <option value="LOW_STOCK">موجودی محدود (LOW_STOCK)</option>
                    <option value="OUT_OF_STOCK">ناموجود (OUT_OF_STOCK)</option>
                    <option value="COMING_SOON">به زودی (COMING_SOON)</option>
                    <option value="DISCONTINUED">توقف فروش (DISCONTINUED)</option>
                  </select>
                </div>

                {/* Publication Status */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-stone-300">
                    وضعیت نمایش در فروشگاه:
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as PricingProduct['status'])}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-sm font-medium"
                  >
                    <option value="ACTIVE">فعال و در حال فروش (ACTIVE)</option>
                    <option value="INACTIVE">غیرفعال (INACTIVE)</option>
                    <option value="DRAFT">پیش‌نویس (DRAFT)</option>
                  </select>
                </div>

              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                <div className="text-xs text-stone-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>تغییرات به صورت آنی در داتابیس، کش سیستم و فروشگاه اعمال می‌شوند.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-base flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>در حال ثبت تغییرات...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>ذخیره و به‌روزرسانی قیمت</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Audit Log / Session History */}
        {logs.length > 0 && (
          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              سابقه به‌روزرسانی‌های قیمت در این نشست (Session History)
            </h3>

            <div className="divide-y divide-stone-800/80">
              {logs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="bg-stone-800 text-amber-400 font-mono text-xs px-2 py-1 rounded">
                      {log.sku ? `کد: ${log.sku}` : 'بدون کد'}
                    </span>
                    <span className="font-medium text-stone-200">{log.productName}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-stone-400 line-through">
                      {formatToToman(log.oldPrice)}
                    </span>
                    <span className="text-stone-400">←</span>
                    <span className="text-emerald-400 font-bold">
                      {formatToToman(log.newPrice)}
                    </span>
                    <span className="text-stone-500 font-mono">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
