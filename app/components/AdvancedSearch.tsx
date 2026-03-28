'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice, convertUSDtoBDT } from '@/utils/currency';
import type {
  Product,
  Filter,
  SortOption,
  SearchHistory,
  SuggestionItem,
  Category,
  SearchState,
  VoiceSearchState,
  AdvancedSearchProps
} from '@/types/search';
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  Package,
  Star,
  Flower,
  Droplets,
  Brush,
  Volume2,
  VolumeX,
  Filter as FilterIcon,
  ChevronRight,
  ChevronLeft,
  TrendingUp
} from 'lucide-react';

// Pre-defined beauty product suggestions (fallback)
const BEAUTY_SUGGESTIONS: SuggestionItem[] = [
  { id: '1', text: 'lipstick', type: 'product', icon: <Brush className="w-4 h-4" />, count: 45 },
  { id: '2', text: 'foundation', type: 'product', icon: <Package className="w-4 h-4" />, count: 38 },
  { id: '3', text: 'mascara', type: 'product', icon: <Star className="w-4 h-4" />, count: 42 },
  { id: '4', text: 'makeup', type: 'category', icon: <Brush className="w-4 h-4" />, count: 156 },
  { id: '5', text: 'skincare', type: 'category', icon: <Droplets className="w-4 h-4" />, count: 89 },
  { id: '6', text: 'perfume', type: 'category', icon: <Flower className="w-4 h-4" />, count: 67 },
  { id: '7', text: 'haircare', type: 'category', icon: <Package className="w-4 h-4" />, count: 78 },
  { id: '8', text: 'nail polish', type: 'product', icon: <Star className="w-4 h-4" />, count: 35 },
];

// Sort options
const SORT_OPTIONS: SortOption[] = [
  { value: 'name', label: 'Name', direction: 'asc' },
  { value: 'price', label: 'Price: Low to High', direction: 'asc' },
  { value: 'price', label: 'Price: High to Low', direction: 'desc' },
  { value: 'rating', label: 'Rating', direction: 'desc' },
  { value: 'newest', label: 'Newest', direction: 'desc' },
];

export default function AdvancedSearch({
  products = [],
  categories = [],
  onSearch,
  onProductClick,
  className = '',
  placeholder = 'Search beauty products...',
  showFilters = true,
  showVoiceSearch = true,
  showHistory = true,
  maxResults = 20,
  historyLimit = 5,
  debounceMs = 300
}: AdvancedSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Search state
  const [searchState, setSearchState] = useState<SearchState>({
    query: searchParams.get('q') || '',
    filters: {
      category: searchParams.get('category') || undefined,
      priceMin: searchParams.get('min') ? Number(searchParams.get('min')) : undefined,
      priceMax: searchParams.get('max') ? Number(searchParams.get('max')) : undefined,
      inStock: searchParams.get('stock') === 'true',
    },
    sort: SORT_OPTIONS[0],
    results: [],
    suggestions: [],
    history: [],
    isLoading: false,
    error: null,
    hasSearched: false,
  });

  // Extra API response fields
  const [spellSuggestion, setSpellSuggestion] = useState<string | null>(null);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  // Voice search state
  const [voiceState, setVoiceState] = useState<VoiceSearchState>({
    isListening: false,
    isSupported: typeof window !== 'undefined' && 'webkitSpeechRecognition' in window,
    error: null,
    language: 'en-US',
  });

  // UI state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Load search history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedHistory = localStorage.getItem('searchHistory');
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          setSearchState(prev => ({ ...prev, history: parsed }));
        }
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    }
  }, []);

  // Update URL with search parameters
  const updateURL = useCallback((query: string, filters: Filter, sort: SortOption) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (filters.category) params.set('category', filters.category);
    if (filters.priceMin) params.set('min', filters.priceMin.toString());
    if (filters.priceMax) params.set('max', filters.priceMax.toString());
    if (filters.inStock) params.set('stock', 'true');

    const url = params.toString() ? `/search?${params.toString()}` : '/search';
    router.push(url, { scroll: false });
  }, [router]);

  // Save search to history
  const saveToHistory = useCallback((term: string, resultCount: number) => {
    if (!term.trim()) return;

    try {
      const newHistory: SearchHistory[] = [
        { term, timestamp: new Date(), resultCount },
        ...searchState.history.filter(h => h.term !== term)
      ].slice(0, historyLimit);

      setSearchState(prev => ({ ...prev, history: newHistory }));
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      }
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }, [searchState.history, historyLimit]);

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchState(prev => ({ ...prev, history: [] }));
    if (typeof window !== 'undefined') {
      localStorage.removeItem('searchHistory');
    }
  }, []);

  // ✅ ELASTICSEARCH SUGGESTIONS - Get suggestions from API
  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      return BEAUTY_SUGGESTIONS.slice(0, 5);
    }

    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();

      if (data.success && data.suggestions) {
        const apiSuggestions = data.suggestions.map((suggestion: any, index: number) => ({
          id: `api-${index}`,
          text: suggestion.text,
          type: suggestion.type || 'completion',
          icon: suggestion.type === 'product' ? <Star className="w-4 h-4" /> : 
                suggestion.type === 'brand' ? <TrendingUp className="w-4 h-4" /> : 
                <Search className="w-4 h-4" />,
          product: suggestion.product,
        }));

        const queryLower = query.toLowerCase();
        const historyMatches = searchState.history
          .filter(h => h.term.toLowerCase().includes(queryLower))
          .slice(0, 2)
          .map((h, index) => ({
            id: `history-${index}`,
            text: h.term,
            type: 'history' as const,
            icon: <Clock className="w-4 h-4" />,
            count: h.resultCount
          }));

        return [...apiSuggestions, ...historyMatches].slice(0, 5);
      }
    } catch (error) {
      console.error('Suggestions error:', error);
    }

    const queryLower = query.toLowerCase();
    return BEAUTY_SUGGESTIONS
      .filter(suggestion =>
        suggestion.text.toLowerCase().includes(queryLower) ||
        suggestion.text.toLowerCase().startsWith(queryLower)
      )
      .slice(0, 5);
  }, [searchState.history]);

  // ✅ ELASTICSEARCH INTEGRATION - Main search function
  const performSearch = useCallback(async (query: string) => {
    setSearchState(prev => ({
      ...prev,
      query,
      isLoading: true,
      error: null,
      hasSearched: true
    }));

    try {
      const params = new URLSearchParams();
      
      if (query.trim()) {
        params.set('q', query);
      }
      
      if (searchState.filters.category) {
        params.set('category', searchState.filters.category);
      }
      
      if (searchState.filters.subcategory) {
        params.set('subcategory', searchState.filters.subcategory);
      }
      
      if (searchState.filters.priceMin !== undefined) {
        params.set('minPrice', searchState.filters.priceMin.toString());
      }
      
      if (searchState.filters.priceMax !== undefined) {
        params.set('maxPrice', searchState.filters.priceMax.toString());
      }
      
      if (searchState.filters.inStock) {
        params.set('inStock', 'true');
      }
      
      if (searchState.filters.rating !== undefined) {
        params.set('rating', searchState.filters.rating.toString());
      }
      
      params.set('page', '1');
      params.set('limit', maxResults.toString());
      
      let sortParam = 'relevance';
      if (searchState.sort.value === 'price') {
        sortParam = searchState.sort.direction === 'asc' ? 'price_asc' : 'price_desc';
      } else if (searchState.sort.value === 'newest') {
        sortParam = 'newest';
      } else if (searchState.sort.value === 'rating') {
        sortParam = 'rating';
      }
      params.set('sort', sortParam);

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        // API returns data.products at root level (not data.data.products)
        const products = data.products || [];
        setSearchState(prev => ({
          ...prev,
          results: products,
          isLoading: false,
        }));
        setSpellSuggestion(data.spellSuggestion || null);
        setFallbackMessage(data.fallback?.message || null);

        if (query.trim() && products.length > 0) {
          saveToHistory(query, products.length);
        }

        updateURL(query, searchState.filters, searchState.sort);
        onSearch?.(query, searchState.filters, searchState.sort);
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setSearchState(prev => ({
        ...prev,
        results: [],
        isLoading: false,
        error: error.message || 'Failed to search products. Please try again.',
      }));
    }
  }, [saveToHistory, updateURL, searchState.filters, searchState.sort, maxResults, onSearch]);

  // ✅ ASYNC DEBOUNCED SEARCH
  const debouncedSearch = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      await performSearch(query);
    }, debounceMs);
  }, [performSearch, debounceMs]);

  // ✅ ASYNC INPUT HANDLER
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchState(prev => ({ ...prev, query: value }));
    setShowSuggestions(true);
    
    if (value.trim()) {
      getSuggestions(value).then(suggestions => {
        setSearchState(prev => ({ ...prev, suggestions }));
      });
    } else {
      setSearchState(prev => ({ ...prev, suggestions: [] }));
    }
    
    debouncedSearch(value);
  };

  // ✅ ASYNC SUGGESTION CLICK
  const handleSuggestionClick = async (suggestion: SuggestionItem) => {
    setSearchState(prev => ({ ...prev, query: suggestion.text }));
    setShowSuggestions(false);
    await performSearch(suggestion.text);
    inputRef.current?.focus();
  };

  // Handle voice search
  const startVoiceSearch = useCallback(() => {
    if (!voiceState.isSupported) {
      setVoiceState(prev => ({
        ...prev,
        error: 'Voice search is not supported in your browser'
      }));
      return;
    }

    try {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = voiceState.language;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setVoiceState(prev => ({ ...prev, isListening: true, error: null }));
      };

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchState(prev => ({ ...prev, query: transcript }));
        await performSearch(transcript);
        setVoiceState(prev => ({ ...prev, isListening: false }));
      };

      recognition.onerror = (event: any) => {
        setVoiceState(prev => ({
          ...prev,
          isListening: false,
          error: `Voice search error: ${event.error}`
        }));
      };

      recognition.onend = () => {
        setVoiceState(prev => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      setVoiceState(prev => ({
        ...prev,
        isListening: false,
        error: 'Failed to start voice recognition'
      }));
    }
  }, [voiceState.isSupported, voiceState.language, performSearch]);

  const stopVoiceSearch = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setVoiceState(prev => ({ ...prev, isListening: false }));
  }, []);

  // Handle filter changes
  const handleFilterChange = (filterName: keyof Filter, value: any) => {
    setSearchState(prev => ({
      ...prev,
      filters: { ...prev.filters, [filterName]: value }
    }));
  };

  // Handle sort change
  const handleSortChange = (sortOption: SortOption) => {
    setSearchState(prev => ({ ...prev, sort: sortOption }));
  };

  // ✅ ASYNC APPLY FILTERS
  const applyFilters = useCallback(async () => {
    await performSearch(searchState.query);
    setShowFiltersPanel(false);
  }, [performSearch, searchState.query]);

  // ✅ ASYNC CLEAR FILTERS
  const clearFilters = useCallback(async () => {
    setSearchState(prev => ({
      ...prev,
      filters: {
        category: undefined,
        subcategory: undefined,
        priceMin: undefined,
        priceMax: undefined,
        inStock: undefined,
        rating: undefined
      }
    }));
    await performSearch(searchState.query);
  }, [performSearch, searchState.query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestionIndex(prev =>
          prev < searchState.suggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : searchState.suggestions.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (searchState.suggestions[activeSuggestionIndex]) {
          handleSuggestionClick(searchState.suggestions[activeSuggestionIndex]);
        }
        break;

      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className={`w-full max-w-6xl mx-auto ${className}`}>
      {/* Search Input Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="relative">
          {/* Search Input */}
          <div className="relative flex items-center">
            <div className="absolute left-3 flex items-center pointer-events-none">
              {searchState.isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              ) : (
                <Search className="h-5 w-5 text-gray-400" />
              )}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={searchState.query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder={placeholder}
              className="w-full pl-10 pr-24 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              aria-label="Search products"
              role="searchbox"
              aria-expanded={showSuggestions}
              aria-autocomplete="list"
            />

            {/* Action Buttons */}
            <div className="absolute right-2 flex items-center gap-2">
              {showVoiceSearch && voiceState.isSupported && (
                <button
                  type="button"
                  onClick={voiceState.isListening ? stopVoiceSearch : startVoiceSearch}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    voiceState.isListening
                      ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  aria-label={voiceState.isListening ? 'Stop voice search' : 'Start voice search'}
                >
                  {voiceState.isListening ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
              )}

              {showFilters && (
                <button
                  type="button"
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-300"
                  aria-label="Toggle filters"
                >
                  <FilterIcon className="h-5 w-5" />
                </button>
              )}

              {searchState.query && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchState(prev => ({ ...prev, query: '', results: [], hasSearched: false }));
                    inputRef.current?.focus();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && searchState.suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
            >
              {searchState.suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors duration-300 ${
                    index === activeSuggestionIndex ? 'bg-gray-50' : ''
                  }`}
                >
                  <span className="text-gray-400">{suggestion.icon}</span>
                  <span className="flex-1 text-left text-gray-700">{suggestion.text}</span>
                  {suggestion.count && (
                    <span className="text-xs text-gray-400">{suggestion.count} items</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFiltersPanel && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={searchState.filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
              <input
                type="number"
                value={searchState.filters.priceMin || ''}
                onChange={(e) => handleFilterChange('priceMin', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
              <input
                type="number"
                value={searchState.filters.priceMax || ''}
                onChange={(e) => handleFilterChange('priceMax', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* In Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={searchState.filters.inStock || false}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked || undefined)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">In Stock Only</span>
              </label>
            </div>
          </div>

          {/* Sort Options */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={`${searchState.sort.value}-${searchState.sort.direction}`}
              onChange={(e) => {
                const option = SORT_OPTIONS.find(opt => 
                  `${opt.value}-${opt.direction}` === e.target.value
                );
                if (option) handleSortChange(option);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map((option, index) => (
                <option key={index} value={`${option.value}-${option.direction}`}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-300"
            >
              Clear All
            </button>
            <button
              onClick={() => setShowFiltersPanel(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search History */}
      {showHistory && searchState.history.length > 0 && !searchState.query && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Recent Searches</h3>
            <button
              onClick={clearHistory}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-300"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchState.history.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick({ id: `history-${index}`, text: item.term, type: 'history' })}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors duration-300 flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                {item.term}
                <span className="text-gray-400 text-xs">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Section */}
      {searchState.hasSearched && (
        <div className="bg-white rounded-lg shadow-md p-4">
          {/* Did you mean? */}
          {spellSuggestion && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-sm">
              <span className="text-yellow-600">🔤</span>
              <span className="text-yellow-800">
                Did you mean:{' '}
                <button
                  onClick={() => handleSuggestionClick({ id: 'spell', text: spellSuggestion, type: 'suggestion' })}
                  className="font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-800"
                >
                  {spellSuggestion}
                </button>
                ?
              </span>
            </div>
          )}

          {/* Fallback message */}
          {fallbackMessage && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-center gap-2">
              <span className="text-blue-500">ℹ️</span>
              {fallbackMessage}
            </div>
          )}

          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {searchState.query
                ? `Search results for "${searchState.query}"`
                : 'All Products'}
            </h2>
            <span className="text-sm text-gray-600">
              {searchState.results.length} {searchState.results.length === 1 ? 'result' : 'results'}
            </span>
          </div>

          {/* Error Message */}
          {searchState.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700">{searchState.error}</p>
            </div>
          )}

          {/* Results Grid */}
          {searchState.results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {searchState.results.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => onProductClick?.(product)}
                >
                  {product.image && (
                    <div className="relative aspect-square mb-3">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(convertUSDtoBDT(product.price))}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through ml-2">
                          {formatPrice(convertUSDtoBDT(product.originalPrice))}
                        </span>
                      )}
                    </div>
                    {product.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{product.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  {!product.inStock && (
                    <p className="text-sm text-red-600 mt-2">Out of Stock</p>
                  )}
                </div>
              ))}
            </div>
          ) : !searchState.isLoading ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
