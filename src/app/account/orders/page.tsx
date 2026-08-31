import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getServerUser } from '@/lib/auth/server-auth';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/currency';
import { ShoppingBag, ChevronLeft, Package, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'سفارش‌های من | فروشگاه شیخ',
  robots: 'noindex, nofollow',
};

function getOrderStatusBadge(status: string, paymentStatus: string) {
  if (status === 'CANCELLED') {
    return <Badge className="bg-red-500/15 border-red-500/30 text-red-400">لغو شده</Badge>;
  }
  if (status === 'DELIVERED' || status === 'COMPLETED') {
    return <Badge className="bg-green-500/15 border-green-500/30 text-green-400">تحویل داده شد</Badge>;
  }
  if (status === 'SHIPPED') {
    return <Badge className="bg-blue-500/15 border-blue-500/30 text-blue-400">ارسال شد</Badge>;
  }
  if (status === 'PROCESSING' || paymentStatus === 'PAID') {
    return <Badge className="bg-amber-500/15 border-amber-500/30 text-amber-300">در حال آماده‌سازی</Badge>;
  }
  return <Badge className="bg-stone-800 border-stone-700 text-stone-400">در انتظار پرداخت</Badge>;
}

export default async function CustomerOrdersPage() {
  const user = await getServerUser();

  if (!user) {
    redirect('/login?callbackUrl=/account/orders');
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: true,
      transactions: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-black text-right font-vazirmatn text-white py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-500/15 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-amber-400" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400">
                سفارش‌های من
              </h1>
            </div>
            <p className="text-stone-400 text-sm mt-1">
              سابقه و وضعیت سفارش‌های ثبت شده شما در فروشگاه شیخ
            </p>
          </div>

          <Link href="/products">
            <Button variant="outline" className="border-amber-500/20 text-amber-200 hover:bg-amber-500/10 rounded-xl text-sm gap-2">
              <ArrowRight className="w-4 h-4" />
              بازگشت به فروشگاه
            </Button>
          </Link>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <Card className="bg-stone-900/80 border border-amber-500/20 rounded-3xl p-12 text-center backdrop-blur-xl">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                <Package className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">هنوز سفارشی ثبت نکرده‌اید</h2>
              <p className="text-stone-400 text-sm">
                محصولات متنوع فروشگاه شیخ را بررسی کنید و اولین سفارش خود را ثبت نمایید.
              </p>
              <Link href="/products" className="inline-block pt-2">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold px-8 py-3 rounded-xl hover:opacity-90">
                  مشاهده محصولات فروشگاه
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {orders.map((order: any) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              const itemsCount = order.items.reduce((acc: number, i: any) => acc + i.quantity, 0);
              const orderTotal = Number(order.totalPrice) || Number(order.total);

              return (
                <Card
                  key={order.id}
                  className="bg-stone-900/80 border border-amber-500/20 rounded-3xl overflow-hidden backdrop-blur-xl hover:border-amber-500/40 transition-all duration-300"
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Top Order Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-stone-400">کد سفارش:</span>
                        <span className="font-mono text-sm font-bold text-amber-300">{order.id}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-stone-400">{formattedDate}</span>
                        {getOrderStatusBadge(order.status, order.paymentStatus)}
                      </div>
                    </div>

                    {/* Products Thumbnails & Summary */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 overflow-x-auto py-1">
                        {order.items.slice(0, 4).map((item: any) => (
                          <div
                            key={item.id}
                            className="relative w-14 h-14 rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 flex-shrink-0"
                          >
                            <Image
                              src={item.productImage || '/assets/noImage.jpg'}
                              alt={item.productName || 'محصول'}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                            {item.quantity > 1 && (
                              <span className="absolute bottom-1 right-1 bg-amber-500 text-black font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                                {item.quantity}×
                              </span>
                            )}
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="w-14 h-14 rounded-2xl border border-stone-800 bg-stone-950/60 flex items-center justify-center text-stone-400 font-bold text-xs flex-shrink-0">
                            +{order.items.length - 4}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-stone-800">
                        <div className="text-right md:text-left">
                          <span className="text-xs text-stone-400 block">مبلغ کل سفارش</span>
                          <span className="text-lg font-black text-amber-300">{formatPrice(orderTotal)}</span>
                        </div>

                        <Link href={`/account/orders/${order.id}`}>
                          <Button variant="outline" className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 rounded-xl text-xs gap-1.5">
                            <span>مشاهده جزئیات</span>
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
