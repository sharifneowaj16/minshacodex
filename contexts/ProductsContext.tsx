'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  item?: string;
  brand: string;
  originCountry: string;
  price: number;
  originalPrice?: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  createdAt: string;
  featured: boolean;
  description?: string;
  weight?: string;
  ingredients?: string;
  skinType?: string[];
  expiryDate?: string;
  shelfLife?: string;
  variants?: Array<{
    id: string;
    size?: string;
    color?: string;
    price: string;
    stock: string;
    sku: string;
  }>;
  metaTitle?: string;
  metaDescription?: string;
  urlSlug?: string;
  tags?: string;
  shippingWeight?: string;
  dimensions?: { length: string; width: string; height: string };
  isFragile?: boolean;
  freeShippingEligible?: boolean;
  discountPercentage?: string;
  salePrice?: string;
  offerStartDate?: string;
  offerEndDate?: string;
  flashSaleEligible?: boolean;
  lowStockThreshold?: string;
  barcode?: string;
  returnEligible?: boolean;
  codAvailable?: boolean;
  preOrderOption?: boolean;
  relatedProducts?: string;
}

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  saveProducts: (newProducts: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // API থেকে products fetch করো
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?activeOnly=false&limit=500');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      // API response কে Product format-এ convert করো
      const mapped: Product[] = (data.products || []).map((p: {
        id: string;
        name: string;
        category: string;
        brand: string;
        price: number;
        originalPrice?: number;
        stock: number;
        status: string;
        image: string;
        images?: string[];
        rating: number;
        reviews: number;
        createdAt: string;
        featured: boolean;
        description?: string;
        tags?: string;
        metaTitle?: string;
        metaDescription?: string;
        slug?: string;
        variants?: Array<{
          id: string;
          sku: string;
          name: string;
          price: number;
          stock: number;
        }>;
      }) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        brand: p.brand,
        originCountry: 'Bangladesh (Local)',
        price: p.price,
        originalPrice: p.originalPrice ?? undefined,
        stock: p.stock,
        status: p.status as 'active' | 'inactive' | 'out_of_stock',
        image: p.image || '✨',
        images: p.images,
        rating: p.rating,
        reviews: p.reviews,
        createdAt: p.createdAt,
        featured: p.featured,
        description: p.description,
        tags: p.tags,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        urlSlug: p.slug,
        variants: p.variants?.map(v => ({
          id: v.id,
          sku: v.sku,
          size: '',
          color: '',
          price: String(v.price),
          stock: String(v.stock),
        })),
      }));

      setProducts(mapped);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
  };

  const updateProduct = (id: string, updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        setProducts,
        saveProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        refreshProducts: fetchProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}
