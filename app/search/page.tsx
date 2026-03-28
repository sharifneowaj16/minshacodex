'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search, X, TrendingUp, Clock, SlidersHorizontal,
  Star, Package, ChevronDown, ChevronUp, Filter, Volume2, VolumeX,
  Home, ChevronRight, AlertCircle, Flame, Tag, Zap, CheckCircle
} from 'lucide-react';
import { formatPrice } from '@/utils/currency';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  discount?: number;
  images?: string[];
  image?: string;
  category?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isFlashSale?: boolean;
  isNewArrival?: boolean;
  highlighted?: { name?: string; description?: string };
}

interface Facet { value: string; count: number }

interface SearchResult {
  success: boolean;
  query: string;
  spellSuggestion: string | null;
  total: number;
  page: number;
  totalPages: number;
  products: Product[];
  fallback?: { strategy: string; message: string; applied: boolean };
  facets?: { categories: Facet[]; brands: Facet[]; priceRanges: Facet[] };
  priceStats?: { avg: number; min: number; max: number };
}

interface ApiSuggestion {
  type: 'product' | 'trending' | 'completion';
  text: string;
  productName?: string;
  slug?: string;
  price?: number;
  image?: string;
  count?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getProductImage(p: Product) {
  if (Array.isArray(p.images) && p.images.length > 0) return p.images[0];
  return p.image ?? '';
}

function calcDiscount(price: number, compareAtPrice?: number): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

function HighlightedText({ html, fallback }: { html?: string; fallback: string }) {
  if (!html) return <>{fallback}</>;
  return (
    <span
      className="[&_mark]:bg-yellow-100 [&_mark]:text-yellow-800 [&_mark]:rounded [&_em]:not-italic [&_em]:font-bold [&_em]:text-pink-600"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ─── Product Card (Daraz style) ───────────────────────────────────────────────

function ProductCard({ product, query }: { product: Product; query: string }) {
  const img = getProductImage(product);
  const discount = product.discount ?? calcDiscount(product.price, product.compareAtPrice);
  const price = product.price;
  const comparePrice = product.compareAtPrice ?? undefined;

  const handleClick = () => {
    // Track click for CTR boost
    fetch('/api/search/clicks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        productId: product.id,
        productName: product.name,
        position: 0,
        resultCount: 1,
        category: product.category,
        price: product.price,
      }),
    }).catch(() => {});
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      onClick={handleClick}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-minsah-primary/30 hover:shadow-lg transition-all duration-200 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={40} className="text-gray-200" />
          </div>
        )}

        {/* Badges — top left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount >= 10 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-[11px] font-bold rounded-md shadow-sm">
              -{discount}%
            </span>
          )}
          {product.isFlashSale && (
            <span className="px-2 py-0.5 bg-orange-500 text-white text-[11px] font-bold rounded-md flex items-center gap-1 shadow-sm">
              <Zap size={10} />Flash
            </span>
          )}
          {product.isNewArrival && !product.isFlashSale && (
            <span className="px-2 py-0.5 bg-green-500 text-white text-[11px] font-bold rounded-md shadow-sm">
              New
            </span>
          )}
        </div>

        {/* Out of stock overlay */}
        {product.inStock === false && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        {/* Brand */}
        {product.brand && (
          <p className="text-[11px] text-minsah-secondary font-medium uppercase tracking-wider mb-1 truncate">
            {product.brand}
          </p>
        )}

        {/* Name */}
        <p className="text-sm font-semibold text-minsah-dark line-clamp-2 mb-2 flex-1">
          <HighlightedText html={product.highlighted?.name} fallback={product.name} />
        </p>

        {/* Rating */}
        {product.rating && product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[1,2,3,4,5].map(i => (
                <Star
                  key={i}
                  size={11}
                  className={i <= Math.round(product.rating!) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-400">
              {product.rating.toFixed(1)}
              {product.reviewCount ? ` (${product.reviewCount})` : ''}
            </span>
          </div>
        )}

        {/* Price row */}
        <div className="flex items-end gap-2">
          <span className="text-base font-bold text-minsah-primary">
            {formatPrice(price)}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="text-xs text-gray-400 line-through pb-0.5">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>

        {/* In stock indicator */}
        {product.inStock !== false && (
          <p className="text-[11px] text-green-600 flex items-center gap-1 mt-1.5">
            <CheckCircle size={10} />In Stock
          </p>
        )}
      </div>
    </Link>
  );
}

// ─── Autocomplete Dropdown (Amazon style) ─────────────────────────────────────

function SuggestionsDropdown({
  suggestions,
  trendingSearches,
  recentSearches,
  activeIndex,
  onSelect,
  onClearRecent,
  inputValue,
}: {
  suggestions: ApiSuggestion[];
  trendingSearches: ApiSuggestion[];
  recentSearches: string[];
  activeIndex: number;
  onSelect: (text: string, slug?: string) => void;
  onClearRecent: () => void;
  inputValue: string;
}) {
  const showSuggestions = inputValue.trim().length > 0 && suggestions.length > 0;
  const showEmpty = !inputValue.trim();

  if (showSuggestions) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s.text, s.slug)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50 last:border-0 ${
              i === activeIndex ? 'bg-pink-50' : 'hover:bg-gray-50'
            }`}
          >
            {/* Image (Amazon style) or icon */}
            {s.image ? (
              <img
                src={s.image}
                alt={s.text}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100"
              />
            ) : (
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                s.type === 'trending' ? 'bg-orange-50' : 'bg-gray-50'
              }`}>
                {s.type === 'trending'
                  ? <Flame size={16} className="text-orange-500" />
                  : <Search size={16} className="text-gray-400" />
                }
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">
                {s.type === 'product' && s.productName ? s.productName : s.text}
              </p>
              {s.price && (
                <p className="text-xs text-minsah-primary font-semibold mt-0.5">
                  {formatPrice(s.price)}
                </p>
              )}
              {s.type === 'trending' && s.count && (
                <p className="text-xs text-gray-400 mt-0.5">{s.count} searches</p>
              )}
            </div>

            {s.type === 'trending' && (
              <TrendingUp size={14} className="text-orange-400 flex-shrink-0" />
            )}
            {s.type === 'product' && (
              <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
    );
  }

  if (showEmpty) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
        {/* Recent searches */}
        {recentSearches.length > 0 && (
          <div className="p-4 border-b border-gray-50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={12} />Recent
              </p>
              <button
                onClick={onClearRecent}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.slice(0, 5).map((s, i) => (
                <button
                  key={i}
                  onClick={() => onSelect(s)}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-pink-50 hover:text-minsah-primary text-gray-700 text-sm rounded-full border border-gray-100 hover:border-minsah-primary/30 transition-all flex items-center gap-1.5"
                >
                  <Clock size={11} className="text-gray-400" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        {trendingSearches.length > 0 && (
          <div className="p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Flame size={12} className="text-orange-500" />Trending Now
            </p>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.slice(0, 8).map((s, i) => (
                <button
                  key={i}
                  onClick={() => onSelect(s.text)}
                  className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-sm rounded-full border border-orange-100 transition-all flex items-center gap-1.5"
                >
                  <TrendingUp size={11} />
                  {s.text}
                  {s.count && (
                    <span className="text-orange-400 text-[10px]">🔥</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// ─── Sort + Filter chips (Daraz style) ────────────────────────────────────────

const SORT_OPTIONS = [
  { label: 'Best Match', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest', value: 'newest' },
  { label: 'Top Rated', value: 'rating' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL-driven state
  const initialQuery    = searchParams.get('q')        || '';
  const initialCategory = searchParams.get('category') || '';
  const initialBrand    = searchParams.get('brand')    || '';
  const initialMinPrice = searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';
  const initialSort     = searchParams.get('sort')     || 'relevance';
  const initialInStock  = searchParams.get('inStock')  === 'true';

  const [inputValue, setInputValue]   = useState(initialQuery);
  const [results, setResults]         = useState<SearchResult | null>(null);
  const [loading, setLoading]         = useState(false);
  const [page, setPage]               = useState(1);

  // Filters
  const [category, setCategory]       = useState(initialCategory);
  const [brand, setBrand]             = useState(initialBrand);
  const [minPrice, setMinPrice]       = useState(initialMinPrice);
  const [maxPrice, setMaxPrice]       = useState(initialMaxPrice);
  const [sort, setSort]               = useState(initialSort);
  const [inStockOnly, setInStockOnly] = useState(initialInStock);

  // Autocomplete
  const [suggestions, setSuggestions]           = useState<ApiSuggestion[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<ApiSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions]   = useState(false);
  const [activeIndex, setActiveIndex]           = useState(-1);

  // Recent searches
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Filters panel
  const [showFilters, setShowFilters] = useState(false);

  // Voice
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported] = useState(
    typeof window !== 'undefined' && 'webkitSpeechRecognition' in window
  );

  const inputRef      = useRef<HTMLInputElement>(null);
  const debounceRef   = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // ── Load recent searches ─────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem('search_page_recent');
      if (saved) setRecentSearches(JSON.parse(saved).slice(0, 6));
    } catch { }
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    try {
      const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem('search_page_recent', JSON.stringify(updated));
    } catch { }
  };

  // ── Load trending searches ───────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/search/suggestions?trending=true&trendingLimit=8')
      .then(r => r.json())
      .then(d => { if (d.success) setTrendingSearches(d.suggestions ?? []); })
      .catch(() => {});
  }, []);

  // ── Build URL params ─────────────────────────────────────────────────────────
  const buildParams = useCallback((q: string, pg = 1) => {
    const p = new URLSearchParams();
    if (q.trim())    p.set('q', q.trim());
    if (category)    p.set('category', category);
    if (brand)       p.set('brand', brand);
    if (minPrice)    p.set('minPrice', minPrice);
    if (maxPrice)    p.set('maxPrice', maxPrice);
    if (inStockOnly) p.set('inStock', 'true');
    p.set('sort', sort);
    p.set('page', String(pg));
    p.set('limit', '20');
    return p;
  }, [category, brand, minPrice, maxPrice, inStockOnly, sort]);

  // ── Perform search ───────────────────────────────────────────────────────────
  const performSearch = useCallback(async (q: string, pg = 1) => {
    if (!q.trim() && !category && !brand) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const params = buildParams(q, pg);
      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error('Search failed');
      const data: SearchResult = await res.json();
      setResults(data);
      setPage(pg);
      router.replace(`/search?${params.toString()}`, { scroll: false });
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [buildParams, router]);

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialQuery) performSearch(initialQuery, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Autocomplete ─────────────────────────────────────────────────────────────
  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) { setSuggestions([]); return; }
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}&limit=7`);
      const data = await res.json();
      if (data.success) setSuggestions(data.suggestions ?? []);
    } catch { }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setActiveIndex(-1);
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 280);
  };

  const executeSearch = (q: string) => {
    if (!q.trim()) return;
    saveRecentSearch(q.trim());
    setInputValue(q.trim());
    setShowSuggestions(false);
    setActiveIndex(-1);
    performSearch(q.trim(), 1);
  };

  const handleSuggestionSelect = (text: string, slug?: string) => {
    if (slug) {
      router.push(`/products/${slug}`);
    } else {
      executeSearch(text);
    }
    setShowSuggestions(false);
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
          handleSuggestionSelect(s.text, s.slug);
        } else {
          executeSearch(inputValue);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // ── Voice search ─────────────────────────────────────────────────────────────
  const startVoice = () => {
    if (!voiceSupported) return;
    const SR = (window as any).webkitSpeechRecognition;
    const r = new SR();
    r.lang = 'bn-BD';
    r.continuous = false;
    r.interimResults = false;
    r.onstart = () => setIsListening(true);
    r.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setInputValue(t);
      executeSearch(t);
    };
    r.onerror = () => setIsListening(false);
    r.onend   = () => setIsListening(false);
    recognitionRef.current = r;
    r.start();
  };
  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // ── Outside click ────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element)?.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasResults  = results && results.products.length > 0;
  const hasSearched = results !== null || loading;

  // Active filter count for badge
  const activeFilterCount = [category, brand, minPrice, maxPrice, inStockOnly].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-minsah-light pb-20">

      {/* ─── Search Header ─────────────────────────────────────────────── */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-minsah-secondary mb-3">
            <Link href="/" className="flex items-center gap-1 hover:text-minsah-primary transition-colors">
              <Home size={12} />Home
            </Link>
            <ChevronRight size={12} />
            <span className="text-minsah-dark font-medium">Search</span>
            {results?.query && (
              <>
                <ChevronRight size={12} />
                <span className="text-minsah-primary font-medium truncate max-w-[150px]">
                  &ldquo;{results.query}&rdquo;
                </span>
              </>
            )}
          </div>

          {/* Search bar */}
          <div className="search-container relative">
            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-minsah-primary focus-within:ring-2 focus-within:ring-minsah-primary/20 transition-all overflow-hidden">
              <div className="pl-4 flex-shrink-0">
                {loading
                  ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-minsah-primary border-t-transparent" />
                  : <Search size={20} className="text-gray-400" />
                }
              </div>

              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search beauty products..."
                className="flex-1 py-3.5 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                autoFocus
              />

              {inputValue && (
                <button
                  onClick={() => { setInputValue(''); setSuggestions([]); setShowSuggestions(true); }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}

              {/* Voice */}
              {voiceSupported && (
                <button
                  onClick={isListening ? stopVoice : startVoice}
                  className={`p-2 mx-1 rounded-xl transition-colors ${
                    isListening
                      ? 'bg-red-100 text-red-600 animate-pulse'
                      : 'text-gray-400 hover:text-minsah-primary hover:bg-gray-100'
                  }`}
                >
                  {isListening ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              )}

              <button
                onClick={() => executeSearch(inputValue)}
                className="px-5 py-3.5 bg-minsah-primary text-white text-sm font-bold hover:bg-minsah-dark transition-colors flex-shrink-0"
              >
                Search
              </button>
            </div>

            {/* ── Autocomplete Dropdown ── */}
            {showSuggestions && (
              <SuggestionsDropdown
                suggestions={suggestions}
                trendingSearches={trendingSearches}
                recentSearches={recentSearches}
                activeIndex={activeIndex}
                onSelect={handleSuggestionSelect}
                onClearRecent={() => {
                  setRecentSearches([]);
                  localStorage.removeItem('search_page_recent');
                }}
                inputValue={inputValue}
              />
            )}
          </div>
        </div>
      </div>

      {/* ─── Results area ──────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-4">

        {/* ── Results header + Sort/Filter chips (Daraz style) ── */}
        {hasSearched && (
          <div className="mb-4">
            {/* Result count + spell suggestion */}
            <div className="flex items-center justify-between mb-3">
              <div>
                {results && (
                  <p className="text-sm text-minsah-secondary">
                    {loading
                      ? 'Searching...'
                      : <><span className="font-bold text-minsah-dark">{results.total.toLocaleString()}</span> results for &ldquo;<span className="text-minsah-primary font-semibold">{results.query}</span>&rdquo;</>
                    }
                  </p>
                )}
                {results?.spellSuggestion && (
                  <button
                    onClick={() => executeSearch(results.spellSuggestion!)}
                    className="text-xs text-minsah-primary mt-1 flex items-center gap-1"
                  >
                    <AlertCircle size={12} />
                    Did you mean: <span className="underline font-semibold">{results.spellSuggestion}</span>?
                  </button>
                )}
              </div>
            </div>

            {/* Sort chips — Daraz style */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSort(opt.value);
                    performSearch(inputValue, 1);
                  }}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    sort === opt.value
                      ? 'bg-minsah-primary text-white border-minsah-primary shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-minsah-primary hover:text-minsah-primary'
                  }`}
                >
                  {opt.value === 'relevance' && sort === 'relevance' && (
                    <span className="mr-1">✓</span>
                  )}
                  {opt.label}
                </button>
              ))}

              {/* Filter button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  showFilters || activeFilterCount > 0
                    ? 'bg-minsah-primary text-white border-minsah-primary'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-minsah-primary hover:text-minsah-primary'
                }`}
              >
                <SlidersHorizontal size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white/30 text-[11px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Active filter tags */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {category && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-minsah-primary/10 text-minsah-primary text-xs rounded-full font-medium">
                    <Tag size={10} />Category: {category}
                    <button onClick={() => { setCategory(''); performSearch(inputValue, 1); }}>
                      <X size={10} />
                    </button>
                  </span>
                )}
                {brand && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-minsah-primary/10 text-minsah-primary text-xs rounded-full font-medium">
                    Brand: {brand}
                    <button onClick={() => { setBrand(''); performSearch(inputValue, 1); }}>
                      <X size={10} />
                    </button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-minsah-primary/10 text-minsah-primary text-xs rounded-full font-medium">
                    Price: {minPrice || '0'}–{maxPrice || '∞'} ৳
                    <button onClick={() => { setMinPrice(''); setMaxPrice(''); performSearch(inputValue, 1); }}>
                      <X size={10} />
                    </button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    In Stock only
                    <button onClick={() => { setInStockOnly(false); performSearch(inputValue, 1); }}>
                      <X size={10} />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => { setCategory(''); setBrand(''); setMinPrice(''); setMaxPrice(''); setInStockOnly(false); performSearch(inputValue, 1); }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Filter panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Category</label>
                    {results?.facets?.categories && results.facets.categories.length > 0 ? (
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-minsah-primary/20"
                      >
                        <option value="">All</option>
                        {results.facets.categories.map(f => (
                          <option key={f.value} value={f.value}>{f.value} ({f.count})</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        placeholder="e.g. skincare"
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Brand</label>
                    {results?.facets?.brands && results.facets.brands.length > 0 ? (
                      <select
                        value={brand}
                        onChange={e => setBrand(e.target.value)}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-minsah-primary/20"
                      >
                        <option value="">All Brands</option>
                        {results.facets.brands.map(f => (
                          <option key={f.value} value={f.value}>{f.value} ({f.count})</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={brand}
                        onChange={e => setBrand(e.target.value)}
                        placeholder="e.g. maybelline"
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Price range */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Min Price (৳)</label>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={e => setMinPrice(e.target.value)}
                      placeholder="0"
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Max Price (৳)</label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={e => setMaxPrice(e.target.value)}
                      placeholder="Any"
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Price range quick chips */}
                {results?.facets?.priceRanges && results.facets.priceRanges.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price Range</p>
                    <div className="flex flex-wrap gap-2">
                      {results.facets.priceRanges.map(r => (
                        <button
                          key={r.value}
                          onClick={() => {
                            // Parse range key like "500-1000"
                            const parts = r.value.replace('Under ', '0-').replace('Over ', '').split('-');
                            if (parts.length === 2) {
                              setMinPrice(parts[0] === '0' && r.value.startsWith('Under') ? '' : parts[0]);
                              setMaxPrice(r.value.startsWith('Over') ? '' : parts[1]);
                            }
                          }}
                          className="px-3 py-1.5 text-xs bg-gray-50 hover:bg-minsah-primary/10 hover:text-minsah-primary border border-gray-200 hover:border-minsah-primary/30 rounded-full transition-all"
                        >
                          {r.value} <span className="text-gray-400">({r.count})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* In stock toggle */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className={`relative w-10 h-6 rounded-full transition-colors ${inStockOnly ? 'bg-minsah-primary' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${inStockOnly ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                  <span className="text-sm text-gray-700 font-medium">In Stock only</span>
                </div>

                {/* Apply button */}
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => { setShowFilters(false); performSearch(inputValue, 1); }}
                    className="px-6 py-2 bg-minsah-primary text-white rounded-xl text-sm font-bold hover:bg-minsah-dark transition-colors"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={() => { setCategory(''); setBrand(''); setMinPrice(''); setMaxPrice(''); setInStockOnly(false); }}
                    className="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:border-gray-300 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {/* Fallback message */}
            {results?.fallback?.applied && (
              <div className="mt-3 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 flex items-center gap-2">
                <AlertCircle size={14} />
                {results.fallback.message}
              </div>
            )}
          </div>
        )}

        {/* ── Product Grid ── */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-5 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && hasResults && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {results!.products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  query={results!.query}
                />
              ))}
            </div>

            {/* Pagination */}
            {results!.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => performSearch(inputValue, page - 1)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-minsah-primary hover:text-minsah-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {page} of {results!.totalPages}
                </span>
                <button
                  disabled={page >= results!.totalPages}
                  onClick={() => performSearch(inputValue, page + 1)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-minsah-primary hover:text-minsah-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* ── No results ── */}
        {!loading && results && results.products.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-minsah-dark mb-2">No products found</h3>
            <p className="text-minsah-secondary mb-6">
              We couldn&apos;t find anything for &ldquo;{results.query}&rdquo;.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/shop" className="px-5 py-2.5 bg-minsah-primary text-white rounded-xl font-semibold text-sm hover:bg-minsah-dark transition-colors">
                Browse All Products
              </Link>
            </div>
          </div>
        )}

        {/* ── Empty state (no search yet) ── */}
        {!loading && !hasSearched && (
          <div className="py-6">

            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-minsah-dark flex items-center gap-2">
                    <Clock size={16} className="text-minsah-secondary" />Recent Searches
                  </h2>
                  <button
                    onClick={() => { setRecentSearches([]); localStorage.removeItem('search_page_recent'); }}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => executeSearch(s)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-minsah-primary hover:text-minsah-primary transition-all shadow-sm"
                    >
                      <Clock size={13} className="text-gray-400" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending searches */}
            {trendingSearches.length > 0 && (
              <div className="mb-8">
                <h2 className="text-base font-bold text-minsah-dark flex items-center gap-2 mb-4">
                  <Flame size={16} className="text-orange-500" />Trending Now
                </h2>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => executeSearch(s.text)}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-full text-sm text-orange-700 hover:bg-orange-100 transition-all"
                    >
                      <TrendingUp size={13} />
                      {s.text}
                      {s.count && <span className="text-orange-400 text-xs">({s.count})</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular categories */}
            <div>
              <h2 className="text-base font-bold text-minsah-dark mb-4">Popular Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: 'Makeup', icon: '💄', slug: 'makeup' },
                  { name: 'Skincare', icon: '✨', slug: 'skincare' },
                  { name: 'Haircare', icon: '💇', slug: 'haircare' },
                  { name: 'Perfume', icon: '🌸', slug: 'perfume' },
                ].map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => executeSearch(cat.name.toLowerCase())}
                    className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-minsah-primary hover:shadow-sm transition-all text-left group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <span className="text-sm font-semibold text-minsah-dark">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-minsah-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-minsah-primary border-t-transparent" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
