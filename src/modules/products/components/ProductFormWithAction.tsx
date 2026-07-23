'use client';

import type { Product } from '@prisma/client';
import { ProductCategory, ProductStatus } from '@prisma/client';
import {
  Input,
  Button,
  Textarea,
  Label,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui';
import Link from 'next/link';
import UploadImage from './UploadImage';
import { useActionState, useEffect, useState } from 'react';
import { upsertProduct } from '../actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';

interface Unit {
  id: string;
  name: string;
  symbol: string;
  multiplier: number;
  sortOrder: number;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

const ProductForm = (props: { product: Product | null }) => {
  const { product } = props;
  const router = useRouter();
  const isNewProduct = !product?.id;
  const { data: user } = useUser();

  const [state, action, isPending] = useActionState<
    {
      data: Product | null;
      error: Record<string, string> | null;
    },
    FormData
  >(upsertProduct, {
    data: product ?? null,
    error: null,
  });

  const { error, data } = state;
  const [submitted, setSubmitted] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const handleSubmit = async (formData: FormData) => {
    setSubmitted(true);
    action(formData);
  };

  // Load units and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch units
        const unitsResponse = await fetch('/api/units');
        if (unitsResponse.ok) {
          const unitsResult = await unitsResponse.json();
          if (unitsResult.success) {
            setUnits(unitsResult.data);
          }
        }

        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        if (categoriesResponse.ok) {
          const categoriesResult = await categoriesResponse.json();
          if (categoriesResult.success) {
            setCategories(categoriesResult.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoadingUnits(false);
        setLoadingCategories(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!submitted) return;

    if (error) {
      if (error.general) {
        toast.error(error.general);
      } else {
        toast.error('Failed to save product. Please check your input.');
      }
    } else if (data) {
      toast.success(isNewProduct ? 'Product created successfully!' : 'Product updated successfully!');
      // Redirect to product list after successful creation
      if (isNewProduct) {
        setTimeout(() => {
          router.push('/dashboard/products');
        }, 1000);
      }
    }
  }, [submitted, error, data, isNewProduct, router]);

  const getStatusBadgeColor = (status: ProductStatus) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-red-100 text-red-800',
      DRAFT: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || colors.DRAFT;
  };

  return (
    <Card className="w-[600px] mx-auto mt-10">
      <form className="max-w-lg" action={handleSubmit}>
        <input type="hidden" name="id" value={product?.id || ''} />
        <CardHeader>
          <CardTitle>{isNewProduct ? 'Create New Product' : 'Edit Product'}</CardTitle>
          <CardDescription>
            {isNewProduct
              ? 'Add a new product to your catalog'
              : `Editing: ${product?.name}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                name="name"
                id="name"
                defaultValue={data?.name || ''}
                placeholder="Enter product name"
                required
              />
              {error?.name && (
                <span className="text-red-600 text-sm mt-1">{error.name}</span>
              )}
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                name="category"
                defaultValue={data?.category || ProductCategory.OTHERS}
                disabled={loadingCategories}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select a category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error?.category && (
                <span className="text-red-600 text-sm mt-1">{error.category}</span>
              )}
            </div>
            <div>
              <Label htmlFor="categoryType">Store Category *</Label>
              <Select
                name="categoryType"
                defaultValue={data?.categoryType || 'SheikhFood'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a store category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SheikhFood">Sheikh Food</SelectItem>
                  <SelectItem value="SheikhDigital">Sheikh Digital</SelectItem>
                  <SelectItem value="SheikhTech">Sheikh Tech</SelectItem>
                  <SelectItem value="SheikhHome">Sheikh Home</SelectItem>
                </SelectContent>
              </Select>
              {error?.categoryType && (
                <span className="text-red-600 text-sm mt-1">{error.categoryType}</span>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="baseUnitId">Base Unit *</Label>
            <Select
              name="baseUnitId"
              defaultValue={data?.baseUnitId || ''}
              disabled={loadingUnits}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingUnits ? "Loading units..." : "Select a unit"} />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name} ({unit.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error?.baseUnitId && (
              <span className="text-red-600 text-sm mt-1">{error.baseUnitId}</span>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              name="description"
              id="description"
              defaultValue={data?.description || ''}
              placeholder="Enter product description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                name="price"
                type="number"
                id="price"
                step="0.01"
                min="0"
                defaultValue={data?.basePrice?.toString() || ''}
                placeholder="0.00"
                required
              />
              {error?.price && (
                <span className="text-red-600 text-sm mt-1">{error.price}</span>
              )}
            </div>
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                name="quantity"
                type="number"
                id="quantity"
                min="0"
                defaultValue={data?.quantity || ''}
                placeholder="0"
                required
              />
              {error?.quantity && (
                <span className="text-red-600 text-sm mt-1">{error.quantity}</span>
              )}
            </div>
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select
                name="status"
                defaultValue={data?.status || ProductStatus.ACTIVE}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ProductStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(status)}`}>
                          {status}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 🚚 تنظیمات پیشرفته ارسال محصول (Polished Enterprise-grade UI) */}
          <div className="border-2 border-amber-500/30 bg-gradient-to-br from-stone-950 via-stone-900 to-black p-7 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(217,119,6,0.1)] font-vazirmatn text-right space-y-6 relative overflow-hidden" dir="rtl">
            {/* Elegant Background Glow */}
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center gap-3.5 pb-4 border-b border-amber-500/20">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-truck"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><polyline points="14 18 20 18 22 14 18 14 18 10 14 10"/><circle cx="7.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent">
                  🚚 تنظیمات پیشرفته ارسال محصول
                </h3>
                <p className="text-xs text-amber-200/50 mt-1 font-medium">پیکربندی سیستم هوشمند توزیع و لجستیک کالا</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Group 1: هزینه و نوع ارسال */}
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-amber-400/90 flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  بخش اول: هزینه و نوع ارسال کالا
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Shipping Cost */}
                  <div className="space-y-2">
                    <Label htmlFor="shippingCost" className="text-stone-300 text-xs font-bold flex items-center gap-1.5">
                      <span>💰</span> هزینه اختصاصی ارسال (تومان)
                    </Label>
                    <div className="relative">
                      <Input
                        name="shippingCost"
                        type="number"
                        id="shippingCost"
                        defaultValue={(data as any)?.shippingCost ?? ''}
                        placeholder="مثال: ۲۵۰۰۰۰"
                        disabled={user?.role !== 'SUPERADMIN'}
                        className="bg-stone-950/90 border-amber-500/20 text-white placeholder-stone-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-75 disabled:cursor-not-allowed text-left font-semibold pr-4 h-11 rounded-xl"
                      />
                    </div>
                    <p className="text-[10px] text-stone-400 leading-relaxed font-medium">
                      💡 در صورت خالی بودن، هزینه پایه حمل و نقل فروشگاه (<span className="text-amber-300">۲۰۰٬۰۰۰ تومان</span>) اعمال خواهد شد.
                    </p>
                    {error?.shippingCost && (
                      <span className="text-red-500 text-xs mt-1 block font-bold">⚠️ {error.shippingCost}</span>
                    )}
                  </div>

                  {/* Shipping Description / Mode */}
                  <div className="space-y-2">
                    <Label htmlFor="shippingDescription" className="text-stone-300 text-xs font-bold flex items-center gap-1.5">
                      <span>📦</span> روش و قالب ارسال کالا
                    </Label>
                    <Select
                      name="shippingDescription"
                      defaultValue={(data as any)?.shippingDescription || ''}
                      disabled={user?.role !== 'SUPERADMIN'}
                    >
                      <SelectTrigger className="bg-stone-950/90 border-amber-500/20 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-75 h-11 rounded-xl">
                        <SelectValue placeholder="انتخاب قالب ارسال..." />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-950 border-amber-500/20 text-white font-vazirmatn">
                        <SelectItem value="ارسال ویژه">📦 ارسال ویژه (لوکس با بسته‌بندی امن)</SelectItem>
                        <SelectItem value="ارسال سنگین">🏋️ ارسال سنگین (کالاهای با وزن بالا)</SelectItem>
                        <SelectItem value="ارسال رایگان">🎁 ارسال رایگان (هدیه ویژه شیخ شاپ)</SelectItem>
                        <SelectItem value="ارسال اقتصادی">⚡ ارسال اقتصادی (حمل استاندارد مقرون‌به‌صرفه)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-stone-400 leading-relaxed font-medium">
                      💡 قالب انتخابی به عنوان یک نشان ارزشمند و لوکس در صفحه محصول به مشتریان نمایش داده می‌شود.
                    </p>
                  </div>
                </div>
              </div>

              {/* Group 2: اولویت و شرایط خاص */}
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-amber-400/90 flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  بخش دوم: زمان‌بندی و شرایط استثنایی
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Shipping Priority */}
                  <div className="space-y-2">
                    <Label htmlFor="shippingPriority" className="text-stone-300 text-xs font-bold flex items-center gap-1.5">
                      <span>⏱</span> زمان‌بندی و اولویت تحویل
                    </Label>
                    <Select
                      name="shippingPriority"
                      defaultValue={(data as any)?.shippingPriority || ''}
                      disabled={user?.role !== 'SUPERADMIN'}
                    >
                      <SelectTrigger className="bg-stone-950/90 border-amber-500/20 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-75 h-11 rounded-xl">
                        <SelectValue placeholder="انتخاب اولویت زمانی..." />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-950 border-amber-500/20 text-white font-vazirmatn">
                        <SelectItem value="Low">Low (عادی - ۵ الی ۱۰ روز کاری)</SelectItem>
                        <SelectItem value="Normal">Normal (استاندارد - ۳ الی ۷ روز کاری)</SelectItem>
                        <SelectItem value="High">High (ارسال سریع - ۲ الی ۴ روز کاری)</SelectItem>
                        <SelectItem value="Express">Express (فوری اکسپرس - ۱ الی ۲ روز کاری)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-stone-400 leading-relaxed font-medium">
                      💡 سیستم بر اساس اولویت زمانی انتخاب شده، زمان‌بندی ارسال و فازهای تحویل را تخمین می‌زند.
                    </p>
                  </div>

                  {/* Free Shipping Switch */}
                  <div className="flex items-center justify-between p-4.5 bg-stone-950/90 border border-amber-500/10 rounded-xl">
                    <div className="space-y-1">
                      <Label htmlFor="allowFreeShipping" className="text-amber-200 text-xs font-bold cursor-pointer flex items-center gap-1.5">
                        <span>🎁</span> ارسال رایگان اختصاصی
                      </Label>
                      <span className="text-[10px] text-stone-400 block font-medium">فعال‌سازی ارسال کاملاً رایگان برای این کالا</span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="allowFreeShipping"
                        id="allowFreeShipping"
                        defaultChecked={!!(data as any)?.allowFreeShipping}
                        disabled={user?.role !== 'SUPERADMIN'}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-amber-100 after:border-amber-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-orange-500 disabled:opacity-50"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {user?.role !== 'SUPERADMIN' && (
              <div className="mt-4 p-4 bg-amber-500/10 border-2 border-amber-500/20 rounded-2xl text-center flex items-center justify-center gap-2">
                <span className="text-xs text-amber-300 font-bold">🔒 حالت فقط مشاهده: دسترسی ویرایش این فیلدها منحصراً در اختیار مدیران ارشد (Super Admin) فروشگاه است.</span>
              </div>
            )}
          </div>

          {data?.status && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Current Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(data.status)}`}>
                {data.status}
              </span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/dashboard/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? 'Saving...'
              : isNewProduct
                ? 'Create Product'
                : 'Update Product'}
          </Button>
        </CardFooter>
      </form>
      {data?.id && (
        <CardFooter>
          <UploadImage productId={data.id} />
        </CardFooter>
      )}
    </Card>
  );
};

export default ProductForm;
