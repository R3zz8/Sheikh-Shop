'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import ImageUpload from '@/components/ui/ImageUpload';
import { Search, Package, Check, AlertCircle, Loader2, X, ExternalLink, Link as LinkIcon } from 'lucide-react';
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
  images?: { image?: string; secureUrl?: string }[];
  basePrice?: number;
}

export default function MarketingShowcaseForm({ slide, onClose, onSuccess }: MarketingShowcaseFormProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(slide);

  // Form State
  const [title, setTitle] = useState(slide?.title || '');
  const [imageUrl, setImageUrl] = useState(slide?.imageUrl || '');
  const [imagePublicId, setImagePublicId] = useState<string | null>(slide?.imagePublicId || null);
  const [productId, setProductId] = useState(slide?.productId || '');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    slide?.product ? (slide.product as ProductItem) : null
  );
  const [sortOrder, setSortOrder] = useState<number>(slide?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState<boolean>(slide?.isActive ?? true);

  // Selector Search & Dropdown State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchResults, setSearchResults] = useState<ProductItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productFetchError, setProductFetchError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Direct Lookup State (ID / Slug fallback)
  const [isDirectLookupMode, setIsDirectLookupMode] = useState(false);
  const [directInput, setDirectInput] = useState('');
  const [isDirectLoading, setIsDirectLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products based on debounced search
  useEffect(() => {
    async function fetchProducts() {
      setIsLoadingProducts(true);
      setProductFetchError(null);
      try {
        const query = debouncedSearch.trim();
        const url = query
          ? `/api/dashboard/products?search=${encodeURIComponent(query)}&limit=20`
          : '/api/dashboard/products?limit=20';

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`خطا در دریافت اطلاعات (${res.status})`);
        }

        const json = await res.json();
        const items = json.data || json.products || (Array.isArray(json) ? json : []);
        setSearchResults(Array.isArray(items) ? items : []);
      } catch (err: any) {
        console.error('Failed to load products:', err);
        setProductFetchError('خطا در دریافت لیست محصولات. دوباره تلاش کنید.');
      } finally {
        setIsLoadingProducts(false);
      }
    }

    fetchProducts();
  }, [debouncedSearch]);

  // If editing and selectedProduct not present initially, fetch it by productId
  useEffect(() => {
    if (productId && !selectedProduct) {
      async function fetchSingleProduct() {
        try {
          const res = await fetch(`/api/dashboard/products?search=${encodeURIComponent(productId)}&limit=5`);
          if (res.ok) {
            const json = await res.json();
            const items: ProductItem[] = json.data || json.products || (Array.isArray(json) ? json : []);
            const match = items.find((p) => p.id === productId || p.slug === productId);
            if (match) {
              setSelectedProduct(match);
            } else {
              // Fallback display if specific detail fetch returns generic ID
              setSelectedProduct({
                id: productId,
                name: `محصول (شناسه: ${productId})`,
                slug: null,
                status: 'ACTIVE',
              });
            }
          }
        } catch (err) {
          console.error('Error fetching linked product:', err);
        }
      }
      fetchSingleProduct();
    }
  }, [productId, selectedProduct]);

  // Direct Lookup by ID or Slug
  const handleDirectLookup = async () => {
    const query = directInput.trim();
    if (!query) {
      toast.error('لطفاً شناسه یا اسلاگ محصول را وارد کنید');
      return;
    }

    setIsDirectLoading(true);
    try {
      const res = await fetch(`/api/dashboard/products?search=${encodeURIComponent(query)}&limit=10`);
      if (res.ok) {
        const json = await res.json();
        const items: ProductItem[] = json.data || json.products || (Array.isArray(json) ? json : []);
        const exactMatch = items.find((p) => p.id === query || p.slug === query || p.name.includes(query));

        if (exactMatch) {
          handleSelectProduct(exactMatch);
          setDirectInput('');
          setIsDirectLookupMode(false);
          toast.success(`محصول "${exactMatch.name}" پیدا و انتخاب شد`);
        } else if (items.length > 0) {
          handleSelectProduct(items[0]!);
          setDirectInput('');
          setIsDirectLookupMode(false);
          toast.success(`محصول "${items[0]!.name}" پیدا و انتخاب شد`);
        } else {
          toast.error('محصولی با این مشخصات یافت نشد');
        }
      } else {
        toast.error('خطا در جستجوی مستقیم محصول');
      }
    } catch (err) {
      console.error('Direct lookup error:', err);
      toast.error('ارتباط با سرور برقرار نشد');
    } finally {
      setIsDirectLoading(false);
    }
  };

  const handleSelectProduct = (product: ProductItem) => {
    setProductId(product.id);
    setSelectedProduct(product);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const handleClearSelection = () => {
    setProductId('');
    setSelectedProduct(null);
  };

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

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-right font-vazirmatn pt-2" dir="rtl">
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
        <p className="text-[11px] text-stone-400 mt-1">این عنوان دقیقاً زیر تصویر کاراکتر تبلیغاتی در ویترین اصلی نمایش داده می‌شود.</p>
      </div>

      {/* Linked Product Selector Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-amber-200 text-sm font-bold block">
            محصول مرتبط با اسلاید <span className="text-rose-400">*</span>
          </Label>
          <button
            type="button"
            onClick={() => setIsDirectLookupMode(!isDirectLookupMode)}
            className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <LinkIcon className="w-3 h-3" />
            {isDirectLookupMode ? 'استفاده از لیست کشویی' : 'ورود مستقیم شناسه/اسلاگ'}
          </button>
        </div>

        {/* Selected Product Card Display */}
        {selectedProduct ? (
          <div className="p-3 bg-stone-900/90 border border-amber-500/40 rounded-xl flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-12 h-12 rounded-lg bg-stone-950 border border-amber-500/20 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {selectedProduct.images && selectedProduct.images[0]?.secureUrl ? (
                  <img
                    src={selectedProduct.images[0].secureUrl}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-6 h-6 text-amber-400/60" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-stone-100 truncate">{selectedProduct.name}</h4>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      selectedProduct.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {selectedProduct.status === 'ACTIVE' ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-1">
                  <span className="font-mono text-amber-300/80">ID: {selectedProduct.id}</span>
                  {selectedProduct.slug && <span className="font-mono dir-ltr truncate max-w-[150px]">/{selectedProduct.slug}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {selectedProduct.slug && (
                <a
                  href={`/products/${selectedProduct.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-stone-400 hover:text-amber-300 hover:bg-stone-800 rounded-lg transition-colors"
                  title="مشاهده صفحه محصول"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button
                type="button"
                onClick={handleClearSelection}
                className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="تغییر محصول"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : isDirectLookupMode ? (
          /* Direct Input Mode */
          <div className="p-3 bg-stone-900/60 border border-amber-500/20 rounded-xl space-y-2">
            <p className="text-[11px] text-stone-300">
              شناسه دیتابیس (Product ID) یا اسلاگ (Slug) محصول را به شکل دقیق وارد کنید:
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="مثال: pd_speaker_1 یا luxury-x9-speaker"
                value={directInput}
                onChange={(e) => setDirectInput(e.target.value)}
                className="bg-stone-950 border-stone-800 text-xs text-stone-100 font-mono focus:border-amber-400"
              />
              <Button
                type="button"
                onClick={handleDirectLookup}
                disabled={isDirectLoading || !directInput.trim()}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold px-4 h-9 flex-shrink-0"
              >
                {isDirectLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'جستجو و انتخاب'}
              </Button>
            </div>
          </div>
        ) : (
          /* Searchable Dropdown Selector Mode */
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <Input
                type="text"
                placeholder="جستجو بر اساس نام، شناسه یا برند محصول..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="bg-stone-900 border-amber-500/20 text-stone-100 placeholder:text-stone-500 focus:border-amber-400 pr-9 text-xs h-10"
              />
              <Search className="w-4 h-4 text-amber-400/70 absolute right-3 top-3 pointer-events-none" />
              {isLoadingProducts && (
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin absolute left-3 top-3" />
              )}
            </div>

            {/* Dropdown Options List */}
            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-stone-900 border border-amber-500/30 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-stone-800/60 custom-scrollbar">
                {isLoadingProducts ? (
                  <div className="p-4 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>در حال دریافت لیست محصولات...</span>
                  </div>
                ) : productFetchError ? (
                  <div className="p-4 text-center text-xs text-rose-400 flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{productFetchError}</span>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-stone-400">
                    <p className="font-bold text-stone-300 mb-1">محصولی یافت نشد.</p>
                    <p className="text-[11px]">عبارت دیگری را جستجو کنید یا از گزینه «ورود مستقیم شناسه» استفاده کنید.</p>
                  </div>
                ) : (
                  searchResults.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSelectProduct(product)}
                      className="w-full text-right p-2.5 hover:bg-stone-800/80 transition-colors flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded bg-stone-950 border border-stone-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {product.images && product.images[0]?.secureUrl ? (
                            <img
                              src={product.images[0].secureUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-amber-400/50" />
                          )}
                        </div>

                        <div className="min-w-0 text-right">
                          <p className="text-xs font-semibold text-stone-200 group-hover:text-amber-300 truncate">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                            <span className="font-mono text-amber-400/80">{product.id}</span>
                            {product.slug && <span className="dir-ltr truncate">/{product.slug}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                            product.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {product.status === 'ACTIVE' ? 'فعال' : 'غیرفعال'}
                        </span>
                        {productId === product.id && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
        <p className="text-[11px] text-stone-400 mt-1">با کلیک روی اسلاید در صفحه اصلی، خریدار مستقیم به صفحه جزئیات این محصول هدایت می‌شود.</p>
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
