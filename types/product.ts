// Product and Shop Types

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  brandSlug: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images: string[];
  sku: string;
  stock: number;
  category: string;
  categorySlug: string;
  subcategory?: string;
  subcategorySlug?: string;
  rating: number;
  reviewCount: number;
  description: string;
  shortDescription: string;

  // Badges
  isNew: boolean;
  isBestSeller: boolean;
  isExclusive: boolean;
  isTrending: boolean;

  // Product attributes
  skinType?: ('oily' | 'dry' | 'combination' | 'normal' | 'sensitive')[];
  skinConcerns?: ('acne' | 'aging' | 'dryness' | 'sensitivity' | 'dark-spots' | 'pores')[];
  tags: string[];
  isVegan: boolean;
  isCrueltyFree: boolean;
  isOrganic: boolean;
  isHalalCertified: boolean;
  isBSTIApproved: boolean;
  isImported: boolean;

  // Variants
  hasVariants: boolean;
  variants?: ProductVariant[];

  // Delivery
  isCODAvailable: boolean;
  isSameDayDelivery: boolean;
  freeShippingEligible: boolean;
  deliveryDays: number;

  // Payments
  isEMIAvailable: boolean;
  emiMonths?: number[];

  // Meta
  views: number;
  salesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  option: string; // e.g., "Shade" or "Size"
  value: string; // e.g., "Ruby Red" or "50ml"
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
  image?: string;
}

export interface FilterOptions {
  categories: CategoryFilter[];
  brands: BrandFilter[];
  priceRange: {
    min: number;
    max: number;
  };
  skinTypes: string[];
  skinConcerns: string[];
  ratings: number[];
  tags: TagFilter[];
}

export interface CategoryFilter {
  id: string;
  name: string;
  slug: string;
  count: number;
  subcategories?: SubcategoryFilter[];
}

export interface SubcategoryFilter {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface BrandFilter {
  id: string;
  name: string;
  slug: string;
  count: number;
  logo?: string;
}

export interface TagFilter {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface ActiveFilter {
  type: 'category' | 'subcategory' | 'brand' | 'price' | 'skinType' | 'skinConcern' | 'rating' | 'tag' | 'availability';
  label: string;
  value: string;
  param: string; // URL parameter key
}

export type SortOption =
  | 'featured'
  | 'newest'
  | 'best-selling'
  | 'price-low-high'
  | 'price-high-low'
  | 'highest-rated'
  | 'biggest-discount'
  | 'a-z'
  | 'z-a';

export interface ShopFilters {
  category?: string | string[];
  subcategory?: string | string[];
  brand?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  skinType?: string | string[];
  skinConcern?: string | string[];
  rating?: number;
  tags?: string | string[];
  inStockOnly?: boolean;
  saleOnly?: boolean;
  search?: string;
  sort?: SortOption;
  page?: number;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: FilterOptions;
}

// Quick View Modal
export interface QuickViewProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  shortDescription: string;
  stock: number;
  hasVariants: boolean;
  variants?: ProductVariant[];
  isCODAvailable: boolean;
  freeShippingEligible: boolean;
}

// Wishlist
export interface WishlistItem {
  productId: string;
  addedAt: Date;
}

// Recently Viewed
export interface RecentlyViewed {
  productId: string;
  viewedAt: Date;
}

// Comparison
export interface CompareProduct {
  productId: string;
  addedAt: Date;
}
