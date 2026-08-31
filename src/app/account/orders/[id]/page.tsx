import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getServerUser } from '@/lib/auth/server-auth';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/currency';
import OrderTimeline from '@/components/orders/OrderTimeline';
import {
  ArrowRight,
  Package,
  MapPin,
  User,
  Phone,
  Mail,
  Receipt,
  CreditCard,
  ShieldCheck,
  FileText,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'جزئیات سفارش | فروشگاه شیخ',
  robots: 'noindex, nofollow',
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const user = await getServerUser();

  if (!user) {
    redirect('/login?callbackUrl=/account/orders');
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      transactions: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Security check: Customer can ONLY access their own order
  const isOwner = order.userId === user.id;
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPERADMIN';

  if (!isOwner && !isAdmin) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center p-4 font-vazirmatn text-right" dir="rtl">
        <Card className="bg-stone-900 border-red-500/30 p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">عدم دسترسی</h2>
          <p className="text-stone-300 text-sm mb-6">شما اجازه مشاهده اطلاعات این سفارش را ندارید.</p>
          <Link href="/account/orders">
            <Button className="bg-amber-500 text-black font-bold">بازگشت به سفارش‌های من</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const shippingAddr = (order.shippingAddress as any) || {};
  const completedTx = order.transactions.find((t: any) => t.status === 'COMPLETED') || order.transactions[0];
  const formattedDate = new Date(order.createdAt).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subtotal = Number(order.subtotal) || Number(order.total);
  const shipping = Number(order.shippingCost);
  const discount = Number(order.discount);
  const grandTotal = Number(order.totalPrice) || (subtotal + shipping - discount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-black text-right font-vazirmatn text-white py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-500/15 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/account/orders">
                <Button variant="ghost" size="icon" className="text-stone-400 hover:text-white rounded-full">
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400">
                جزئیات سفارش
              </h1>
            </div>
            <p className="text-stone-400 text-xs sm:text-sm mt-1 flex items-center gap-2">
              <span className="font-mono text-amber-300 font-bold">#{order.id}</span>
              <span>•</span>
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </p>
          </div>

          <Link href="/account/orders">
            <Button variant="outline" className="border-amber-500/20 text-amber-200 hover:bg-amber-500/10 rounded-xl text-xs gap-2">
              بازگشت به لیست سفارش‌ها
            </Button>
          </Link>
        </div>

        {/* Order Status Timeline Banner */}
        <Card className="bg-stone-900/80 border border-amber-500/20 rounded-3xl p-6 backdrop-blur-xl">
          <CardHeader className="p-0 mb-6 border-b border-stone-800 pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              وضعیت سفارش
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <OrderTimeline
              orderStatus={order.status}
              paymentStatus={order.paymentStatus}
              trackingCode={order.trackingCode}
            />
          </CardContent>
        </Card>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Purchased Items List (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="bg-stone-900/80 border border-amber-500/20 rounded-3xl overflow-hidden backdrop-blur-xl">
              <CardHeader className="bg-gradient-to-l from-amber-950/40 via-amber-900/10 to-stone-900/20 border-b border-amber-500/15 p-6">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2.5">
                  <Package className="w-5 h-5 text-amber-400" />
                  اقلام سفارش داده شده ({order.items.length} کالا)
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 divide-y divide-stone-800">
                {order.items.map((item: any) => {
                  const lineTotal = Number(item.price) * item.quantity;

                  return (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 flex-shrink-0">
                          <Image
                            src={item.productImage || '/assets/noImage.jpg'}
                            alt={item.productName || 'محصول'}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-white font-bold text-sm truncate">
                            {item.productName || 'محصول سفارشی'}
                          </h4>
                          {item.unitName && (
                            <p className="text-stone-400 text-xs mt-0.5">
                              واحد: <span className="text-amber-300">{item.unitName}</span>
                            </p>
                          )}
                          <p className="text-stone-400 text-xs mt-0.5">
                            قیمت واحد: {formatPrice(Number(item.price))} × {item.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="text-left flex-shrink-0">
                        <span className="text-amber-300 font-extrabold text-base block">
                          {formatPrice(lineTotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Shipping Address Details */}
            <Card className="bg-stone-900/80 border border-amber-500/20 rounded-3xl overflow-hidden backdrop-blur-xl">
              <CardHeader className="bg-gradient-to-l from-amber-950/40 via-amber-900/10 to-stone-900/20 border-b border-amber-500/15 p-6">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2.5">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  اطلاعات تحویل و گیرنده
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-sm text-stone-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>تحویل گیرنده:</span>
                    <strong className="text-white">{shippingAddr.recipientName || shippingAddr.firstName ? `${shippingAddr.firstName} ${shippingAddr.lastName}` : 'ثبت نشده'}</strong>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>شماره تماس:</span>
                    <strong className="text-white font-mono">{shippingAddr.recipientPhone || shippingAddr.phone || 'ثبت نشده'}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 border-t border-stone-800 pt-3">
                  <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-xs">آدرس کامل پستی:</span>
                    <p className="text-white mt-0.5">
                      {shippingAddr.province ? `استان ${shippingAddr.province}، شهر ${shippingAddr.city}، ` : ''}
                      {shippingAddr.address || 'آدرس ثبت نشده'}
                    </p>
                    {shippingAddr.postalCode && (
                      <span className="text-stone-400 text-xs block mt-1">
                        کد پستی: <strong className="text-amber-300 font-mono">{shippingAddr.postalCode}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {shippingAddr.orderNotes && (
                  <div className="flex items-start gap-2.5 border-t border-stone-800 pt-3">
                    <FileText className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-stone-400 block text-xs">توضیحات خریدار:</span>
                      <p className="text-stone-200 mt-0.5 text-xs">{shippingAddr.orderNotes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary & Payment Info (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-stone-900/80 border border-amber-500/25 rounded-3xl overflow-hidden backdrop-blur-xl shadow-xl">
              <CardHeader className="bg-gradient-to-l from-amber-950/50 via-amber-900/20 to-stone-900/30 border-b border-amber-500/20 p-6">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2.5">
                  <Receipt className="w-5 h-5 text-amber-400" />
                  صورت‌حساب مالی
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center text-stone-300">
                    <span>مبلغ کل کالاها</span>
                    <span className="font-semibold text-white">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center text-stone-300">
                    <span>هزینه ارسال</span>
                    <span className="font-semibold text-amber-300">
                      {shipping === 0 ? 'رایگان' : formatPrice(shipping)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center text-green-400">
                      <span>تخفیف</span>
                      <span className="font-semibold">-{formatPrice(discount)}</span>
                    </div>
                  )}

                  <Separator className="bg-amber-500/15 my-2" />

                  <div className="flex justify-between items-center p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                    <span className="font-bold text-white text-base">مبلغ پرداختی</span>
                    <span className="text-xl font-black text-amber-300">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* Payment Reference Details */}
                {completedTx && (
                  <div className="border-t border-stone-800 pt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-stone-400">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                        درگاه پرداخت:
                      </span>
                      <span className="text-white font-semibold">زرین‌پال</span>
                    </div>

                    {completedTx.reference && (
                      <div className="flex items-center justify-between text-stone-400">
                        <span>کد پیگیری (Ref ID):</span>
                        <span className="text-green-400 font-mono font-bold">{completedTx.reference}</span>
                      </div>
                    )}

                    {completedTx.authority && (
                      <div className="flex items-center justify-between text-stone-500">
                        <span>شناسه ارجاع:</span>
                        <span className="font-mono text-[10px] truncate max-w-[140px] text-stone-400">
                          {completedTx.authority}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
