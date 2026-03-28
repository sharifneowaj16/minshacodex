'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X, TrendingUp, Package } from 'lucide-react';

interface ApiSuggestion {
  type: 'product' | 'trending' | 'completion';
  text: string;
  productName?: string;
  slug?: string;
  price?: number;
  image?: string;
}

export default function ShopSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [inputValue, setInputValue] = useState(initialQ);
  const [suggestions, setSuggestions] = useState<ApiSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync input with URL query
  useEffect(() => {
    setInputValue(searchParams.get('q') || '');
  }, [searchParams]);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) { setSuggestions([]); return; }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}&limit=6`);
      const data = await res.json();
      if (data.success) setSuggestions(data.suggestions ?? []);
    } catch { /* ignore */ } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setActiveIndex(-1);
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 280);
  };

  const executeSearch = (q: string) => {
    if (!q.trim()) return;
    setShowSuggestions(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', q.trim());
    params.delete('page');
    router.push(`/shop?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          const s = suggestions[activeIndex];
          if (s.type === 'product' && s.slug) {
            router.push(`/products/${s.slug}`);
          } else {
            executeSearch(s.text);
          }
        } else {
          executeSearch(inputValue);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 focus-within:border-minsah-primary focus-within:ring-2 focus-within:ring-minsah-primary/20 transition-all overflow-hidden shadow-sm">
        <div className="pl-4 flex-shrink-0">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-minsah-primary border-t-transparent" />
          ) : (
            <Search size={18} className="text-gray-400" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { setShowSuggestions(true); if (!suggestions.length) fetchSuggestions(inputValue); }}
          placeholder="Search within shop..."
          className="flex-1 py-3 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
        />

        {inputValue && (
          <button
            onClick={() => {
              setInputValue('');
              setSuggestions([]);
              const params = new URLSearchParams(searchParams.toString());
              params.delete('q');
              params.delete('page');
              router.push(`/shop${params.toString() ? '?' + params.toString() : ''}`);
            }}
            className="p-2 mr-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}

        <button
          onClick={() => executeSearch(inputValue)}
          className="px-4 py-3 bg-minsah-primary text-white text-sm font-semibold hover:bg-minsah-dark transition-colors flex-shrink-0"
        >
          Search
        </button>
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                if (s.type === 'product' && s.slug) {
                  router.push(`/products/${s.slug}`);
                } else {
                  executeSearch(s.text);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-pink-50 transition-colors border-b border-gray-50 last:border-0 ${
                i === activeIndex ? 'bg-pink-50' : ''
              }`}
            >
              {s.image ? (
                <img src={s.image} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded bg-pink-50 flex items-center justify-center flex-shrink-0">
                  {s.type === 'trending'
                    ? <TrendingUp size={14} className="text-orange-400" />
                    : <Package size={14} className="text-gray-400" />
                  }
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{s.productName || s.text}</p>
                {s.price && s.price > 0 && (
                  <p className="text-xs text-gray-500">৳{(s.price * 110).toLocaleString()}</p>
                )}
              </div>
              {s.type === 'trending' && (
                <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full flex-shrink-0">🔥</span>
              )}
            </button>
          ))}
          <button
            onClick={() => executeSearch(inputValue)}
            className="w-full px-4 py-3 text-sm text-minsah-primary font-semibold hover:bg-pink-50 text-left border-t border-gray-100"
          >
            Search &ldquo;{inputValue}&rdquo; in shop →
          </button>
        </div>
      )}
    </div>
  );
}
