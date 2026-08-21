'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CreditCard, 
  Lock, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  ShoppingBag, 
  Truck, 
  Shield,
  CheckCircle2,
  ArrowLeft,
  ShoppingCart,
  Package,
  BadgeCheck,
  Receipt,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { useUser } from '@/hooks/useUser';
import { formatPrice } from '@/lib/currency';
import { getShippingCost, calculateOrderTotal } from '@/lib/shipping';
import EstimatedDelivery from '@/components/shipping/EstimatedDelivery';
import { normalizePersianDigits, isValidIranianMobile, isValidIranianPostalCode } from '@/lib/validation';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotals, isLoading: isCartLoading } = useCart();
  const { data: user, isLoading: isUserLoading } = useUser();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    province: '',
    city: '',
    address: '',
    zipCode: '',
    recipientName: '',
    recipientPhone: '',
    orderNotes: '',
  });

  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      const u = user as any;
      setFormData(prev => ({
        ...prev,
        firstName: u.firstName || prev.firstName,
        lastName: u.lastName || prev.lastName,
        email: u.email || prev.email,
      }));
    }
  }, [user]);

  // Redirect if cart is empty, but only after loading is complete
  useEffect(() => {
    const doneLoading = !isUserLoading && !isCartLoading;
    if (doneLoading && (!cart || cart.length === 0)) {
      router.push('/cart');
    }
  }, [cart, isCartLoading, isUserLoading, router]);

  // Calculate totals using centralized shipping logic
  const subtotal = cartTotals.subtotal || 0;
  const shipping = cartTotals.shippingTotal || 0;
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlaceOrder = async () => {
    setError(null);

    // Validate required Iranian checkout fields
    if (!formData.firstName.trim()) {
      setError('لطفاً نام خود را وارد کنید.');
      return;
    }

    if (!formData.lastName.trim()) {
      setError('لطفاً نام خانوادگی خود را وارد کنید.');
      return;
    }

    const normalizedPhone = normalizePersianDigits(formData.phone).trim();
    if (!normalizedPhone || !isValidIranianMobile(normalizedPhone)) {
      setError('لطفاً شماره موبایل معتبر ۱۱ رقمی (مانند ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.');
      return;
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError('فرمت ایمیل وارد شده معتبر نیست.');
      return;
    }

    if (!formData.province.trim()) {
      setError('لطفاً استان خود را وارد کنید.');
      return;
    }

    if (!formData.city.trim()) {
      setError('لطفاً شهر خود را وارد کنید.');
      return;
    }

    if (!formData.address.trim() || formData.address.trim().length < 5) {
      setError('لطفاً آدرس کامل و دقیق خود را وارد کنید.');
      return;
    }

    const normalizedZip = normalizePersianDigits(formData.zipCode).trim();
    if (!normalizedZip || !isValidIranianPostalCode(normalizedZip)) {
      setError('لطفاً کد پستی ۱۰ رقمی معتبر وارد کنید.');
      return;
    }

    if (!cart || cart.length === 0) {
      setError('سبد خرید شما خالی است.');
      router.push('/cart');
      return;
    }

    setIsLoadingApi(true);

    // Construct unified payload for ZarinPal checkout API
    const payload = {
      items: cart,
      shippingAddress: {
        province: formData.province.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        postalCode: normalizedZip,
        recipientName: formData.recipientName.trim() || `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        recipientPhone: formData.recipientPhone.trim() ? normalizePersianDigits(formData.recipientPhone).trim() : normalizedPhone,
      },
      contactInfo: {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: normalizedPhone,
        mobile: normalizedPhone,
        email: formData.email.trim(),
      },
      orderNotes: formData.orderNotes.trim(),
    };

    try {
      const response = await fetch('/api/payment/zarinpal/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success && data.url) {
        // Redirect directly to ZarinPal payment gateway
        window.location.href = data.url;
      } else {
        const errorMessage = data.error || data.description || 'ایجاد درخواست پرداخت با خطا مواجه شد.';
        setError(errorMessage);
        console.error('Payment request failed:', data);
        setIsLoadingApi(false);
      }
    } catch (err) {
      setError('ارتباط با درگاه پرداخت برقرار نشد. لطفاً چند لحظه بعد دوباره تلاش کنید.');
      console.error('Network or unexpected error:', err);
      setIsLoadingApi(false);
    }
  };

  // Show loading state
  if (isUserLoading || isCartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-black flex items-center justify-center font-vazirmatn" dir="rtl">
        <div className="flex flex-col items-center gap-3 text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400"></div>
          <span className="text-lg">در حال بارگذاری اطلاعات سبد خرید...</span>
        </div>
      </div>
    );
  }

  // Show empty cart state
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-black flex items-center justify-center font-vazirmatn p-4" dir="rtl">
        <div className="text-center bg-stone-900/80 border border-amber-500/20 p-8 rounded-3xl max-w-md w-full shadow-2xl backdrop-blur-xl">
          <ShoppingCart className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-2">سبد خرید شما خالی است</h2>
          <p className="text-stone-400 mb-6 text-sm">برای تکمیل خرید، ابتدا کالاهای مورد نظر خود را به سبد اضافه کنید.</p>
          <Link href="/">
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold py-3 rounded-xl hover:opacity-90">
              بازگشت به فروشگاه
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-black relative overflow-hidden font-vazirmatn text-right" dir="rtl">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center md:text-right flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/15 pb-6"
        >
          <div>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <ShoppingBag className="w-8 h-8 text-amber-400" />
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100">
                تکمیل سفارش و پرداخت
              </h1>
            </div>
            <p className="text-stone-400 text-sm">
              لطفاً اطلاعات تحویل گیرنده را با دقت وارد کنید تا سفارش شما ثبت و ارسال گردد.
            </p>
          </div>

          <Link href="/cart">
            <Button variant="outline" className="border-amber-500/30 text-amber-200 hover:bg-amber-500/10 hover:text-white rounded-xl text-sm gap-2">
              <ArrowLeft className="w-4 h-4" />
              بازگشت به سبد خرید
            </Button>
          </Link>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Right Column (Mobile 1st/Desktop Right) - Customer & Delivery Forms */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Information Card */}
            <Card className="bg-stone-900/70 backdrop-blur-xl border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl">
              <CardHeader className="bg-gradient-to-l from-amber-950/40 via-amber-900/10 to-stone-900/20 border-b border-amber-500/20 px-6 py-4">
                <CardTitle className="flex items-center gap-3 text-white text-lg font-bold">
                  <User className="w-5 h-5 text-amber-400" />
                  اطلاعات خریدار و تحویل‌گیرنده
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-stone-300 text-sm mb-1.5 block">نام *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="bg-stone-950/60 border-amber-500/20 text-white placeholder-stone-500 focus:border-amber-400 rounded-xl py-2.5"
                      placeholder="مثال: علی"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-stone-300 text-sm mb-1.5 block">نام خانوادگی *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="bg-stone-950/60 border-amber-500/20 text-white placeholder-stone-500 focus:border-amber-400 rounded-xl py-2.5"
                      placeholder="مثال: محمدی"
                    />
                  </div>
                </div>

                {/* Contact Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-stone-300 text-sm mb-1.5 block">شماره موبایل *</Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-500 w-4 h-4" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        dir="ltr"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pr-10 bg-stone-950/60 border-amber-500/20 text-white placeholder-stone-500 focus:border-amber-400 rounded-xl py-2.5 text-left"
                        placeholder="09123456789"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-stone-300 text-sm mb-1.5 block">ایمیل (اختیاری)</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-500 w-4 h-4" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        dir="ltr"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pr-10 bg-stone-950/60 border-amber-500/20 text-white placeholder-stone-500 focus:border-amber-400 rounded-xl py-2.5 text-left"
                        placeholder="example@gmail.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Province & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <Label htmlFor="province" className="text-stone-300 text-sm mb-1.5 block">استان *</Label>
                    <Input
                      id="province"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className="bg-stone-950/60 border-amber-500/20 text-white placeholder-stone-500 focus:border-amber-400 rounded-xl py-2.5"
                      placeholder="مثال: تهران"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-stone-300 text-sm mb-1.5 block">شهر *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="bg-stone-950/60 border-amber-500/20 text-white placeholder-stone-500 focus:border-amber-400 rounded-xl py-2.5"
                      placeholder="مثال: تهران"
                    />
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <Label htmlFor="address" className="text-stone-300 text-sm mb-1.5 block">آدرس کامل پستی *</Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-3 text-stone-500 w-4 h-4" />
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="pr-10 bg-stone-950/60 border-amber-500/20 text-white placeholder-stone-500 focus:border-amber-400 rounded-xl py-2.5"
                      placeholder="خیابان، کوچه، پلاک، طبقه، واحد"
                    />
                  </div>
                </div>

                {/* Postal Code */}
                <div>
                  <Label htmlFor="zipCode" className="text-stone-300 text-sm mb-1.5 block">کد پستی ۱۰ رقمی *</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    dir="ltr"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="bg-stone-950/60 border-amber-500/20 text-white placeholder-stone-500 focus:border-amber-400 rounded-xl py-2.5 text-left font-mono"
                    placeholder="1234567890"
                  />
                </div>

                {/* Secondary Recipient (Optional) */}
                <div className="border-t border-amber-500/10 pt-4 mt-4 space-y-4">
                  <span className="text-xs font-semibold text-amber-300/80 block">تحویل به شخص دیگر (اختیاری)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recipientName" className="text-stone-400 text-xs mb-1 block">نام تحویل‌گیرنده</Label>
                      <Input
                        id="recipientName"
                        name="recipientName"
                        value={formData.recipientName}
                        onChange={handleInputChange}
                        className="bg-stone-950/40 border-amber-500/15 text-white placeholder-stone-600 focus:border-amber-400 rounded-xl py-2 text-sm"
                        placeholder="در صورت تفاوت با خریدار"
                      />
                    </div>
                    <div>
                      <Label htmlFor="recipientPhone" className="text-stone-400 text-xs mb-1 block">شماره تماس تحویل‌گیرنده</Label>
                      <Input
                        id="recipientPhone"
                        name="recipientPhone"
                        dir="ltr"
                        value={formData.recipientPhone}
                        onChange={handleInputChange}
                        className="bg-stone-950/40 border-amber-500/15 text-white placeholder-stone-600 focus:border-amber-400 rounded-xl py-2 text-sm text-left font-mono"
                        placeholder="09120000000"
                      />
                    </div>
                  </div>
                </div>

                {/* Order Notes */}
                <div className="border-t border-amber-500/10 pt-4">
                  <Label htmlFor="orderNotes" className="text-stone-300 text-sm mb-1.5 flex items-center gap-1.5 block">
                    <FileText className="w-4 h-4 text-amber-400" />
                    توضیحات سفارش / ارسال (اختیاری)
                  </Label>
                  <Input
                    id="orderNotes"
                    name="orderNotes"
                    value={formData.orderNotes}
                    onChange={handleInputChange}
                    className="bg-stone-950/60 border-amber-500/20 text-white placeholder-stone-500 focus:border-amber-400 rounded-xl py-2.5"
                    placeholder="نکات خاص جهت زمان ارسال یا تحویل کالا"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Gateway Option Card */}
            <Card className="bg-stone-900/70 backdrop-blur-xl border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl">
              <CardHeader className="bg-gradient-to-l from-amber-950/40 via-amber-900/10 to-stone-900/20 border-b border-amber-500/20 px-6 py-4">
                <CardTitle className="flex items-center gap-3 text-white text-lg font-bold">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  روش پرداخت
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="p-4 rounded-2xl border-2 border-amber-400 bg-amber-500/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-300 font-black text-sm">زرین</span>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base">درگاه آنلاین زرین‌پال</h3>
                      <p className="text-stone-300 text-xs mt-0.5">پرداخت امن با تمامی کارت‌های عضو شتاب</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-amber-400 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Left Column (Desktop Left) - Order Summary & Payment Button */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <Card className="bg-stone-900/80 backdrop-blur-xl border border-amber-500/25 rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(217,119,6,0.15)]">
              <CardHeader className="bg-gradient-to-l from-amber-950/50 via-amber-900/20 to-stone-900/30 border-b border-amber-500/20 px-6 py-4">
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2.5">
                    <Receipt className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-lg">خلاصه سفارش</span>
                  </div>
                  {cartTotals.itemCount > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 border border-amber-400/30 text-amber-200">
                      {cartTotals.itemCount} کالا
                    </span>
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                {/* Cart Items List */}
                <div className="space-y-3 mb-6 max-h-[220px] overflow-y-auto pl-1">
                  {cart.map((item: any) => {
                    const unitPrice = item.unitPrice || item.product?.basePrice || 0;
                    const itemTotal = unitPrice * item.quantity;
                    const productImage = item.product?.images?.[0]?.image || '/assets/noImage.jpg';
                    const productName = item.product?.name || 'محصول';
                    const unitName = item.unit?.name || item.unit?.symbol || '';

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-3 bg-stone-950/50 rounded-2xl border border-stone-800"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-stone-800 bg-stone-900">
                            <Image
                              src={productImage}
                              alt={productName}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-white font-medium text-xs truncate">{productName}</h4>
                            <p className="text-stone-400 text-[11px] mt-0.5">
                              {unitName && <span className="text-amber-300 ml-1">{unitName}</span>}
                              تعداد: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-left flex-shrink-0">
                          <p className="text-amber-300 font-bold text-xs">{formatPrice(itemTotal)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3.5 border-t border-amber-500/15 pt-4">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-stone-300 text-sm">
                    <span className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-500/70" />
                      جمع کالاها
                    </span>
                    <span className="font-semibold text-white">{formatPrice(subtotal)}</span>
                  </div>

                  {/* Shipping Total */}
                  <div className="flex justify-between items-center text-stone-300 text-sm">
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-amber-500/70" />
                      هزینه ارسال
                    </span>
                    <span className="font-semibold text-amber-300">
                      {shipping === 0 ? 'رایگان' : formatPrice(shipping)}
                    </span>
                  </div>

                  {/* Delivery Estimate Box */}
                  <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/15 space-y-2">
                    <EstimatedDelivery variant="glass" showDivider={false} className="py-0 px-0 border-none bg-transparent" />
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                      <BadgeCheck className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      <span>ارسال سریع با بسته‌بندی ایمن</span>
                    </div>
                  </div>

                  <Separator className="bg-amber-500/15" />

                  {/* Grand Total */}
                  <div className="flex justify-between items-center p-3.5 bg-gradient-to-r from-amber-500/15 to-orange-500/10 rounded-2xl border-r-4 border-amber-500">
                    <span className="font-bold text-white text-base">مبلغ قابل پرداخت</span>
                    <span className="text-xl font-black text-amber-300 drop-shadow">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-center"
                  >
                    <p className="text-red-300 text-xs font-semibold">{error}</p>
                  </motion.div>
                )}

                {/* Payment Submit Button */}
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isLoadingApi}
                  className="w-full mt-6 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-extrabold text-base py-6 rounded-2xl shadow-lg hover:shadow-amber-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingApi ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                      <span>در حال انتقال به درگاه پرداخت...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span>پرداخت و تکمیل سفارش</span>
                    </div>
                  )}
                </Button>

                {/* Guarantee Banner */}
                <div className="flex items-center justify-center gap-2 mt-4 p-2.5 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 text-xs font-medium">ضمانت پرداخت امن زرین‌پال</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
