import { Product, FilterOptions } from '@/types/product';

// Product data - populated from database
export const mockProducts: Product[] = [];

// Generate filter options from products
export function getFilterOptions(products: Product[]): FilterOptions {
  const categories = new Map<string, { name: string; slug: string; count: number }>();
  const brands = new Map<string, { name: string; slug: string; count: number }>();
  const subcategories = new Map<string, Map<string, { name: string; slug: string; count: number }>>();

  let minPrice = Infinity;
  let maxPrice = 0;

  products.forEach(product => {
    // Categories
    if (!categories.has(product.categorySlug)) {
      categories.set(product.categorySlug, {
        name: product.category,
        slug: product.categorySlug,
        count: 0,
      });
    }
    categories.get(product.categorySlug)!.count++;

    // Subcategories
    if (product.subcategory && product.subcategorySlug) {
      if (!subcategories.has(product.categorySlug)) {
        subcategories.set(product.categorySlug, new Map());
      }
      const catSubcats = subcategories.get(product.categorySlug)!;
      if (!catSubcats.has(product.subcategorySlug)) {
        catSubcats.set(product.subcategorySlug, {
          name: product.subcategory,
          slug: product.subcategorySlug,
          count: 0,
        });
      }
      catSubcats.get(product.subcategorySlug)!.count++;
    }

    // Brands
    if (!brands.has(product.brandSlug)) {
      brands.set(product.brandSlug, {
        name: product.brand,
        slug: product.brandSlug,
        count: 0,
      });
    }
    brands.get(product.brandSlug)!.count++;

    // Price range
    minPrice = Math.min(minPrice, product.price);
    maxPrice = Math.max(maxPrice, product.price);
  });

  // Convert to arrays
  const categoryFilters = Array.from(categories.values()).map(cat => ({
    id: cat.slug,
    name: cat.name,
    slug: cat.slug,
    count: cat.count,
    subcategories: subcategories.has(cat.slug)
      ? Array.from(subcategories.get(cat.slug)!.values()).map(sub => ({
          id: sub.slug,
          name: sub.name,
          slug: sub.slug,
          count: sub.count,
        }))
      : [],
  }));

  const brandFilters = Array.from(brands.values()).map(brand => ({
    id: brand.slug,
    name: brand.name,
    slug: brand.slug,
    count: brand.count,
  }));

  return {
    categories: categoryFilters,
    brands: brandFilters,
    priceRange: {
      min: Math.floor(minPrice / 100) * 100,
      max: Math.ceil(maxPrice / 100) * 100,
    },
    skinTypes: ['oily', 'dry', 'combination', 'normal', 'sensitive'],
    skinConcerns: ['acne', 'aging', 'dryness', 'sensitivity', 'dark-spots', 'pores'],
    ratings: [4, 3, 2, 1],
    tags: [
      { id: 'vegan', name: 'Vegan', slug: 'vegan' },
      { id: 'cruelty-free', name: 'Cruelty-Free', slug: 'cruelty-free' },
      { id: 'organic', name: 'Organic', slug: 'organic' },
      { id: 'halal', name: 'Halal Certified', slug: 'halal' },
    ],
  };
}

export const filterOptions = getFilterOptions(mockProducts);
