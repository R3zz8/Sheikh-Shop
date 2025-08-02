import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwtToken } from '@/lib/auth/jwt';

// Cache cart data for 1 minute (cart data changes frequently)
export const revalidate = 60;

// Helper function to get user ID from JWT
async function getUserIdFromToken(request: NextRequest) {
    try {
        const token = request.cookies.get('session-token')?.value;

        if (!token) {
            return null;
        }

        const user = verifyJwtToken(token);
        return user?.id || null;
    } catch (error) {
        return null;
    }
}

// GET - Fetch user's cart
export async function GET(request: NextRequest) {
    try {
        const userId = await getUserIdFromToken(request);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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
    try {
        const userId = await getUserIdFromToken(request);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productId, quantity = 1 } = await request.json();

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        // Check if product exists and is active
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        if (product.status !== 'ACTIVE') {
            return NextResponse.json(
                { error: 'Product is not available' },
                { status: 400 }
            );
        }

        if (product.quantity < quantity) {
            return NextResponse.json(
                { error: 'Insufficient stock' },
                { status: 400 }
            );
        }

        // Check if item already exists in cart
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                userId,
                productId,
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
                        },
                    },
                },
            });
        } else {
            // Create new cart item
            cartItem = await prisma.cartItem.create({
                data: {
                    userId,
                    productId,
                    quantity,
                },
                include: {
                    product: {
                        include: {
                            images: true,
                        },
                    },
                },
            });
        }

        return NextResponse.json(cartItem);
    } catch (error) {
        console.error('Error adding to cart:', error);
        return NextResponse.json(
            { error: 'Failed to add to cart' },
            { status: 500 }
        );
    }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
    try {
        const userId = await getUserIdFromToken(request);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { cartItemId, quantity } = await request.json();

        if (!cartItemId || quantity === undefined) {
            return NextResponse.json(
                { error: 'Cart item ID and quantity are required' },
                { status: 400 }
            );
        }

        if (quantity <= 0) {
            return NextResponse.json(
                { error: 'Quantity must be greater than 0' },
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
                product: true,
            },
        });

        if (!cartItem) {
            return NextResponse.json(
                { error: 'Cart item not found' },
                { status: 404 }
            );
        }

        // Check stock availability
        if (cartItem.product.quantity < quantity) {
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
                    },
                },
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
    try {
        const userId = await getUserIdFromToken(request);

        if (!userId) {
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