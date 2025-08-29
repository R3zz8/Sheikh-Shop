import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

async function getUserIdFromToken() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return null;
        }

        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.JWT_SECRET)
        );

        return payload.id as string;
    } catch (error) {
        return null;
    }
}

export default async function CheckoutPage() {
    const userId = await getUserIdFromToken();

    if (!userId) {
        redirect('/login');
    }

    // Fetch user's cart
    const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
            product: {
                include: {
                    images: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    if (cartItems.length === 0) {
        redirect('/products');
    }

    const subtotal = cartItems.reduce((total, item) => total + (item.product.basePrice * item.quantity), 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent mb-4">
                            Checkout
                        </h1>
                        <p className="text-gray-400">Complete your purchase</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Order Summary */}
                        <div className="bg-white/8 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                            <h2 className="text-2xl font-semibold text-white mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.product.images[0]?.image || '/assets/noImage.jpg'}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-white font-medium">{item.product.name}</h3>
                                            <p className="text-amber-300 text-sm">${item.product.basePrice.toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-medium">Qty: {item.quantity}</p>
                                            <p className="text-amber-300 font-semibold">
                                                ${(item.product.basePrice * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                <div className="flex justify-between items-center text-lg font-semibold">
                                    <span className="text-white">Subtotal:</span>
                                    <span className="text-amber-300">${subtotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Form */}
                        <div className="bg-white/8 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                            <h2 className="text-2xl font-semibold text-white mb-6">Payment Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-white text-sm font-medium mb-2">Card Number</label>
                                    <input
                                        type="text"
                                        placeholder="1234 5678 9012 3456"
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-white text-sm font-medium mb-2">Expiry Date</label>
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white text-sm font-medium mb-2">CVV</label>
                                        <input
                                            type="text"
                                            placeholder="123"
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-white text-sm font-medium mb-2">Cardholder Name</label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <button className="w-full mt-6 bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl border border-amber-500/30 shadow-lg hover:shadow-xl hover:shadow-amber-900/30 transition-all duration-300 transform hover:-translate-y-0.5">
                                Pay ${subtotal.toFixed(2)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 