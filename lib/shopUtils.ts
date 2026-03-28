import { Product, ShopFilters, SortOption, ActiveFilter } from '@/types/product';

// URL State Management
export function parseSearchParams(searchParams: URLSearchParams): ShopFilters {
  return {
    category: searchParams.get('category') || undefined,
    subcategory: searchParams.get('subcategory') || undefined,
    brand: searchParams.get('brand')?.split(',') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    skinType: searchParams.get('skinType')?.split(',') || undefined,
    skinConcern: searchParams.get('skinConcern')?.split(',') || undefined,
    rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
    tags: searchParams.get('tags')?.split(',') || undefined,
    inStockOnly: searchParams.get('inStockOnly') === 'true',
    saleOnly: searchParams.get('saleOnly') === 'true',
    search: searchParams.get('search') || undefined,
    sort: (searchParams.get('sort') as SortOption) || 'featured',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  };
}

export function buildSearchParams(filters: Partial<ShopFilters>): string {
  const params = new URLSearchParams();

  if (filters.category) params.set('category', filters.category.toString());
  if (filters.subcategory) params.set('subcategory', filters.subcategory.toString());
  if (filters.brand && Array.isArray(filters.brand) && filters.brand.length > 0) {
    params.set('brand', filters.brand.join(','));
  }
  if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString());
  if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString());
  if (filters.skinType && Array.isArray(filters.skinType) && filters.skinType.length > 0) {
    params.set('skinType', filters.skinType.join(','));
  }
  if (filters.skinConcern && Array.isArray(filters.skinConcern) && filters.skinConcern.length > 0) {
    params.set('skinConcern', filters.skinConcern.join(','));
  }
  if (filters.rating) params.set('rating', filters.rating.toString());
  if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
    params.set('tags', filters.tags.join(','));
  }
  if (filters.inStockOnly) params.set('inStockOnly', 'true');
  if (filters.saleOnly) params.set('saleOnly', 'true');
  if (filters.search) params.set('search', filters.search);
  if (filters.sort && filters.sort !== 'featured') params.set('sort', filters.sort);
  if (filters.page && filters.page > 1) params.set('page', filters.page.toString());

  return params.toString();
}

// Filter products based on criteria
export function filterProducts(products: Product[], filters: ShopFilters): Product[] {
  let filtered = [...products];

  // Category filter
  if (filters.category) {
    filtered = filtered.filter(p => p.categorySlug === filters.category);
  }

  // Subcategory filter
  if (filters.subcategory) {
    filtered = filtered.filter(p => p.subcategorySlug === filters.subcategory);
  }

  // Brand filter
  if (filters.brand && filters.brand.length > 0) {
    const brands = Array.isArray(filters.brand) ? filters.brand : [filters.brand];
    filtered = filtered.filter(p => brands.includes(p.brandSlug));
  }

  // Price range filter
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(p => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(p => p.price <= filters.maxPrice!);
  }

  // Skin type filter
  if (filters.skinType && filters.skinType.length > 0) {
    const skinTypes = Array.isArray(filters.skinType) ? filters.skinType : [filters.skinType];
    filtered = filtered.filter(p =>
      p.skinType && p.skinType.some(st => skinTypes.includes(st))
    );
  }

  // Skin concern filter
  if (filters.skinConcern && filters.skinConcern.length > 0) {
    const concerns = Array.isArray(filters.skinConcern) ? filters.skinConcern : [filters.skinConcern];
    filtered = filtered.filter(p =>
      p.skinConcerns && p.skinConcerns.some(sc => concerns.includes(sc))
    );
  }

  // Rating filter
  if (filters.rating) {
    filtered = filtered.filter(p => p.rating >= filters.rating!);
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    const tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
    filtered = filtered.filter(p => {
      const productTags = [
        ...(p.isVegan ? ['vegan'] : []),
        ...(p.isCrueltyFree ? ['cruelty-free'] : []),
        ...(p.isOrganic ? ['organic'] : []),
        ...(p.isHalalCertified ? ['halal'] : []),
        ...p.tags.map(t => t.toLowerCase()),
      ];
      return tags.some(tag => productTags.includes(tag.toLowerCase()));
    });
  }

  // In stock filter
  if (filters.inStockOnly) {
    filtered = filtered.filter(p => p.stock > 0);
  }

  // Sale filter
  if (filters.saleOnly) {
    filtered = filtered.filter(p => p.discount && p.discount > 0);
  }

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.brand.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  return filtered;
}

// Sort products
export function sortProducts(products: Product[], sortBy: SortOption): Product[] {
  const sorted = [...products];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'best-selling':
      return sorted.sort((a, b) => b.salesCount - a.salesCount);
    case 'price-low-high':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high-low':
      return sorted.sort((a, b) => b.price - a.price);
    case 'highest-rated':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'biggest-discount':
      return sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    case 'a-z':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'z-a':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'featured':
    default:
      return sorted.sort((a, b) => {
        // Featured logic: Best sellers + high rated + new
        const scoreA = (a.salesCount * 0.4) + (a.rating * 20 * 0.3) + (a.isNew ? 50 : 0) + (a.isBestSeller ? 30 : 0);
        const scoreB = (b.salesCount * 0.4) + (b.rating * 20 * 0.3) + (b.isNew ? 50 : 0) + (b.isBestSeller ? 30 : 0);
        return scoreB - scoreA;
      });
  }
}

// Get active filters for display
export function getActiveFilters(filters: ShopFilters): ActiveFilter[] {
  const active: ActiveFilter[] = [];

  if (filters.category) {
    active.push({
      type: 'category',
      label: `Category: ${filters.category}`,
      value: filters.category.toString(),
      param: 'category',
    });
  }

  if (filters.subcategory) {
    active.push({
      type: 'subcategory',
      label: `Subcategory: ${filters.subcategory}`,
      value: filters.subcategory.toString(),
      param: 'subcategory',
    });
  }

  if (filters.brand && Array.isArray(filters.brand)) {
    filters.brand.forEach(brand => {
      active.push({
        type: 'brand',
        label: brand,
        value: brand,
        param: 'brand',
      });
    });
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const min = filters.minPrice || 0;
    const max = filters.maxPrice || Infinity;
    active.push({
      type: 'price',
      label: `৳${formatPrice(min)} - ৳${formatPrice(max)}`,
      value: `${min}-${max}`,
      param: 'price',
    });
  }

  if (filters.skinType && Array.isArray(filters.skinType)) {
    filters.skinType.forEach(type => {
      active.push({
        type: 'skinType',
        label: `Skin: ${type}`,
        value: type,
        param: 'skinType',
      });
    });
  }

  if (filters.skinConcern && Array.isArray(filters.skinConcern)) {
    filters.skinConcern.forEach(concern => {
      active.push({
        type: 'skinConcern',
        label: concern,
        value: concern,
        param: 'skinConcern',
      });
    });
  }

  if (filters.rating) {
    active.push({
      type: 'rating',
      label: `${filters.rating} & above`,
      value: filters.rating.toString(),
      param: 'rating',
    });
  }

  if (filters.tags && Array.isArray(filters.tags)) {
    filters.tags.forEach(tag => {
      active.push({
        type: 'tag',
        label: tag,
        value: tag,
        param: 'tags',
      });
    });
  }

  if (filters.inStockOnly) {
    active.push({
      type: 'availability',
      label: 'In Stock Only',
      value: 'true',
      param: 'inStockOnly',
    });
  }

  if (filters.saleOnly) {
    active.push({
      type: 'availability',
      label: 'Sale Items',
      value: 'true',
      param: 'saleOnly',
    });
  }

  return active;
}

// Format price with BDT
export function formatPrice(price: number): string {
  return price.toLocaleString('en-BD');
}

// Calculate savings
export function calculateSavings(price: number, originalPrice?: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return originalPrice - price;
}

// Generate SEO-friendly title
export function generatePageTitle(filters: ShopFilters): string {
  const parts: string[] = [];

  if (filters.category) {
    const cat = Array.isArray(filters.category) ? filters.category[0] : filters.category;
    if (cat) parts.push(cat.charAt(0).toUpperCase() + cat.slice(1));
  }
  if (filters.subcategory) {
    const sub = Array.isArray(filters.subcategory) ? filters.subcategory[0] : filters.subcategory;
    if (sub) parts.push(sub.charAt(0).toUpperCase() + sub.slice(1));
  }
  if (filters.brand && Array.isArray(filters.brand) && filters.brand.length === 1) {
    parts.push(filters.brand[0]);
  }

  if (parts.length === 0) {
    return 'Shop Beauty Products | Buy Cosmetics Online | Minsah Beauty';
  }

  return `${parts.join(' ')} Products | Buy ${parts.join(' ')} Online | Minsah Beauty`;
}

// Generate meta description
export function generateMetaDescription(filters: ShopFilters, totalProducts: number): string {
  const parts: string[] = [`Shop ${totalProducts}`];

  if (filters.brand && Array.isArray(filters.brand) && filters.brand.length > 0) {
    parts.push(filters.brand.join(', '));
  }
  if (filters.category) {
    const cat = Array.isArray(filters.category) ? filters.category.join(', ') : filters.category;
    parts.push(cat);
  }
  if (filters.subcategory) {
    const sub = Array.isArray(filters.subcategory) ? filters.subcategory.join(', ') : filters.subcategory;
    parts.push(sub);
  }

  parts.push('products');

  if (filters.minPrice && filters.maxPrice) {
    parts.push(`under ৳${formatPrice(filters.maxPrice)}`);
  }

  parts.push('in Bangladesh. Free shipping, Cash on Delivery, Easy Returns | Minsah Beauty');

  return parts.join(' ');
}
