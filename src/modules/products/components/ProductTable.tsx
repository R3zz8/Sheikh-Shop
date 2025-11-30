'use client';

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Checkbox,
} from '@/components/ui';
import {
  Edit,
  PlusCircle,
  Trash2,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Eye,
  EyeOff,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { deleteProduct, bulkProductOperation, exportProducts } from '../actions';
import type { ProductsWithImages } from '@/types';
import { useHasRole } from '@/hooks/useRBAC';
import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { ProductStatus } from '@prisma/client';

const ITEMS_PER_PAGE = 10;

const ProductTable = (props: {
  products: ProductsWithImages[];
}) => {
  const { products } = props;
  const canEdit = useHasRole(['ADMIN', 'SUPERADMIN']);

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isBulkOperating, setIsBulkOperating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'name' | 'price' | 'quantity' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue = sortField === 'price' ? a.basePrice : a[sortField];
      let bValue = sortField === 'price' ? b.basePrice : b[sortField];

      if (sortField === 'createdAt') {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, selectedStatus, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Bulk operations
  const handleSelectAll = useCallback(() => {
    if (selectedProducts.size === paginatedProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(paginatedProducts.map(p => p.id)));
    }
  }, [paginatedProducts, selectedProducts.size]);

  const handleSelectProduct = useCallback((productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  }, [selectedProducts]);

  const handleBulkOperation = async (action: 'delete' | 'activate' | 'deactivate' | 'draft') => {
    if (selectedProducts.size === 0) {
      toast.error('Please select at least one product');
      return;
    }

    const actionText = {
      delete: 'delete',
      activate: 'activate',
      deactivate: 'deactivate',
      draft: 'move to draft'
    }[action];

    if (!confirm(`Are you sure you want to ${actionText} ${selectedProducts.size} product(s)?`)) {
      return;
    }

    setIsBulkOperating(true);
    try {
      const formData = new FormData();
      formData.append('productIds', JSON.stringify(Array.from(selectedProducts)));
      formData.append('action', action);

      const result = await bulkProductOperation(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Successfully ${actionText} ${result.affectedCount} product(s)`);
        setSelectedProducts(new Set());
      }
    } catch (error) {
      toast.error('Bulk operation failed');
    } finally {
      setIsBulkOperating(false);
    }
  };

  const handleExport = async () => {
    try {
      const csv = await exportProducts({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: searchTerm || undefined,
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Products exported successfully');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  // Individual product operations
  const onDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(id);
    try {
      await deleteProduct(id);
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(null);
    }
  };

  // Utility functions
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      HONEY: 'bg-amber-100 text-amber-800',
      SAFFRON: 'bg-red-100 text-red-800',
      DATES: 'bg-orange-100 text-orange-800',
      OTHERS: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.OTHERS;
  };

  const getStatusBadgeColor = (status: ProductStatus) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-red-100 text-red-800',
      DRAFT: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || colors.DRAFT;
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg shadow-md mt-4">
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
            <p className="text-sm text-gray-600 mt-1">
              {filteredAndSortedProducts.length} of {products.length} products
              {selectedProducts.size > 0 && ` • ${selectedProducts.size} selected`}
            </p>
          </div>

          <div className="flex gap-2">
            {canEdit && selectedProducts.size > 0 && (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkOperation('activate')}
                  disabled={isBulkOperating}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkOperation('deactivate')}
                  disabled={isBulkOperating}
                >
                  <EyeOff className="w-4 h-4 mr-1" />
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkOperation('draft')}
                  disabled={isBulkOperating}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Draft
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkOperation('delete')}
                  disabled={isBulkOperating}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}

            {canEdit && (
              <Button asChild className="shrink-0">
                <Link href="/dashboard/products/new">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add New Product
                </Link>
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            <option value="HONEY">Honey</option>
            <option value="SAFFRON">Saffron</option>
            <option value="DATES">Dates</option>
            <option value="OTHERS">Others</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DRAFT">Draft</option>
          </select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedStatus('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {canEdit && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProducts.size === paginatedProducts.length && paginatedProducts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead className="font-semibold">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 p-0 h-auto font-semibold"
                >
                  Product
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </TableHead>
              <TableHead className="font-semibold text-center">Category</TableHead>
              <TableHead className="font-semibold text-center">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('price')}
                  className="flex items-center gap-1 p-0 h-auto font-semibold"
                >
                  Price
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </TableHead>
              <TableHead className="font-semibold text-center">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('quantity')}
                  className="flex items-center gap-1 p-0 h-auto font-semibold"
                >
                  Stock
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </TableHead>
              <TableHead className="font-semibold text-center">Units</TableHead>
              <TableHead className="font-semibold text-center">Status</TableHead>
              <TableHead className="font-semibold text-center">Image</TableHead>
              {canEdit && (
                <TableHead className="font-semibold text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts && paginatedProducts.length > 0 ? (
              paginatedProducts.map((product: ProductsWithImages) => (
                <TableRow key={product.id} className="hover:bg-gray-50">
                  {canEdit && (
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.has(product.id)}
                        onCheckedChange={() => handleSelectProduct(product.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(product.category)}`}>
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {formatPrice(product.basePrice)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.quantity > 10
                      ? 'bg-green-100 text-green-800'
                      : product.quantity > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {product.quantity} in stock
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center space-y-1">
                      <span className="text-sm font-medium text-gray-900">
                        {product.units?.length || 0} units
                      </span>
                      {product.units && product.units.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {product.units.slice(0, 2).map((unit, index) => (
                            <span
                              key={unit.id}
                              className={`px-2 py-1 rounded text-xs ${
                                unit.isActive && unit.stock > 0
                                  ? 'bg-green-100 text-green-800'
                                  : unit.isActive
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {unit.name}
                            </span>
                          ))}
                          {product.units.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{product.units.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(product.status as any)}`}>
                      {product.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Image
                        src={product.images[0]?.image || '/assets/noImage.jpg'}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded-md object-cover"
                      />
                      {product.images.length > 1 && (
                        <span className="ml-1 text-xs text-gray-500">
                          +{product.images.length - 1}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/products/${product.id}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteProduct(product.id)}
                          disabled={isDeleting === product.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          {isDeleting === product.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={canEdit ? 9 : 8} className="text-center py-12">
                  <div className="text-gray-500">
                    {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' ? (
                      <>
                        <p className="text-lg font-medium mb-2">No products found</p>
                        <p className="text-sm">Try adjusting your search or filter criteria</p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-medium mb-2">No products yet</p>
                        <p className="text-sm mb-4">Create your first product to get started</p>
                        {canEdit && (
                          <Button asChild>
                            <Link href="/dashboard/products/new">
                              <PlusCircle className="w-4 h-4 mr-2" />
                              Add Your First Product
                            </Link>
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
