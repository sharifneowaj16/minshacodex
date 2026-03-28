import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthenticatedUserIdFromRequest } from '@/lib/auth/appAuth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { take: 1, orderBy: { sortOrder: 'asc' } },
            brand: true,
          },
        },
        variant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format cart items
    const items = cartItems.map((item) => ({
      id: item.productId,
      cartItemId: item.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.variant ? `${item.product.name} - ${item.variant.name}` : item.product.name,
      quantity: item.quantity,
      price: item.variant?.price?.toNumber() || item.product.price.toNumber(),
      image: item.product.images[0]?.url || '',
      sku: item.variant?.sku || item.product.sku,
    }));

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return NextResponse.json({
      items,
      summary: {
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal,
        shipping: 0, // Calculate based on shipping rules
        tax: 0, // Calculate based on tax rules
        total: subtotal,
      },
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, variantId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    if (quantity < 1) {
      return NextResponse.json({ error: 'quantity must be at least 1' }, { status: 400 });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Product not found or inactive' }, { status: 404 });
    }

    // If variantId is provided, verify it belongs to this product
    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) {
        return NextResponse.json({ error: 'Invalid variant for this product' }, { status: 400 });
      }

      // Check variant stock
      if (variant.quantity < quantity) {
        return NextResponse.json(
          { error: 'Insufficient stock for this variant' },
          { status: 400 }
        );
      }
    } else {
      // Check product stock
      if (product.quantity < quantity) {
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
      }
    }

    // FIX: Handle the unique constraint properly
    // When variantId is undefined, we need to handle it explicitly
    const whereClause = variantId
      ? { userId_productId_variantId: { userId, productId, variantId } }
      : {
          userId,
          productId,
          variantId: null, // This is the fix - explicitly set to null when no variant
        };

    // Check if item already exists in cart
    const existing = await prisma.cartItem.findFirst({
      where: whereClause,
    });

    let cartItem;

    if (existing) {
      // Update quantity
      const newQuantity = existing.quantity + quantity;

      // Check stock again for the new quantity
      const availableStock = variantId
        ? product.variants.find((v) => v.id === variantId)?.quantity || 0
        : product.quantity;

      if (newQuantity > availableStock) {
        return NextResponse.json(
          { error: 'Cannot add more items than available stock' },
          { status: 400 }
        );
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            include: {
              images: { take: 1, orderBy: { sortOrder: 'asc' } },
              brand: true,
            },
          },
          variant: true,
        },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          variantId: variantId || null, // Explicitly set null if undefined
          quantity,
        },
        include: {
          product: {
            include: {
              images: { take: 1, orderBy: { sortOrder: 'asc' } },
              brand: true,
            },
          },
          variant: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      item: {
        id: cartItem.id,
        productId: cartItem.productId,
        variantId: cartItem.variantId,
        quantity: cartItem.quantity,
        product: {
          id: cartItem.product.id,
          name: cartItem.product.name,
          slug: cartItem.product.slug,
          price: cartItem.product.price.toNumber(),
          image: cartItem.product.images[0]?.url || null,
          brand: cartItem.product.brand?.name || null,
        },
        variant: cartItem.variant
          ? {
              id: cartItem.variant.id,
              name: cartItem.variant.name,
              price: cartItem.variant.price?.toNumber() || cartItem.product.price.toNumber(),
              attributes: cartItem.variant.attributes,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 });
  }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
    }

    if (quantity < 1) {
      return NextResponse.json({ error: 'quantity must be at least 1' }, { status: 400 });
    }

    // Find cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, userId },
      include: { product: true, variant: true },
    });

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    // Check stock
    const availableStock = cartItem.variant
      ? cartItem.variant.quantity
      : cartItem.product.quantity;

    if (quantity > availableStock) {
      return NextResponse.json(
        { error: `Only ${availableStock} items available in stock` },
        { status: 400 }
      );
    }

    // Update quantity
    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: {
          include: {
            images: { take: 1, orderBy: { sortOrder: 'asc' } },
            brand: true,
          },
        },
        variant: true,
      },
    });

    return NextResponse.json({
      success: true,
      item: {
        id: updated.id,
        productId: updated.productId,
        variantId: updated.variantId,
        quantity: updated.quantity,
        product: {
          id: updated.product.id,
          name: updated.product.name,
          price: updated.product.price.toNumber(),
          image: updated.product.images[0]?.url || null,
        },
        variant: updated.variant
          ? {
              id: updated.variant.id,
              name: updated.variant.name,
              price: updated.variant.price?.toNumber() || updated.product.price.toNumber(),
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 });
  }
}

// DELETE /api/cart - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      await prisma.cartItem.deleteMany({
        where: { userId },
      });

      return NextResponse.json({ success: true, cleared: true });
    }

    // Verify ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    // Delete item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json({ error: 'Failed to remove item from cart' }, { status: 500 });
  }
}
