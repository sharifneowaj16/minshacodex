'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Brush,
  Package,
  Star,
  Droplets,
  Sparkles,
  Flower,
  ChevronUp,
  ChevronDown,
  Palette,
  Eye,
  PenTool,
  Target,
  Heart,
  Sun,
  Zap,
  Shield,
  Smile,
  Leaf,
  Moon,
  Flower2,
  Wrench,
  Paintbrush,
  Square,
  TrendingUp,
  Search,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type IconComponent = React.ComponentType<{ className?: string }>;

// Static fallback suggestions (used when API returns nothing)
const STATIC_FALLBACKS = [
  { id: 'f1', text: 'lipstick', category: 'makeup', icon: Heart as IconComponent },
  { id: 'f2', text: 'foundation', category: 'makeup', icon: Palette as IconComponent },
  { id: 'f3', text: 'mascara', category: 'makeup', icon: Eye as IconComponent },
  { id: 'f4', text: 'moisturizer', category: 'skincare', icon: Droplets as IconComponent },
  { id: 'f5', text: 'serum', category: 'skincare', icon: Sparkles as IconComponent },
  { id: 'f6', text: 'shampoo', category: 'haircare', icon: Package as IconComponent },
  { id: 'f7', text: 'perfume', category: 'perfume', icon: Flower2 as IconComponent },
  { id: 'f8', text: 'nail polish', category: 'nails', icon: Star as IconComponent },
];

// API suggestion shape returned by /api/search/suggestions
interface ApiSuggestion {
  type: 'product' | 'trending' | 'completion';
  text: string;
  productId?: string;
  productName?: string;
  slug?: string;
  price?: number;
  image?: string;
  count?: number;
  badges?: string[];
  icon?: string;
}

// Internal display shape
interface DisplaySuggestion {
  id: string;
  text: string;
  displayText: string;
  category: string;
  icon: IconComponent;
  type: 'api_product' | 'api_trending' | 'static' | 'history';
  price?: number;
  image?: string;
  slug?: string;
  badges?: string[];
}

interface AutocompleteSearchProps {
  placeholder?: string;
  maxSuggestions?: number;
  onSearch?: (query: string) => void;
  className?: string;
  navigateOnSearch?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  makeup: 'bg-pink-50 text-pink-700',
  skincare: 'bg-green-50 text-green-700',
  haircare: 'bg-purple-50 text-purple-700',
  perfume: 'bg-blue-50 text-blue-700',
  nails: 'bg-yellow-50 text-yellow-700',
  tools: 'bg-gray-50 text-gray-700',
  trending: 'bg-orange-50 text-orange-700',
  product: 'bg-rose-50 text-rose-700',
};

export default function AutocompleteSearch({
  placeholder = 'Search for beauty products...',
  maxSuggestions = 7,
  onSearch,
  className = '',
  navigateOnSearch = true,
}: AutocompleteSearchProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [displaySuggestions, setDisplaySuggestions] = useState<DisplaySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('autocomplete_recent');
      if (saved) setRecentSearches(JSON.parse(saved).slice(0, 5));
    } catch { /* ignore */ }
  }, []);

  const saveRecentSearch = (term: string) => {
    try {
      const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('autocomplete_recent', JSON.stringify(updated));
    } catch { /* ignore */ }
  };

  // Map API suggestions to display format
  const mapApiSuggestions = (apiSuggestions: ApiSuggestion[]): DisplaySuggestion[] => {
    return apiSuggestions.slice(0, maxSuggestions).map((s, i) => {
      if (s.type === 'product') {
        return {
          id: `api-product-${i}`,
          text: s.slug ? s.slug : s.text,
          displayText: s.productName || s.text,
          category: 'product',
          icon: Package as IconComponent,
          type: 'api_product' as const,
          price: s.price,
          image: s.image,
          slug: s.slug,
          badges: s.badges,
        };
      }
      if (s.type === 'trending') {
        return {
          id: `api-trending-${i}`,
          text: s.text,
          displayText: s.text,
          category: 'trending',
          icon: TrendingUp as IconComponent,
          type: 'api_trending' as const,
          count: s.count,
        };
      }
      // completion type
      return {
        id: `api-completion-${i}`,
        text: s.text,
        displayText: s.text,
        category: 'product',
        icon: Search as IconComponent,
        type: 'api_product' as const,
      };
    });
  };

  // Fetch suggestions from API with debounce
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      // Show recent searches and popular fallbacks when input is empty
      const historyItems: DisplaySuggestion[] = recentSearches.slice(0, 3).map((s, i) => ({
        id: `history-${i}`,
        text: s,
        displayText: s,
        category: 'history',
        icon: Clock as IconComponent,
        type: 'history' as const,
      }));
      const staticItems: DisplaySuggestion[] = STATIC_FALLBACKS.slice(0, maxSuggestions - historyItems.length).map(s => ({
        id: s.id,
        text: s.text,
        displayText: s.text,
        category: s.category,
        icon: s.icon,
        type: 'static' as const,
      }));
      setDisplaySuggestions([...historyItems, ...staticItems]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(query)}&limit=${maxSuggestions}`
      );
      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      if (data.success && data.suggestions?.length > 0) {
        setDisplaySuggestions(mapApiSuggestions(data.suggestions));
      } else {
        // Fallback: filter static suggestions by query
        const queryLower = query.toLowerCase();
        const filtered = STATIC_FALLBACKS
          .filter(s => s.text.includes(queryLower) || s.category.includes(queryLower))
          .slice(0, maxSuggestions)
          .map(s => ({
            id: s.id,
            text: s.text,
            displayText: s.text,
            category: s.category,
            icon: s.icon,
            type: 'static' as const,
          }));
        setDisplaySuggestions(filtered);
      }
    } catch {
      // On error, use static fallback
      const queryLower = query.toLowerCase();
      const filtered = STATIC_FALLBACKS
        .filter(s => s.text.includes(queryLower) || s.category.includes(queryLower))
        .slice(0, maxSuggestions)
        .map(s => ({
          id: s.id,
          text: s.text,
          displayText: s.text,
          category: s.category,
          icon: s.icon,
          type: 'static' as const,
        }));
      setDisplaySuggestions(filtered);
    } finally {
      setIsLoading(false);
    }
  }, [maxSuggestions, recentSearches]);

  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="font-semibold text-pink-600">{part}</span>
      ) : part
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(true);
    setActiveSuggestionIndex(0);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 280);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
    if (displaySuggestions.length === 0) fetchSuggestions(inputValue);
  };

  const executeSearch = (query: string) => {
    if (!query.trim()) return;
    saveRecentSearch(query.trim());
    setShowSuggestions(false);
    onSearch?.(query);
    if (navigateOnSearch) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSuggestionClick = (suggestion: DisplaySuggestion) => {
    // For products with a slug, navigate directly to the product page
    if (suggestion.type === 'api_product' && suggestion.slug) {
      setInputValue(suggestion.displayText);
      setShowSuggestions(false);
      router.push(`/products/${suggestion.slug}`);
      return;
    }
    setInputValue(suggestion.displayText);
    executeSearch(suggestion.displayText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setShowSuggestions(true);
        setActiveSuggestionIndex(prev =>
          prev < displaySuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setShowSuggestions(true);
        setActiveSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : displaySuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (showSuggestions && displaySuggestions[activeSuggestionIndex]) {
          handleSuggestionClick(displaySuggestions[activeSuggestionIndex]);
        } else if (inputValue.trim()) {
          executeSearch(inputValue);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestionIndex(0);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(inputValue);
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current !== event.target
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  return (
    <div className={`relative w-full max-w-2xl ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-pink-500 border-t-transparent" />
            ) : (
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
          />

          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                fetchSuggestions('');
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto"
        >
          {/* Section header */}
          {displaySuggestions.length > 0 && (
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
              {inputValue.trim() ? 'Suggestions' : recentSearches.length > 0 ? 'Recent & Popular' : 'Popular Searches'}
            </div>
          )}

          {displaySuggestions.length > 0 ? (
            <div className="py-1">
              {displaySuggestions.map((suggestion, index) => {
                const isActive = index === activeSuggestionIndex;
                const IconComponent = suggestion.icon;
                const colorClass = CATEGORY_COLORS[suggestion.category] || 'bg-gray-50 text-gray-700';

                return (
                  <div
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-150 ${
                      isActive ? 'bg-pink-50 border-l-4 border-pink-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Image (for API product suggestions) */}
                    {suggestion.image ? (
                      <img
                        src={suggestion.image}
                        alt={suggestion.displayText}
                        className="w-8 h-8 rounded object-cover mr-3 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="mr-3 flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-gray-400" />
                      </span>
                    )}

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {highlightText(suggestion.displayText, inputValue)}
                      </div>
                      {suggestion.price && suggestion.price > 0 && (
                        <div className="text-xs text-gray-500">
                          ৳{(suggestion.price * 110).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Badge chips */}
                    <div className="flex items-center gap-1 ml-2">
                      {suggestion.badges?.map(badge => (
                        <span key={badge} className="text-[10px] px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 font-medium">
                          {badge}
                        </span>
                      ))}
                      {suggestion.type !== 'history' && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${colorClass}`}>
                          {suggestion.category === 'trending' ? '🔥 Trending' : suggestion.category}
                        </span>
                      )}
                      {suggestion.type === 'history' && (
                        <span className="text-xs text-gray-400">recent</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : inputValue.trim() ? (
            <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
              <svg className="h-10 w-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-500">No suggestions for "{inputValue}"</p>
              <p className="text-xs text-gray-400 mt-1">Press Enter to search anyway</p>
            </div>
          ) : null}

          {/* Keyboard hint */}
          {displaySuggestions.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs inline-flex items-center">
                <ChevronUp className="h-3 w-3" />
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs inline-flex items-center">
                <ChevronDown className="h-3 w-3" />
              </kbd>
              <span className="text-xs text-gray-500">navigate</span>
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs ml-1">Enter</kbd>
              <span className="text-xs text-gray-500">select</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
