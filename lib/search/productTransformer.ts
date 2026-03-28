/**
 * lib/search/productTransformer.ts
 *
 * Transforms a Prisma Product (with relations) into an
 * Elasticsearch document matching our index mapping.
 */

interface ProductWithRelations {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: any; // Decimal
  compareAtPrice?: any | null;
  quantity?: number;
  sku?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  images?: Array<{ url: string; alt?: string | null }>;
  category?: {
    name: string;
    slug: string;
    parent?: {
      name: string;
      slug: string;
      parent?: { name: string; slug: string } | null;
    } | null;
  } | null;
  brand?: { name: string; slug: string } | null;
  reviews?: Array<{ rating: number }>;
}

export interface ESProductDocument {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  category: string;
  subcategory: string;
  categoryHierarchy: string[];
  price: number;
  compareAtPrice: number | null;
  discount: number;
  stock: number;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  sku: string;
  tags: string[];
  ingredients: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isFlashSale: boolean;
  isFavourite: boolean;
  isRecommended: boolean;
  isForYou: boolean;
  createdAt: Date;
  updatedAt: Date;
  suggest: { input: string[]; weight: number };
  popularityScore: number;
  searchClickCount: number;
  viewCount: number;
  salesCount: number;
}

/**
 * Build category hierarchy array from nested category.
 */
function buildCategoryHierarchy(
  category: ProductWithRelations['category']
): string[] {
  if (!category) return [];

  const hierarchy: string[] = [category.name];

  if (category.parent) {
    hierarchy.unshift(category.parent.name);
    if (category.parent.parent) {
      hierarchy.unshift(category.parent.parent.name);
    }
  }

  return hierarchy;
}

/**
 * Build autocomplete suggestions from product name and brand.
 */
function buildSuggestions(
  product: ProductWithRelations
): { input: string[]; weight: number } {
  const inputs = new Set<string>();

  // Full name
  inputs.add(product.name);

  // Individual words from name (>2 chars)
  const words = product.name.split(/\s+/).filter((w) => w.length > 2);
  for (const word of words) inputs.add(word);

  // Brand
  if (product.brand?.name) inputs.add(product.brand.name);

  // Category
  if (product.category?.name) inputs.add(product.category.name);

  // Weight: featured products get higher weight
  let weight = 1;
  if (product.isFeatured) weight += 5;
  if (product.isNew) weight += 2;

  // Reviews boost
  const reviewCount = product.reviews?.length ?? 0;
  if (reviewCount > 10) weight += 3;
  else if (reviewCount > 5) weight += 1;

  return { input: [...inputs], weight };
}

/**
 * Transform a Prisma Product into an ES document.
 */
export function transformProductToES(
  product: ProductWithRelations
): ESProductDocument {
  const price = parseFloat(product.price?.toString() ?? '0');
  const compareAtPrice = product.compareAtPrice
    ? parseFloat(product.compareAtPrice.toString())
    : null;

  const discount =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : 0;

  const reviews = product.reviews ?? [];
  const rating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10
        ) / 10
      : 0;

  const hierarchy = buildCategoryHierarchy(product.category);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    brand: product.brand?.name || '',
    category: hierarchy[0] || '',
    subcategory: hierarchy[1] || hierarchy[0] || '',
    categoryHierarchy: hierarchy,
    price,
    compareAtPrice,
    discount,
    stock: product.quantity ?? 0,
    inStock: (product.quantity ?? 0) > 0,
    rating,
    reviewCount: reviews.length,
    image: product.images?.[0]?.url || '',
    images: product.images?.map((img) => img.url) || [],
    sku: product.sku || '',
    tags: [],
    ingredients: '',
    isFeatured: product.isFeatured || false,
    isNewArrival: product.isNew || false,
    isFlashSale: false,
    isFavourite: false,
    isRecommended: false,
    isForYou: false,
    createdAt: product.createdAt || new Date(),
    updatedAt: product.updatedAt || new Date(),
    suggest: buildSuggestions(product),
    popularityScore: 0,
    searchClickCount: 0,
    viewCount: 0,
    salesCount: 0,
  };
}
