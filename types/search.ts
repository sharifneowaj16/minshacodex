import React from 'react';

// TypeScript interfaces for Advanced Search Component

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  subcategory?: string;
  description?: string;
  rating?: number;
  inStock: boolean;
  tags?: string[];
}

export interface Filter {
  category?: string;
  subcategory?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  rating?: number;
}

export interface SortOption {
  value: 'name' | 'price' | 'rating' | 'newest';
  label: string;
  direction: 'asc' | 'desc';
}

export interface SearchHistory {
  term: string;
  timestamp: Date;
  resultCount?: number;
}

export interface SuggestionItem {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand' | 'suggestion' | 'history';
  count?: number;
  icon?: React.ReactNode;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: React.ReactNode;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

export interface SearchState {
  query: string;
  filters: Filter;
  sort: SortOption;
  results: Product[];
  suggestions: SuggestionItem[];
  history: SearchHistory[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}

export interface VoiceSearchState {
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  language: 'en-US' | 'bn-BD';
}

export interface AdvancedSearchProps {
  products: Product[];
  categories: Category[];
  onSearch?: (query: string, filters: Filter, sort: SortOption) => void;
  onProductClick?: (product: Product) => void;
  className?: string;
  placeholder?: string;
  showFilters?: boolean;
  showVoiceSearch?: boolean;
  showHistory?: boolean;
  maxResults?: number;
  historyLimit?: number;
  debounceMs?: number;
}
