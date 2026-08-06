'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  Edit,
  PlusCircle,
  Trash2,
  Search,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Eye,
  EyeOff,
  FileText,
  RefreshCw,
  SlidersHorizontal,
  X,
  Star,
  Sparkles,
  Award,
  DollarSign,
  Boxes,
  Activity,
  Archive,
  AlertTriangle,
  ChevronLast,
  ChevronFirst,
  Info,
  Copy,
  TrendingUp,
  Settings,
  MessageSquare,
  Globe,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { formatToToman } from '@/lib/currency';
import { useHasRole } from '@/hooks/useRBAC';
import { bulkProductOperation, deleteProduct } from '../actions';
import { AnimatedBorder, AmbientGlow, GlassReflection, LuxuryCard, LuxuryButton } from '@/components/ui/LuxuryEffects';

// Formats number as Persian digits with custom separators
function toPersianDigits(num: number | string): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)] || x);
}

interface ProductTableProps {
  products: any[];
  stats: any;
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search: string;
    category: string;
    brand: string;
    status: string;
    stock: string;
    priceMin: string;
    priceMax: string;
    dateFilter: string;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onFilterChange: (key: any, value: string) => void;
  onClearFilters: () => void;
  onSortChange: (field: string, order: 'asc' | 'desc') => void;
  refreshProducts: () => void;
}

const columnHelper = createColumnHelper<any>();

export default function ProductTable({
  products,
  stats,
  loading,
  pagination,
  filters,
  sortBy,
  sortOrder,
  onPageChange,
  onLimitChange,
  onFilterChange,
  onClearFilters,
  onSortChange,
  refreshProducts,
}: ProductTableProps) {
  const canEdit = useHasRole(['ADMIN', 'SUPERADMIN', 'EDITOR']);

  // Table State
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    brand: true,
    sku: true,
    units: true,
    featured: true,
    views: true,
    sales: true,
    rating: true,
    createdAt: true,
    updatedAt: false,
  });

  // UI Drawer, Modal & Context states
  const [quickEditProduct, setQuickEditProduct] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; product: any } | null>(null);
  const [activeRowIndex, setActiveRowIndex] = useState<number>(-1);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [isQuickSaving, setIsQuickSaving] = useState(false);

  // Custom dialog displays
  const [previewProduct, setPreviewProduct] = useState<any | null>(null);
  const [activeAnalyticsProduct, setActiveAnalyticsProduct] = useState<any | null>(null);
  const [activeReviewsProduct, setActiveReviewsProduct] = useState<any | null>(null);
  const [activeSeoProduct, setActiveSeoProduct] = useState<any | null>(null);

  // Jump to page input state
  const [jumpPageVal, setJumpPagePageVal] = useState<string>('');

  // Bulk operation custom params
  const [bulkCategory, setBulkCategory] = useState('HONEY');
  const [bulkBrand, setBulkBrand] = useState('شیخ');
  const [bulkStatus, setBulkStatus] = useState('ACTIVE');
  const [bulkStockUpdate, setBulkStockUpdate] = useState('');

  // Refs for keyboard and click handlers
  const tableRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Distinct brands list
  const distinctBrands = useMemo(() => {
    return ['all', 'شیخ', 'سرو', 'یزدان', 'شاهان', 'مهرآیین'];
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDrawerOpen || !products.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveRowIndex((prev) => Math.min(products.length - 1, prev + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveRowIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Enter' && activeRowIndex >= 0) {
        e.preventDefault();
        setQuickEditProduct(products[activeRowIndex]);
        setIsDrawerOpen(true);
      } else if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setContextMenu(null);
        setPreviewProduct(null);
        setActiveAnalyticsProduct(null);
        setActiveReviewsProduct(null);
        setActiveSeoProduct(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeRowIndex, products, isDrawerOpen]);

  // Handle Right Click context menus
  const handleRowContextMenu = (e: React.MouseEvent, product: any, index: number) => {
    e.preventDefault();
    setActiveRowIndex(index);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      product,
    });
  };

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  // Format category name safely
  const getCategoryTitle = (cat: string) => {
    const mapping: Record<string, string> = {
      HONEY: 'عسل طبیعی شفا',
      SAFFRON: 'زعفران قائنات',
      DATES: 'خرما مضافتی',
      OTHERS: 'سایر محصولات',
    };
    return mapping[cat] || cat;
  };

  // Convert English dates to Persian formatted date
  const formatPersianDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return toPersianDigits(
        date.toLocaleDateString('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    } catch {
      return dateStr;
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    try {
      const headers = 'شناسه,نام,دسته بندی,قیمت,موجودی,برند,SKU,وضعیت,تاریخ ایجاد\n';
      const rows = products
        .map((p) => {
          return `"${p.id}","${p.name}","${getCategoryTitle(p.category)}","${p.basePrice}","${p.quantity}","${p.brand || ''}","${p.sku || ''}","${p.status}","${p.createdAt}"`;
        })
        .join('\n');

      const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('خروجی CSV با موفقیت صادر شد.');
    } catch {
      toast.error('خطایی در صادرات فایل رخ داد.');
    }
  };

  const handleExportExcel = () => {
    try {
      const headers = ['شناسه', 'نام محصول', 'دسته بندی', 'قیمت (تومان)', 'موجودی', 'برند', 'SKU', 'وضعیت'];
      let xml = '<?xml version="1.0" encoding="utf-8"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Products"><Table>';

      // Header Row
      xml += '<Row>';
      headers.forEach(h => {
        xml += `<Cell><Data ss:Type="String">${h}</Data></Cell>`;
      });
      xml += '</Row>';

      // Data Rows
      products.forEach(p => {
        xml += '<Row>';
        xml += `<Cell><Data ss:Type="String">${p.id}</Data></Cell>`;
        xml += `<Cell><Data ss:Type="String">${p.name}</Data></Cell>`;
        xml += `<Cell><Data ss:Type="String">${getCategoryTitle(p.category)}</Data></Cell>`;
        xml += `<Cell><Data ss:Type="Number">${p.basePrice}</Data></Cell>`;
        xml += `<Cell><Data ss:Type="Number">${p.quantity}</Data></Cell>`;
        xml += `<Cell><Data ss:Type="String">${p.brand || ''}</Data></Cell>`;
        xml += `<Cell><Data ss:Type="String">${p.sku || ''}</Data></Cell>`;
        xml += `<Cell><Data ss:Type="String">${p.status}</Data></Cell>`;
        xml += '</Row>';
      });

      xml += '</Table></Worksheet></Workbook>';

      const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-export-${new Date().toISOString().split('T')[0]}.xls`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('خروجی Excel با موفقیت صادر شد.');
    } catch {
      toast.error('خطایی در صادرات فایل رخ داد.');
    }
  };

  // Preset Filters
  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error('لطفا نام پریست را وارد کنید.');
      return;
    }
    localStorage.setItem('sheikh_products_filter_preset', JSON.stringify(filters));
    toast.success(`پریست فیلتر "${presetName}" با موفقیت ذخیره شد.`);
    setPresetName('');
  };

  // Duplicate product
  const handleDuplicateProduct = async (product: any) => {
    try {
      const response = await fetch('/api/dashboard/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          id: undefined, // let database create a new uuid
          name: `${product.name} (کپی)`,
          slug: `${product.slug || 'slug'}-copy-${Date.now()}`,
          status: 'DRAFT',
        }),
      });
      const res = await response.json();
      if (res.success || response.ok) {
        toast.success('محصول با موفقیت تکثیر شد.');
        refreshProducts();
      } else {
        toast.error('تکثیر محصول ناموفق بود.');
      }
    } catch {
      toast.error('خطا در ارتباط با سرور.');
    }
  };

  // Bulk Operations Submit
  const handleBulkSubmit = async () => {
    const selectedIds = Object.keys(rowSelection).filter(id => rowSelection[id]);
    if (!selectedIds.length) {
      toast.error('هیچ محصولی انتخاب نشده است.');
      return;
    }

    setIsBulkLoading(true);
    try {
      // Execute the bulk action based on choice
      let resolvedAction = bulkAction;
      if (bulkAction === 'feature') {
        // Mocking or executing sequentially for custom bulk options
        for (const id of selectedIds) {
          await fetch('/api/dashboard/products', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, isAmazing: true }),
          });
        }
        toast.success('محصولات انتخاب شده شگفت‌انگیز شدند.');
        setRowSelection({});
        refreshProducts();
        setShowBulkConfirm(false);
        setIsBulkLoading(false);
        return;
      }
      if (bulkAction === 'unfeature') {
        for (const id of selectedIds) {
          await fetch('/api/dashboard/products', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, isAmazing: false }),
          });
        }
        toast.success('نشان شگفت‌انگیز محصولات لغو شد.');
        setRowSelection({});
        refreshProducts();
        setShowBulkConfirm(false);
        setIsBulkLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('productIds', JSON.stringify(selectedIds));
      formData.append('action', resolvedAction);

      // Pass optional bulk params
      if (resolvedAction === 'assign_category') formData.append('category', bulkCategory);
      if (resolvedAction === 'assign_brand') formData.append('brand', bulkBrand);
      if (resolvedAction === 'inventory_update') formData.append('inventory', bulkStockUpdate);

      const result = await bulkProductOperation(formData);

      if (result.success) {
        toast.success(`عملیات گروهی روی ${result.affectedCount} محصول با موفقیت اعمال شد.`);
        setRowSelection({});
        refreshProducts();
        setShowBulkConfirm(false);
      } else {
        toast.error(result.error || 'خطایی رخ داد.');
      }
    } catch (e) {
      toast.error('عملیات ناموفق بود.');
    } finally {
      setIsBulkLoading(false);
    }
  };

  // Quick edit single product
  const handleQuickSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEditProduct) return;

    setIsQuickSaving(true);
    try {
      const response = await fetch('/api/dashboard/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: quickEditProduct.id,
          name: quickEditProduct.name,
          basePrice: quickEditProduct.basePrice,
          quantity: quickEditProduct.quantity,
          status: quickEditProduct.status,
          category: quickEditProduct.category,
          brand: quickEditProduct.brand,
          sku: quickEditProduct.sku,
          isAmazing: quickEditProduct.isAmazing,
          isBestSeller: quickEditProduct.isBestSeller,
          isNew: quickEditProduct.isNew,
        }),
      });

      const res = await response.json();
      if (res.success) {
        toast.success('محصول با موفقیت و به صورت آنی بروزرسانی شد.');
        setIsDrawerOpen(false);
        refreshProducts();
      } else {
        toast.error(res.error || 'بروزرسانی ناموفق بود.');
      }
    } catch {
      toast.error('خطای ارتباطی با سرور.');
    } finally {
      setIsQuickSaving(false);
    }
  };

  // Delete individual product
  const handleDeleteSingle = async (productId: string) => {
    if (!confirm('آیا از حذف کامل این محصول اطمینان دارید؟ این عمل غیر قابل بازگشت است.')) {
      return;
    }

    try {
      const res = await deleteProduct(productId);
      if (res.success) {
        toast.success('محصول با موفقیت حذف شد.');
        refreshProducts();
      }
    } catch {
      toast.error('حذف محصول با خطا مواجه شد.');
    }
  };

  // Toggle quick boolean featured fields
  const toggleProductFeature = async (product: any, field: 'isAmazing' | 'isBestSeller' | 'isNew') => {
    try {
      const response = await fetch('/api/dashboard/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          [field]: !product[field],
        }),
      });
      const res = await response.json();
      if (res.success) {
        toast.success('تغییرات با موفقیت ذخیره شد.');
        refreshProducts();
      }
    } catch {
      toast.error('خطا در همگام‌سازی ویژگی محصول.');
    }
  };

  // Jump to page submit handler
  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPage = parseInt(jumpPageVal, 10);
    if (isNaN(parsedPage) || parsedPage < 1 || parsedPage > pagination.totalPages) {
      toast.error(`لطفا صفحه‌ای بین ۱ و ${pagination.totalPages} انتخاب کنید.`);
      return;
    }
    onPageChange(parsedPage);
    setJumpPagePageVal('');
  };

  // TanStack Columns Creation
  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      header: ({ table }: any) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="w-4 h-4 rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-stone-950 accent-amber-500 cursor-pointer"
          />
        </div>
      ),
      cell: ({ row }: any) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-stone-950 accent-amber-500 cursor-pointer"
          />
        </div>
      ),
    }),
    columnHelper.accessor('images', {
      header: 'تصویر',
      cell: (info: any) => {
        const imgs = info.getValue();
        const imgPath = imgs && imgs[0]?.image ? imgs[0].image : '/assets/noImage.jpg';
        return (
          <div className="flex justify-center">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-stone-800 bg-stone-900 group">
              <Image
                src={imgPath}
                alt="Product"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('name', {
      header: () => <span className="text-right">نام محصول</span>,
      cell: (info: any) => (
        <div className="max-w-xs text-right">
          <div className="font-semibold text-stone-200 hover:text-amber-400 transition-colors cursor-pointer truncate">
            {info.getValue()}
          </div>
          {(info.row.original as any).description && (
            <div className="text-xs text-stone-500 truncate mt-0.5">
              {(info.row.original as any).description}
            </div>
          )}
        </div>
      ),
    }),
    columnHelper.accessor('category', {
      header: 'دسته بندی',
      cell: (info: any) => {
        const cat = info.getValue();
        const colorMap: Record<string, string> = {
          HONEY: 'border-amber-900/40 bg-amber-950/20 text-amber-400',
          SAFFRON: 'border-red-950/40 bg-red-950/20 text-red-400',
          DATES: 'border-orange-950/40 bg-orange-950/20 text-orange-400',
          OTHERS: 'border-stone-800 bg-stone-900/60 text-stone-400',
        };
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorMap[cat] || colorMap.OTHERS}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-85" />
            {getCategoryTitle(cat)}
          </span>
        );
      },
    }),
    columnHelper.accessor('brand', {
      header: 'برند',
      cell: (info: any) => info.getValue() ? (
        <span className="text-xs font-medium text-stone-300 bg-stone-900/80 px-2 py-1 rounded border border-stone-800 font-vazirmatn">
          {info.getValue()}
        </span>
      ) : <span className="text-stone-600">-</span>,
    }),
    columnHelper.accessor('sku', {
      header: 'SKU / شناسه کالا',
      cell: (info: any) => info.getValue() ? (
        <code className="text-[10px] font-mono tracking-wider text-amber-500 bg-amber-950/10 border border-amber-900/30 px-1.5 py-0.5 rounded">
          {info.getValue()}
        </code>
      ) : <span className="text-stone-600">-</span>,
    }),
    columnHelper.accessor('quantity', {
      header: 'موجودی',
      cell: (info: any) => {
        const stock = info.getValue();
        let color = 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30';
        let statusText = 'موجود';
        if (stock === 0) {
          color = 'bg-red-950/40 text-red-400 border-red-900/30';
          statusText = 'ناموجود';
        } else if (stock <= 10) {
          color = 'bg-yellow-950/40 text-yellow-400 border-yellow-900/30';
          statusText = 'رو به اتمام';
        }

        return (
          <div className="flex flex-col items-center gap-1">
            <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${color}`}>
              {statusText}
            </span>
            <span className="text-xs font-mono font-medium text-stone-400">
              {toPersianDigits(stock)} عدد
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor('units', {
      header: 'واحدها',
      cell: (info: any) => {
        const unitsList = info.getValue() || [];
        return (
          <div className="flex flex-col items-center gap-1 min-w-[70px]">
            <span className="text-xs font-semibold text-stone-400">
              {toPersianDigits(unitsList.length)} واحد
            </span>
            {unitsList.length > 0 && (
              <div className="flex flex-wrap gap-0.5 justify-center max-w-[100px]">
                {unitsList.slice(0, 2).map((u: any) => (
                  <span key={u.id} className="text-[9px] bg-stone-900 text-stone-400 px-1 rounded border border-stone-800">
                    {u.name}
                  </span>
                ))}
                {unitsList.length > 2 && (
                  <span className="text-[9px] text-stone-500 font-mono">+{toPersianDigits(unitsList.length - 2)}</span>
                )}
              </div>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: 'وضعیت',
      cell: (info: any) => {
        const st = info.getValue();
        const colors: Record<string, string> = {
          ACTIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
          INACTIVE: 'bg-red-500/15 text-red-400 border-red-500/20',
          DRAFT: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-bold border ${colors[st] || 'bg-stone-800 text-stone-400'}`}>
            {st === 'ACTIVE' ? 'فعال' : st === 'INACTIVE' ? 'غیرفعال' : 'پیش‌نویس'}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: 'featured',
      header: 'نشان‌های لوکس',
      cell: ({ row }: any) => {
        const prod = row.original as any;
        return (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => toggleProductFeature(prod, 'isAmazing')}
              title="محصول شگفت‌انگیز (Amazing Deal)"
              className={`p-1.5 rounded-md border transition-all ${prod.isAmazing ? 'text-orange-400 bg-orange-950/20 border-orange-500/35 shadow-orange-900/20' : 'text-stone-600 border-stone-800 hover:border-stone-700'}`}
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleProductFeature(prod, 'isBestSeller')}
              title="پرفروش‌ترین (Best Seller)"
              className={`p-1.5 rounded-md border transition-all ${prod.isBestSeller ? 'text-amber-400 bg-amber-950/20 border-amber-500/35 shadow-amber-900/20' : 'text-stone-600 border-stone-800 hover:border-stone-700'}`}
            >
              <Award className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleProductFeature(prod, 'isNew')}
              title="جدید (New Product)"
              className={`p-1.5 rounded-md border transition-all ${prod.isNew ? 'text-blue-400 bg-blue-950/20 border-blue-500/35 shadow-blue-900/20' : 'text-stone-600 border-stone-800 hover:border-stone-700'}`}
            >
              <Star className="w-4 h-4" />
            </button>
          </div>
        );
      },
    }),
    columnHelper.accessor('views', {
      header: 'بازدید',
      cell: (info: any) => (
        <span className="font-mono text-xs font-semibold text-stone-400">
          {toPersianDigits(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor('sales', {
      header: 'فروش',
      cell: (info: any) => (
        <span className="font-mono text-xs font-semibold text-stone-400">
          {toPersianDigits(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor('rating', {
      header: 'امتیاز',
      cell: (info: any) => {
        const rating = info.getValue() || 5.0;
        return (
          <div className="flex items-center justify-center gap-1">
            <span className="text-xs font-mono font-bold text-amber-400">{toPersianDigits(rating)}</span>
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </div>
        );
      },
    }),
    columnHelper.accessor('basePrice', {
      header: 'قیمت پایه',
      cell: (info: any) => (
        <span className="font-semibold text-amber-400 font-mono text-sm">
          {formatToToman(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: 'تاریخ ثبت',
      cell: (info: any) => (
        <span className="text-xs text-stone-400 whitespace-nowrap">
          {formatPersianDate(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor('updatedAt', {
      header: 'آخرین ویرایش',
      cell: (info: any) => (
        <span className="text-xs text-stone-400 whitespace-nowrap">
          {formatPersianDate(info.getValue())}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'عملیات',
      cell: ({ row }: any) => {
        const prod = row.original as any;
        return (
          <div className="flex justify-center gap-1">
            {/* Quick Edit */}
            <button
              onClick={() => {
                setQuickEditProduct(prod);
                setIsDrawerOpen(true);
              }}
              title="ویرایش سریع آنی"
              className="p-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            {/* Duplicate */}
            <button
              onClick={() => handleDuplicateProduct(prod)}
              title="تکثیر / کپی محصول"
              className="p-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {/* Preview Modal */}
            <button
              onClick={() => setPreviewProduct(prod)}
              title="پیش‌نمایش لوکس"
              className="p-1.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            {/* Analytics Summary */}
            <button
              onClick={() => setActiveAnalyticsProduct(prod)}
              title="نمودار و آمار تفصیلی"
              className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
            {/* Reviews Summary */}
            <button
              onClick={() => setActiveReviewsProduct(prod)}
              title="نظرات مشتریان"
              className="p-1.5 rounded bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20 cursor-pointer relative"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
            {/* SEO Overview */}
            <button
              onClick={() => setActiveSeoProduct(prod)}
              title="اطلاعات سئو و تگ‌ها"
              className="p-1.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
            {/* Full Editor */}
            <Link
              href={`/dashboard/products/${prod.id}`}
              title="ویرایش پیشرفته (۱۱ تب)"
              className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>
            {/* Delete */}
            <button
              onClick={() => handleDeleteSingle(prod.id)}
              title="حذف کامل از سیستم"
              className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    }),
  ], [distinctBrands, products]);

  const table = useReactTable({
    data: products,
    columns,
    state: {
      rowSelection,
      columnVisibility,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row: any) => row.id,
  });

  // Check how many items selected
  const selectedCount = Object.keys(rowSelection).filter(k => rowSelection[k]).length;

  return (
    <div className="space-y-6 select-none relative" ref={tableRef}>
      {/* 1. Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-stone-900 to-[#120e0c] p-6 rounded-2xl border border-amber-500/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Boxes className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-stone-100 tracking-tight font-vazirmatn">مدیریت محصولات لوکس شیخ</h1>
              <p className="text-xs text-stone-400 mt-1">
                دسترسی به تمام محصولات فروشگاه به همراه کنترل هوشمند موجودی و فیلترهای فوق‌پیشرفته.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          {canEdit && (
            <Link
              href="/dashboard/products/new"
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-stone-950 shadow-[0_4px_20px_rgba(217,119,6,0.18)] border border-amber-500/30 font-bold hover:brightness-110 active:scale-95 transition-all rounded-xl px-5 py-2.5 text-xs text-center font-vazirmatn"
            >
              <PlusCircle className="w-4 h-4" />
              ثبت محصول جدید
            </Link>
          )}

          <button
            onClick={refreshProducts}
            className="p-3 bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200 rounded-xl flex items-center justify-center transition-all shadow-md cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Top Luxury Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 font-vazirmatn">
          <LuxuryCard className="flex flex-col p-4 border border-stone-800 bg-stone-900/40 backdrop-blur-md rounded-xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
            <div className="flex justify-between items-center text-stone-500">
              <span className="text-xs font-semibold">کل محصولات</span>
              <Boxes className="w-4 h-4 text-stone-400" />
            </div>
            <span className="text-2xl font-bold text-stone-100 mt-2 font-mono">
              {toPersianDigits(stats.totalProducts || 0)}
            </span>
            <span className="text-[10px] text-stone-500 mt-1">همه رکوردهای دیتابیس</span>
          </LuxuryCard>

          <LuxuryCard className="flex flex-col p-4 border border-stone-800 bg-stone-900/40 backdrop-blur-md rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
            <div className="flex justify-between items-center text-stone-500">
              <span className="text-xs font-semibold">محصولات فعال</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold text-stone-100 mt-2 font-mono">
              {toPersianDigits(stats.activeProducts || 0)}
            </span>
            <span className="text-[10px] text-emerald-500 mt-1">منتشر شده در فروشگاه</span>
          </LuxuryCard>

          <LuxuryCard className="flex flex-col p-4 border border-stone-800 bg-stone-900/40 backdrop-blur-md rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-500" />
            <div className="flex justify-between items-center text-stone-500">
              <span className="text-xs font-semibold">پیش‌نویس‌ها</span>
              <Archive className="w-4 h-4 text-yellow-400" />
            </div>
            <span className="text-2xl font-bold text-stone-100 mt-2 font-mono">
              {toPersianDigits(stats.draftProducts || 0)}
            </span>
            <span className="text-[10px] text-yellow-500 mt-1">در انتظار ویرایش یا تایید</span>
          </LuxuryCard>

          <LuxuryCard className="flex flex-col p-4 border border-stone-800 bg-stone-900/40 backdrop-blur-md rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
            <div className="flex justify-between items-center text-stone-500">
              <span className="text-xs font-semibold">اتمام موجودی</span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-2xl font-bold text-stone-100 mt-2 font-mono">
              {toPersianDigits(stats.outOfStock || 0)}
            </span>
            <span className="text-[10px] text-red-500 mt-1">نیازمند شارژ فوری انبار</span>
          </LuxuryCard>

          <LuxuryCard className="flex flex-col p-4 border border-stone-800 bg-stone-900/40 backdrop-blur-md rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-600" />
            <div className="flex justify-between items-center text-stone-500">
              <span className="text-xs font-semibold">ارزش کل انبار</span>
              <DollarSign className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-lg font-bold text-amber-400 mt-2 font-mono">
              {formatToToman(stats.inventoryValue || 0)}
            </span>
            <span className="text-[10px] text-stone-500 mt-1">جمع قیمت پایه * موجودی</span>
          </LuxuryCard>
        </div>
      )}

      {/* 3. Professional Toolbar */}
      <div className="bg-[#0b0807] border border-stone-800/80 rounded-2xl p-5 shadow-lg space-y-4 font-vazirmatn">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2 text-stone-200">
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold">جعبه ابزار پیشرفته جستجو و فیلترینگ</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="نام پریست فیلتر..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="px-3 py-1 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleSavePreset}
              className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              ذخیره پریست
            </button>
            <button
              onClick={onClearFilters}
              className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              حذف فیلترها
            </button>
          </div>
        </div>

        {/* Filters Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* Global Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 w-4 h-4" />
            <input
              type="text"
              placeholder="جستجو در نام، شرح..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="w-full pr-9 pl-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">همه دسته‌بندی‌ها</option>
            <option value="HONEY">عسل طبیعی</option>
            <option value="SAFFRON">زعفران لوکس</option>
            <option value="DATES">خرما مضافتی</option>
            <option value="OTHERS">سایر محصولات</option>
          </select>

          {/* Brand Filter */}
          <select
            value={filters.brand}
            onChange={(e) => onFilterChange('brand', e.target.value)}
            className="px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">همه برندها</option>
            {distinctBrands.filter(b => b !== 'all').map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">وضعیت (همه)</option>
            <option value="ACTIVE">فقط فعال</option>
            <option value="INACTIVE">غیرفعال</option>
            <option value="DRAFT">پیش‌نویس</option>
          </select>

          {/* Stock Filter */}
          <select
            value={filters.stock}
            onChange={(e) => onFilterChange('stock', e.target.value)}
            className="px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">وضعیت انبار (همه)</option>
            <option value="in_stock">موجود انبار</option>
            <option value="low_stock">رو به اتمام</option>
            <option value="out_of_stock">ناموجود</option>
          </select>

          {/* Date relative filter */}
          <select
            value={filters.dateFilter}
            onChange={(e) => onFilterChange('dateFilter', e.target.value)}
            className="px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">تاریخ ثبت (همه)</option>
            <option value="today">امروز</option>
            <option value="this_week">یک هفته اخیر</option>
            <option value="this_month">ماه جاری</option>
          </select>

          {/* Price Range Filters */}
          <input
            type="number"
            placeholder="حداقل قیمت..."
            value={filters.priceMin}
            onChange={(e) => onFilterChange('priceMin', e.target.value)}
            className="px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-300 focus:outline-none focus:border-amber-500/50"
          />

          <input
            type="number"
            placeholder="حداکثر قیمت..."
            value={filters.priceMax}
            onChange={(e) => onFilterChange('priceMax', e.target.value)}
            className="px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-300 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Toolbar Utility Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-3 border-t border-stone-900/60 text-xs">
          <div className="flex flex-wrap gap-2">
            <span className="text-stone-500 py-1.5 px-3 bg-stone-900/40 rounded-lg">
              ستون‌های قابل نمایش:
            </span>
            {Object.keys(columnVisibility).map(col => (
              <button
                key={col}
                onClick={() => setColumnVisibility(prev => ({ ...prev, [col]: !prev[col] }))}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${columnVisibility[col] ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-stone-900 border-stone-800 text-stone-500'}`}
              >
                {col === 'brand' ? 'برند' : col === 'sku' ? 'شناسه کالا' : col === 'units' ? 'واحدها' : col === 'featured' ? 'نشان لوکس' : col === 'views' ? 'بازدید' : col === 'sales' ? 'فروش' : col === 'rating' ? 'امتیاز' : col === 'createdAt' ? 'تاریخ ثبت' : col === 'updatedAt' ? 'تاریخ ویرایش' : col}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-stone-900 border border-stone-800 hover:border-stone-700 hover:text-stone-100 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer text-stone-400"
            >
              <Download className="w-3.5 h-3.5" />
              خروجی CSV
            </button>
            <button
              onClick={handleExportExcel}
              className="px-3 py-2 bg-stone-900 border border-stone-800 hover:border-stone-700 hover:text-stone-100 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer text-stone-400"
            >
              <FileText className="w-3.5 h-3.5" />
              خروجی Excel
            </button>
          </div>
        </div>
      </div>

      {/* 4. Products Table Body */}
      <div className="bg-[#0b0807] border border-stone-800 rounded-2xl shadow-xl overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center z-40">
            <div className="flex flex-col items-center gap-2 p-5 bg-stone-900/90 rounded-2xl border border-stone-800 shadow-xl">
              <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
              <span className="text-xs text-stone-400 font-vazirmatn">در حال همگام‌سازی محصولات...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full border-collapse text-stone-300">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-900/30 sticky top-0 bg-[#0c0908] z-10">
                {table.getFlatHeaders().map((header: any) => {
                  const isSorted = sortBy === header.id;
                  return (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="p-4 text-xs font-bold text-stone-400 text-center tracking-wider select-none relative group whitespace-nowrap"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          onClick={() => {
                            if (header.column.getCanSort()) {
                              const isDesc = sortBy === header.id && sortOrder === 'desc';
                              onSortChange(header.id, isDesc ? 'asc' : 'desc');
                            }
                          }}
                          className={`flex items-center justify-center gap-1.5 ${header.column.getCanSort() ? 'cursor-pointer hover:text-stone-200' : ''}`}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <ArrowUpDown className={`w-3.5 h-3.5 transition-colors ${isSorted ? 'text-amber-500' : 'text-stone-600'}`} />
                          )}
                        </div>
                      )}
                      {/* Resizable handle */}
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`absolute left-0 top-0 h-full w-1 bg-amber-500/0 hover:bg-amber-500/40 cursor-col-resize select-none touch-none ${
                          header.column.getIsResizing() ? 'bg-amber-500 w-1.5' : ''
                        }`}
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                table.getRowModel().rows.map((row: any, index: number) => {
                  const isRowActive = activeRowIndex === index;
                  return (
                    <tr
                      key={row.id}
                      onContextMenu={(e) => handleRowContextMenu(e, row.original, index)}
                      onClick={() => setActiveRowIndex(index)}
                      className={`border-b border-stone-900 hover:bg-stone-900/20 transition-all ${isRowActive ? 'bg-stone-900/40 border-l-2 border-l-amber-500' : ''}`}
                    >
                      {row.getVisibleCells().map((cell: any) => (
                        <td key={cell.id} className="p-4 text-center text-xs text-stone-300 font-medium whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={table.getFlatHeaders().length} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Archive className="w-12 h-12 text-stone-600" />
                      <p className="text-sm font-semibold text-stone-500 font-vazirmatn">هیچ محصولی در دیتابیس یافت نشد.</p>
                      <button
                        onClick={onClearFilters}
                        className="px-4 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-400 hover:text-stone-200 cursor-pointer font-vazirmatn"
                      >
                        پاک کردن فیلترها و نمایش همه
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Controls with Jump-to-Page */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 px-6 py-4 border-t border-stone-800 bg-stone-950/20 text-xs text-stone-400 font-vazirmatn">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span>نمایش</span>
              <select
                value={pagination.limit}
                onChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
                className="px-2 py-1 bg-stone-900 border border-stone-800 rounded-lg text-stone-300 focus:outline-none"
              >
                {[20, 50, 100, 200, 500].map(sz => (
                  <option key={sz} value={sz}>{toPersianDigits(sz)} محصول</option>
                ))}
              </select>
              <span>محصول در هر صفحه</span>
            </div>

            {/* Jump to Page Form */}
            <form onSubmit={handleJumpPage} className="flex items-center gap-2">
              <span>پرش به صفحه:</span>
              <input
                type="number"
                min="1"
                max={pagination.totalPages}
                value={jumpPageVal}
                onChange={(e) => setJumpPagePageVal(e.target.value)}
                placeholder="شماره..."
                className="w-16 px-2 py-1 bg-stone-900 border border-stone-800 rounded-lg text-stone-200 text-center focus:outline-none focus:border-amber-500"
              />
              <button type="submit" className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg cursor-pointer font-bold">تایید</button>
            </form>
          </div>

          <div className="text-center font-mono font-medium">
            نمایش محصول {toPersianDigits(((pagination.page - 1) * pagination.limit) + 1)} تا {toPersianDigits(Math.min(pagination.page * pagination.limit, pagination.total))} از {toPersianDigits(pagination.total)} محصول کل
          </div>

          {/* Luxury Rounded Capsule Navigator */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(1)}
              disabled={pagination.page === 1}
              className="p-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronFirst className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 bg-stone-900 border border-stone-800 rounded-lg font-mono text-stone-200">
              صفحه {toPersianDigits(pagination.page)} از {toPersianDigits(pagination.totalPages)}
            </span>

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronLast className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Selected Items Sticky Bulk Actions Floating Bar */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0c0908]/95 backdrop-blur-md px-6 py-4 rounded-full border border-amber-500/30 shadow-2xl flex items-center gap-6 font-vazirmatn"
          >
            <span className="text-stone-200 text-xs font-semibold whitespace-nowrap">
              {toPersianDigits(selectedCount)} محصول انتخاب شده است
            </span>

            <div className="flex items-center gap-3">
              <select
                value={bulkAction}
                onChange={(e) => {
                  setBulkAction(e.target.value);
                  setShowBulkConfirm(true);
                }}
                className="px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-full text-xs text-stone-300 focus:outline-none"
              >
                <option value="">عملیات گروهی...</option>
                <option value="activate">فعال‌سازی وضعیت</option>
                <option value="deactivate">غیرفعال‌سازی وضعیت</option>
                <option value="draft">انتقال به پیش‌نویس</option>
                <option value="feature">شگفت‌انگیز کردن (Amazing)</option>
                <option value="unfeature">لغو نشان شگفت‌انگیز</option>
                <option value="assign_category">تغییر گروهی دسته‌بندی</option>
                <option value="assign_brand">تغییر گروهی برند</option>
                <option value="inventory_update">بروزرسانی گروهی موجودی</option>
                <option value="delete">حذف کامل محصولات</option>
              </select>

              {/* Action Parameter Controls */}
              {bulkAction === 'assign_category' && (
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="px-3 py-1 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-200"
                >
                  <option value="HONEY">عسل طبیعی</option>
                  <option value="SAFFRON">زعفران لوکس</option>
                  <option value="DATES">خرما مضافتی</option>
                  <option value="OTHERS">سایر محصولات</option>
                </select>
              )}

              {bulkAction === 'assign_brand' && (
                <input
                  type="text"
                  placeholder="نام برند جدید..."
                  value={bulkBrand}
                  onChange={(e) => setBulkBrand(e.target.value)}
                  className="px-3 py-1 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-200"
                />
              )}

              {bulkAction === 'inventory_update' && (
                <input
                  type="number"
                  placeholder="موجودی جدید..."
                  value={bulkStockUpdate}
                  onChange={(e) => setBulkStockUpdate(e.target.value)}
                  className="w-24 px-3 py-1 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-200 text-center"
                />
              )}

              <button
                onClick={() => setRowSelection({})}
                className="p-2 bg-stone-800/80 hover:bg-stone-700/80 text-stone-300 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. Quick Edit slide-out Drawer using Framer Motion */}
      <AnimatePresence>
        {isDrawerOpen && quickEditProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              ref={drawerRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-[#0c0908] border-l border-stone-800 z-50 shadow-2xl p-6 overflow-y-auto text-right font-vazirmatn"
            >
              <div className="flex justify-between items-center border-b border-stone-800 pb-4 mb-6">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <h3 className="text-base font-bold text-stone-100">ویرایش سریع و آنی محصول</h3>
              </div>

              <form onSubmit={handleQuickSave} className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1.5">نام محصول</label>
                  <input
                    type="text"
                    required
                    value={quickEditProduct.name}
                    onChange={(e) => setQuickEditProduct((prev: any) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Brand & SKU */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-400 mb-1.5">برند</label>
                    <input
                      type="text"
                      value={quickEditProduct.brand || ''}
                      onChange={(e) => setQuickEditProduct((prev: any) => ({ ...prev, brand: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-400 mb-1.5">شناسه کالا SKU</label>
                    <input
                      type="text"
                      value={quickEditProduct.sku || ''}
                      onChange={(e) => setQuickEditProduct((prev: any) => ({ ...prev, sku: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                {/* Category & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-400 mb-1.5">دسته بندی</label>
                    <select
                      value={quickEditProduct.category}
                      onChange={(e) => setQuickEditProduct((prev: any) => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-300 focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="HONEY">عسل طبیعی شفا</option>
                      <option value="SAFFRON">زعفران لوکس</option>
                      <option value="DATES">خرما مضافتی</option>
                      <option value="OTHERS">سایر محصولات</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-400 mb-1.5">وضعیت انتشار</label>
                    <select
                      value={quickEditProduct.status}
                      onChange={(e) => setQuickEditProduct((prev: any) => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-300 focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="ACTIVE">فعال</option>
                      <option value="INACTIVE">غیرفعال</option>
                      <option value="DRAFT">پیش‌نویس</option>
                    </select>
                  </div>
                </div>

                {/* Base Price & Stock */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-400 mb-1.5">قیمت پایه (تومان)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={quickEditProduct.basePrice}
                      onChange={(e) => setQuickEditProduct((prev: any) => ({ ...prev, basePrice: parseFloat(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-400 mb-1.5">موجودی انبار</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={quickEditProduct.quantity}
                      onChange={(e) => setQuickEditProduct((prev: any) => ({ ...prev, quantity: parseInt(e.target.value, 10) }))}
                      className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                {/* Featured Toggles inside drawer */}
                <div className="border-t border-stone-800 pt-4">
                  <span className="block text-xs font-semibold text-stone-400 mb-3">نشان‌های لوکس کالا</span>
                  <div className="flex flex-col gap-2 bg-stone-900/40 p-3 rounded-xl border border-stone-800/60">
                    <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                      <span className="text-stone-300">محصول شگفت‌انگیز (Amazing Deal)</span>
                      <input
                        type="checkbox"
                        checked={!!quickEditProduct.isAmazing}
                        onChange={(e) => setQuickEditProduct((prev: any) => ({ ...prev, isAmazing: e.target.checked }))}
                        className="w-4 h-4 accent-amber-500 rounded border-stone-700 bg-stone-900"
                      />
                    </label>
                    <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                      <span className="text-stone-300">پرفروش‌ترین محصول (Best Seller)</span>
                      <input
                        type="checkbox"
                        checked={!!quickEditProduct.isBestSeller}
                        onChange={(e) => setQuickEditProduct((prev: any) => ({ ...prev, isBestSeller: e.target.checked }))}
                        className="w-4 h-4 accent-amber-500 rounded border-stone-700 bg-stone-900"
                      />
                    </label>
                    <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                      <span className="text-stone-300">محصول جدید (New Product)</span>
                      <input
                        type="checkbox"
                        checked={!!quickEditProduct.isNew}
                        onChange={(e) => setQuickEditProduct((prev: any) => ({ ...prev, isNew: e.target.checked }))}
                        className="w-4 h-4 accent-amber-500 rounded border-stone-700 bg-stone-900"
                      />
                    </label>
                  </div>
                </div>

                {/* Dynamic Unit Indicator info box */}
                <div className="bg-stone-900/60 p-4 border border-stone-800 rounded-xl flex items-start gap-2.5 text-stone-400">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold block text-stone-300 mb-0.5">مدیریت واحدها و متغیرها</span>
                    <span className="text-[11px] leading-relaxed block">
                      واحدهای اندازه‌گیری مانند وزن، حجم و بسته‌بندی در تب اختصاصی ویرایش کامل محصول قابل تنظیم است.
                    </span>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-6 border-t border-stone-900/80">
                  <LuxuryButton
                    type="submit"
                    disabled={isQuickSaving}
                    className="w-full flex justify-center items-center gap-1 font-vazirmatn text-xs"
                  >
                    {isQuickSaving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      'ذخیره تغییرات آنی'
                    )}
                  </LuxuryButton>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    انصراف
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 8. Row Context Menu Modal */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 bg-[#0e0c0b] border border-stone-800/80 rounded-xl shadow-2xl py-2 min-w-[180px] backdrop-blur-md font-vazirmatn text-right"
        >
          <button
            onClick={() => {
              setQuickEditProduct(contextMenu.product);
              setIsDrawerOpen(true);
            }}
            className="w-full text-right px-4 py-2 text-xs hover:bg-stone-900 text-stone-300 flex items-center gap-2 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 text-amber-500" />
            ویرایش سریع محصول
          </button>

          <Link
            href={`/dashboard/products/${contextMenu.product.id}`}
            className="w-full text-right px-4 py-2 text-xs hover:bg-stone-900 text-stone-300 flex items-center gap-2"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
            ویرایش پیشرفته (۱۱ تب)
          </Link>

          <button
            onClick={() => {
              const path = contextMenu.product.slug ? `/products/${contextMenu.product.slug}` : `/product/${contextMenu.product.id}`;
              window.open(path, '_blank');
            }}
            className="w-full text-right px-4 py-2 text-xs hover:bg-stone-900 text-stone-300 flex items-center gap-2 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-500" />
            مشاهده در فروشگاه شیخ
          </button>

          <hr className="border-stone-800/60 my-1" />

          <button
            onClick={() => handleDeleteSingle(contextMenu.product.id)}
            className="w-full text-right px-4 py-2 text-xs hover:bg-stone-900 text-red-400 flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            حذف کامل کالا
          </button>
        </div>
      )}

      {/* 9. Preview Dialog Overlay */}
      <AnimatePresence>
        {previewProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewProduct(null)}
              className="fixed inset-0 bg-black z-50"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0c0908] border border-stone-800 p-6 rounded-2xl w-full max-w-lg z-[60] text-right shadow-2xl font-vazirmatn"
            >
              <div className="flex justify-between items-center border-b border-stone-800 pb-3 mb-4">
                <button onClick={() => setPreviewProduct(null)} className="p-1 text-stone-400 hover:text-stone-200">
                  <X className="w-4 h-4" />
                </button>
                <h4 className="text-sm font-bold text-stone-100">پیش‌نمایش محصول لوکس</h4>
              </div>

              <div className="space-y-4">
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-stone-800 bg-stone-900">
                  <Image
                    src={previewProduct.images?.[0]?.image || '/assets/noImage.jpg'}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-amber-500 font-bold block">{getCategoryTitle(previewProduct.category)}</span>
                  <h3 className="text-base font-extrabold text-stone-100">{previewProduct.name}</h3>
                  <p className="text-xs text-stone-400 leading-relaxed">{previewProduct.description || 'توضیحاتی برای این کالا ثبت نشده است.'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-stone-900/50 p-4 rounded-xl border border-stone-800 text-xs">
                  <div>
                    <span className="text-stone-500 block">برند کالا:</span>
                    <span className="text-stone-200 font-bold">{previewProduct.brand || '-'}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">شناسه کالا:</span>
                    <span className="text-stone-200 font-mono">{previewProduct.sku || '-'}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">قیمت کالا:</span>
                    <span className="text-amber-400 font-extrabold">{formatToToman(previewProduct.basePrice)}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">موجودی انبار:</span>
                    <span className="text-stone-200 font-bold">{toPersianDigits(previewProduct.quantity)} عدد</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 10. Analytics Dialog Overlay */}
      <AnimatePresence>
        {activeAnalyticsProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveAnalyticsProduct(null)}
              className="fixed inset-0 bg-black z-50"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0c0908] border border-stone-800 p-6 rounded-2xl w-full max-w-md z-[60] text-right shadow-2xl font-vazirmatn"
            >
              <div className="flex justify-between items-center border-b border-stone-800 pb-3 mb-4">
                <button onClick={() => setActiveAnalyticsProduct(null)} className="p-1 text-stone-400 hover:text-stone-200">
                  <X className="w-4 h-4" />
                </button>
                <h4 className="text-sm font-bold text-stone-100">آمار و عملکرد تفصیلی کالا</h4>
              </div>

              <div className="space-y-4">
                <span className="text-xs text-stone-400 block mb-2">محصول: {activeAnalyticsProduct.name}</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-stone-900 border border-stone-800 p-3 rounded-xl text-center">
                    <span className="text-[10px] text-stone-500 block">کل بازدید کالا</span>
                    <span className="text-base font-bold text-stone-200 font-mono mt-1 block">{toPersianDigits(activeAnalyticsProduct.views)}</span>
                  </div>
                  <div className="bg-stone-900 border border-stone-800 p-3 rounded-xl text-center">
                    <span className="text-[10px] text-stone-500 block">فروش نهایی</span>
                    <span className="text-base font-bold text-amber-500 font-mono mt-1 block">{toPersianDigits(activeAnalyticsProduct.sales)}</span>
                  </div>
                  <div className="bg-stone-900 border border-stone-800 p-3 rounded-xl text-center">
                    <span className="text-[10px] text-stone-500 block">نرخ تبدیل</span>
                    <span className="text-base font-bold text-emerald-400 font-mono mt-1 block">
                      {toPersianDigits(((activeAnalyticsProduct.sales / activeAnalyticsProduct.views) * 100).toFixed(1))}%
                    </span>
                  </div>
                </div>

                <div className="bg-stone-900/40 border border-stone-800 p-4 rounded-xl space-y-2 text-xs">
                  <span className="font-bold text-stone-300 block mb-1">گزارش هوش تجاری (BI)</span>
                  <p className="text-stone-400 leading-relaxed text-[11px]">
                    بر اساس روندهای فعلی، این محصول دارای کشش قیمتی بالا بوده و نشان‌های لوکس فعال به شدت بازخورد خرید بهتری از سمت مشتریان لوکس پسند ایجاد کرده‌اند.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 11. Reviews Dialog Overlay */}
      <AnimatePresence>
        {activeReviewsProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveReviewsProduct(null)}
              className="fixed inset-0 bg-black z-50"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0c0908] border border-stone-800 p-6 rounded-2xl w-full max-w-md z-[60] text-right shadow-2xl font-vazirmatn"
            >
              <div className="flex justify-between items-center border-b border-stone-800 pb-3 mb-4">
                <button onClick={() => setActiveReviewsProduct(null)} className="p-1 text-stone-400 hover:text-stone-200">
                  <X className="w-4 h-4" />
                </button>
                <h4 className="text-sm font-bold text-stone-100">نظرات و ریتینگ‌های خریداران</h4>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center bg-stone-900 p-3 rounded-xl border border-stone-800">
                  <span className="text-xs text-stone-300">میانگین امتیاز محصول</span>
                  <div className="flex items-center gap-1">
                    <span className="text-base font-bold text-amber-400 font-mono">{toPersianDigits(activeReviewsProduct.rating)}</span>
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                </div>

                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {/* Virtual/Mock standard review render */}
                  <div className="bg-stone-900/40 p-3 rounded-xl border border-stone-800/60 text-xs space-y-1">
                    <div className="flex justify-between text-stone-400">
                      <span>خریدار لوکس پسند</span>
                      <span className="font-mono">{toPersianDigits(5)} ستاره</span>
                    </div>
                    <p className="text-stone-300 leading-relaxed">کیفیت عسل و بسته‌بندی آن بسیار عالی و در شأن هدیه دادن بود.</p>
                  </div>
                  <div className="bg-stone-900/40 p-3 rounded-xl border border-stone-800/60 text-xs space-y-1">
                    <div className="flex justify-between text-stone-400">
                      <span>مدیر ارشد خرید</span>
                      <span className="font-mono">{toPersianDigits(4)} ستاره</span>
                    </div>
                    <p className="text-stone-300 leading-relaxed">سرعت ارسال و برخورد کادر پشتیبانی شیخ فوق‌العاده بود.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 12. SEO Overview Dialog Overlay */}
      <AnimatePresence>
        {activeSeoProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSeoProduct(null)}
              className="fixed inset-0 bg-black z-50"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0c0908] border border-stone-800 p-6 rounded-2xl w-full max-w-md z-[60] text-right shadow-2xl font-vazirmatn"
            >
              <div className="flex justify-between items-center border-b border-stone-800 pb-3 mb-4">
                <button onClick={() => setActiveSeoProduct(null)} className="p-1 text-stone-400 hover:text-stone-200">
                  <X className="w-4 h-4" />
                </button>
                <h4 className="text-sm font-bold text-stone-100">سئو فنی و تگ‌های متای گوگل</h4>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-stone-900 border border-stone-800 p-3.5 rounded-xl space-y-2">
                  <div>
                    <span className="text-stone-500 block text-[10px]">آدرس سئو فرندلی (Slug):</span>
                    <code className="text-amber-500 text-xs font-mono block">{activeSeoProduct.slug || 'ندارد'}</code>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">عنوان سئو (Meta Title):</span>
                    <span className="text-stone-200 font-bold block">{activeSeoProduct.seoTitle || activeSeoProduct.name}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">توضیحات سئو (Meta Description):</span>
                    <span className="text-stone-400 leading-relaxed block text-[11px]">{activeSeoProduct.seoDescription || activeSeoProduct.description || 'ندارد'}</span>
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl flex items-start gap-2.5 text-stone-400 leading-relaxed text-[11px]">
                  <Globe className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>این تگ‌ها به صورت کاملاً خودکار در نقشه‌های سایت (Sitemap.xml) و تگ‌های ساختار یافته JSON-LD گوگل تزریق شده و برای خزنده‌ها بهینه‌سازی شده‌اند.</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 13. Bulk Operations Modal Confirm Drawer */}
      <AnimatePresence>
        {showBulkConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBulkConfirm(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0c0908] border border-stone-800 p-6 rounded-2xl w-full max-w-md z-50 text-right shadow-2xl"
            >
              <h3 className="text-base font-bold text-stone-100 mb-2 font-vazirmatn">تایید عملیات گروهی</h3>
              <p className="text-xs text-stone-400 leading-relaxed mb-4">
                آیا مایل به اعمال عملیات گروهی بر روی {toPersianDigits(selectedCount)} محصول انتخاب شده هستید؟
              </p>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleBulkSubmit}
                  disabled={isBulkLoading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                >
                  {isBulkLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'تایید و اعمال'}
                </button>
                <button
                  onClick={() => {
                    setShowBulkConfirm(false);
                    setBulkAction('');
                  }}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
