// app/api/products/route.ts
// IMPORTANT: তোমার existing route.ts এ map() function এ শুধু slug যোগ করতে হবে।
// নিচে complete file দেওয়া আছে যেটায় slug যোগ করা।

import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_PERMISSIONS,
  getAuthenticatedAdminFromRequest,
  hasAdminPermission,
} from '@/lib/auth/adminAuth';
import prisma from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search      = searchParams.get('search')     || '';
    const category    = searchParams.get('category')   || '';
    const featured    = searchParams.get('featured')   || '';
    const isNew       = searchParams.get('new')        || '';
    const activeOnly  = searchParams.get('activeOnly') !== 'false';
    const page        = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit       = Math.min(100, parseInt(searchParams.get('limit') || '20'));
    const skip        = (page - 1) * limit;
    const sortBy      = searchParams.get('sortBy')      || 'createdAt';
    const sortOrder   = (searchParams.get('sortOrder')  || 'desc') as 'asc' | 'desc';
    const slugParam   = searchParams.get('slug')        || '';

    const where: Prisma.ProductWhereInput = {};

    if (activeOnly) where.isActive = true;
    if (featured === 'true') where.isFeatured = true;
    if (isNew    === 'true') where.isNew      = true;

    if (slugParam) {
      where.slug = slugParam;
    }

    if (category) {
      where.category = {
        OR: [{ name: { contains: category, mode: 'insensitive' } }, { slug: category }],
      };
    }

    if (search) {
      where.OR = [
        { name:             { contains: search, mode: 'insensitive' } },
        { description:      { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { sku:              { contains: search, mode: 'insensitive' } },
        { brand: { name:    { contains: search, mode: 'insensitive' } } },
      ];
    }

    const allowedSortFields: Record<string, Prisma.ProductOrderByWithRelationInput> = {
      createdAt:  { createdAt: sortOrder },
      price:      { price: sortOrder },
      name:       { name: sortOrder },
      rating:     { averageRating: sortOrder },
      reviewCount:{ reviewCount: sortOrder },
    };
    const orderBy = allowedSortFields[sortBy] || { createdAt: 'desc' };

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images:   { orderBy: { sortOrder: 'asc' }, take: 3 },
          category: { select: { id: true, name: true, slug: true } },
          brand:    { select: { id: true, name: true, slug: true } },
          variants: { select: { id: true, price: true, quantity: true, attributes: true }, take: 10 },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const formatted = products.map((p) => {
      const mainImage = p.images.find((i) => i.isDefault) || p.images[0];
      return {
        id:            p.id,
        slug:          p.slug,              // ← slug এখানে
        sku:           p.sku,
        name:          p.name,
        description:   p.description   || '',
        shortDescription: p.shortDescription || '',
        price:         p.price.toNumber(),
        originalPrice: p.compareAtPrice ? p.compareAtPrice.toNumber() : null,
        image:         mainImage?.url   || '',
        images:        p.images.map((i) => i.url),
        stock:         p.quantity,
        category:      p.category?.name || '',
        categorySlug:  p.category?.slug || '',
        brand:         p.brand?.name    || '',
        brandSlug:     p.brand?.slug    || '',
        rating:        p.averageRating?.toNumber() || 0,
        reviews:       p.reviewCount    || 0,
        inStock:       p.quantity > 0,
        isNew:         p.isNew,
        isFeatured:    p.isFeatured,
        status:        !p.isActive ? 'inactive' : p.quantity === 0 ? 'out_of_stock' : 'active',
        featured:      p.isFeatured,
        codAvailable:  p.codAvailable,
        returnEligible:p.returnEligible,
        createdAt:     p.createdAt.toISOString(),
        variants: p.variants.map((v) => ({
          id:         v.id,
          price:      v.price?.toNumber() ?? p.price.toNumber(),
          stock:      v.quantity,
          attributes: v.attributes || {},
        })),
      };
    });

    return NextResponse.json({
      products: formatted,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.PRODUCTS_CREATE)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();

    if (!body.name) return NextResponse.json({ error: 'Product name is required' }, { status: 400 });

    // Resolve category
    let categoryId: string | null = null;
    if (body.category) {
      const cat = await prisma.category.findFirst({
        where: { OR: [{ name: body.category }, { slug: body.category }] },
      });
      categoryId = cat?.id ?? null;
    }

    // Resolve / create brand
    let brandId: string | null = null;
    if (body.brand) {
      let brand = await prisma.brand.findFirst({
        where: { OR: [{ name: body.brand }, { slug: body.brand }] },
      });
      if (!brand) {
        brand = await prisma.brand.create({
          data: {
            name:     body.brand,
            slug:     body.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
            isActive: true,
          },
        });
      }
      brandId = brand.id;
    }

    // Generate unique slug
    const baseName = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    let slug = body.urlSlug || baseName;
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) slug = `${slug}-${Date.now()}`;

    // Generate unique SKU
    const baseSku = `MB-${Date.now()}`;
    const sku = body.variants?.[0]?.sku || baseSku;
    const existingSku = await prisma.product.findUnique({ where: { sku } });
    const finalSku = existingSku ? `${sku}-${Date.now()}` : sku;

    const basePrice = body.price != null
      ? Number(body.price)
      : (body.variants?.[0]?.price ? Number(body.variants[0].price) : 0);

    const totalStock = Array.isArray(body.variants)
      ? body.variants.reduce((sum: number, v: { stock?: string | number }) => sum + (Number(v.stock) || 0), 0)
      : (body.stock ?? 0);

    const product = await prisma.product.create({
      data: {
        sku:              finalSku,
        name:             body.name,
        slug,
        description:      body.description      || null,
        shortDescription: body.shortDescription || null,
        price:            basePrice,
        compareAtPrice:   body.originalPrice    ? Number(body.originalPrice) : null,
        quantity:         totalStock,
        lowStockThreshold:body.lowStockThreshold ? Number(body.lowStockThreshold) : 5,
        isActive:         body.status === 'active' || body.status == null,
        isFeatured:       body.featured           || false,
        categoryId,
        brandId,
        metaTitle:          body.metaTitle          || null,
        metaDescription:    body.metaDescription    || null,
        metaKeywords:       body.tags               || null,
        bengaliName:        body.bengaliName        || null,
        bengaliDescription: body.bengaliDescription || null,
        focusKeyword:       body.focusKeyword       || null,
        ogTitle:            body.ogTitle            || null,
        ogImageUrl:         body.ogImageUrl         || null,
        canonicalUrl:       body.canonicalUrl       || null,
        subcategory:        body.subcategory        || null,
        skinType:           body.skinType           || [],
        ingredients:        body.ingredients        || null,
        shelfLife:          body.shelfLife          || null,
        expiryDate:         body.expiryDate ? new Date(body.expiryDate) : null,
        originCountry:      body.originCountry      || 'Bangladesh (Local)',
        shippingWeight:     body.shippingWeight     || null,
        isFragile:          body.isFragile          || false,
        discountPercentage: body.discountPercentage ? Number(body.discountPercentage) : null,
        salePrice:          body.salePrice          ? Number(body.salePrice) : null,
        offerStartDate:     body.offerStartDate ? new Date(body.offerStartDate) : null,
        offerEndDate:       body.offerEndDate   ? new Date(body.offerEndDate)   : null,
        flashSaleEligible:  body.flashSaleEligible  || false,
        returnEligible:     body.returnEligible  !== false,
        codAvailable:       body.codAvailable    !== false,
        preOrderOption:     body.preOrderOption     || false,
        barcode:            body.barcode            || null,
        relatedProducts:    body.relatedProducts    || null,
        condition:          body.condition          || 'NEW',
        gtin:               body.gtin               || null,
        averageRating:      body.averageRating ? Number(body.averageRating) : null,
        reviewCount:        body.reviewCount   ? Number(body.reviewCount)   : 0,
      },
    });

    // Create images
    if (Array.isArray(body.images) && body.images.length > 0) {
      await prisma.productImage.createMany({
        data: body.images.map((img: { url: string; alt?: string; title?: string; sortOrder?: number }, idx: number) => ({
          productId: product.id,
          url:       img.url,
          alt:       img.alt   || body.name,
          title:     img.title || body.name,
          sortOrder: img.sortOrder ?? idx,
          isDefault: idx === 0,
        })),
      });
    }

    // Create variants
    if (Array.isArray(body.variants) && body.variants.length > 0) {
      const variantData = [];
      for (const v of body.variants) {
        const vSku = v.sku || `${finalSku}-V${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const conflict = await prisma.productVariant.findUnique({ where: { sku: vSku } });
        if (!conflict) {
          variantData.push({
            productId:  product.id,
            sku:        vSku,
            name:       v.size || v.color || body.name,
            price:      v.price ? Number(v.price) : basePrice,
            quantity:   v.stock ? Number(v.stock) : 0,
            attributes: { size: v.size || '', color: v.color || '' },
          });
        }
      }
      if (variantData.length > 0) {
        await prisma.productVariant.createMany({ data: variantData });
      }
    }

    return NextResponse.json({ success: true, product: { id: product.id, slug: product.slug, name: product.name } }, { status: 201 });
  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
