'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Package, Search, X, Frown } from 'lucide-react';
import { formatPrice } from '@/utils/currency';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
  description?: string;
}

interface InstantSearchProps {
  placeholder?: string;
  maxResults?: number;
  className?: string;
}

export default function InstantSearch({
  placeholder = 'Search for products...',
  maxResults = 5,
  className = ''
}: InstantSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&limit=${maxResults}`
      );
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();

      const rawProducts = data.products ?? [];
      const mapped: Product[] = rawProducts.slice(0, maxResults).map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug ?? p.id,
        price: p.price,
        originalPrice: p.compareAtPrice ?? p.originalPrice,
        image: Array.isArray(p.images) ? p.images[0] : (p.image ?? ''),
        category: p.category,
        description: p.description,
      }));
      setSearchResults(mapped);
    } catch {
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(query), 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsOpen(true);
    setIsLoading(true);
    debouncedSearch(query);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim()) setIsOpen(true);
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div ref={searchRef} className={`relative w-full max-w-2xl ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-pink-600 border-t-transparent" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
        />

        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden">
          
          {/* Loading */}
          {isLoading && searchQuery && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-pink-600 border-t-transparent" />
            </div>
          )}

          {/* Results */}
          {!isLoading && searchResults.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                Search Results ({searchResults.length})
              </div>
              {searchResults.map((product) => {
                const discount = product.originalPrice && product.originalPrice > product.price
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                  : 0;

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={handleResultClick}
                    className="flex items-center p-4 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Package className="w-8 h-8 text-pink-400" />
                      )}
                    </div>

                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {discount > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800">
                                -{discount}%
                              </span>
                            )}
                            {product.category && (
                              <span className="text-xs text-gray-500">{product.category}</span>
                            )}
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {product.description}
                            </p>
                          )}
                        </div>

                        <div className="ml-2 text-right">
                          <div className="text-sm font-bold text-pink-600">
                            {formatPrice(product.price)}
                          </div>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="text-xs text-gray-400 line-through">
                              {formatPrice(product.originalPrice)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* No results */}
          {!isLoading && searchQuery && searchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Frown className="h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">No results found</h3>
              <p className="text-xs text-gray-500">
                Try searching for "{searchQuery}" with different keywords
              </p>
            </div>
          )}

          {/* View all */}
          {!isLoading && searchResults.length > 0 && (
            <div className="border-t border-gray-100 p-3 bg-gray-50">
              <Link
                href={`/search?q=${encodeURIComponent(searchQuery)}`}
                onClick={handleResultClick}
                className="block w-full text-center px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors duration-200"
              >
                See all results for "{searchQuery}"
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
