'use client';

import React, { useState, useEffect } from 'react';
import { useRequireRole } from '@/hooks/useRBAC';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/lib/currency';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Eye,
  Truck,
  PackageCheck,
  Edit,
  User,
  MapPin,
  Receipt,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import OrderTimeline from '@/components/orders/OrderTimeline';

interface AdminOrder {
  id: string;
  userId: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  shippingAddress: any;
  trackingCode: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  items: Array<{
    id: string;
    productId: string;
    productName: string | null;
    productImage: string | null;
    unitName: string | null;
    quantity: number;
    price: number;
  }>;
  transactions: Array<{
    id: string;
    authority: string;
    reference: string | null;
    status: string;
  }>;
}

export default function AdminOrdersDashboardPage() {
  useRequireRole(['ADMIN', 'SUPERADMIN']);

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Edit State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null);
  const [editStatus, setEditStatus] = useState<string>('PENDING');
  const [editPaymentStatus, setEditPaymentStatus] = useState<string>('PENDING');
  const [editTrackingCode, setEditTrackingCode] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  const limit = 20;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (paymentStatusFilter !== 'all') params.append('paymentStatus', paymentStatusFilter);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setOrders(data.orders);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      } else {
        toast.error('خطا در دریافت لیست سفارشات');
      }
    } catch (err) {
      console.error(err);
      toast.error('ارتباط با سرور برقرار نشد');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search, statusFilter, paymentStatusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, paymentStatusFilter]);

  const handleOpenEdit = (order: AdminOrder, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingOrder(order);
    setEditStatus(order.status);
    setEditPaymentStatus(order.paymentStatus);
    setEditTrackingCode(order.trackingCode || '');
    setEditModalOpen(true);
  };

  const handleSaveOrderChanges = async () => {
    if (!editingOrder) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/admin/orders/${editingOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          paymentStatus: editPaymentStatus,
          trackingCode: editTrackingCode,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || 'سفارش با موفقیت به‌روزرسانی شد');
        setEditModalOpen(false);
        fetchOrders();
        if (selectedOrder && selectedOrder.id === editingOrder.id) {
          setSelectedOrder(data.order);
        }
      } else {
        toast.error(data.error || 'خطا در ویرایش سفارش');
      }
    } catch (err) {
      console.error(err);
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setUpdating(false);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    if (status === 'CANCELLED') return <Badge variant="destructive">لغو شده</Badge>;
    if (status === 'DELIVERED' || status === 'COMPLETED') return <Badge className="bg-green-600">تحویل داده شد</Badge>;
    if (status === 'SHIPPED') return <Badge className="bg-blue-600">ارسال شد</Badge>;
    if (status === 'PROCESSING') return <Badge className="bg-amber-600">در حال پردازش</Badge>;
    return <Badge variant="secondary">در انتظار</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    if (status === 'PAID') return <Badge className="bg-emerald-600">پرداخت شده</Badge>;
    if (status === 'FAILED') return <Badge variant="destructive">ناموفق</Badge>;
    if (status === 'REFUNDED') return <Badge variant="outline">مسترد شده</Badge>;
    return <Badge variant="secondary">در انتظار پرداخت</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6 font-vazirmatn text-right" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">مدیریت سفارشات (Order Management)</h1>
          <p className="text-stone-400 text-sm mt-1">
            مشاهده کامل خریداران، اقلام، وضعیت ارسال، پرداخت و کد مرسولات پستی
          </p>
        </div>
        <Button variant="outline" onClick={fetchOrders} className="border-amber-500/20 text-stone-300">
          <RefreshCw className="h-4 w-4 ml-2" />
          به‌روزرسانی
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-stone-900/80 border-stone-800">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="جستجو با شماره سفارش، کد رهگیری، نام یا ایمیل..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 bg-stone-950 border-stone-800 text-white"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-stone-950 border-stone-800 text-white">
                <SelectValue placeholder="وضعیت سفارش" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه وضعیت‌های سفارش</SelectItem>
                <SelectItem value="PENDING">در انتظار</SelectItem>
                <SelectItem value="PROCESSING">در حال پردازش</SelectItem>
                <SelectItem value="SHIPPED">ارسال شده</SelectItem>
                <SelectItem value="DELIVERED">تحویل داده شده</SelectItem>
                <SelectItem value="CANCELLED">لغو شده</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-stone-950 border-stone-800 text-white">
                <SelectValue placeholder="وضعیت پرداخت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه وضعیت‌های پرداخت</SelectItem>
                <SelectItem value="PENDING">در انتظار پرداخت</SelectItem>
                <SelectItem value="PAID">پرداخت شده</SelectItem>
                <SelectItem value="FAILED">پرداخت ناموفق</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-stone-900/80 border-stone-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-stone-950">
              <TableRow className="border-stone-800">
                <TableHead className="text-right text-stone-400">شماره سفارش</TableHead>
                <TableHead className="text-right text-stone-400">خریدار</TableHead>
                <TableHead className="text-right text-stone-400">مبلغ کل</TableHead>
                <TableHead className="text-right text-stone-400">وضعیت پرداخت</TableHead>
                <TableHead className="text-right text-stone-400">وضعیت سفارش</TableHead>
                <TableHead className="text-right text-stone-400">کد مرسوله</TableHead>
                <TableHead className="text-right text-stone-400">تاریخ ثبت</TableHead>
                <TableHead className="text-center text-stone-400">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <Skeleton className="h-10 w-full bg-stone-800" />
                    </TableCell>
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-stone-500">
                    هیچ سفارشی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const customerName = order.user?.firstName
                    ? `${order.user.firstName} ${order.user.lastName || ''}`.trim()
                    : order.user?.email || 'کاربر مهمان';

                  const formattedDate = new Date(order.createdAt).toLocaleDateString('fa-IR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <TableRow
                      key={order.id}
                      className="border-stone-800 cursor-pointer hover:bg-stone-800/50"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <TableCell className="font-mono text-xs font-bold text-amber-300">
                        {order.id}
                      </TableCell>
                      <TableCell className="text-stone-200 text-sm font-medium">
                        {customerName}
                      </TableCell>
                      <TableCell className="font-extrabold text-amber-300">
                        {formatPrice(Number(order.totalPrice) || Number(order.total))}
                      </TableCell>
                      <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                      <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                      <TableCell className="font-mono text-xs text-stone-300">
                        {order.trackingCode || <span className="text-stone-600">-</span>}
                      </TableCell>
                      <TableCell className="text-xs text-stone-400">{formattedDate}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleOpenEdit(order, e)}
                            className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                            className="text-stone-400 hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-stone-800 text-xs text-stone-400">
            <div>
              نمایش {(page - 1) * limit + 1} تا {Math.min(page * limit, total)} از {total} سفارش
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="border-stone-800"
              >
                قبلی
              </Button>
              <span>صفحه {page} از {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="border-stone-800"
              >
                بعدی
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl bg-stone-900 border-amber-500/20 text-white font-vazirmatn text-right" dir="rtl">
          <DialogHeader className="border-b border-stone-800 pb-4">
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              <span>جزئیات کامل سفارش #{selectedOrder?.id}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedOrder && handleOpenEdit(selectedOrder)}
                className="border-amber-500/30 text-amber-300"
              >
                <Edit className="w-4 h-4 ml-1.5" />
                ویرایش وضعیت
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pl-1">
              {/* Timeline */}
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800">
                <OrderTimeline
                  orderStatus={selectedOrder.status}
                  paymentStatus={selectedOrder.paymentStatus}
                  trackingCode={selectedOrder.trackingCode}
                />
              </div>

              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2 text-xs">
                  <h4 className="font-bold text-sm text-amber-400 flex items-center gap-1.5 mb-2">
                    <User className="w-4 h-4" /> خریدار
                  </h4>
                  <p>نام: <strong className="text-white">{selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</strong></p>
                  <p>ایمیل: <strong className="text-white font-mono">{selectedOrder.user?.email}</strong></p>
                </div>

                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2 text-xs">
                  <h4 className="font-bold text-sm text-amber-400 flex items-center gap-1.5 mb-2">
                    <MapPin className="w-4 h-4" /> تحویل و آدرس
                  </h4>
                  <p>گیرنده: <strong className="text-white">{selectedOrder.shippingAddress?.recipientName}</strong></p>
                  <p>تماس: <strong className="text-white font-mono">{selectedOrder.shippingAddress?.recipientPhone || selectedOrder.shippingAddress?.phone}</strong></p>
                  <p>آدرس: <strong className="text-white">{selectedOrder.shippingAddress?.province}، {selectedOrder.shippingAddress?.city}، {selectedOrder.shippingAddress?.address}</strong></p>
                  <p>کد پستی: <strong className="text-amber-300 font-mono">{selectedOrder.shippingAddress?.postalCode}</strong></p>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
                <h4 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4" /> کالاهای خریداری شده
                </h4>
                <div className="divide-y divide-stone-800">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{item.productName || item.productId}</span>
                        {item.unitName && <span className="text-stone-400">واحد: {item.unitName} | </span>}
                        <span className="text-stone-400">تعداد: {item.quantity} × {formatPrice(Number(item.price))}</span>
                      </div>
                      <span className="font-bold text-amber-300 text-sm">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction / ZarinPal */}
              {selectedOrder.transactions?.[0] && (
                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 text-xs space-y-1.5">
                  <h4 className="font-bold text-sm text-amber-400 flex items-center gap-1.5 mb-2">
                    <Receipt className="w-4 h-4" /> تراکنش بانکی (زرین‌پال)
                  </h4>
                  <p>شناسه Authority: <span className="font-mono text-stone-300">{selectedOrder.transactions[0].authority}</span></p>
                  <p>کد پیگیری Ref ID: <span className="font-mono text-green-400 font-bold">{selectedOrder.transactions[0].reference || 'ندارد'}</span></p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md bg-stone-900 border-amber-500/20 text-white font-vazirmatn text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">ویرایش وضعیت سفارش #{editingOrder?.id}</DialogTitle>
            <DialogDescription className="text-stone-400 text-xs">
              به‌روزرسانی وضعیت سفارش، وضعیت پرداخت و کد مرسوله پستی
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-stone-300 mb-1.5 block">وضعیت سفارش</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="bg-stone-950 border-stone-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">در انتظار (PENDING)</SelectItem>
                  <SelectItem value="PROCESSING">در حال پردازش (PROCESSING)</SelectItem>
                  <SelectItem value="SHIPPED">ارسال شده (SHIPPED)</SelectItem>
                  <SelectItem value="DELIVERED">تحویل داده شد (DELIVERED)</SelectItem>
                  <SelectItem value="CANCELLED">لغو شده (CANCELLED)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 mb-1.5 block">وضعیت پرداخت</label>
              <Select value={editPaymentStatus} onValueChange={setEditPaymentStatus}>
                <SelectTrigger className="bg-stone-950 border-stone-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">در انتظار پرداخت</SelectItem>
                  <SelectItem value="PAID">پرداخت شده (PAID)</SelectItem>
                  <SelectItem value="FAILED">پرداخت ناموفق</SelectItem>
                  <SelectItem value="REFUNDED">مسترد شده</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 mb-1.5 block">کد مرسوله پستی / رهگیری</label>
              <Input
                value={editTrackingCode}
                onChange={(e) => setEditTrackingCode(e.target.value)}
                placeholder="مثال: 123456789012345"
                className="bg-stone-950 border-stone-800 text-white font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-stone-800">
              <Button variant="ghost" onClick={() => setEditModalOpen(false)}>
                انصراف
              </Button>
              <Button
                onClick={handleSaveOrderChanges}
                disabled={updating}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold"
              >
                {updating ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
