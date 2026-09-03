import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwtToken } from '@/lib/auth/jwt';
import { hasSufficientStock, calculateProductUnitPrice } from '@/lib/pricing';
import { validateProductPurchasable } from '@/lib/inventory';

// Cache cart data for 1 minute (cart data changes frequently)
export const revalidate = 60;

// Helper function to get user ID from JWT - supports multiple token types
async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
    const timestamp = new Date().toISOString();
    
    try {
        // Security: Check multiple token types for compatibility
        const sessionToken = request.cookies.get('session-token')?.value; // legacy
        const accessToken = request.cookies.get('access-token')?.value;
        const refreshToken = request.cookies.get('refresh-token')?.value;

        // Log available cookies (without values for security)
        const hasSessionToken = !!sessionToken;
        const hasAccessToken = !!accessToken;
        const hasRefreshToken = !!refreshToken;

        // Try access-token first (primary authentication method)
        if (accessToken) {
            try {
                const user = await verifyJwtToken(accessToken);
                if (user?.id) {
                    return user.id;
                }
            } catch (error) {
                console.warn(`[${timestamp}] Access token verification failed:`, error instanceof Error ? error.message : 'Unknown error');
            }
        }

        // Fallback to refresh-token
        if (refreshToken) {
            try {
                const user = await verifyJwtToken(refreshToken);
                if (user?.id) {
                    return user.id;
                }
            } catch (error) {
                console.warn(`[${timestamp}] Refresh token verification failed:`, error instanceof Error ? error.message : 'Unknown error');
            }
        }

        // Legacy: session-token support
        if (sessionToken) {
            try {
                const user = await verifyJwtToken(sessionToken);
                if (user?.id) {
                    return user.id;
                }
            } catch (error) {
                console.warn(`[${timestamp}] Session token verification failed:`, error instanceof Error ? error.message : 'Unknown error');
            }
        }

        // Log 401 case with cookie presence info
        console.warn(`[${timestamp}] 401 Unauthorized - No valid token found. Cookies present:`, {
            hasSessionToken,
            hasAccessToken,
            hasRefreshToken,
            path: request.nextUrl.pathname,
            method: request.method,
        });

        return null;
    } catch (error) {
        console.error(`[${timestamp}] Error in getUserIdFromToken:`, error instanceof Error ? error.message : 'Unknown error');
        return null;
    }
}

// GET - Fetch user's cart
export async function GET(request: NextRequest) {
    const timestamp = new Date().toISOString();
    
    try {
        const userId = await getUserIdFromToken(request);

        if (!userId) {
            console.warn(`[${timestamp}] 401 Unauthorized: Failed to authenticate user for cart GET`);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cartItems = await prisma.cartItem.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        images: true,
                        units: true, // Include ProductUnits for display
                    },
                },
                unit: true, // Include Unit information
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cart' },
            { status: 500 }
        );
    }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
    const timestamp = new Date().toISOString();
    
    try {
        const userId = await getUserIdFromToken(request);

        if (!userId) {
            console.error(`[${timestamp}] 401 Unauthorized: Failed to authenticate user for cart POST`, {
                path: request.nextUrl.pathname,
                ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
                userAgent: request.headers.get('user-agent'),
            });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productId, unitId, quantity = 1 } = await request.json();

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        // Check if product exists and is active
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                baseUnit: true,
                units: true, // Include ProductUnits
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Validate product purchasability using central domain rules
        const validation = validateProductPurchasable(product, quantity);
        if (!validation.purchasable) {
            return NextResponse.json(
                { error: validation.reason || 'امکان خرید این محصول وجود ندارد.' },
                { status: 400 }
            );
        }

        // Determine which unit to use
        let selectedUnitId = unitId || product.baseUnitId;
        let unitPrice = product.basePrice;

        // If unitId is provided, validate it and get its price
        if (unitId) {
            const productUnit = product.units.find((unit: any) => unit.id === unitId);
            if (productUnit) {
                if (!productUnit.isActive) {
                    return NextResponse.json(
                        { error: 'Invalid or inactive product unit' },
                        { status: 400 }
                    );
                }
                unitPrice = Number(productUnit.price);

                if (!hasSufficientStock(productUnit.stock, quantity)) {
                    return NextResponse.json(
                        { error: 'موجودی این واحد کافی نیست' },
                        { status: 400 }
                    );
                }
            }
        }

        // Check if item already exists in cart (same product + unit combination)
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                userId,
                productId,
                unitId: selectedUnitId,
            },
        });

        let cartItem;

        if (existingItem) {
            // Update quantity
            cartItem = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
                include: {
                    product: {
                        include: {
                            images: true,
                            units: true,
                        },
                    },
                    unit: true,
                },
            });
        } else {
            // Create new cart item
            cartItem = await prisma.cartItem.create({
                data: {
                    userId,
                    productId,
                    quantity,
                    unitId: selectedUnitId,
                    unitPrice,
                },
                include: {
                    product: {
                        include: {
                            images: true,
                            units: true,
                        },
                    },
                    unit: true,
                },
            });
        }

        return NextResponse.json(cartItem);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[${timestamp}] Error adding to cart:`, {
            error: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            path: request.nextUrl.pathname,
        });
        return NextResponse.json(
            { error: 'Failed to add to cart' },
            { status: 500 }
        );
    }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
    const timestamp = new Date().toISOString();
    
    try {
        const userId = await getUserIdFromToken(request);

        if (!userId) {
            console.warn(`[${timestamp}] 401 Unauthorized: Failed to authenticate user for cart PUT`);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { cartItemId, quantity } = await request.json();

        if (!cartItemId || quantity === undefined) {
            return NextResponse.json(
                { error: 'Cart item ID and quantity are required' },
                { status: 400 }
            );
        }

        // Validate quantity
        if (quantity < 0) {
            return NextResponse.json(
                { error: 'Quantity cannot be negative' },
                { status: 400 }
            );
        }

        // Check if cart item belongs to user
        const cartItem = await prisma.cartItem.findFirst({
            where: {
                id: cartItemId,
                userId,
            },
            include: {
                product: {
                    include: {
                        units: true,
                    },
                },
            },
        });

        if (!cartItem) {
            return NextResponse.json(
                { error: 'Cart item not found' },
                { status: 404 }
            );
        }

        // Auto-remove if quantity is 0
        if (quantity === 0) {
            await prisma.cartItem.delete({
                where: { id: cartItemId },
            });
            return NextResponse.json({ success: true, removed: true });
        }

        // Check stock availability - support both ProductUnit and legacy stock
        let hasStock = false;
        
        if (cartItem.unitId) {
            // Check ProductUnit stock
            const productUnit = cartItem.product.units.find((unit: any) => unit.id === cartItem.unitId);
            if (productUnit) {
                hasStock = hasSufficientStock(productUnit.stock, quantity);
            } else {
                // Fallback to legacy stock if the unit is a standard unit without custom ProductUnit row
                hasStock = cartItem.product.quantity >= quantity;
            }
        } else {
            // Legacy stock check
            hasStock = cartItem.product.quantity >= quantity;
        }

        if (!hasStock) {
            return NextResponse.json(
                { error: 'Insufficient stock' },
                { status: 400 }
            );
        }

        const updatedCartItem = await prisma.cartItem.update({
            where: { id: cartItemId },
            data: { quantity },
            include: {
                product: {
                    include: {
                        images: true,
                        units: true,
                    },
                },
                unit: true,
            },
        });

        return NextResponse.json(updatedCartItem);
    } catch (error) {
        console.error('Error updating cart:', error);
        return NextResponse.json(
            { error: 'Failed to update cart' },
            { status: 500 }
        );
    }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
    const timestamp = new Date().toISOString();
    
    try {
        const userId = await getUserIdFromToken(request);

        if (!userId) {
            console.warn(`[${timestamp}] 401 Unauthorized: Failed to authenticate user for cart DELETE`);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { cartItemId } = await request.json();

        if (!cartItemId) {
            return NextResponse.json(
                { error: 'Cart item ID is required' },
                { status: 400 }
            );
        }

        // Check if cart item belongs to user
        const cartItem = await prisma.cartItem.findFirst({
            where: {
                id: cartItemId,
                userId,
            },
        });

        if (!cartItem) {
            return NextResponse.json(
                { error: 'Cart item not found' },
                { status: 404 }
            );
        }

        await prisma.cartItem.delete({
            where: { id: cartItemId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error removing from cart:', error);
        return NextResponse.json(
            { error: 'Failed to remove from cart' },
            { status: 500 }
        );
    }
} 