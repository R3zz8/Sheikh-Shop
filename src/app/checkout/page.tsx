'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    saveInfo: false
  });

  const [paymentMethod, setPaymentMethod] = useState('credit-card');

  // Example cart items
  const cartItems = [
    {
      id: 1,
      name: 'Premium Saffron - 1g',
      price: 89.99,
      quantity: 2,
      image: '/assets/saffron.jpg'
    },
    {
      id: 2,
      name: 'Organic Honey - 500g',
      price: 24.99,
      quantity: 1,
      image: '/assets/honey.jpg'
    },
    {
      id: 3,
      name: 'Luxury Dates - 1kg',
      price: 34.99,
      quantity: 1,
      image: '/assets/dates.jpg'
    }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePlaceOrder = () => {
    // Handle order placement logic here
    console.log('Order placed:', { formData, paymentMethod, cartItems, total });
  };

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
                      <Label htmlFor="state" className="text-gray-300">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="mt-1 bg-white/10 border-amber-200/20 text-white placeholder-gray-400 focus:border-amber-400"
                        placeholder="State"
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
            <div className="space-y-6">
              <Card className="bg-white/5 backdrop-blur-sm border border-amber-200/20 rounded-2xl overflow-hidden sticky top-24">
                <CardHeader className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-200/20">
                  <CardTitle className="flex items-center gap-3 text-white">
                    <ShoppingBag className="w-6 h-6 text-amber-400" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center space-x-4 p-3 bg-white/5 rounded-xl"
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold text-sm">{item.name}</h4>
                          <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-amber-400 font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <Separator className="bg-amber-200/20" />

                  {/* Pricing Breakdown */}
                  <div className="space-y-3 mt-6">
                    <div className="flex justify-between text-gray-300">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span className="flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Shipping
                      </span>
                      <span>${shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator className="bg-amber-200/20" />
                    <div className="flex justify-between text-xl font-bold">
                      <span className="text-white">Total</span>
                      <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                </div>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center gap-2 mt-6 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">Secure Checkout</span>
                  </div>

                  {/* Place Order Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-6"
                  >
                    <Button
                      onClick={handlePlaceOrder}
                      className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-black font-bold text-lg py-6 rounded-xl shadow-lg hover:shadow-xl hover:shadow-amber-500/25 transition-all duration-300 group"
                    >
                      <Lock className="w-5 h-5 mr-2" />
                      Place Order
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
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