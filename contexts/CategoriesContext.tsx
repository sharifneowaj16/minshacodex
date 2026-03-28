'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Subcategory {
  name: string;
  items: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  href: string;
  icon?: string;
  subcategories: Subcategory[];
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  saveCategories: (newCategories: Category[]) => void;
  getActiveCategories: () => Category[];
  refreshCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories?activeOnly=false');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const saveCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
  };

  const getActiveCategories = () => {
    return categories.filter(cat => cat.status === 'active');
  };

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        loading,
        setCategories,
        saveCategories,
        getActiveCategories,
        refreshCategories: fetchCategories,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}

export type { Category, Subcategory };
