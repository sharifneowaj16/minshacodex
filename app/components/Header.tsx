'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MegaMenu from './MegaMenu';
import MobileMenu from './MobileMenu';
import { User, Heart, ShoppingCart, Search, X, TrendingUp, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SearchSuggestion {
  type: 'product' | 'trending' | 'completion';
  text: string;
  productName?: string;
  slug?: string;
  price?: number;
  image?: string;
  badges?: string[];
}

export default function Navbar() {
  const router = useRouter();
  const { user } = useAuth();
  const [cartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
      setSuggestions([]);
      setActiveSuggestionIndex(-1);
    }
  }, [searchOpen]);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    setSuggestionsLoading(true);
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&limit=6`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) setSuggestions(data.suggestions ?? []);
    } catch {
      // silent
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setActiveSuggestionIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 280);
  };

  const executeSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }, [router]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestionIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
          const s = suggestions[activeSuggestionIndex];
          if (s.type === 'product' && s.slug) {
            setSearchOpen(false);
            router.push(`/products/${s.slug}`);
          } else {
            executeSearch(s.text);
          }
        } else {
          executeSearch(searchQuery);
        }
        break;
      case 'Escape':
        setSearchOpen(false);
        break;
    }
  };

  return (
    <>
      <nav
        className={`fixed left-4 right-4 z-50 transition-all duration-300 ${
          isScrolled ? 'top-4' : 'top-12'
        } ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md shadow-md rounded-3xl'
            : 'bg-transparent'
        }`}
        style={{
          backgroundColor: isScrolled ? 'rgba(252, 237, 234, 0.9)' : 'transparent'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-center ${isScrolled ? 'h-16' : 'h-20'} transition-all duration-300`}>
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-black transition-colors duration-300">
                Minsah Beauty
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-black hover:text-black/80 transition-colors duration-300">
                Home
              </Link>
              <MegaMenu />

              {/* Search Icon / Expanded Input */}
              <div ref={searchContainerRef} className="relative">
                {searchOpen ? (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchInput}
                        onKeyDown={handleKeyDown}
                        placeholder="Search products..."
                        className="w-56 pl-9 pr-3 py-2 rounded-full border border-black/20 bg-white/80 text-sm text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black/30 transition-all duration-200"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/50 pointer-events-none" />

                      {/* Suggestions dropdown */}
                      {(suggestions.length > 0 || suggestionsLoading) && (
                        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                          {suggestionsLoading && (
                            <div className="flex items-center justify-center py-4">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-pink-500 border-t-transparent" />
                            </div>
                          )}
                          {!suggestionsLoading && suggestions.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                if (s.type === 'product' && s.slug) {
                                  setSearchOpen(false);
                                  router.push(`/products/${s.slug}`);
                                } else {
                                  executeSearch(s.text);
                                }
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-pink-50 transition-colors border-b border-gray-50 last:border-0 ${
                                i === activeSuggestionIndex ? 'bg-pink-50' : ''
                              }`}
                            >
                              {s.image ? (
                                <img src={s.image} alt={s.text} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                              ) : s.type === 'trending' ? (
                                <TrendingUp className="w-4 h-4 text-orange-400 flex-shrink-0" />
                              ) : (
                                <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 truncate font-medium">
                                  {s.productName || s.text}
                                </p>
                                {s.price && s.price > 0 && (
                                  <p className="text-xs text-gray-500">৳{(s.price * 110).toLocaleString()}</p>
                                )}
                              </div>
                              {s.type === 'trending' && (
                                <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded flex-shrink-0">
                                  Trending
                                </span>
                              )}
                            </button>
                          ))}
                          {searchQuery.trim() && !suggestionsLoading && (
                            <button
                              onClick={() => executeSearch(searchQuery)}
                              className="w-full px-4 py-3 text-sm text-pink-600 font-medium hover:bg-pink-50 transition-colors border-t border-gray-100 text-left"
                            >
                              See all results for &ldquo;{searchQuery}&rdquo; →
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setSearchOpen(false)}
                      className="text-black hover:text-black/70 transition-colors"
                      aria-label="Close search"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="text-black hover:text-black/80 transition-colors duration-300"
                    aria-label="Open search"
                  >
                    <Search className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* User Icon — smart: /account if logged in, /login if not */}
              <Link
                href={user ? '/account' : '/login'}
                className="relative"
                aria-label={user ? 'My Account' : 'Login'}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.firstName || 'Account'}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-black hover:text-black/80 transition-colors duration-300" />
                )}
              </Link>

              {/* Wishlist Icon */}
              <Link href="/wishlist" className="relative">
                <Heart className="w-6 h-6 text-black hover:text-black/80 transition-colors duration-300" />
              </Link>

              {/* Cart Icon */}
              <Link href="/cart" className="relative">
                <ShoppingCart className="w-6 h-6 text-black hover:text-black/80 transition-colors duration-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: '#d4a574' }}>
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Menu */}
            <div className="lg:hidden flex items-center space-x-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="text-black hover:text-black/80 transition-colors"
                aria-label="Search"
              >
                <Search className="w-6 h-6" />
              </button>
              <MobileMenu itemCount={cartCount} />
            </div>
          </div>
        </div>
      </nav>

      {/* Full-screen search overlay for mobile */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSearchOpen(false)}>
          <div
            className="absolute top-0 left-0 right-0 bg-white p-4 shadow-xl"
            onClick={e => e.stopPropagation()}
            ref={searchContainerRef}
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Search beauty products..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              <button
                onClick={() => setSearchOpen(false)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Mobile suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-3 divide-y divide-gray-50">
                {suggestions.slice(0, 6).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (s.type === 'product' && s.slug) {
                        setSearchOpen(false);
                        router.push(`/products/${s.slug}`);
                      } else {
                        executeSearch(s.text);
                      }
                    }}
                    className="w-full flex items-center gap-3 py-3 text-left hover:bg-pink-50 px-1 rounded-lg transition-colors"
                  >
                    {s.image ? (
                      <img src={s.image} alt={s.text} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
                        {s.type === 'trending'
                          ? <TrendingUp className="w-5 h-5 text-orange-400" />
                          : <Search className="w-5 h-5 text-gray-400" />
                        }
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{s.productName || s.text}</p>
                      {s.price && s.price > 0 && (
                        <p className="text-xs text-gray-500">৳{(s.price * 110).toLocaleString()}</p>
                      )}
                    </div>
                  </button>
                ))}
                {searchQuery.trim() && (
                  <button
                    onClick={() => executeSearch(searchQuery)}
                    className="w-full py-3 text-sm text-pink-600 font-semibold text-left px-1"
                  >
                    Search all results for &ldquo;{searchQuery}&rdquo; →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
