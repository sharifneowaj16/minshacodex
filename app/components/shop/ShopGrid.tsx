'use client';

import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronRight, AlertCircle } from 'lucide-react';
import { filterProducts, sortProducts, parseSearchParams } from '@/lib/shopUtils';
import ProductCard from './ProductCard';
import ActiveFilters from './ActiveFilters';
import SortDropdown from './SortDropdown';
import type { Product as ShopProduct, SortOption } from '@/types/product';

function toSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  brandSlug: string;
  price: number;
  originalPrice: number | null;
  image: string;
  images: string[];
  sku: string;
  stock: number;
  category: string;
  categorySlug: string;
  rating: number;
  reviews: number;
  description: string;
  shortDescription: string;
  featured: boolean;
  isNew: boolean;
  tags: string;
  createdAt: string;
  updatedAt: string;
}

// Maps an Elasticsearch product source to ApiProduct shape
interface EsProduct {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  category?: string;
  subcategory?: string;
  brand?: string;
  images?: string[];
  inStock?: boolean;
  rating?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

function esProductToApiProduct(p: EsProduct): ApiProduct {
  const images = p.images ?? [];
  return {
    id: p.id,
    name: p.name,
    slug: p.slug || toSlug(p.name),
    brand: p.brand ?? '',
    brandSlug: toSlug(p.brand ?? ''),
    price: p.price,
    originalPrice: p.compareAtPrice ?? null,
    image: images[0] ?? '',
    images,
    sku: '',
    stock: p.inStock ? 1 : 0,
    category: p.category ?? '',
    categorySlug: toSlug(p.category ?? ''),
    rating: p.rating ?? 0,
    reviews: 0,
    description: p.description ?? '',
    shortDescription: p.description?.substring(0, 100) ?? p.name,
    featured: false,
    isNew: false,
    tags: Array.isArray(p.tags) ? p.tags.join(',') : (p.tags ?? ''),
    createdAt: p.createdAt ?? new Date().toISOString(),
    updatedAt: p.updatedAt ?? new Date().toISOString(),
  };
}

function apiProductToShopProduct(p: ApiProduct): ShopProduct {
  const createdAt = new Date(p.createdAt);
  const discount =
    p.originalPrice != null && p.originalPrice > p.price
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
      : undefined;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug || toSlug(p.name),
    brand: p.brand,
    brandSlug: p.brandSlug || toSlug(p.brand),
    price: p.price,
    originalPrice: p.originalPrice ?? undefined,
    discount,
    image: p.image,
    images: p.images?.length ? p.images : [p.image],
    sku: p.sku,
    stock: p.stock,
    category: p.category,
    categorySlug: p.categorySlug || toSlug(p.category),
    rating: p.rating,
    reviewCount: p.reviews,
    description: p.description || '',
    shortDescription: p.shortDescription || p.description?.substring(0, 100) || p.name,
    isNew: p.isNew,
    isBestSeller: false,
    isExclusive: false,
    isTrending: p.featured,
    skinType: undefined,
    skinConcerns: [],
    tags: p.tags ? p.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    isVegan: false,
    isCrueltyFree: false,
    isOrganic: false,
    isHalalCertified: false,
    isBSTIApproved: false,
    isImported: false,
    hasVariants: false,
    isCODAvailable: true,
    isSameDayDelivery: false,
    freeShippingEligible: false,
    deliveryDays: 3,
    isEMIAvailable: false,
    views: 0,
    salesCount: 0,
    createdAt,
    updatedAt: new Date(p.updatedAt),
  };
}

export default function ShopGrid() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [allProducts, setAllProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [esTotal, setEsTotal] = useState<number | null>(null);
  const [esTotalPages, setEsTotalPages] = useState<number | null>(null);
  const [spellSuggestion, setSpellSuggestion] = useState<string | null>(null);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const [facets, setFacets] = useState<{ brands: { value: string; count: number }[] }>({ brands: [] });

  const q = searchParams.get('q') || '';
  const filters = parseSearchParams(searchParams as unknown as URLSearchParams);
  const page = filters.page || 1;
  const pageSize = 20;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        if (q.trim()) {
          // ── Elasticsearch path ──────────────────────────────────────
          const params = new URLSearchParams();
          params.set('q', q);
          params.set('page', String(page));
          params.set('limit', String(pageSize));

          const category = searchParams.get('category');
          const brand = searchParams.get('brand');
          const minPrice = searchParams.get('minPrice');
          const maxPrice = searchParams.get('maxPrice');
          const sort = searchParams.get('sort');
          const inStock = searchParams.get('inStockOnly');
          const rating = searchParams.get('rating');

          if (category) params.set('category', category);
          if (brand) params.set('brand', brand);
          if (minPrice) params.set('minPrice', minPrice);
          if (maxPrice) params.set('maxPrice', maxPrice);
          if (sort) params.set('sort', sort);
          if (inStock === 'true') params.set('inStock', 'true');
          if (rating) params.set('rating', rating);

          const res = await fetch(`/api/search?${params.toString()}`);
          if (!res.ok) throw new Error('Search failed');
          const data = await res.json();

          // API returns products at root level: data.products, data.total, data.totalPages
          const esProducts: EsProduct[] = data.products ?? [];
          setAllProducts(esProducts.map((p) => apiProductToShopProduct(esProductToApiProduct(p))));
          setEsTotal(data.total ?? 0);
          setEsTotalPages(data.totalPages ?? 1);
          setSpellSuggestion(data.spellSuggestion ?? null);
          setFallbackMessage(data.fallback?.message ?? null);
          setFacets({ brands: data.facets?.brands ?? [] });
        } else {
          // ── Regular products API path ────────────────────────────────
          setEsTotal(null);
          setEsTotalPages(null);

          const params = new URLSearchParams({ limit: '100', activeOnly: 'true' });

          const category = searchParams.get('category');
          const brand = searchParams.get('brand');
          const search = searchParams.get('search');
          const minPrice = searchParams.get('minPrice');
          const maxPrice = searchParams.get('maxPrice');

          if (category) params.set('category', category);
          if (brand) params.set('brand', brand);
          if (search) params.set('search', search);
          if (minPrice) params.set('minPrice', minPrice);
          if (maxPrice) params.set('maxPrice', maxPrice);

          const res = await fetch(`/api/products?${params.toString()}`);
          if (!res.ok) throw new Error('Failed to fetch products');
          const data = await res.json();
          const apiProds: ApiProduct[] = data.products || [];
          setAllProducts(apiProds.map(apiProductToShopProduct));
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams, q, page]);

  // For ES results, server already paginated; for regular, do client-side
  const displayProducts = useMemo(() => {
    if (q.trim()) {
      // ES already returned the right page
      return allProducts;
    }
    const filtered = filterProducts(allProducts, filters);
    const sorted = sortProducts(filtered, (filters.sort || 'featured') as SortOption);
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [allProducts, filters, q, page]);

  const totalCount = q.trim()
    ? (esTotal ?? 0)
    : (() => {
        const filtered = filterProducts(allProducts, filters);
        return filtered.length;
      })();

  const totalPages = q.trim()
    ? (esTotalPages ?? 1)
    : Math.ceil(totalCount / pageSize);

  const start = (page - 1) * pageSize;
  const hasMore = page < totalPages;

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
            <div className="w-full aspect-square bg-minsah-accent/30 rounded-lg mb-3" />
            <div className="h-4 bg-minsah-accent/30 rounded w-3/4 mb-2" />
            <div className="h-4 bg-minsah-accent/30 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // Handler for spell correction click
  const applySpellSuggestion = () => {
    if (!spellSuggestion) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', spellSuggestion);
    router.push(`/shop?${params.toString()}`);
  };

  // Brand filter click
  const applyBrandFilter = (brandValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (brandValue) {
      params.set('brand', brandValue);
    } else {
      params.delete('brand');
    }
    router.push(`/shop?${params.toString()}`);
  };

  const currentBrand = searchParams.get('brand') || '';

  return (
    <>
      {/* Did you mean? */}
      {spellSuggestion && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm">
          <AlertCircle size={16} className="text-yellow-600 flex-shrink-0" />
          <span className="text-yellow-800">
            Did you mean:{' '}
            <button
              onClick={applySpellSuggestion}
              className="font-semibold text-minsah-primary underline underline-offset-2 hover:text-minsah-dark"
            >
              {spellSuggestion}
            </button>
            ?
          </span>
        </div>
      )}

      {/* Fallback notice */}
      {fallbackMessage && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 flex items-center gap-2">
          <AlertCircle size={16} className="text-blue-600 flex-shrink-0" />
          {fallbackMessage}
        </div>
      )}

      {/* Brand filter chips (from facets) */}
      {facets.brands.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Filter by Brand</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => applyBrandFilter('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                !currentBrand
                  ? 'bg-minsah-primary text-white border-minsah-primary'
                  : 'border-gray-200 text-gray-600 hover:border-minsah-primary hover:text-minsah-primary'
              }`}
            >
              All
            </button>
            {facets.brands.slice(0, 10).map(b => (
              <button
                key={b.value}
                onClick={() => applyBrandFilter(b.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  currentBrand === b.value
                    ? 'bg-minsah-primary text-white border-minsah-primary'
                    : 'border-gray-200 text-gray-600 hover:border-minsah-primary hover:text-minsah-primary'
                }`}
              >
                {b.value} <span className="opacity-60">({b.count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex-1">
          <ActiveFilters totalProducts={totalCount} />
        </div>
        <div className="flex-shrink-0">
          <SortDropdown />
        </div>
      </div>

      {displayProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Link
                href={`/shop?${new URLSearchParams({
                  ...Object.fromEntries(searchParams.entries()),
                  page: String(page + 1),
                }).toString()}`}
                className="px-6 py-3 bg-minsah-primary text-white rounded-lg hover:bg-minsah-dark transition-colors font-semibold flex items-center gap-2"
              >
                Load More Products
                <ChevronRight size={20} />
              </Link>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-minsah-secondary">
            Showing {start + 1}&ndash;{Math.min(start + pageSize, totalCount)} of {totalCount}{' '}
            products
            {totalPages > 1 && ` \u2022 Page ${page} of ${totalPages}`}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 text-minsah-secondary">&#128269;</div>
          <h3 className="text-2xl font-bold text-minsah-dark mb-2">No products found</h3>
          <p className="text-minsah-secondary mb-6">
            Try adjusting your filters or search for something else
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-3 bg-minsah-primary text-white rounded-lg hover:bg-minsah-dark transition-colors font-semibold"
          >
            Clear All Filters
          </Link>
        </div>
      )}
    </>
  );
}
