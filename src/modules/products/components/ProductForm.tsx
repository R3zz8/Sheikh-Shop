'use client';

import type { Product, ProductUnit } from '@prisma/client';
import { ProductCategory, ProductCategoryType } from '@prisma/client';
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
import { useForm } from 'react-hook-form';
import { upsertProduct as serverUpsertProduct } from '../actions';
import UploadImage from './UploadImage';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProductUnitForm {
  id?: string;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
  isFeatured?: boolean;
  discountPercentage?: number;
  discountStartDate?: string;
  discountEndDate?: string;
}

const ProductForm = (props: { product: Product | null }) => {
  const { product } = props;
  const router = useRouter();
  const { register, handleSubmit, setValue } = useForm<Product>();
  const [uploading, setUploading] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [productUnits, setProductUnits] = useState<ProductUnitForm[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  // Load existing product units when editing
  useEffect(() => {
    if (product?.id) {
      loadProductUnits();
    } else {
      // Initialize with one default unit for new products
      setProductUnits([{
        name: 'Default Unit',
        price: 0,
        stock: 0,
        isActive: true,
        isFeatured: true,
        discountPercentage: 0,
        discountStartDate: '',
        discountEndDate: ''
      }]);
    }
  }, [product?.id]);

  const loadProductUnits = async () => {
    if (!product?.id) return;
    
    setLoadingUnits(true);
    try {
      const response = await fetch(`/api/dashboard/products/${product.id}/units`, {
        credentials: 'include',
      });
      if (response.ok) {
        const units = await response.json();
        setProductUnits(units.map((unit: ProductUnit) => ({
          id: unit.id,
          name: unit.name,
          price: Number(unit.price),
          stock: unit.stock,
          isActive: unit.isActive,
          isFeatured: false, // Default to false, will be enhanced with API
          discountPercentage: 0,
          discountStartDate: '',
          discountEndDate: ''
        })));
      }
    } catch (error) {
      console.error('Failed to load product units:', error);
    } finally {
      setLoadingUnits(false);
    }
  };

  const onSubmitForm = async (data: any) => {
    // Prepare FormData for server action
    const formData = new FormData();
    
    // Basic fields
    if (product?.id) formData.append('id', product.id);
    formData.append('name', data.name || '');
    formData.append('category', data.category || ProductCategory.OTHERS);
    formData.append('description', data.description || '');
    formData.append('price', (data.basePrice || 0).toString());
    formData.append('quantity', (data.quantity || 0).toString());
    formData.append('status', data.status || 'ACTIVE');
    formData.append('categoryType', data.categoryType || ProductCategoryType.SheikhFood);
    
    // SEO fields
    if (data.slug) formData.append('slug', data.slug);
    if (data.seoTitle) formData.append('seoTitle', data.seoTitle);
    if (data.seoDescription) formData.append('seoDescription', data.seoDescription);
    if (data.h1Override) formData.append('h1Override', data.h1Override);
    if (data.excerpt) formData.append('excerpt', data.excerpt);
    
    // New e-commerce fields
    if (data.brand) formData.append('brand', data.brand);
    if (data.sku) formData.append('sku', data.sku);
    
    // Parse features from textarea (one per line)
    if (data.features) {
      const featuresArray = typeof data.features === 'string' 
        ? data.features.split('\n').filter((f: string) => f.trim())
        : (Array.isArray(data.features) ? data.features : []);
      if (featuresArray.length > 0) {
        formData.append('features', JSON.stringify(featuresArray));
      }
    }
    
    // Parse tags from comma-separated string
    if (data.tags) {
      const tagsArray = typeof data.tags === 'string'
        ? data.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t)
        : (Array.isArray(data.tags) ? data.tags : []);
      if (tagsArray.length > 0) {
        formData.append('tags', JSON.stringify(tagsArray));
      }
    }
    
    // Parse materials from comma-separated string
    if (data.materials) {
      const materialsArray = typeof data.materials === 'string'
        ? data.materials.split(',').map((m: string) => m.trim()).filter((m: string) => m)
        : (Array.isArray(data.materials) ? data.materials : []);
      if (materialsArray.length > 0) {
        formData.append('materials', JSON.stringify(materialsArray));
      }
    }
    
    // Parse JSON fields
    if (data.technicalSpecs) {
      try {
        const specs = typeof data.technicalSpecs === 'string' 
          ? JSON.parse(data.technicalSpecs) 
          : data.technicalSpecs;
        formData.append('technicalSpecs', JSON.stringify(specs));
      } catch (e) {
        console.error('Invalid technicalSpecs JSON:', e);
      }
    }
    
    if (data.dimensions) {
      try {
        const dims = typeof data.dimensions === 'string'
          ? JSON.parse(data.dimensions)
          : data.dimensions;
        formData.append('dimensions', JSON.stringify(dims));
      } catch (e) {
        console.error('Invalid dimensions JSON:', e);
      }
    }
    
    if (data.weight !== undefined && data.weight !== null && data.weight !== '') {
      formData.append('weight', data.weight.toString());
    }
    if (data.weightUnit) formData.append('weightUnit', data.weightUnit);
    if (data.warranty) formData.append('warranty', data.warranty);
    if (data.origin) formData.append('origin', data.origin);
    if (data.color) formData.append('color', data.color);
    if (data.scent) formData.append('scent', data.scent);
    if (data.flavor) formData.append('flavor', data.flavor);
    
    if (data.ogTitle) formData.append('ogTitle', data.ogTitle);
    if (data.ogDescription) formData.append('ogDescription', data.ogDescription);
    if (data.ogImage) formData.append('ogImage', data.ogImage);
    if (data.canonicalUrl) formData.append('canonicalUrl', data.canonicalUrl);
    if (data.metaKeywords) formData.append('metaKeywords', data.metaKeywords);
    
    // Use server action
    const result = await serverUpsertProduct(
      { data: product, error: null },
      formData
    );
    
    if (result.error) {
      console.error('Product save error:', result.error);
      alert('Failed to save product: ' + (result.error.general || 'Unknown error'));
      return;
    }
    
    const savedProduct = result.data;
    
    if (!savedProduct) {
      alert('Failed to save product');
      return;
    }
    
    // Then save/update product units
    if (productUnits.length > 0) {
      await saveProductUnits(savedProduct.id);
    }
    
    // Redirect to product list
    router.push('/dashboard/products');
    router.refresh();
  };

  const saveProductUnits = async (productId: string) => {
    try {
      // Save each unit
      for (const unit of productUnits) {
        const unitData = {
          name: unit.name,
          price: unit.price,
          stock: unit.stock,
          isActive: unit.isActive
        };

        if (unit.id) {
          // Update existing unit
          await fetch(`/api/dashboard/products/${productId}/units/${unit.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(unitData)
          });
        } else {
          // Create new unit
          await fetch(`/api/dashboard/products/${productId}/units`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(unitData)
          });
        }
      }
    } catch (error) {
      console.error('Failed to save product units:', error);
    }
  };

  // Unit management functions
  const addProductUnit = () => {
    setProductUnits([...productUnits, {
      name: '',
      price: 0,
      stock: 0,
      isActive: true,
      isFeatured: false,
      discountPercentage: 0,
      discountStartDate: '',
      discountEndDate: ''
    }]);
  };

  const removeProductUnit = (index: number) => {
    if (productUnits.length > 1) {
      setProductUnits(productUnits.filter((_, i) => i !== index));
    }
  };

  const updateProductUnit = (index: number, field: keyof ProductUnitForm, value: any) => {
    const updated = [...productUnits];
    updated[index] = { 
      ...updated[index], 
      [field]: value 
    } as ProductUnitForm;
    setProductUnits(updated);
  };

  async function handleUpload(file: File) {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { 
        method: 'POST', 
        credentials: 'include',
        body: formData 
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Upload failed');
      setTempImageUrl(json.url as string);
      // set imageUrl to be saved
      setValue('description' as any, (product?.description || '')); // keep form dirty
      (setValue as any)('imageUrl', json.url);
    } catch (e: any) {
      alert(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className="w-[500px] mx-auto mt-10">
      <form className="max-w-lg" onSubmit={handleSubmit(onSubmitForm)}>
        <CardHeader>
          <CardTitle> Product</CardTitle>
          <CardDescription>Create New Product</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="my-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              {...register('name')}
              id="name"
              required
              defaultValue={product?.name || ''}
            />
          </div>
          <div className="my-2">
            <Label htmlFor="category">Category</Label>
            <Select
              required
              onValueChange={(value) =>
                setValue('category', value as ProductCategory)
              }
              defaultValue={product?.category || ProductCategory.OTHERS}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ProductCategory).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="my-2">
            <Label htmlFor="categoryType">Category Type</Label>
            <Select
              required
              onValueChange={(value) =>
                setValue('categoryType', value as ProductCategoryType)
              }
              defaultValue={product?.categoryType || ProductCategoryType.SheikhFood}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ProductCategoryType).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="my-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              {...register('description')}
              id="description"
              defaultValue={product?.description || ''}
            />
          </div>
          <div className="my-2">
            <Label htmlFor="price">Price</Label>
            <Input
              {...register('basePrice' as any)}
              type="number"
              id="price"
              step="0.01"
              defaultValue={product?.basePrice || ''}
            />
          </div>
          <div className="my-2">
            <Label htmlFor="quantity">Quantity (Legacy)</Label>
            <Input
              {...register('quantity')}
              type="number"
              id="quantity"
              defaultValue={product?.quantity || ''}
            />
            <p className="text-xs text-gray-500 mt-1">
              This field is kept for backward compatibility. Use Product Units below for better inventory management.
            </p>
          </div>

          {/* Product Units Management */}
          <div className="my-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Package className="w-4 h-4" />
                Product Units
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addProductUnit}
                className="flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Unit
              </Button>
            </div>
            
            {loadingUnits ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading units...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {productUnits.map((unit, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Unit {index + 1}</h4>
                      {productUnits.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProductUnit(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`unit-name-${index}`}>Unit Name</Label>
                        <Input
                          id={`unit-name-${index}`}
                          value={unit.name}
                          onChange={(e) => updateProductUnit(index, 'name', e.target.value)}
                          placeholder="e.g., 500g, 1kg, Box"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`unit-price-${index}`}>Price</Label>
                        <Input
                          id={`unit-price-${index}`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={unit.price}
                          onChange={(e) => updateProductUnit(index, 'price', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`unit-stock-${index}`}>Stock</Label>
                        <Input
                          id={`unit-stock-${index}`}
                          type="number"
                          min="0"
                          value={unit.stock}
                          onChange={(e) => updateProductUnit(index, 'stock', parseInt(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`unit-active-${index}`}
                          checked={unit.isActive}
                          onChange={(e) => updateProductUnit(index, 'isActive', e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor={`unit-active-${index}`}>Active</Label>
                      </div>
                    </div>

                    {/* Featured Unit */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`unit-featured-${index}`}
                        checked={unit.isFeatured || false}
                        onChange={(e) => updateProductUnit(index, 'isFeatured', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor={`unit-featured-${index}`} className="text-amber-600 font-medium">
                        ⭐ Featured Unit (Default Selection)
                      </Label>
                    </div>

                    {/* Unit Discount */}
                    <div className="border-t pt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Unit Discount</h5>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor={`unit-discount-${index}`}>Discount %</Label>
                          <Input
                            id={`unit-discount-${index}`}
                            type="number"
                            min="0"
                            max="100"
                            value={unit.discountPercentage || 0}
                            onChange={(e) => updateProductUnit(index, 'discountPercentage', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`unit-discount-start-${index}`}>Start Date</Label>
                          <Input
                            id={`unit-discount-start-${index}`}
                            type="date"
                            value={unit.discountStartDate || ''}
                            onChange={(e) => updateProductUnit(index, 'discountStartDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`unit-discount-end-${index}`}>End Date</Label>
                          <Input
                            id={`unit-discount-end-${index}`}
                            type="date"
                            value={unit.discountEndDate || ''}
                            onChange={(e) => updateProductUnit(index, 'discountEndDate', e.target.value)}
                          />
                        </div>
                      </div>
                      {(unit.discountPercentage || 0) > 0 && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                          <span className="text-green-700">
                            Discounted Price: ${((unit.price * (1 - (unit.discountPercentage || 0) / 100)).toFixed(2))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEO Fields Section */}
          <div className="my-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
            <div className="space-y-4">
              {/* Slug */}
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  {...register('slug')}
                  id="slug"
                  placeholder="auto-generated-from-name"
                  defaultValue={product?.slug || ''}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to auto-generate from product name. Only lowercase letters, numbers, and hyphens.
                </p>
              </div>

              {/* SEO Title */}
              <div>
                <Label htmlFor="seoTitle">SEO Title (max 60 chars)</Label>
                <Input
                  {...register('seoTitle')}
                  id="seoTitle"
                  maxLength={60}
                  defaultValue={product?.seoTitle || ''}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used in search results. If empty, will use product name.
                </p>
              </div>

              {/* SEO Description */}
              <div>
                <Label htmlFor="seoDescription">SEO Description (max 160 chars)</Label>
                <Textarea
                  {...register('seoDescription')}
                  id="seoDescription"
                  maxLength={160}
                  rows={2}
                  defaultValue={product?.seoDescription || ''}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Meta description for search engines. If empty, will use excerpt or product description.
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <Label htmlFor="excerpt">Excerpt (auto-generated if empty)</Label>
                <Textarea
                  {...register('excerpt' as any)}
                  id="excerpt"
                  rows={3}
                  defaultValue={(product as any)?.excerpt || ''}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Brief summary (160-240 chars). Used in listings and as fallback for meta description. Auto-generated from description if empty.
                </p>
              </div>

              {/* H1 Override */}
              <div>
                <Label htmlFor="h1Override">H1 Override (max 100 chars)</Label>
                <Input
                  {...register('h1Override')}
                  id="h1Override"
                  maxLength={100}
                  defaultValue={(product as any)?.h1Override || ''}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Custom H1 text for product detail page. If empty, will use SEO title or product name.
                </p>
              </div>

              {/* Open Graph Title */}
              <div>
                <Label htmlFor="ogTitle">Open Graph Title (max 60 chars)</Label>
                <Input
                  {...register('ogTitle')}
                  id="ogTitle"
                  maxLength={60}
                  defaultValue={(product as any)?.ogTitle || ''}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Title for social media sharing. If empty, will use SEO title.
                </p>
              </div>

              {/* Open Graph Description */}
              <div>
                <Label htmlFor="ogDescription">Open Graph Description (max 160 chars)</Label>
                <Textarea
                  {...register('ogDescription')}
                  id="ogDescription"
                  maxLength={160}
                  rows={2}
                  defaultValue={(product as any)?.ogDescription || ''}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Description for social media sharing. If empty, will use SEO description.
                </p>
              </div>

              {/* Open Graph Image */}
              <div>
                <Label htmlFor="ogImage">Open Graph Image URL</Label>
                <Input
                  {...register('ogImage')}
                  id="ogImage"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  defaultValue={product?.ogImage || ''}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Image URL for social media sharing (1200x630px recommended). If empty, will use product image.
                </p>
              </div>

              {/* Canonical URL */}
              <div>
                <Label htmlFor="canonicalUrl">Canonical URL</Label>
                <Input
                  {...register('canonicalUrl')}
                  id="canonicalUrl"
                  type="url"
                  placeholder="https://sheikhshops.com/products/product-slug"
                  defaultValue={product?.canonicalUrl || ''}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Canonical URL for this product. If empty, will auto-generate from slug.
                </p>
              </div>

              {/* Meta Keywords */}
              <div>
                <Label htmlFor="metaKeywords">Meta Keywords (comma-separated)</Label>
                <Input
                  {...register('metaKeywords')}
                  id="metaKeywords"
                  placeholder="premium, luxury, authentic, arabian"
                  defaultValue={(product as any)?.metaKeywords?.join(', ') || ''}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comma-separated keywords for SEO. If empty, will auto-generate from product name and category.
                </p>
              </div>
            </div>
          </div>

          {/* E-Commerce Fields Section */}
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold">E-Commerce Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Brand */}
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  {...register('brand' as any)}
                  id="brand"
                  maxLength={100}
                  placeholder="Brand name"
                  defaultValue={(product as any)?.brand || ''}
                />
              </div>

              {/* SKU */}
              <div>
                <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                <Input
                  {...register('sku' as any)}
                  id="sku"
                  maxLength={100}
                  placeholder="PROD-001"
                  defaultValue={(product as any)?.sku || ''}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Unique product identifier
                </p>
              </div>

              {/* Origin */}
              <div>
                <Label htmlFor="origin">Country of Origin</Label>
                <Input
                  {...register('origin' as any)}
                  id="origin"
                  maxLength={100}
                  placeholder="Iran, Saudi Arabia, etc."
                  defaultValue={(product as any)?.origin || ''}
                />
              </div>

              {/* Weight */}
              <div>
                <Label htmlFor="weight">Weight</Label>
                <div className="flex gap-2">
                  <Input
                    {...register('weight' as any, { valueAsNumber: true })}
                    id="weight"
                    type="number"
                    step="0.01"
                    placeholder="1.5"
                    defaultValue={(product as any)?.weight || ''}
                  />
                  <Select
                    onValueChange={(value) => setValue('weightUnit' as any, value)}
                    defaultValue={(product as any)?.weightUnit || 'kg'}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="lb">lb</SelectItem>
                      <SelectItem value="oz">oz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Color */}
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  {...register('color' as any)}
                  id="color"
                  maxLength={50}
                  placeholder="Red, Blue, etc."
                  defaultValue={(product as any)?.color || ''}
                />
              </div>

              {/* Scent */}
              <div>
                <Label htmlFor="scent">Scent</Label>
                <Input
                  {...register('scent' as any)}
                  id="scent"
                  maxLength={50}
                  placeholder="Rose, Lavender, etc."
                  defaultValue={(product as any)?.scent || ''}
                />
              </div>

              {/* Flavor */}
              <div>
                <Label htmlFor="flavor">Flavor</Label>
                <Input
                  {...register('flavor' as any)}
                  id="flavor"
                  maxLength={50}
                  placeholder="Vanilla, Chocolate, etc."
                  defaultValue={(product as any)?.flavor || ''}
                />
              </div>

              {/* Warranty */}
              <div className="md:col-span-2">
                <Label htmlFor="warranty">Warranty</Label>
                <Input
                  {...register('warranty' as any)}
                  id="warranty"
                  maxLength={200}
                  placeholder="1 year manufacturer warranty"
                  defaultValue={(product as any)?.warranty || ''}
                />
              </div>
            </div>

            {/* Features */}
            <div>
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                {...register('features' as any)}
                id="features"
                rows={4}
                placeholder="Premium quality materials&#10;Comfortable and durable design&#10;Perfect for everyday use"
                defaultValue={(product as any)?.features?.join('\n') || ''}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter one feature per line. These will be displayed as a bullet list.
              </p>
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                {...register('tags' as any)}
                id="tags"
                placeholder="premium, organic, handmade, luxury"
                defaultValue={(product as any)?.tags?.join(', ') || ''}
              />
              <p className="text-xs text-gray-500 mt-1">
                Comma-separated tags for search and filtering
              </p>
            </div>

            {/* Materials */}
            <div>
              <Label htmlFor="materials">Materials (comma-separated)</Label>
              <Input
                {...register('materials' as any)}
                id="materials"
                placeholder="Cotton, Silk, Wool"
                defaultValue={(product as any)?.materials?.join(', ') || ''}
              />
            </div>

            {/* Technical Specs */}
            <div>
              <Label htmlFor="technicalSpecs">Technical Specifications (JSON)</Label>
              <Textarea
                {...register('technicalSpecs' as any)}
                id="technicalSpecs"
                rows={6}
                placeholder='{"length": "10cm", "width": "5cm", "height": "3cm", "unit": "cm"}'
                defaultValue={(product as any)?.technicalSpecs ? JSON.stringify((product as any).technicalSpecs, null, 2) : ''}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter as JSON object. Example: {"{"}"length": "10cm", "width": "5cm"{"}"}
              </p>
            </div>

            {/* Dimensions */}
            <div>
              <Label htmlFor="dimensions">Dimensions (JSON)</Label>
              <Textarea
                {...register('dimensions' as any)}
                id="dimensions"
                rows={4}
                placeholder='{"length": 10, "width": 5, "height": 3, "unit": "cm"}'
                defaultValue={(product as any)?.dimensions ? JSON.stringify((product as any).dimensions, null, 2) : ''}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter as JSON object with length, width, height, and unit.
              </p>
            </div>
          </div>

          {/* Image upload for new product */}
          {!product?.id && (
            <div className="my-2">
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUpload(file);
                }}
                disabled={uploading}
              />
              {tempImageUrl && (
                <img src={tempImageUrl} alt="preview" className="mt-3 rounded-md border" />
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/dashboard/products">Back</Link>
          </Button>
          <Button type="submit" disabled={uploading}>
            {product?.id ? 'Update Product' : 'Add Product'}
          </Button>
        </CardFooter>
      </form>
      {product?.id && (
        <CardFooter>
          <UploadImage productId={product?.id} />
        </CardFooter>
      )}
    </Card>
  );
};

export default ProductForm;
