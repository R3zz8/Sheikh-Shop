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
    if (data.shortDescription) formData.append('shortDescription', data.shortDescription);
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
                  Meta description for search engines. If empty, will use short description or product description.
                </p>
              </div>

              {/* Short Description */}
              <div>
                <Label htmlFor="shortDescription">Short Description (max 300 chars)</Label>
                <Textarea
                  {...register('shortDescription')}
                  id="shortDescription"
                  maxLength={300}
                  rows={2}
                  defaultValue={(product as any)?.shortDescription || ''}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Brief summary used in listings and as fallback for meta description.
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
