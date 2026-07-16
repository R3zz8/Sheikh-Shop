'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
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
  CheckCircle,
  ArrowRight,
  ShoppingCart,
  Package,
  BadgeCheck,
  Receipt
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useCart } from '@/hooks/useCart';
import { useUser } from '@/hooks/useUser';
import { formatPrice } from '@/lib/currency';
import { getShippingCost, calculateOrderTotal } from '@/lib/shipping';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotals, isLoading: isCartLoading } = useCart();
  const { data: user, isLoading: isUserLoading } = useUser();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    saveInfo: false,
  });

  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
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
  const shipping = subtotal > 0 ? getShippingCost(subtotal) : 0;
  const total = subtotal > 0 ? calculateOrderTotal(subtotal) : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePlaceOrder = async () => {
    setError(null);

    // Basic client-side validation
    const requiredFields: (keyof typeof formData)[] = [
      'firstName', 'lastName', 'email', 'phone',
      'address', 'city', 'zipCode', 'country'
    ];

    const missingField = requiredFields.find(field => !formData[field]);
    if (missingField) {
      setError(`Please fill in the ${missingField.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
      return;
    }

    if (!cart || cart.length === 0) {
      setError('Your cart is empty.');
      router.push('/cart');
      return;
    }

    setIsLoadingApi(true);

    // --- CURRENCY CONSTANTS ---
    const CURRENCY_IRR = 2; // Using the appropriate code for IRR

    // Construct payload for the API
    const payload = {
      amount: total,
      currencyFrom: CURRENCY_IRR,
      currencyTo: CURRENCY_IRR,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      mobile: formData.phone, // Map phone to mobile
      address: formData.address,
      postalCode: formData.zipCode, // Map zipCode to postalCode
      country: formData.country,
      city: formData.city,
      description: `Order from Sheikh-Shop for ${cartTotals.itemCount} items.`,
    };

    try {
      const response = await fetch('/api/payment/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to payment gateway
        router.push(data.paymentUrl);
      } else {
        // Handle API error
        const errorMessage = data.description || data.error || 'An unexpected error occurred.';
        setError(errorMessage);
        console.error('Payment request failed:', data);
      }
    } catch (err) {
      // Handle network or unexpected errors
      setError('Failed to connect to the payment service. Please try again later.');
      console.error('Network or unexpected error:', err);
    } finally {
      setIsLoadingApi(false);
    }
  };

  // Show loading or empty state
  if (isUserLoading || isCartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading cart...</div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-black flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-white text-2xl mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-4">Add items to your cart before checkout</p>
          <Link href="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/public/assets/pattern.png')] opacity-5"></div>
      
      <div className="relative z-10">
                    {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="pt-20 pb-8"
        >
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="flex items-center justify-center gap-4 mb-4"
            >
              <ShoppingBag className="w-10 h-10 text-amber-400" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
                            Checkout
                        </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="text-gray-300 text-lg"
            >
              Complete your order securely
            </motion.p>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="container mx-auto px-4 pb-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Customer & Payment Information */}
            <div className="space-y-6">
              {/* Customer Information */}
              <Card className="bg-white/5 backdrop-blur-sm border border-amber-200/20 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-200/20">
                  <CardTitle className="flex items-center gap-3 text-white">
                    <User className="w-6 h-6 text-amber-400" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-gray-300">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="mt-1 bg-white/10 border-amber-200/20 text-white placeholder-gray-400 focus:border-amber-400"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-gray-300">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="mt-1 bg-white/10 border-amber-200/20 text-white placeholder-gray-400 focus:border-amber-400"
                        placeholder="Enter your last name"
                                            />
                                        </div>
                                        </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email Address *</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 bg-white/10 border-amber-200/20 text-white placeholder-gray-400 focus:border-amber-400"
                        placeholder="Enter your email"
                      />
                                        </div>
                                    </div>

                  <div>
                    <Label htmlFor="phone" className="text-gray-300">Phone Number *</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10 bg-white/10 border-amber-200/20 text-white placeholder-gray-400 focus:border-amber-400"
                        placeholder="Enter your phone number"
                      />
                    </div>
                            </div>

                  <div>
                    <Label htmlFor="address" className="text-gray-300">Street Address *</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="pl-10 bg-white/10 border-amber-200/20 text-white placeholder-gray-400 focus:border-amber-400"
                        placeholder="Enter your street address"
                      />
                            </div>
                        </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-gray-300">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="mt-1 bg-white/10 border-amber-200/20 text-white placeholder-gray-400 focus:border-amber-400"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-gray-300">Country *</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="mt-1 bg-white/10 border-amber-200/20 text-white placeholder-gray-400 focus:border-amber-400"
                        placeholder="Country"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode" className="text-gray-300">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="mt-1 bg-white/10 border-amber-200/20 text-white placeholder-gray-400 focus:border-amber-400"
                        placeholder="ZIP"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="saveInfo"
                      name="saveInfo"
                      checked={formData.saveInfo}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, saveInfo: checked as boolean }))}
                      className="border-amber-400 data-[state=checked]:bg-amber-500"
                    />
                    <Label htmlFor="saveInfo" className="text-gray-300 text-sm">
                      Save this information for future orders
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card className="bg-white/5 backdrop-blur-sm border border-amber-200/20 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-200/20">
                  <CardTitle className="flex items-center gap-3 text-white">
                    <CreditCard className="w-6 h-6 text-amber-400" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div 
                      className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        paymentMethod === 'credit-card' 
                          ? 'border-amber-400 bg-amber-500/10' 
                          : 'border-amber-200/20 bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => setPaymentMethod('credit-card')}
                    >
                      <CreditCard className="w-6 h-6 text-amber-400 mr-3" />
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">Credit Card</h3>
                        <p className="text-gray-400 text-sm">Visa, Mastercard, American Express</p>
                      </div>
                      {paymentMethod === 'credit-card' && (
                        <CheckCircle className="w-5 h-5 text-amber-400" />
                      )}
                    </div>

                    <div 
                      className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        paymentMethod === 'paypal' 
                          ? 'border-amber-400 bg-amber-500/10' 
                          : 'border-amber-200/20 bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => setPaymentMethod('paypal')}
                    >
                      <div className="w-6 h-6 bg-blue-600 rounded mr-3 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">P</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">PayPal</h3>
                        <p className="text-gray-400 text-sm">Pay securely with PayPal</p>
                      </div>
                      {paymentMethod === 'paypal' && (
                        <CheckCircle className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                  </div>

                  {paymentMethod === 'credit-card' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 pt-4 border-t border-amber-200/20"
                    >
                      <div>
                        <Label htmlFor="cardNumber" className="text-gray-300">Card Number *</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          className="mt-1 bg-white/10 border-amber-200/20 text-white placeholder-gray-400 focus:border-amber-400"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate" className="text-gray-300">Expiry Date *</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            className="mt-1 bg-white/10 border-amber-200/20 text-white placeholder-gray-400 focus:border-amber-400"
                          />
                        </div>
                                <div>
                          <Label htmlFor="cvv" className="text-gray-300">CVV *</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            className="mt-1 bg-white/10 border-amber-200/20 text-white placeholder-gray-400 focus:border-amber-400"
                                    />
                                </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
                            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6 font-vazirmatn" dir="rtl">
              <Card className="relative bg-stone-900/60 backdrop-blur-xl border border-amber-500/20 rounded-3xl overflow-hidden sticky top-24 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(217,119,6,0.15)] group transition-all duration-300 hover:border-amber-500/30">
                {/* Visual Accent Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-all duration-500"></div>

                <CardHeader className="bg-gradient-to-l from-amber-950/40 via-amber-900/10 to-stone-900/20 border-b border-amber-500/20 px-6 py-5">
                  <CardTitle className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-6 h-6 text-amber-500" />
                      <span className="font-bold text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100">
                        خلاصه سفارش
                      </span>
                    </div>
                    {cartTotals.itemCount > 0 && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/25 border border-amber-400/30 text-amber-200">
                        {cartTotals.itemCount} کالا
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6 max-h-[240px] overflow-y-auto pr-1">
                    {cart.map((item: any) => {
                      const unitPrice = item.unitPrice || item.product?.basePrice || 0;
                      const itemTotal = unitPrice * item.quantity;
                      const productImage = item.product?.images?.[0]?.image || '/assets/noImage.jpg';
                      const productName = item.product?.name || 'محصول';
                      const unitName = item.unit?.name || item.unit?.symbol || '';
                      
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4 }}
                          className="flex items-center justify-between gap-4 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-amber-500/30 transition-colors">
                              <Image
                                src={productImage}
                                alt={productName}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-white font-medium text-sm truncate group-hover:text-amber-200 transition-colors">{productName}</h4>
                              <p className="text-gray-400 text-xs mt-0.5">
                                {unitName && <span className="bg-amber-500/10 text-amber-300 text-[10px] px-2 py-0.5 rounded-full ml-1.5 font-semibold">{unitName}</span>}
                                تعداد: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="text-left flex-shrink-0">
                            <p className="text-amber-400 font-semibold text-sm">{formatPrice(itemTotal)}</p>
                            <p className="text-gray-500 text-[10px] mt-0.5">{formatPrice(unitPrice)} هر کدام</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="border-t border-amber-500/10 pt-5 space-y-4">
                    {/* Section 1: Subtotal */}
                    <motion.div
                      layout
                      className="flex justify-between items-center text-gray-300"
                    >
                      <span className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-amber-500/70" />
                        جمع کالاها
                      </span>
                      <span className="font-semibold text-white text-sm">{formatPrice(subtotal)}</span>
                    </motion.div>

                    {/* Section 2: Shipping with inline informational row */}
                    <div className="space-y-1.5 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                      <motion.div
                        layout
                        className="flex justify-between items-center text-gray-300"
                      >
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <Truck className="w-4 h-4 text-amber-500" />
                          هزینه ارسال
                        </span>
                        <span className="font-semibold text-amber-400 text-sm">
                          {shipping === 0 ? 'رایگان' : formatPrice(shipping)}
                        </span>
                      </motion.div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 pr-1 select-none">
                        <BadgeCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        <span>ارسال سفارش با بسته‌بندی ایمن و استاندارد انجام خواهد شد.</span>
                      </div>
                    </div>

                    <Separator className="bg-amber-500/10" />

                    {/* Section 3: Grand Total - strongest visual emphasis */}
                    <motion.div
                      layout
                      className="flex justify-between items-center p-3 bg-gradient-to-l from-amber-500/10 to-transparent rounded-xl border-r-4 border-amber-500"
                    >
                      <span className="flex items-center gap-2 text-base font-bold text-white">
                        <Receipt className="w-5 h-5 text-amber-400" />
                        مبلغ قابل پرداخت
                      </span>
                      <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(245,158,11,0.2)]">
                        {formatPrice(total)}
                      </span>
                    </motion.div>
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center gap-2.5 mt-6 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-xs font-semibold">پرداخت امن و تضمین شده</span>
                  </div>

                  {/* Place Order Button */}
                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center"
                    >
                      <p className="text-red-400 text-sm">{error}</p>
                    </motion.div>
                  )}

                  {/* Place Order Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-6"
                  >
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={isLoadingApi}
                      className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-black font-bold text-lg py-6 rounded-xl shadow-lg hover:shadow-xl hover:shadow-amber-500/25 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingApi ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 mr-2" />
                          Place Order
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </Button>
                  </motion.div>

                  <p className="text-center text-gray-400 text-xs mt-4">
                    By placing this order, you agree to our Terms of Service and Privacy Policy
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
            </div>
        </div>
    );
} 