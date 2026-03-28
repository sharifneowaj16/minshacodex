// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_PERMISSIONS,
  getAuthenticatedAdminFromRequest,
  hasAdminPermission,
} from '@/lib/auth/adminAuth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ── GET /api/products/[id] ─────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        images:   { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { id: 'asc' } },
        category: true,
        brand:    true,
        reviews:  {
          where:   { isApproved: true },
          select:  {
            id: true, rating: true, comment: true, title: true, createdAt: true,
            user: { select: { firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const mainImage = product.images.find((i) => i.isDefault) || product.images[0];

    const relatedProducts = product.categoryId
      ? await prisma.product.findMany({
          where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
          take: 4,
          include: { images: { where: { isDefault: true }, take: 1 } },
        })
      : [];

    const reviews = product.reviews.map((r) => ({
      id:        r.id,
      userName:  [r.user.firstName, r.user.lastName].filter(Boolean).join(' ') || 'Customer',
      rating:    r.rating,
      title:     r.title   || '',
      content:   r.comment || '',
      verified:  true,
      createdAt: r.createdAt.toISOString(),
    }));

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });

    return NextResponse.json({
      product: {
        id:               product.id,
        name:             product.name,
        slug:             product.slug,
        description:      product.description      || '',
        shortDescription: product.shortDescription || '',
        price:            product.price.toNumber(),
        originalPrice:    product.compareAtPrice ? product.compareAtPrice.toNumber() : null,
        image:            mainImage?.url  || '',
        // FIXED: return full image objects with alt text
        images:           product.images.map((i) => ({ url: i.url, alt: i.alt || '', isDefault: i.isDefault })),
        sku:              product.sku,
        stock:            product.quantity,
        category:         product.category?.name || '',
        categorySlug:     product.category?.slug || '',
        brand:            product.brand?.name    || '',
        rating:           product.averageRating?.toNumber() || 0,
        reviews:          product.reviewCount    || 0,
        inStock:          product.quantity > 0,
        isNew:            product.isNew,
        isFeatured:       product.isFeatured,
        ingredients:      product.ingredients    || '',
        skinType:         product.skinType       || [],
        codAvailable:     product.codAvailable,
        returnEligible:   product.returnEligible,
        metaTitle:        product.metaTitle      || '',
        metaDescription:  product.metaDescription || '',
        ogTitle:          product.ogTitle         || '',
        ogImageUrl:       product.ogImageUrl      || '',
        // FIXED: variants with image field
        variants: product.variants.map((v) => ({
          id:         v.id,
          sku:        v.sku,
          name:       v.name,
          price:      v.price ? v.price.toNumber() : product.price.toNumber(),
          stock:      v.quantity,
          attributes: v.attributes || {},
          image:      v.image || '',
        })),
      },
      reviews,
      rating: {
        average:      product.averageRating?.toNumber() || 0,
        total:        product.reviewCount || 0,
        distribution,
      },
      relatedProducts: relatedProducts.map((rp) => ({
        id:            rp.id,
        name:          rp.name,
        slug:          rp.slug,
        price:         rp.price.toNumber(),
        originalPrice: rp.compareAtPrice ? rp.compareAtPrice.toNumber() : null,
        image:         rp.images[0]?.url || '',
      })),
    });
  } catch (error) {
    console.error('GET /api/products/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// ── PUT /api/products/[id] ─────────────────────────────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.PRODUCTS_EDIT)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { variants: true, images: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Resolve category
    let categoryId: string | null = existing.categoryId;
    if (body.category) {
      const cat = await prisma.category.findFirst({
        where: { OR: [{ name: body.category }, { slug: body.category }] },
      });
      categoryId = cat?.id ?? existing.categoryId ?? null;
    }

    // Resolve / create brand
    let brandId: string | null = existing.brandId;
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

    // Resolve slug
    let slug = existing.slug;
    if (body.slug && body.slug !== existing.slug) {
      const conflict = await prisma.product.findFirst({
        where: { slug: body.slug, id: { not: existing.id } },
      });
      if (!conflict) slug = body.slug;
    }

    const updateData: Record<string, unknown> = {
      name:             body.name             ?? existing.name,
      slug,
      description:      body.description      ?? existing.description,
      shortDescription: body.shortDescription ?? existing.shortDescription,
      categoryId,
      brandId,
      price:          body.price         != null ? body.price         : existing.price,
      compareAtPrice: body.originalPrice != null ? body.originalPrice : existing.compareAtPrice,
      costPrice:      body.costPrice     != null ? body.costPrice     : existing.costPrice,
      lowStockThreshold: body.lowStockThreshold != null ? Number(body.lowStockThreshold) : existing.lowStockThreshold,
      weight: body.weight != null ? body.weight : existing.weight,
      // FIXED: dimensions saved correctly
      length: body.dimensions?.length && body.dimensions.length !== '' ? Number(body.dimensions.length) : existing.length,
      width:  body.dimensions?.width  && body.dimensions.width  !== '' ? Number(body.dimensions.width)  : existing.width,
      height: body.dimensions?.height && body.dimensions.height !== '' ? Number(body.dimensions.height) : existing.height,
      isActive:   body.status   !== undefined ? body.status === 'active' : existing.isActive,
      isFeatured: body.featured != null       ? body.featured            : existing.isFeatured,
      metaTitle:          body.metaTitle          ?? existing.metaTitle,
      metaDescription:    body.metaDescription    ?? existing.metaDescription,
      metaKeywords:       body.tags               ?? existing.metaKeywords,
      bengaliName:        body.bengaliName        ?? existing.bengaliName,
      bengaliDescription: body.bengaliDescription ?? existing.bengaliDescription,
      focusKeyword:       body.focusKeyword       ?? existing.focusKeyword,
      ogTitle:            body.ogTitle            ?? existing.ogTitle,
      ogImageUrl:         body.ogImageUrl         ?? existing.ogImageUrl,
      canonicalUrl:       body.canonicalUrl       ?? existing.canonicalUrl,
      // FIXED: subcategory saved
      subcategory:   body.subcategory   ?? existing.subcategory,
      skinType:      body.skinType      ?? existing.skinType,
      ingredients:   body.ingredients   ?? existing.ingredients,
      shelfLife:     body.shelfLife     ?? existing.shelfLife,
      expiryDate:    body.expiryDate    ? new Date(body.expiryDate) : existing.expiryDate,
      originCountry: body.originCountry ?? existing.originCountry,
      shippingWeight: body.shippingWeight ?? existing.shippingWeight,
      isFragile:      body.isFragile      ?? existing.isFragile,
      discountPercentage: body.discountPercentage != null ? Number(body.discountPercentage) : existing.discountPercentage,
      salePrice:          body.salePrice          != null ? Number(body.salePrice)          : existing.salePrice,
      offerStartDate: body.offerStartDate ? new Date(body.offerStartDate) : existing.offerStartDate,
      offerEndDate:   body.offerEndDate   ? new Date(body.offerEndDate)   : existing.offerEndDate,
      flashSaleEligible:  body.flashSaleEligible ?? existing.flashSaleEligible,
      returnEligible:  body.returnEligible  ?? existing.returnEligible,
      codAvailable:    body.codAvailable    ?? existing.codAvailable,
      preOrderOption:  body.preOrderOption  ?? existing.preOrderOption,
      barcode:         body.barcode         ?? existing.barcode,
      relatedProducts: body.relatedProducts ?? existing.relatedProducts,
      condition:     body.condition     ?? existing.condition,
      gtin:          body.gtin          ?? existing.gtin,
      averageRating: body.averageRating != null ? Number(body.averageRating) : existing.averageRating,
      reviewCount:   body.reviewCount   != null ? Number(body.reviewCount)   : existing.reviewCount,
    };

    const updated = await prisma.product.update({
      where: { id: existing.id },
      data:  updateData,
    });

    // FIXED: Images with alt text saved properly
    if (Array.isArray(body.images) && body.images.length > 0) {
      await prisma.productImage.deleteMany({ where: { productId: existing.id } });
      await prisma.productImage.createMany({
        data: body.images.map(
          (img: { url: string; alt?: string; title?: string; sortOrder?: number }, idx: number) => ({
            productId: existing.id,
            url:       img.url,
            alt:       img.alt   || '',
            title:     img.title || '',
            sortOrder: img.sortOrder ?? idx,
            isDefault: idx === 0,
          })
        ),
      });
    }

    // FIXED: Variants with image field
    if (Array.isArray(body.variants) && body.variants.length > 0) {
      for (const v of body.variants) {
        const variantSku  = v.sku || `${updated.sku}-V${Date.now()}`;
        const isRealId    = v.id && v.id.length > 10 && !['1','2','3','4','5'].includes(v.id);
        const variantData = {
          productId:  existing.id,
          name:       v.size || v.color || v.name || updated.name,
          sku:        variantSku,
          price:      v.price != null ? Number(v.price) : updated.price,
          quantity:   v.stock != null ? Number(v.stock) : 0,
          attributes: { size: v.size || '', color: v.color || '' },
          image:      v.image || null, // FIXED: variant image saved
        };
        if (isRealId) {
          await prisma.productVariant.upsert({
            where:  { id: v.id },
            update: variantData,
            create: { ...variantData, sku: variantSku },
          });
        } else {
          const skuConflict = await prisma.productVariant.findUnique({ where: { sku: variantSku } });
          if (!skuConflict) await prisma.productVariant.create({ data: variantData });
        }
      }
      const totalStock = body.variants.reduce(
        (sum: number, v: { stock?: string | number }) => sum + (Number(v.stock) || 0), 0
      );
      await prisma.product.update({ where: { id: existing.id }, data: { quantity: totalStock } });
    }

    return NextResponse.json({ success: true, product: { id: updated.id, slug: updated.slug, name: updated.name } });
  } catch (error) {
    console.error('PUT /api/products/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// ── DELETE /api/products/[id] ──────────────────────────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.PRODUCTS_DELETE)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.product.findFirst({ where: { OR: [{ id }, { slug: id }] } });
    if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    await prisma.product.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/products/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
