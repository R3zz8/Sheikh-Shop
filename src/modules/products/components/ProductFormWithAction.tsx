'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Product, ProductUnit, Review } from '@prisma/client';
import { ProductCategory, ProductStatus, ProductCategoryType } from '@prisma/client';
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
import {
  Settings,
  DollarSign,
  Package,
  Image as ImageIcon,
  Film,
  Search,
  FileText,
  Truck,
  MessageSquare,
  Cpu,
  AlertTriangle,
  Save,
  Undo,
  Sparkles,
  Plus,
  Trash2,
  X,
  Check,
  CheckCircle,
  Eye,
  Star,
  Lock,
  ThumbsUp,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useUser } from '@/hooks/useUser';
import UploadImage from './UploadImage';
import { upsertProduct as serverUpsertProduct } from '../actions';

interface ProductFormProps {
  product: Product | null;
}

interface ProductUnitForm {
  id?: string;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
}

interface ReviewWithProduct extends Review {
  product: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function ProductFormWithAction({ product }: ProductFormProps) {
  const router = useRouter();
  const isNewProduct = !product?.id;
  const { data: user } = useUser();

  // Generate high-quality client ID for new products
  const [generatedId] = useState(() => crypto.randomUUID());
  const activeProductId = product?.id || generatedId;

  // Track currently uploaded/managed images for authoritative save syncing
  const [currentImages, setCurrentImages] = useState<any[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const handleImagesChange = (images: any[]) => {
    setCurrentImages(images);
    setImagesLoaded(true);
  };

  // Active Tab State
  const [activeTab, setActiveTab] = useState<string>('general');

  // Units (Variants) state
  const [productUnits, setProductUnits] = useState<ProductUnitForm[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewReply, setReviewReply] = useState<Record<string, string>>({});

  // Categories & Units selection state (loaded from global config)
  const [units, setUnits] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Options & Variants States
  const [globalAttributesList, setGlobalAttributesList] = useState<any[]>([]);
  const [assignedAttributes, setAssignedAttributes] = useState<any[]>([]);
  const [variantMatrix, setVariantMatrix] = useState<any[]>([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [selectedAttributeToAdd, setSelectedAttributeToAdd] = useState<string>('');

  // Custom Attribute Value forms
  const [newValueInput, setNewValueInput] = useState<Record<string, { value: string; unit: string; hex: string }>>({});

  // Submitting state
  const [isSaving, setIsSaving] = useState(false);

  // Extract initial discount if it exists
  const initialDiscount = (product as any)?.discounts?.[0];

  // React Hook Form for full product control
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { isDirty, errors },
  } = useForm({
    defaultValues: {
      name: product?.name || '',
      category: product?.category || ProductCategory.OTHERS,
      categoryType: product?.categoryType || ProductCategoryType.SheikhFood,
      description: product?.description || '',
      basePrice: product?.basePrice || 0,
      baseUnitId: product?.baseUnitId || '',
      quantity: product?.quantity || 0,
      inventoryStatus: (product as any)?.inventoryStatus || 'AVAILABLE',
      lowStockThreshold: (product as any)?.lowStockThreshold || 3,
      allowBackInStockNotification: (product as any)?.allowBackInStockNotification ?? true,
      requiresOrderConfirmation: (product as any)?.requiresOrderConfirmation ?? false,
      status: product?.status || ProductStatus.ACTIVE,
      isNew: product?.isNew ?? false,
      isBestSeller: product?.isBestSeller ?? false,
      isAmazing: product?.isAmazing ?? false,
      slug: product?.slug || '',
      seoTitle: product?.seoTitle || '',
      seoDescription: product?.seoDescription || '',
      h1Override: product?.h1Override || '',
      excerpt: product?.excerpt || '',
      ogTitle: product?.ogTitle || '',
      ogDescription: product?.ogDescription || '',
      ogImage: product?.ogImage || '',
      canonicalUrl: product?.canonicalUrl || '',
      metaKeywords: product?.metaKeywords?.join(', ') || '',
      schemaMarkup: product?.schemaMarkup ? JSON.stringify(product.schemaMarkup, null, 2) : '',
      brand: product?.brand || '',
      sku: product?.sku || '',
      features: product?.features?.join('\n') || '',
      tags: product?.tags?.join(', ') || '',
      materials: product?.materials?.join(', ') || '',
      warranty: product?.warranty || '',
      origin: product?.origin || '',
      color: product?.color || '',
      scent: product?.scent || '',
      flavor: product?.flavor || '',
      weight: product?.weight || '',
      weightUnit: product?.weightUnit || 'kg',
      dimensions: product?.dimensions ? JSON.stringify(product.dimensions, null, 2) : '',
      technicalSpecs: product?.technicalSpecs ? JSON.stringify(product.technicalSpecs, null, 2) : '',
      shippingCost: product?.shippingCost || '',
      shippingMode: product?.shippingMode || '',
      shippingDescription: product?.shippingDescription || '',
      allowFreeShipping: product?.allowFreeShipping ?? false,
      shippingPriority: product?.shippingPriority || 'Normal',
      // Discount Fields
      discountType: initialDiscount?.discountType || 'NONE',
      discountValue: initialDiscount?.value || 0,
      discountStartDate: initialDiscount?.startDate ? new Date(initialDiscount.startDate).toISOString().split('T')[0] : '',
      discountEndDate: initialDiscount?.endDate ? new Date(initialDiscount.endDate).toISOString().split('T')[0] : '',
      discountActive: initialDiscount?.isActive ?? true,
    }
  });

  // Watch fields
  const watchDiscountType = watch('discountType') || 'NONE';

  // Warn on unsaved changes before page leave
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Load Categories & Units
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const unitsRes = await fetch('/api/units');
        if (unitsRes.ok) {
          const unitsData = await unitsRes.json();
          if (unitsData.success) setUnits(unitsData.data);
        }
        const catRes = await fetch('/api/categories');
        if (catRes.ok) {
          const catData = await catRes.json();
          if (catData.success) setCategories(catData.data);
        }
      } catch (err) {
        console.error('Error fetching categories/units:', err);
      }
    };
    fetchInitialData();
  }, []);

  // Set initial base unit value if editing
  useEffect(() => {
    if (product?.baseUnitId) {
      setValue('baseUnitId', product.baseUnitId);
    }
  }, [product, setValue]);

  // Hydrate global attributes library, product's assigned attributes and variants on mount
  useEffect(() => {
    const loadAttributesAndHydrate = async () => {
      // 1. Fetch all global attribute definitions from the library
      try {
        const res = await fetch('/api/admin/attributes');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setGlobalAttributesList(data.data);
          }
        }
      } catch (err) {
        console.error('Failed to load global attributes library:', err);
      }

      // 2. Hydrate from existing product if applicable
      if (product && !isNewProduct) {
        // Hydrate assigned attributes
        const prodAttrs = (product as any).productAttributes || [];
        if (prodAttrs.length > 0) {
          const hydratedAssigned = prodAttrs.map((pa: any) => ({
            id: pa.attribute.id,
            name: pa.attribute.name,
            displayName: pa.attribute.displayName,
            type: pa.attribute.type,
            values: pa.attribute.values || []
          }));
          setAssignedAttributes(hydratedAssigned);
        }

        // Hydrate variants matrix
        const prodUnits = (product as any).units || [];
        // Only hydrate units that actually represent variant combinations (have values associated)
        const hasVariants = prodUnits.some((u: any) => u.values && u.values.length > 0);
        if (hasVariants) {
          const hydratedMatrix = prodUnits.map((u: any) => {
            const combination: Record<string, string> = {};
            if (u.values && Array.isArray(u.values)) {
              u.values.forEach((v: any) => {
                if (v.attributeValue?.attributeId) {
                  combination[v.attributeValue.attributeId] = v.attributeValueId;
                }
              });
            }
            return {
              id: u.id,
              name: u.name,
              price: String(u.price),
              oldPrice: u.oldPrice ? String(u.oldPrice) : '',
              sku: u.sku || '',
              stock: String(u.stock),
              isActive: u.isActive,
              combination
            };
          });
          setVariantMatrix(hydratedMatrix);
        }
      }
    };

    loadAttributesAndHydrate();
  }, [product, isNewProduct]);

  // Load product units (variants)
  const loadProductUnits = async () => {
    if (isNewProduct) return;
    setLoadingUnits(true);
    try {
      const response = await fetch(`/api/dashboard/products/${product.id}/units`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProductUnits(result.data.map((u: any) => ({
            id: u.id,
            name: u.name,
            price: Number(u.price),
            stock: u.stock,
            isActive: u.isActive
          })));
        }
      }
    } catch (err) {
      console.error('Failed to load product units:', err);
    } finally {
      setLoadingUnits(false);
    }
  };

  useEffect(() => {
    loadProductUnits();
  }, [product?.id]);

  // Load reviews when review tab is open
  const loadReviews = async () => {
    if (isNewProduct) return;
    setLoadingReviews(true);
    try {
      const res = await fetch(`/api/reviews/admin?productId=${product.id}&limit=100`);
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setReviews(result.data);
          // Set initial reply state
          const replies: Record<string, string> = {};
          result.data.forEach((r: any) => {
            if (r.reply) replies[r.id] = r.reply;
          });
          setReviewReply(replies);
        }
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reviews') {
      loadReviews();
    }
  }, [activeTab, product?.id]);

  // Tab List metadata
  const tabsList = [
    { id: 'general', label: 'عمومی (General)', icon: Settings },
    { id: 'pricing', label: 'قیمت‌گذاری و تخفیف', icon: DollarSign },
    { id: 'inventory', label: 'موجودی و تنوع (Inventory)', icon: Package },
    { id: 'variants', label: 'ویژگی‌ها و تنوع (Options & Variants)', icon: Sliders },
    { id: 'media', label: 'تصاویر (Media Gallery)', icon: ImageIcon },
    { id: 'videos', label: 'ویدیوها (Video Gallery)', icon: Film },
    { id: 'seo', label: 'سئو و گوگل (SEO Panel)', icon: Search },
    { id: 'specifications', label: 'مشخصات فنی (Specifications)', icon: FileText },
    { id: 'shipping', label: 'حمل و نقل (Shipping)', icon: Truck },
    { id: 'reviews', label: 'نظرات خریداران (Reviews)', icon: MessageSquare },
    { id: 'ai', label: 'هوش مصنوعی (AI Assistant)', icon: Cpu },
    { id: 'danger', label: 'بخش حساس (Danger Zone)', icon: AlertTriangle },
  ];

  // Form Submit handler
  const onSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('id', activeProductId);

      // Core parameters
      formData.append('name', data.name);
      formData.append('category', data.category);
      formData.append('categoryType', data.categoryType);
      formData.append('description', data.description || '');
      formData.append('price', data.basePrice.toString());
      formData.append('baseUnitId', data.baseUnitId || '');
      formData.append('quantity', data.quantity.toString());
      formData.append('inventoryStatus', data.inventoryStatus || 'AVAILABLE');
      formData.append('lowStockThreshold', (data.lowStockThreshold || 3).toString());
      formData.append('allowBackInStockNotification', data.allowBackInStockNotification ? 'true' : 'false');
      formData.append('requiresOrderConfirmation', data.requiresOrderConfirmation ? 'true' : 'false');
      formData.append('status', data.status);

      // Badges
      formData.append('isNew', data.isNew ? 'true' : 'false');
      formData.append('isBestSeller', data.isBestSeller ? 'true' : 'false');
      formData.append('isAmazing', data.isAmazing ? 'true' : 'false');

      // SEO
      if (data.slug) formData.append('slug', data.slug);
      if (data.seoTitle) formData.append('seoTitle', data.seoTitle);
      if (data.seoDescription) formData.append('seoDescription', data.seoDescription);
      if (data.h1Override) formData.append('h1Override', data.h1Override);
      if (data.excerpt) formData.append('excerpt', data.excerpt);
      if (data.ogTitle) formData.append('ogTitle', data.ogTitle);
      if (data.ogDescription) formData.append('ogDescription', data.ogDescription);
      if (data.ogImage) formData.append('ogImage', data.ogImage);
      if (data.canonicalUrl) formData.append('canonicalUrl', data.canonicalUrl);
      if (data.metaKeywords) formData.append('metaKeywords', data.metaKeywords);

      if (data.schemaMarkup) {
        try {
          JSON.parse(data.schemaMarkup); // validate
          formData.append('schemaMarkup', data.schemaMarkup);
        } catch {
          toast.error('ساختار Structured Data نامعتبر است.');
          setIsSaving(false);
          return;
        }
      }

      // Specs & E-Commerce fields
      if (data.brand) formData.append('brand', data.brand);
      if (data.sku) formData.append('sku', data.sku);
      if (data.origin) formData.append('origin', data.origin);
      if (data.color) formData.append('color', data.color);
      if (data.scent) formData.append('scent', data.scent);
      if (data.flavor) formData.append('flavor', data.flavor);
      if (data.warranty) formData.append('warranty', data.warranty);
      if (data.weight) formData.append('weight', data.weight.toString());
      if (data.weightUnit) formData.append('weightUnit', data.weightUnit);

      // Arrays (split line by line or commas)
      const featuresArr = data.features ? data.features.split('\n').filter((f: string) => f.trim()) : [];
      formData.append('features', JSON.stringify(featuresArr));

      const tagsArr = data.tags ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
      formData.append('tags', JSON.stringify(tagsArr));

      const materialsArr = data.materials ? data.materials.split(',').map((m: string) => m.trim()).filter(Boolean) : [];
      formData.append('materials', JSON.stringify(materialsArr));

      // JSON Specification Validation
      if (data.dimensions) {
        try {
          JSON.parse(data.dimensions);
          formData.append('dimensions', data.dimensions);
        } catch {
          toast.error('ابعاد کالا باید یک JSON معتبر باشد.');
          setIsSaving(false);
          return;
        }
      }
      if (data.technicalSpecs) {
        try {
          JSON.parse(data.technicalSpecs);
          formData.append('technicalSpecs', data.technicalSpecs);
        } catch {
          toast.error('مشخصات فنی کالا باید یک JSON معتبر باشد.');
          setIsSaving(false);
          return;
        }
      }

      // Shipping Configurations (Enforced superadmin role in action)
      if (data.shippingCost !== '') formData.append('shippingCost', data.shippingCost.toString());
      if (data.shippingMode) formData.append('shippingMode', data.shippingMode);
      if (data.shippingDescription) formData.append('shippingDescription', data.shippingDescription);
      formData.append('allowFreeShipping', data.allowFreeShipping ? 'true' : 'false');
      if (data.shippingPriority) formData.append('shippingPriority', data.shippingPriority);

      // Discount configurations
      formData.append('discountType', data.discountType);
      formData.append('discountValue', (data.discountValue || 0).toString());
      formData.append('discountStartDate', data.discountStartDate || '');
      formData.append('discountEndDate', data.discountEndDate || '');
      formData.append('discountActive', data.discountActive ? 'true' : 'false');

      // Authoritative Product Image Sync Strategy - serialize currently uploaded/managed images ONLY if explicitly loaded/managed by UI
      if (imagesLoaded) {
        formData.append('imagesJson', JSON.stringify(currentImages));
      }

      // Trigger server action
      const result = await serverUpsertProduct({ data: product, error: null }, formData);

      if (result.error) {
        toast.error(result.error.general || 'خطا در ثبت اطلاعات کالا.');
        setIsSaving(false);
        return;
      }

      const savedProduct = result.data;
      if (savedProduct) {
        // 1. Save assigned attributes
        const attrPayload = { attributeIds: assignedAttributes.map(a => a.id) };
        await fetch(`/api/dashboard/products/${savedProduct.id}/attributes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(attrPayload)
        });

        // 2. Save generated variants matrix
        const variantPayload = {
          variants: variantMatrix.map(v => ({
            id: v.id,
            name: v.name,
            price: Number(v.price),
            oldPrice: v.oldPrice ? Number(v.oldPrice) : null,
            sku: v.sku || null,
            stock: Number(v.stock),
            isActive: v.isActive !== false,
            attributeValueIds: v.attributeValueIds,
          }))
        };
        await fetch(`/api/dashboard/products/${savedProduct.id}/variants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(variantPayload)
        });

        // 3. Save Units/Variants (Legacy fallback)
        await saveAllUnits(savedProduct.id);
        toast.success(isNewProduct ? 'کالا با موفقیت ایجاد شد!' : 'کالا با موفقیت بروزرسانی شد!');

        if (isNewProduct) {
          router.push(`/dashboard/products/${savedProduct.id}`);
        } else {
          router.refresh();
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'خطایی در ارسال اطلاعات رخ داد.');
    } finally {
      setIsSaving(false);
    }
  };

  // Options & Variants Helper Methods
  const handleAddAttribute = async (attrIdOrName: string) => {
    if (!attrIdOrName) return;

    // Check if already assigned
    const alreadyAssigned = assignedAttributes.some(a => a.id === attrIdOrName || a.name === attrIdOrName);
    if (alreadyAssigned) {
      toast.error('این ویژگی قبلاً به کالا افزوده شده است.');
      return;
    }

    // Try finding in global library
    const found = globalAttributesList.find(a => a.id === attrIdOrName || a.name === attrIdOrName);
    if (found) {
      setAssignedAttributes([...assignedAttributes, { ...found, values: [] }]);
      toast.success(`ویژگی ${found.displayName} با موفقیت به کالا تخصیص یافت.`);
    } else {
      // Create a new attribute dynamically
      const displayName = attrIdOrName;
      const name = attrIdOrName.toLowerCase().replace(/\s+/g, '-');
      try {
        const res = await fetch('/api/admin/attributes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, displayName, type: 'SELECT', values: [] }),
        });
        if (res.ok) {
          const result = await res.json();
          if (result.success) {
            setGlobalAttributesList([...globalAttributesList, result.data]);
            setAssignedAttributes([...assignedAttributes, { ...result.data, values: [] }]);
            toast.success(`ویژگی سفارشی جدید "${displayName}" ایجاد و به کالا افزوده شد.`);
          }
        }
      } catch {
        toast.error('خطا در ایجاد ویژگی سفارشی.');
      }
    }
    setSelectedAttributeToAdd('');
  };

  const handleRemoveAttribute = (attrId: string) => {
    setAssignedAttributes(assignedAttributes.filter(a => a.id !== attrId));
    toast.success('ویژگی با موفقیت از کالا برداشته شد.');
  };

  const handleAddValueToAttribute = (attrId: string) => {
    const input = newValueInput[attrId];
    if (!input || !input.value.trim()) {
      toast.error('لطفاً مقداری برای ویژگی وارد کنید.');
      return;
    }

    const attrIndex = assignedAttributes.findIndex(a => a.id === attrId);
    if (attrIndex === -1) return;

    const currentValues = assignedAttributes[attrIndex].values || [];

    // Check if value already exists
    const duplicate = currentValues.some((v: any) => v.value === input.value.trim() && v.unit === (input.unit || null));
    if (duplicate) {
      toast.error('این مقدار قبلاً وارد شده است.');
      return;
    }

    const newValue = {
      id: `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      attributeId: attrId,
      value: input.value.trim(),
      unit: input.unit || null,
      hex: input.hex || null,
      displayName: input.value.trim() + (input.unit ? ` ${input.unit}` : ''),
    };

    const updated = [...assignedAttributes];
    updated[attrIndex] = {
      ...updated[attrIndex],
      values: [...currentValues, newValue],
    };

    setAssignedAttributes(updated);

    // Clear inputs
    setNewValueInput({
      ...newValueInput,
      [attrId]: { value: '', unit: '', hex: '#000000' },
    });
    toast.success('مقدار جدید افزوده شد.');
  };

  const handleRemoveValueFromAttribute = (attrId: string, valId: string) => {
    const attrIndex = assignedAttributes.findIndex(a => a.id === attrId);
    if (attrIndex === -1) return;

    const updated = [...assignedAttributes];
    updated[attrIndex] = {
      ...updated[attrIndex],
      values: updated[attrIndex].values.filter((v: any) => v.id !== valId),
    };

    setAssignedAttributes(updated);
    toast.success('مقدار با موفقیت حذف گردید.');
  };

  const generateCombinationVariants = () => {
    const attributesWithValues = assignedAttributes.map(attr => ({
      attributeId: attr.id,
      displayName: attr.displayName,
      values: attr.values || [],
    })).filter(attr => attr.values.length > 0);

    if (attributesWithValues.length === 0) {
      toast.error('لطفاً ابتدا حداقل یک ویژگی با چند مقدار معتبر اضافه کنید.');
      return;
    }

    const cartesian = (arrays: any[][]): any[][] => {
      return arrays.reduce((acc, curr) => {
        return acc.flatMap(d => curr.map(e => [...d, e]));
      }, [[]]);
    };

    const valueArrays = attributesWithValues.map(attr => attr.values);
    const combinations = cartesian(valueArrays);

    const basePrice = Number(getValues('basePrice')) || 0;
    const parentSku = getValues('sku') || '';

    const newVariants = combinations.map((combo, idx) => {
      const attributeValueIds = combo.map((v: any) => v.id);

      const existing = variantMatrix.find(v => {
        if (!v.attributeValueIds) return false;
        return v.attributeValueIds.length === attributeValueIds.length &&
          v.attributeValueIds.every((id: string) => attributeValueIds.includes(id));
      });

      if (existing) {
        return existing;
      }

      const name = combo.map((v: any) => v.displayName || v.value).join(' / ');
      const skuSuffix = combo.map((v: any) => String(v.value).substring(0, 3).toUpperCase()).join('-');
      const sku = parentSku ? `${parentSku}-${skuSuffix}` : `VAR-${idx + 1}`;

      return {
        name,
        price: basePrice,
        oldPrice: null,
        sku,
        stock: 10,
        isActive: true,
        attributeValueIds,
        attributeValues: combo,
      };
    });

    setVariantMatrix(newVariants);
    toast.success(`${newVariants.length} ردیف تنوع با موفقیت تولید شد. برای نهایی‌سازی باید فرم را ذخیره کنید.`);
  };

  const updateVariantMatrixField = (index: number, field: string, value: any) => {
    const updated = [...variantMatrix];
    updated[index] = { ...updated[index], [field]: value };
    setVariantMatrix(updated);
  };

  const handleRemoveVariant = (index: number) => {
    setVariantMatrix(variantMatrix.filter((_, i) => i !== index));
    toast.success('ردیف تنوع برداشته شد.');
  };

  // Unit / Variant Management Methods
  const addUnit = () => {
    setProductUnits([...productUnits, {
      name: '',
      price: 0,
      stock: 0,
      isActive: true,
    }]);
    toast.success('یک ردیف تنوع جدید به کالا افزوده شد.');
  };

  const removeUnit = async (index: number, unitId?: string) => {
    if (unitId && product?.id) {
      if (!confirm('آیا مطمئن هستید که می‌خواهید این تنوع را حذف کنید؟ این تغییر بلافاصله ذخیره می‌شود.')) return;
      try {
        const res = await fetch(`/api/dashboard/products/${product.id}/units/${unitId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          toast.success('تنوع با موفقیت از سیستم حذف گردید.');
          setProductUnits(productUnits.filter((_, i) => i !== index));
        } else {
          toast.error('خطا در حذف تنوع کالا.');
        }
      } catch {
        toast.error('ارتباط با سرور برقرار نشد.');
      }
    } else {
      setProductUnits(productUnits.filter((_, i) => i !== index));
    }
  };

  const updateUnitField = (index: number, field: keyof ProductUnitForm, value: any) => {
    const updated = [...productUnits];
    updated[index] = { ...updated[index], [field]: value } as ProductUnitForm;
    setProductUnits(updated);
  };

  const saveAllUnits = async (prodId: string) => {
    try {
      for (const unit of productUnits) {
        const payload = {
          name: unit.name,
          price: Number(unit.price),
          stock: Number(unit.stock),
          isActive: unit.isActive
        };

        if (unit.id) {
          await fetch(`/api/dashboard/products/${prodId}/units/${unit.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          await fetch(`/api/dashboard/products/${prodId}/units`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
      }
    } catch (err) {
      console.error('Failed saving units:', err);
    }
  };

  // Review management handlers
  const handleModerateReview = async (reviewId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const replyText = reviewReply[reviewId] || '';
      const res = await fetch('/api/reviews/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, status, reply: replyText })
      });
      if (res.ok) {
        toast.success('دیدگاه با موفقیت مدیریت و بروزرسانی شد.');
        loadReviews();
      } else {
        toast.error('خطا در مدیریت دیدگاه.');
      }
    } catch {
      toast.error('ارتباط با سرور برقرار نشد.');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('آیا از حذف دائم این دیدگاه اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/reviews/admin?reviewId=${reviewId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('دیدگاه به طور کامل حذف شد.');
        setReviews(reviews.filter(r => r.id !== reviewId));
      } else {
        toast.error('خطا در حذف دیدگاه.');
      }
    } catch {
      toast.error('ارتباط با سرور برقرار نشد.');
    }
  };

  // Watch current SEO lengths
  const watchSeoTitle = watch('seoTitle') || '';
  const watchSeoDesc = watch('seoDescription') || '';
  const watchSlug = watch('slug') || '';
  const watchName = watch('name') || '';

  // Calculate rating stats
  const avgRating = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0';
  const pendingReviewsCount = reviews.filter(r => r.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#050201] text-stone-100 font-vazirmatn pb-24" dir="rtl">
      {/* Dynamic Navigation Top-Bar (Sticky) */}
      <div className="sticky top-0 z-40 bg-[#050201]/95 backdrop-blur-md border-b border-amber-500/15 py-4 px-6 md:px-12 flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-amber-300 via-amber-100 to-amber-500 bg-clip-text text-transparent flex items-center gap-2">
            <span>✨ پنل مدیریت پیشرفته محصول شیخ شاپ</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">مدیریت کامل فیلدها، گالری تصاویر، ویدیوها، سئو، ابعاد، تخفیف‌ها و نظرات خریداران کالا</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Safe/Auto-save indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-stone-400 bg-stone-900/60 px-3 py-1.5 rounded-xl border border-stone-850">
            {isDirty ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                <span className="text-[10px] text-amber-400 font-bold">دارای تغییرات ذخیره‌نشده</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span className="text-[10px] text-green-400 font-bold">تمامی تغییرات ذخیره شدند</span>
              </>
            )}
          </div>

          <Button variant="outline" className="border-stone-800 text-stone-400 hover:text-stone-200 text-xs rounded-xl" asChild>
            <Link href="/dashboard/products">بازگشت به لیست</Link>
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/15 flex items-center gap-1.5"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isNewProduct ? 'ثبت و ساخت محصول' : 'ذخیره کل تغییرات کالا'}</span>
          </Button>
        </div>
      </div>

      {/* Validation Error Summary Card */}
      {Object.keys(errors).length > 0 && (
        <div className="mx-6 md:mx-12 mt-6 bg-red-500/10 border-2 border-red-500/30 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h4 className="text-xs md:text-sm font-black">خطاهای اعتبارسنجی فرم کالا ({Object.keys(errors).length} مورد)</h4>
          </div>
          <ul className="list-disc list-inside text-[11px] text-stone-300 space-y-1 pr-2">
            {Object.entries(errors).map(([key, err]: any) => (
              <li key={key}>
                <strong>{key}:</strong> {err?.message || 'مقدار معتبر نیست'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Unsaved Changes Floating Banner */}
      {isDirty && (
        <div className="mx-6 md:mx-12 mt-6 bg-amber-500/10 border-2 border-amber-500/30 p-4 rounded-2xl flex items-center justify-between text-amber-200 animate-pulse">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-xs md:text-sm font-bold">شما تغییرات ذخیره‌نشده دارید. لطفاً تغییرات را ذخیره کنید تا از بین نروند.</span>
          </div>
          <Button
            onClick={handleSubmit(onSubmit)}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black px-4 py-2 rounded-xl shrink-0"
          >
            ذخیره آنی کالا
          </Button>
        </div>
      )}

      {/* Main Workspace Layout Grid */}
      <div className="px-6 md:px-12 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN: Vertical Sticky Navigation Tabs Panel */}
        <div className="lg:col-span-3 sticky top-24 z-30 space-y-4">
          <Card className="bg-[#0D0907]/90 border border-amber-500/15 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-lg">
            <CardHeader className="p-5 border-b border-stone-900 bg-stone-950/40">
              <CardTitle className="text-sm font-black text-stone-300">منوی ناوبری تنظیمات کالا</CardTitle>
              <CardDescription className="text-[10px] text-stone-500">انتخاب زبانه مورد نظر جهت پیکربندی</CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <nav className="space-y-1.5">
                {tabsList.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between py-3 px-4 rounded-2xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                          : 'text-stone-400 hover:text-stone-200 hover:bg-stone-950/60'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4.5 h-4.5 shrink-0" />
                        <span>{tab.label}</span>
                      </span>
                      {isActive && <ChevronLeft className="w-4 h-4 shrink-0" />}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* MIDDLE COLUMN: Primary Dynamic Tab Content Card */}
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* 1. GENERAL TAB */}
            {activeTab === 'general' && (
              <Card className="bg-[#0D0907]/90 border border-amber-500/15 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
                <CardHeader className="p-0 pb-6 mb-6 border-b border-amber-500/15">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-black text-stone-100">بخش اول: تنظیمات عمومی محصول</CardTitle>
                      <CardDescription className="text-[11px] text-stone-400">شناسه پایه کالا, توضیحات معرفی و برچسب‌های مدیریتی لوکس</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-stone-300">نام کامل محصول *</Label>
                    <Input
                      {...register('name')}
                      placeholder="مثال: عسل کوهستان ۵۰۰ گرمی سبلان"
                      className="bg-stone-950/80 border-stone-800 text-stone-200 focus:border-amber-500/40 focus:ring-amber-500/40 h-12 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-stone-300">توضیحات معرفی و ویژگی‌های کالا (HTML / Markdown)</Label>
                    <Textarea
                      {...register('description')}
                      placeholder="توضیحات غنی کالا که در تب‌ها و جزییات به زیبایی رندر می‌شود..."
                      className="bg-stone-950/80 border-stone-800 text-stone-200 focus:border-amber-500/40 focus:ring-amber-500/40 min-h-[160px] rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-stone-300">خلاصه توضیحات یا گزیده محصول (Excerpt)</Label>
                    <Textarea
                      {...register('excerpt')}
                      placeholder="خلاصه‌ای کوتاه (حدود ۱۵۰ کاراکتر) برای سئو و نتایج موتورهای جستجو..."
                      className="bg-stone-950/80 border-stone-800 text-stone-200 focus:border-amber-500/40 focus:ring-amber-500/40 h-20 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-stone-300">برند یا شرکت سازنده کالا</Label>
                      <Input
                        {...register('brand')}
                        placeholder="مثال: شیخ شاپ"
                        className="bg-stone-950/80 border-stone-800 text-stone-200 focus:border-amber-500/40 focus:ring-amber-500/40 h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-stone-300">کشور تولیدکننده / مبدا اثر</Label>
                      <Input
                        {...register('origin')}
                        placeholder="مثال: ایران، شیراز"
                        className="bg-stone-950/80 border-stone-800 text-stone-200 focus:border-amber-500/40 focus:ring-amber-500/40 h-11 rounded-xl"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 2. PRICING TAB */}
            {activeTab === 'pricing' && (
              <Card className="bg-[#0D0907]/90 border border-amber-500/15 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
                <CardHeader className="p-0 pb-6 mb-6 border-b border-amber-500/15">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-black text-stone-100">قیمت‌گذاری پایه و سیستم مالی</CardTitle>
                      <CardDescription className="text-[11px] text-stone-400">مدیریت قیمت پایه تومان در دیتابیس (بدون نیاز به نرخ تبدیل مانیلوکس)</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-stone-300">قیمت پایه محصول به تومان (Treat directly as Toman)</Label>
                    <div className="relative">
                      <Input
                        {...register('basePrice', { valueAsNumber: true })}
                        type="number"
                        placeholder="0"
                        className="bg-stone-950/80 border-stone-800 text-stone-200 focus:border-amber-500/40 focus:ring-amber-500/40 h-12 rounded-xl text-left pl-12 font-bold"
                        required
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-500">تومان</span>
                    </div>
                    <p className="text-[10px] text-stone-500 leading-relaxed">
                      💡 قیمت ثبت شده در دیتابیس مستقیماً ارزش کالا را به تومان مشخص می‌کند و بدون هیچ تبدیل مانیلوکس نامعتبر یا ارز دیگر مستقیماً با زبان فارسی و رقم‌های جداسازی شده رندر خواهد شد.
                    </p>
                  </div>

                  {/* HIGH-FIDELITY PRODUCT DISCOUNT MANAGER */}
                  <div className="border-t border-stone-900 pt-6 space-y-4">
                    <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>تنظیم تخفیف اختصاصی محصول</span>
                    </h4>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-stone-300">نوع تخفیف محصول</Label>
                      <Select
                        onValueChange={(val) => setValue('discountType', val)}
                        value={watch('discountType') || 'NONE'}
                      >
                        <SelectTrigger className="bg-stone-950 border-stone-800 text-stone-200 h-11 text-xs rounded-xl">
                          <SelectValue placeholder="نوع تخفیف را انتخاب کنید" />
                        </SelectTrigger>
                        <SelectContent className="bg-stone-950 border-stone-800 text-stone-200 text-xs">
                          <SelectItem value="NONE">بدون تخفیف (NONE)</SelectItem>
                          <SelectItem value="PERCENTAGE">درصدی (PERCENTAGE)</SelectItem>
                          <SelectItem value="FIXED">کاهش مبلغ ثابت - تومان (FIXED)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {watchDiscountType !== 'NONE' && (
                      <div className="space-y-4 animate-luxury-bloom">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-stone-300">مقدار تخفیف (درصد یا مبلغ تومان)</Label>
                          <Input
                            {...register('discountValue', { valueAsNumber: true })}
                            type="number"
                            className="bg-stone-950/80 border-stone-800 text-stone-200 focus:border-amber-500/40 focus:ring-amber-500/40 h-11 rounded-xl text-left font-bold"
                            placeholder="مثال: ۱۰ برای درصد یا ۵۰۰۰۰ برای مبلغ"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-stone-300">تاریخ شروع تخفیف</Label>
                            <Input
                              {...register('discountStartDate')}
                              type="date"
                              className="bg-stone-950/80 border-stone-800 text-stone-200 focus:border-amber-500/40 focus:ring-amber-500/40 h-11 rounded-xl font-sans"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-stone-300">تاریخ پایان تخفیف</Label>
                            <Input
                              {...register('discountEndDate')}
                              type="date"
                              className="bg-stone-950/80 border-stone-800 text-stone-200 focus:border-amber-500/40 focus:ring-amber-500/40 h-11 rounded-xl font-sans"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-stone-950 border border-stone-900 rounded-2xl">
                          <div className="space-y-0.5">
                            <Label className="text-xs font-bold text-stone-300">وضعیت فعال بودن تخفیف</Label>
                            <p className="text-[10px] text-stone-500">تخفیف بلافاصله اعمال شود</p>
                          </div>
                          <input
                            type="checkbox"
                            {...register('discountActive')}
                            className="rounded bg-stone-950 border-stone-800 text-amber-500 focus:ring-0 w-4.5 h-4.5"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 3. INVENTORY TAB (Variants & Units) */}
            {activeTab === 'inventory' && (
              <Card className="bg-[#0D0907]/90 border border-amber-500/15 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                <CardHeader className="p-0 pb-6 mb-6 border-b border-amber-500/15">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-black text-stone-100">مدیریت واحدها و تنوع کالا (Product Units / Variants)</CardTitle>
                        <CardDescription className="text-[11px] text-stone-400">افزودن و ویرایش تنوع رنگی، وزنی، حجمی و تعداد موجودی انبار در یک ویو</CardDescription>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={addUnit}
                      className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-black py-1.5 px-3 rounded-xl border border-amber-500/25 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>افزودن تنوع</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                  {/* Inventory Controls */}
                  <div className="space-y-4 bg-stone-950/40 p-5 rounded-2xl border border-stone-900">
                    <h4 className="text-xs font-black text-amber-400">مدیریت موجودی هوشمند و وضعیت انبار</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-stone-300">موجودی انبار (تعداد)</Label>
                        <Input
                          {...register('quantity', { valueAsNumber: true })}
                          type="number"
                          placeholder="0"
                          className="bg-stone-950 border-stone-850 h-11 rounded-xl text-left font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-stone-300">آستانه هشدار کمبود موجودی</Label>
                        <Input
                          {...register('lowStockThreshold', { valueAsNumber: true })}
                          type="number"
                          placeholder="3"
                          className="bg-stone-950 border-stone-850 h-11 rounded-xl text-left"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-stone-300">وضعیت موجودی کالا</Label>
                        <Select
                          onValueChange={(val) => setValue('inventoryStatus', val)}
                          value={watch('inventoryStatus') || 'AVAILABLE'}
                        >
                          <SelectTrigger className="bg-stone-950 border-stone-850 h-11 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-stone-950 border-stone-850 text-stone-200 text-xs">
                            <SelectItem value="AVAILABLE">🟢 موجود (AVAILABLE)</SelectItem>
                            <SelectItem value="LOW_STOCK">🟡 رو به اتمام (LOW_STOCK)</SelectItem>
                            <SelectItem value="OUT_OF_STOCK">🔴 ناموجود (OUT_OF_STOCK)</SelectItem>
                            <SelectItem value="COMING_SOON">🔵 به زودی (COMING_SOON)</SelectItem>
                            <SelectItem value="DISCONTINUED">⚪ متوقف شده (DISCONTINUED)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-stone-950 border border-stone-900 rounded-xl mt-3">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-bold text-stone-300">امکان ثبت «موجود شد خبرم کن»</Label>
                        <p className="text-[10px] text-stone-500">مشتریان در صورت اتمام موجودی بتوانند درخواست اطلاع‌رسانی ثبت کنند</p>
                      </div>
                      <input
                        type="checkbox"
                        {...register('allowBackInStockNotification')}
                        className="rounded bg-stone-950 border-stone-800 text-amber-500 focus:ring-0 w-4.5 h-4.5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl mt-3">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-black text-amber-300">نیاز به هماهنگی قبل از سفارش</Label>
                        <p className="text-[10px] text-stone-400">پیش از پرداخت مشتری، مودال اختصاصی هماهنگی قیمت و موجودی (Concierge) نمایش داده شود</p>
                      </div>
                      <input
                        type="checkbox"
                        {...register('requiresOrderConfirmation')}
                        className="rounded bg-stone-950 border-amber-500 text-amber-500 focus:ring-0 w-4.5 h-4.5 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Units List */}
                  {loadingUnits ? (
                    <div className="text-center py-6 text-stone-500 text-xs">در حال دریافت و هماهنگ‌سازی تنوع‌های کالا...</div>
                  ) : productUnits.length === 0 ? (
                    <div className="text-center py-8 bg-stone-950/20 border border-dashed border-stone-800 rounded-2xl">
                      <p className="text-xs text-stone-500 font-bold">هیچ تنوع یا واحد اختصاصی برای این محصول تعریف نشده است.</p>
                      <button
                        type="button"
                        onClick={addUnit}
                        className="mt-3 text-xs text-amber-500 hover:text-amber-400 font-black"
                      >
                        ایجاد اولین واحد اختصاصی کالا
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {productUnits.map((item, index) => (
                        <div key={index} className="bg-stone-950/40 border border-stone-900 rounded-2xl p-4 space-y-4 relative">
                          <div className="flex items-center justify-between border-b border-stone-900/50 pb-2">
                            <span className="text-xs font-black text-amber-400">تنوع شماره {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeUnit(index, item.id)}
                              className="text-red-500 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-[10px] text-stone-400 font-bold">عنوان واحد / تنوع</Label>
                              <Input
                                value={item.name}
                                onChange={(e) => updateUnitField(index, 'name', e.target.value)}
                                placeholder="مثال: ۵۰۰ گرمی"
                                className="bg-stone-950 border-stone-850 h-10 text-xs"
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] text-stone-400 font-bold">قیمت اختصاصی (تومان)</Label>
                              <Input
                                type="number"
                                value={item.price}
                                onChange={(e) => updateUnitField(index, 'price', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                className="bg-stone-950 border-stone-850 h-10 text-xs text-left"
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-[10px] text-stone-400 font-bold">تعداد موجودی انبار (Stock)</Label>
                              <Input
                                type="number"
                                value={item.stock}
                                onChange={(e) => updateUnitField(index, 'stock', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="bg-stone-950 border-stone-850 h-10 text-xs text-left"
                                required
                              />
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                              <input
                                type="checkbox"
                                checked={item.isActive}
                                onChange={(e) => updateUnitField(index, 'isActive', e.target.checked)}
                                className="rounded bg-stone-950 border-stone-800 text-amber-500 focus:ring-0 w-4 h-4"
                                id={`unit-active-${index}`}
                              />
                              <Label htmlFor={`unit-active-${index}`} className="text-xs text-stone-300 font-bold cursor-pointer">فعال و آماده فروش</Label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 3.1 OPTIONS & VARIANTS TAB */}
            {activeTab === 'variants' && (
              <Card className="bg-[#0D0907]/90 border border-amber-500/15 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl text-right">
                <CardHeader className="p-0 pb-6 mb-6 border-b border-amber-500/15">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Sliders className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-black text-stone-100">ویژگی‌ها و ترکیب‌های کالا (Options & Variants)</CardTitle>
                        <CardDescription className="text-[11px] text-stone-400">افزودن گزینه‌های ویژگی (رنگ، ظرفیت، وزن) و تولید خودکار ترکیب‌های ماتریسی با قیمت مستقل</CardDescription>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={generateCombinationVariants}
                      className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-black py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/10 border border-amber-500/20"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>تولید خودکار ترکیب‌ها</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-8">
                  {/* Outer Option Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Attributes Manager */}
                    <div className="lg:col-span-5 space-y-6">
                      <div className="bg-stone-950/40 p-5 rounded-2xl border border-stone-900/80 space-y-4">
                        <Label className="text-xs font-black text-stone-200 block">افزودن ویژگی جدید به این کالا</Label>
                        <div className="flex gap-2.5">
                          <select
                            value={selectedAttributeToAdd}
                            onChange={(e) => setSelectedAttributeToAdd(e.target.value)}
                            className="flex-1 bg-stone-950 border-stone-800 text-stone-300 text-xs rounded-xl h-10 px-3 focus:ring-amber-500/30 focus:border-amber-500"
                          >
                            <option value="">-- انتخاب ویژگی --</option>
                            <option value="Color">رنگ (Color)</option>
                            <option value="Storage">حافظه (Storage)</option>
                            <option value="Weight">وزن (Weight)</option>
                            <option value="Volume">حجم (Volume)</option>
                            <option value="Size">سایز (Size)</option>
                            <option value="Flavor">طعم (Flavor)</option>
                            <option value="Material">جنس (Material)</option>
                          </select>
                          <Button
                            type="button"
                            onClick={() => handleAddAttribute(selectedAttributeToAdd)}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/25 px-4 rounded-xl h-10"
                          >
                            افزودن
                          </Button>
                        </div>
                        <p className="text-[10px] text-stone-500 font-bold">می‌توانید عنوان دلخواه خود را نیز در کادر بالا تایپ کنید تا ویژگی سفارشی ساخته شود.</p>
                      </div>

                      {/* Configured Attributes and Values list */}
                      <div className="space-y-4">
                        <Label className="text-xs font-black text-amber-500 tracking-wider uppercase block">ویژگی‌های کالا و مقادیر مجاز</Label>

                        {assignedAttributes.length === 0 ? (
                          <div className="text-center py-8 bg-stone-950/20 border border-dashed border-stone-850 rounded-2xl text-xs text-stone-500 font-bold">
                            هیچ ویژگی گزینشی (مثل رنگ یا حافظه) برای این کالا افزوده نشده است.
                          </div>
                        ) : (
                          assignedAttributes.map((attr) => (
                            <div key={attr.id} className="bg-stone-950/35 border border-stone-900 rounded-2xl p-4.5 space-y-4">
                              <div className="flex items-center justify-between border-b border-stone-900/60 pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-stone-100">{attr.displayName}</span>
                                  <span className="text-[9px] bg-stone-900 text-stone-400 font-mono px-2 py-0.5 rounded-md uppercase">{attr.type}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAttribute(attr.id)}
                                  className="text-stone-500 hover:text-red-400 transition-colors text-[10px] font-bold"
                                >
                                  حذف ویژگی
                                </button>
                              </div>

                              {/* Value lists */}
                              <div className="flex flex-wrap gap-2">
                                {(attr.values || []).map((val: any) => (
                                  <div
                                    key={val.id}
                                    className="flex items-center gap-1.5 bg-[#FAF6EE]/5 border border-stone-800 text-stone-300 text-xs px-2.5 py-1.5 rounded-xl hover:border-amber-500/20 transition-all"
                                  >
                                    {attr.type === 'COLOR' && val.hex && (
                                      <span
                                        className="w-3.5 h-3.5 rounded-full border border-stone-900 shadow-md inline-block"
                                        style={{ backgroundColor: val.hex }}
                                      />
                                    )}
                                    <span>{val.value} {val.unit || ''}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveValueFromAttribute(attr.id, val.id)}
                                      className="text-stone-500 hover:text-red-400 transition-colors mr-1"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              {/* Add Value Input bar */}
                              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-900/40">
                                <div className="flex-1 flex gap-1.5">
                                  <Input
                                    value={newValueInput[attr.id]?.value || ''}
                                    onChange={(e) => setNewValueInput({
                                      ...newValueInput,
                                      [attr.id]: {
                                        value: e.target.value,
                                        unit: newValueInput[attr.id]?.unit || '',
                                        hex: newValueInput[attr.id]?.hex || '#000000',
                                      }
                                    })}
                                    placeholder={attr.type === 'COLOR' ? 'عنوان رنگ (مثلاً: قرمز)' : 'مقدار ویژگی'}
                                    className="bg-stone-950 border-stone-850 h-9 text-xs rounded-xl flex-1 text-right"
                                  />

                                  {attr.type === 'COLOR' && (
                                    <div className="flex items-center gap-1 bg-stone-950 px-2 rounded-xl border border-stone-850">
                                      <input
                                        type="color"
                                        value={newValueInput[attr.id]?.hex || '#000000'}
                                        onChange={(e) => setNewValueInput({
                                          ...newValueInput,
                                          [attr.id]: {
                                            value: newValueInput[attr.id]?.value || '',
                                            unit: newValueInput[attr.id]?.unit || '',
                                            hex: e.target.value,
                                          }
                                        })}
                                        className="w-6 h-6 border-0 bg-transparent cursor-pointer rounded"
                                      />
                                      <span className="text-[10px] font-mono text-stone-400 uppercase">{newValueInput[attr.id]?.hex || '#000000'}</span>
                                    </div>
                                  )}

                                  {(attr.type === 'WEIGHT' || attr.type === 'VOLUME') && (
                                    <select
                                      value={newValueInput[attr.id]?.unit || ''}
                                      onChange={(e) => setNewValueInput({
                                        ...newValueInput,
                                        [attr.id]: {
                                          value: newValueInput[attr.id]?.value || '',
                                          unit: e.target.value,
                                          hex: newValueInput[attr.id]?.hex || '#000000',
                                        }
                                      })}
                                      className="bg-stone-950 border-stone-850 text-stone-400 text-xs rounded-xl h-9 px-2 focus:ring-0"
                                    >
                                      <option value="">واحد</option>
                                      <option value="g">گرم</option>
                                      <option value="kg">کیلوگرم</option>
                                      <option value="ml">میلی‌لیتر</option>
                                      <option value="L">لیتر</option>
                                    </select>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  onClick={() => handleAddValueToAttribute(attr.id)}
                                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-black border border-amber-500/20 h-9 px-3.5 rounded-xl"
                                >
                                  افزودن مقدار
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Right Column: Combination matrix */}
                    <div className="lg:col-span-7 space-y-4">
                      <Label className="text-xs font-black text-amber-500 tracking-wider uppercase block">ماتریس تنوع‌ها و قیمت‌گذاری (Variant Matrix)</Label>

                      {variantMatrix.length === 0 ? (
                        <div className="text-center py-16 bg-stone-950/10 border border-dashed border-stone-850 rounded-[2rem] flex flex-col items-center justify-center gap-3">
                          <Sliders className="w-10 h-10 text-stone-600 animate-pulse" />
                          <p className="text-xs text-stone-500 font-bold max-w-sm leading-relaxed">
                            ماتریس تنوع در حال حاضر خالی است. ابتدا مقادیر بالا را وارد کرده و سپس بر روی دکمه طلایی رنگ "تولید خودکار ترکیب‌ها" در بالای صفحه کلیک کنید تا ترکیب‌ها ساخته شوند.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                          {variantMatrix.map((variant, index) => (
                            <div key={index} className="bg-stone-950/45 border border-stone-900 rounded-2xl p-4.5 space-y-4 relative shadow-md">
                              <div className="flex items-center justify-between border-b border-stone-900/60 pb-2">
                                <span className="text-xs font-black text-amber-400">{variant.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariant(index)}
                                  className="text-stone-500 hover:text-red-400 transition-colors p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <Label className="text-[10px] text-stone-400 font-bold">قیمت فروش (تومان)</Label>
                                  <Input
                                    type="number"
                                    value={variant.price}
                                    onChange={(e) => updateVariantMatrixField(index, 'price', parseFloat(e.target.value) || 0)}
                                    className="bg-stone-950 border-stone-850 h-10 text-xs text-left"
                                    required
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-[10px] text-stone-400 font-bold">قیمت قبل از تخفیف (Toman، اختیاری)</Label>
                                  <Input
                                    type="number"
                                    value={variant.oldPrice || ''}
                                    onChange={(e) => updateVariantMatrixField(index, 'oldPrice', parseFloat(e.target.value) || null)}
                                    className="bg-stone-950 border-stone-850 h-10 text-xs text-left"
                                    placeholder="بدون تخفیف"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <Label className="text-[10px] text-stone-400 font-bold">موجودی انبار (Stock)</Label>
                                  <Input
                                    type="number"
                                    value={variant.stock}
                                    onChange={(e) => updateVariantMatrixField(index, 'stock', parseInt(e.target.value) || 0)}
                                    className="bg-stone-950 border-stone-850 h-10 text-xs text-left"
                                    required
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-[10px] text-stone-400 font-bold">کد تنوع (SKU اختصاصی)</Label>
                                  <Input
                                    value={variant.sku || ''}
                                    onChange={(e) => updateVariantMatrixField(index, 'sku', e.target.value)}
                                    placeholder="SKU-COLOR-SIZE"
                                    className="bg-stone-950 border-stone-850 h-10 text-xs text-left"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2 pt-2">
                                <input
                                  type="checkbox"
                                  checked={variant.isActive !== false}
                                  onChange={(e) => updateVariantMatrixField(index, 'isActive', e.target.checked)}
                                  className="rounded bg-stone-950 border-stone-800 text-amber-500 focus:ring-0 w-4 h-4"
                                  id={`variant-active-${index}`}
                                />
                                <Label htmlFor={`variant-active-${index}`} className="text-xs text-stone-300 font-bold cursor-pointer">فعال و آماده فروش برای مشتریان</Label>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 4. MEDIA TAB */}
            {activeTab === 'media' && (
              <Card className="bg-[#0D0907]/90 border border-amber-500/15 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                <CardContent className="p-0 space-y-6">
                  <UploadImage productId={activeProductId} onImagesChange={handleImagesChange} />
                </CardContent>
              </Card>
            )}

            {/* 5. VIDEOS TAB */}
            {activeTab === 'videos' && (
              <Card className="bg-[#0D0907]/90 border border-amber-500/15 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                  <UploadImage productId={activeProductId} onImagesChange={handleImagesChange} />
                </CardContent>
              </Card>
            )}

            {/* 6. SEO TAB */}
            {activeTab === 'seo' && (
              <Card className="bg-[#0D0907]/90 border border-amber-500/15 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                <CardHeader className="p-0 pb-6 mb-6 border-b border-amber-500/15">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Search className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-black text-stone-100">سئو فوق پیشرفته و متادیتا (SEO Panel)</CardTitle>
                      <CardDescription className="text-[11px] text-stone-400">افزایش حداکثری بازدید، مدیریت دقیق اسلاگ، OpenGraph و Schema markup</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-6">

                  {/* GOOGLE PREVIEW COMPONENT */}
                  <div className="bg-stone-950 p-5 rounded-2xl border border-stone-900 font-sans space-y-2.5 text-right" dir="ltr">
                    <div className="flex items-center gap-2 text-xs text-[#a7a7a7]">
                      <span>🔍 Google Search Live Preview</span>
                    </div>
                    <div className="text-sm text-[#1a0dab] font-medium hover:underline cursor-pointer truncate">
                      {watchSeoTitle || watchName || 'Sheikh Shops Premium Product Title'}
                    </div>
                    <div className="text-xs text-[#006621] truncate">
                      https://sheikhshops.com/products/{watchSlug || 'product-slug'}
                    </div>
                    <div className="text-xs text-[#545454] leading-relaxed break-words">
                      {watchSeoDesc || 'Please provide an SEO Description to preview how google search engine result will display this product in searches.'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Slug */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold text-stone-300">اسلاگ آدرس محصول (Slug)</Label>
                        <span className="text-[10px] text-stone-500">فقط حروف کوچک انگلیسی و هایفن</span>
                      </div>
                      <Input
                        {...register('slug')}
                        placeholder="auto-generated-from-name"
                        className="bg-stone-950 border-stone-850 h-11 rounded-xl text-left font-bold text-amber-400"
                      />
                    </div>

                    {/* SEO Title */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold text-stone-300">عنوان بهینه سئو (Meta Title)</Label>
                        <span className={`text-[10px] ${watchSeoTitle.length > 60 ? 'text-red-400' : 'text-stone-500'}`}>
                          {watchSeoTitle.length} / 60 کاراکتر
                        </span>
                      </div>
                      <Input
                        {...register('seoTitle')}
                        maxLength={60}
                        placeholder="عسل گون اعلا شیخ | عسل طبیعی ۱۰۰ درصد خالص سبلان"
                        className="bg-stone-950 border-stone-850 h-11 rounded-xl"
                      />
                    </div>

                    {/* SEO Description */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold text-stone-300">توضیحات بهینه سئو (Meta Description)</Label>
                        <span className={`text-[10px] ${watchSeoDesc.length > 160 ? 'text-red-400' : 'text-stone-500'}`}>
                          {watchSeoDesc.length} / 160 کاراکتر
                        </span>
                      </div>
                      <Textarea
                        {...register('seoDescription')}
                        maxLength={160}
                        placeholder="خرید عسل گون سبلان شیخ با طعم و عطر به یاد ماندنی، ارسال ویژه و هدیه نفیس..."
                        className="bg-stone-950 border-stone-850 h-20 rounded-xl"
                      />
                    </div>

                    {/* H1 Override */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-stone-300">عنوان سراسری اصلی صفحه (H1 Override)</Label>
                      <Input
                        {...register('h1Override')}
                        placeholder="H1 Override"
                        className="bg-stone-950 border-stone-850 h-11 rounded-xl"
                      />
                    </div>

                    {/* Canonical URL */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-stone-300">آدرس ارجاعی بهینه (Canonical URL)</Label>
                      <Input
                        {...register('canonicalUrl')}
                        placeholder="https://sheikhshops.com/products/sub-slug"
                        className="bg-stone-950 border-stone-850 h-11 rounded-xl text-left"
                      />
                    </div>

                    {/* Meta Keywords */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-stone-300">کلمات کلیدی سئو (با کاما انگلیسی جدا شوند)</Label>
                      <Input
                        {...register('metaKeywords')}
                        placeholder="عسل, عسل گون, عسل طبیعی"
                        className="bg-stone-950 border-stone-850 h-11 rounded-xl"
                      />
                    </div>

                    {/* OG Social configurations */}
                    <div className="border-t border-stone-900 pt-4 space-y-4">
                      <h4 className="text-xs font-bold text-amber-400">تنظیمات اشتراک‌گذاری شبکه‌های اجتماعی (Open Graph)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">عنوان سوشیال (OG Title)</Label>
                          <Input
                            {...register('ogTitle')}
                            className="bg-stone-950 border-stone-850 h-10 text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">تصویر سهم‌گذاری (OG Image URL)</Label>
                          <Input
                            {...register('ogImage')}
                            className="bg-stone-950 border-stone-850 h-10 text-xs text-left"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">توضیحات سوشیال (OG Description)</Label>
                        <Textarea
                          {...register('ogDescription')}
                          className="bg-stone-950 border-stone-850 h-16 text-xs"
                        />
                      </div>
                    </div>

                    {/* Schema JSON Markup */}
                    <div className="space-y-2 border-t border-stone-900 pt-4">
                      <Label className="text-xs font-bold text-stone-300">ساختار داده موتورهای جستجو (Structured Data JSON-LD)</Label>
                      <Textarea
                        {...register('schemaMarkup')}
                        placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "Product",\n  "name": "نام محصول"\n}`}
                        className="bg-stone-950 border-stone-850 h-32 rounded-xl text-left font-mono text-xs"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 7. SPECIFICATIONS TAB */}
            {activeTab === 'specifications' && (
              <Card className="bg-[#0D0907]/90 border border-amber-500/15 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                <CardHeader className="p-0 pb-6 mb-6 border-b border-amber-500/15">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-black text-stone-100">ویژگی‌ها و جزئیات دقیق کالا</CardTitle>
                      <CardDescription className="text-[11px] text-stone-400">ابعاد، رنگ, مواد اولیه، گارانتی و ساختارهای JSON مشخصات فنی</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-6">

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-stone-300">وزن کالا (عددی)</Label>
                      <Input
                        {...register('weight', { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        placeholder="1.5"
                        className="bg-stone-950 border-stone-850 h-11 text-left"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-stone-300">واحد وزن</Label>
                      <Select
                        onValueChange={(val) => setValue('weightUnit', val)}
                        value={watch('weightUnit') || 'kg'}
                      >
                        <SelectTrigger className="bg-stone-950 border-stone-850 h-11 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-stone-950 border-stone-850 text-stone-200">
                          <SelectItem value="kg">کیلوگرم (kg)</SelectItem>
                          <SelectItem value="g">گرم (g)</SelectItem>
                          <SelectItem value="lb">پوند (lb)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-stone-300">رنگ (Color)</Label>
                      <Input
                        {...register('color')}
                        placeholder="مثال: طلایی، قهوه‌ای"
                        className="bg-stone-950 border-stone-850 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-stone-300">عطر و رایحه (Scent)</Label>
                      <Input
                        {...register('scent')}
                        placeholder="مثال: رایحه آویشن کوهی"
                        className="bg-stone-950 border-stone-850 h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-stone-300">طعم و مزه (Flavor)</Label>
                      <Input
                        {...register('flavor')}
                        placeholder="مثال: کاراملی شیرین ملایم"
                        className="bg-stone-950 border-stone-850 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-stone-300">گارانتی محصول (Warranty)</Label>
                      <Input
                        {...register('warranty')}
                        placeholder="مثال: تضمین اصالت و بازگشت کالا تا ۷ روز"
                        className="bg-stone-950 border-stone-850 h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-stone-300">ویژگی‌های کالا (یک مورد در هر سطر بنویسید)</Label>
                    <Textarea
                      {...register('features')}
                      placeholder={`مثال:\nعسل صد درصد ارگانیک گون\nتولید سنتی در زنبورستان سبلان\nتایید شده توسط آزمایشگاه کنترل کیفی`}
                      className="bg-stone-950 border-stone-850 min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-stone-300">مواد تشکیل دهنده (با کاما انگلیسی جدا شوند)</Label>
                    <Input
                      {...register('materials')}
                      placeholder="عسل خالص طبیعی, موم زنبور"
                      className="bg-stone-950 border-stone-850 h-11"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-stone-300">ابعاد کالا (ساختار JSON)</Label>
                      <Textarea
                        {...register('dimensions')}
                        placeholder={`{\n  "length": 15,\n  "width": 10,\n  "height": 10,\n  "unit": "cm"\n}`}
                        className="bg-stone-950 border-stone-850 h-28 text-left font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-stone-300">جدول مشخصات فنی (ساختار JSON)</Label>
                      <Textarea
                        {...register('technicalSpecs')}
                        placeholder={`{\n  "درجه خلوص": "98%",\n  "نوع زنبور": "وحشی سبلان"\n}`}
                        className="bg-stone-950 border-stone-850 h-28 text-left font-mono text-xs"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 8. SHIPPING TAB */}
            {activeTab === 'shipping' && (
              <Card className="bg-[#0D0907]/90 border border-amber-500/15 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
                <CardHeader className="p-0 pb-6 mb-6 border-b border-amber-500/15">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-black text-stone-100">تنظیمات لجستیک و ارسال کالا</CardTitle>
                      <CardDescription className="text-[11px] text-stone-400">پیکربندی سیستم‌های ارسال، تخصیص هزینه مجزا و وضعیت ارسال رایگان کالا</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-6">

                  {user?.role !== 'SUPERADMIN' && (
                    <div className="bg-amber-500/10 border-2 border-amber-500/20 rounded-2xl p-4 text-center flex items-center justify-center gap-2 mb-4">
                      <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-xs text-amber-300 font-bold">🔒 دسترسی محدود: تنها مدیر ارشد (Super Admin) مجاز به ویرایش فیلدهای ترابری است.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-stone-300">هزینه ارسال اختصاصی کالا (تومان)</Label>
                      <Input
                        {...register('shippingCost', { valueAsNumber: true })}
                        type="number"
                        disabled={user?.role !== 'SUPERADMIN'}
                        placeholder="200000"
                        className="bg-stone-950 border-stone-850 h-11 text-left font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-stone-300">نوع ارسال کالا (Shipping Mode)</Label>
                      <Input
                        {...register('shippingMode')}
                        disabled={user?.role !== 'SUPERADMIN'}
                        placeholder="مثال: ارسال زمینی اکسپرس"
                        className="bg-stone-950 border-stone-850 h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-stone-300">اولویت‌بندی ارسال و ترخیص انبار</Label>
                      <Select
                        disabled={user?.role !== 'SUPERADMIN'}
                        onValueChange={(val) => setValue('shippingPriority', val)}
                        value={watch('shippingPriority') || 'Normal'}
                      >
                        <SelectTrigger className="bg-stone-950 border-stone-850 h-11 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-stone-950 border-stone-850 text-stone-200">
                          <SelectItem value="Low">Low (عادی)</SelectItem>
                          <SelectItem value="Normal">Normal (استاندارد)</SelectItem>
                          <SelectItem value="High">High (سریع)</SelectItem>
                          <SelectItem value="Express">Express (فوری)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between p-4.5 bg-stone-950/80 border border-stone-900 rounded-xl">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold cursor-pointer flex items-center gap-1.5 text-stone-300">ارسال کاملاً رایگان</Label>
                        <span className="text-[10px] text-stone-500">فعال‌سازی ارسال رایگان انحصاری این کالا</span>
                      </div>
                      <input
                        type="checkbox"
                        disabled={user?.role !== 'SUPERADMIN'}
                        {...register('allowFreeShipping')}
                        className="rounded bg-stone-950 border-stone-800 text-amber-500 focus:ring-0 w-4 h-4"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-stone-300">قالب توصیف تحویل کالا (توضیحات ارسال)</Label>
                    <Select
                      disabled={user?.role !== 'SUPERADMIN'}
                      onValueChange={(val) => setValue('shippingDescription', val)}
                      value={watch('shippingDescription') || ''}
                    >
                      <SelectTrigger className="bg-stone-950 border-stone-850 h-11 text-xs">
                        <SelectValue placeholder="قالب توصیف تحویل را انتخاب کنید..." />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-950 border-stone-850 text-stone-200">
                        <SelectItem value="ارسال ویژه">📦 ارسال ویژه (لوکس با بسته‌بندی امن)</SelectItem>
                        <SelectItem value="ارسال سنگین">🏋️ ارسال سنگین (کالاهای با وزن بالا)</SelectItem>
                        <SelectItem value="ارسال رایگان">🎁 ارسال رایگان (هدیه ویژه شیخ شاپ)</SelectItem>
                        <SelectItem value="ارسال اقتصادی">⚡ ارسال اقتصادی (حمل استاندارد مقرون‌به‌صرفه)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 9. REVIEWS TAB (Moderation inline) */}
            {activeTab === 'reviews' && (
              <Card className="bg-[#0D0907]/90 border border-amber-500/15 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                <CardHeader className="p-0 pb-6 mb-6 border-b border-amber-500/15">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-black text-stone-100">نظرات و دیدگاه‌های ثبت شده ({reviews.length})</CardTitle>
                      <CardDescription className="text-[11px] text-stone-400">امتیازدهی میانگین: {avgRating} ستاره | {pendingReviewsCount} مورد در انتظار تایید</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                  {loadingReviews ? (
                    <div className="text-center py-6 text-xs text-stone-500">درحال واکشی نظرات خریداران...</div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-8 bg-stone-950/20 border border-dashed border-stone-800 rounded-2xl">
                      <p className="text-xs text-stone-500">هنوز دیدگاهی برای این کالا ثبت نشده است.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((r) => (
                        <div key={r.id} className="bg-stone-950/50 border border-stone-900 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-stone-200">{r.userName}</span>
                              <div className="flex items-center text-amber-500 gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < r.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-800'}`}
                                  />
                                ))}
                              </div>
                              {r.isVerified && (
                                <span className="bg-green-500/10 text-green-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">خریدار تاییدشده</span>
                              )}
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              r.status === 'APPROVED' ? 'bg-green-500/10 text-green-400' :
                              r.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {r.status === 'APPROVED' ? 'approved' : r.status === 'REJECTED' ? 'rejected' : 'pending'}
                            </span>
                          </div>

                          <p className="text-xs text-stone-300 leading-relaxed font-semibold">{r.comment}</p>

                          {/* Reply interface */}
                          <div className="space-y-2 pt-2 border-t border-stone-900/50">
                            <Label className="text-[10px] text-stone-400 font-bold">پاسخ مدیر فروشگاه:</Label>
                            <Textarea
                              value={reviewReply[r.id] || ''}
                              onChange={(e) => setReviewReply({ ...reviewReply, [r.id]: e.target.value })}
                              placeholder="متن پاسخ رسمی به نظر مشتری..."
                              className="bg-stone-950 border-stone-850 h-16 text-xs"
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => handleModerateReview(r.id, 'APPROVED')}
                                className="bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold py-1 px-3 rounded-lg"
                              >
                                تایید و انتشار
                              </button>
                              <button
                                type="button"
                                onClick={() => handleModerateReview(r.id, 'REJECTED')}
                                className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold py-1 px-3 rounded-lg"
                              >
                                رد نظر
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteReview(r.id)}
                                className="bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-bold py-1 px-2 rounded-lg"
                              >
                                حذف کامل
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 10. AI TAB */}
            {activeTab === 'ai' && (
              <Card className="bg-[#0D0907]/90 border border-amber-500/15 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
                <CardHeader className="p-0 pb-6 mb-6 border-b border-amber-500/15">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-black text-stone-100">ابزارهای بهبود هوش مصنوعی (AI & SEO Tools)</CardTitle>
                      <CardDescription className="text-[11px] text-stone-400">بهینه‌سازی توضیحات کالا، پیشنهاد برچسب‌ها و همگام‌سازی با چت‌بات هوشمند فروشگاه</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                  <div className="space-y-4">
                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-900 space-y-2">
                      <h4 className="text-xs font-black text-amber-400">💡 پیشنهاد خودکار توضیحات کالا (AI Engine)</h4>
                      <p className="text-[10px] text-stone-500 leading-relaxed">
                        چت‌بات و هوش مصنوعی شیخ شاپ اطلاعات این بخش را جهت اولویت در سرچ‌ها و راهنمایی هوشمند مشتریان استفاده می‌کند.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-stone-300">برچسب‌های کالا (با کاما انگلیسی جدا شوند)</Label>
                      <Input
                        {...register('tags')}
                        placeholder="لوکس, ارگانیک, عسل خالص"
                        className="bg-stone-950 border-stone-850 h-11"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 11. DANGER ZONE TAB */}
            {activeTab === 'danger' && (
              <Card className="border-2 border-red-500/30 bg-[#0D0907]/90 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                <CardHeader className="p-0 pb-6 mb-6 border-b border-red-500/15">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-black text-red-400">منطقه فوق حساس کاربری (Danger Zone)</CardTitle>
                      <CardDescription className="text-[11px] text-stone-400">عملیات‌های حساس و غیرقابل بازگشت بر روی اطلاعات کالا</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                    <h4 className="text-xs font-black text-red-400 mb-1">هشدار بسیار مهم</h4>
                    <p className="text-[10px] text-stone-400 leading-relaxed">
                      حذف دائم کالا از دیتابیس شیخ شاپ تمامی تصاویر، ویدیوها، واحدها و کدهای تخفیف مرتبط را به صورت کامل و آبشاری (Cascade Delete) از پایگاه داده فیزیکی حذف می‌کند و به هیچ وجه قابل بازیابی مجدد نخواهد بود.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-stone-900/50">
                    <div>
                      <h4 className="text-xs font-bold text-stone-200">حذف فیزیکی دائم کالا</h4>
                      <p className="text-[10px] text-stone-500 mt-0.5">پاک کردن کامل کلیه موجودیت‌ها و اسناد مرتبط از سرور</p>
                    </div>
                    <Button
                      type="button"
                      onClick={async () => {
                        if (!product?.id) return;
                        if (confirm('آیا از حذف دائم و غیر قابل بازگشت این کالا مطمئن هستید؟')) {
                          try {
                            const res = await fetch(`/api/product?id=${product.id}`, {
                              method: 'DELETE',
                            });
                            if (res.ok) {
                              toast.success('کالا با موفقیت حذف گردید.');
                              router.push('/dashboard/products');
                            } else {
                              toast.error('خطا در حذف کالا از دیتابیس.');
                            }
                          } catch {
                            toast.error('خطا در برقراری ارتباط با سرور.');
                          }
                        }
                      }}
                      className="bg-red-600 hover:bg-red-500 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-lg shadow-red-500/10"
                      disabled={isNewProduct}
                    >
                      حذف دائم محصول
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

          </form>
        </div>

        {/* RIGHT COLUMN: Sidebar Quick-Actions Controls Panel */}
        <div className="lg:col-span-3 sticky top-24 z-30 space-y-6">

          {/* Status & Settings Card */}
          <Card className="bg-[#0D0907]/90 border border-amber-500/15 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-lg">
            <CardHeader className="p-5 border-b border-stone-900 bg-stone-950/40">
              <CardTitle className="text-xs font-black text-stone-300">وضعیت کالا و دسته‌بندی</CardTitle>
              <CardDescription className="text-[9px] text-stone-500">انتخاب وضعیت انتشار، فروشگاه و واحد اندازه‌گیری اصلی</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">

              {/* Product Status (ACTIVE, INACTIVE, DRAFT) */}
              <div className="space-y-1.5">
                <Label className="text-[11px] text-stone-400 font-bold">وضعیت انتشار کالا *</Label>
                <Select
                  onValueChange={(val) => setValue('status', val as ProductStatus)}
                  value={watch('status') || ProductStatus.ACTIVE}
                >
                  <SelectTrigger className="bg-stone-950 border-stone-850 text-stone-200 text-xs h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-950 border-stone-850 text-stone-200 text-xs">
                    <SelectItem value={ProductStatus.ACTIVE}>🟢 فعال (ACTIVE)</SelectItem>
                    <SelectItem value={ProductStatus.INACTIVE}>🔴 غیرفعال (INACTIVE)</SelectItem>
                    <SelectItem value={ProductStatus.DRAFT}>🟡 پیش‌نویس (DRAFT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category / Main Category (category maps to ProductCategory) */}
              <div className="space-y-1.5">
                <Label className="text-[11px] text-stone-400 font-bold">دسته‌بندی اصلی محصول *</Label>
                <Select
                  onValueChange={(val) => setValue('category', val as ProductCategory)}
                  value={watch('category') || ProductCategory.OTHERS}
                >
                  <SelectTrigger className="bg-stone-950 border-stone-850 text-stone-200 text-xs h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-950 border-stone-850 text-stone-200 text-xs">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                    <SelectItem value={ProductCategory.HONEY}>عسل طبیعی (HONEY)</SelectItem>
                    <SelectItem value={ProductCategory.SAFFRON}>زعفران ناب (SAFFRON)</SelectItem>
                    <SelectItem value={ProductCategory.DATES}>خرما ویژه (DATES)</SelectItem>
                    <SelectItem value={ProductCategory.OTHERS}>کالاهای دیگر (OTHERS)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Store Category Type Selector */}
              <div className="space-y-1.5">
                <Label className="text-[11px] text-stone-400 font-bold">بخش و سبک فروشگاه *</Label>
                <Select
                  onValueChange={(val) => setValue('categoryType', val as ProductCategoryType)}
                  value={watch('categoryType') || ProductCategoryType.SheikhFood}
                >
                  <SelectTrigger className="bg-stone-950 border-stone-850 text-stone-200 text-xs h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-950 border-stone-850 text-stone-200 text-xs">
                    <SelectItem value="SheikhFood">🥬 شیخ فود (Sheikh Food)</SelectItem>
                    <SelectItem value="SheikhTech">🔊 شیخ نوا (Sheikh Tech)</SelectItem>
                    <SelectItem value="SheikhDigital">💻 شیخ دیجیتال (Sheikh Digital)</SelectItem>
                    <SelectItem value="SheikhHome">🏠 شیخ هوم (Sheikh Home)</SelectItem>
                    <SelectItem value="SheikhNicotine">💨 شیخ نیکوتین (Sheikh Nicotine)</SelectItem>
                    <SelectItem value="SheikhGrooming">✂️ شیخ گرومینگ (Sheikh Grooming)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Base Unit Selection */}
              <div className="space-y-1.5">
                <Label className="text-[11px] text-stone-400 font-bold">واحد اندازه‌گیری پایه *</Label>
                <Select
                  onValueChange={(val) => setValue('baseUnitId', val)}
                  value={watch('baseUnitId') || ''}
                >
                  <SelectTrigger className="bg-stone-950 border-stone-850 text-stone-200 text-xs h-10">
                    <SelectValue placeholder="یک واحد پایه را انتخاب کنید..." />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-950 border-stone-850 text-stone-200 text-xs">
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Feature/Promotion Flags */}
              <div className="space-y-3 border-t border-stone-900 pt-3">
                <Label className="text-[11px] text-stone-400 font-bold">نشان‌ها و پروموشن‌ها</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isNew"
                      {...register('isNew')}
                      className="rounded bg-stone-950 border-stone-800 text-amber-500 focus:ring-0 w-4 h-4"
                    />
                    <Label htmlFor="isNew" className="text-xs text-stone-300 font-bold cursor-pointer">محصول جدید (New Product)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isBestSeller"
                      {...register('isBestSeller')}
                      className="rounded bg-stone-950 border-stone-800 text-amber-500 focus:ring-0 w-4 h-4"
                    />
                    <Label htmlFor="isBestSeller" className="text-xs text-stone-300 font-bold cursor-pointer">محصول پرفروش (Best Seller)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isAmazing"
                      {...register('isAmazing')}
                      className="rounded bg-stone-950 border-stone-800 text-amber-500 focus:ring-0 w-4 h-4"
                    />
                    <Label htmlFor="isAmazing" className="text-xs text-stone-300 font-bold cursor-pointer">پیشنهاد شگفت‌انگیز (Amazing)</Label>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Quick Stats Summary Card */}
          {!isNewProduct && (
            <Card className="bg-[#0D0907]/90 border border-amber-500/15 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-lg">
              <CardHeader className="p-5 border-b border-stone-900 bg-stone-950/40">
                <CardTitle className="text-xs font-black text-stone-300">خلاصه وضعیت محصول</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3 text-xs text-stone-400">
                <div className="flex justify-between">
                  <span>تنوع محصول:</span>
                  <span className="font-bold text-stone-200">{productUnits.length} تنوع</span>
                </div>
                <div className="flex justify-between">
                  <span>تعداد کل دیدگاه‌ها:</span>
                  <span className="font-bold text-stone-200">{reviews.length} دیدگاه</span>
                </div>
                <div className="flex justify-between">
                  <span>امتیاز میانگین:</span>
                  <span className="font-bold text-amber-400">{avgRating} از ۵</span>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

      </div>
    </div>
  );
}
