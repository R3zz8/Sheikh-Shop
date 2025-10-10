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

interface Unit {
  id: string;
  name: string;
  symbol: string;
  multiplier: number;
  sortOrder: number;
  isActive: boolean;
}

const ProductForm = (props: { product: Product | null }) => {
  const { product } = props;
  const router = useRouter();
  const isNewProduct = !product?.id;

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
  const [loadingUnits, setLoadingUnits] = useState(true);

  const handleSubmit = async (formData: FormData) => {
    setSubmitted(true);
    action(formData);
  };

  // Load units on component mount
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await fetch('/api/units');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUnits(result.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch units:', error);
      } finally {
        setLoadingUnits(false);
      }
    };

    fetchUnits();
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
