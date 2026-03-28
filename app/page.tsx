'use client';

import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/contexts/ProductsContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, Heart, ShoppingCart, Home as HomeIcon, User, ChevronRight, Flame } from 'lucide-react';
import { formatPrice, convertUSDtoBDT } from '@/utils/currency';

// Helper: render a real image URL or fall back to emoji text
function ProductImage({ src, alt }: { src: string; alt: string }) {
  const isUrl = src.startsWith('/') || src.startsWith('http') || src.startsWith('data:');
  if (isUrl) {
    return <img src={src} alt={alt} className="w-full h-full object-cover rounded-inherit" />;
  }
  return <span className="text-4xl">{src}</span>;
}

const brands = [
  { name: 'MAC', logo: 'MAC' },
  { name: 'Dior', logo: 'Dior' },
  { name: 'Fenty Beauty', logo: 'FENTY\nBEAUTY' },
  { name: 'Chanel', logo: 'CHANEL' },
];

const CATEGORY_COLORS = [
  'bg-pink-100',
  'bg-blue-100',
  'bg-purple-100',
  'bg-yellow-100',
  'bg-green-100',
  'bg-orange-100',
  'bg-red-100',
  'bg-teal-100',
];

const DEFAULT_CATEGORY_ICON = '🏷️';


const comboSlides = [
  {
    title: 'Best Value Combos',
    description: 'Save More with Our Curated Sets',
    gradient: 'from-minsah-primary via-minsah-secondary to-minsah-dark',
    image: '🎁'
  },
  {
    title: 'Premium Combo Deals',
    description: 'Luxury Beauty at Great Prices',
    gradient: 'from-purple-600 via-pink-500 to-orange-400',
    image: '💎'
  },
  {
    title: 'Complete Care Sets',
    description: 'Everything You Need in One Box',
    gradient: 'from-blue-500 via-teal-400 to-green-400',
    image: '✨'
  },
];

interface Suggestion {
  text: string;
  slug: string;
  productName: string;
  price: number;
  image?: string;
}

export default function HomePage() {
  const router = useRouter();
  const { items, addItem } = useCart();
  const { products } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(() => {
    const q = searchQuery.trim();
    if (q) {
      setShowSuggestions(false);
      router.push(`/shop?q=${encodeURIComponent(q)}`);
    }
  }, [searchQuery, router]);

  // Fetch suggestions with debounce
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}&limit=6`);
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
        setShowSuggestions(true);
      } catch {
        // silently ignore
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentComboSlide, setCurrentComboSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 7, minutes: 33, seconds: 28 });
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; icon: string; color: string }[]>([]);

  const handleAddToCart = (
    e: React.MouseEvent,
    product: { id: string; name: string; price: number; image: string }
  ) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image });
    setAddedIds(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedIds(prev => { const next = new Set(prev); next.delete(product.id); return next; });
    }, 1500);
  };

  const activeProducts = useMemo(
    () => products.filter(p => p.status === 'active'),
    [products]
  );

  // New Arrivals: most recently added active products
  const newArrivals = useMemo(
    () =>
      [...activeProducts]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8)
        .map(p => ({ id: p.id, name: p.name, price: p.price, image: p.image, sku: p.category })),
    [activeProducts]
  );

  // For You: first 6 active products
  const forYouProducts = useMemo(
    () => activeProducts.slice(0, 6).map(p => ({ id: p.id, name: p.name, price: p.price, image: p.image })),
    [activeProducts]
  );

  // Recommendations: highest-rated active products
  const recommendations = useMemo(
    () =>
      [...activeProducts]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6)
        .map(p => ({ id: p.id, name: p.name, price: p.price, rating: Math.round(p.rating), reviews: p.reviews, image: p.image })),
    [activeProducts]
  );

  // Favourites: featured active products, fallback to any active
  const favourites = useMemo(
    () =>
      [...activeProducts]
        .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        .slice(0, 6)
        .map(p => ({ id: p.id, name: p.name, price: p.price, rating: Math.round(p.rating), reviews: p.reviews, image: p.image })),
    [activeProducts]
  );

  // Flash Sale: active products that have a lower price than originalPrice
  const flashSaleProducts = useMemo(
    () =>
      activeProducts
        .filter(p => p.originalPrice != null && p.originalPrice > p.price)
        .slice(0, 4)
        .map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice as number,
          discount: Math.round(((p.originalPrice as number - p.price) / (p.originalPrice as number)) * 100),
          image: p.image,
        })),
    [activeProducts]
  );

  // Fetch categories from API
  useEffect(() => {
    fetch('/api/categories?activeOnly=true')
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          const mapped = data.categories.map((cat: { id: string; name: string; slug: string; icon?: string }, index: number) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon || DEFAULT_CATEGORY_ICON,
            color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
          }));
          setCategories(mapped);
        }
      })
      .catch(() => {
        // keep empty array on error
      });
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-slide promotion
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 2);
    }, 5000);

    return () => clearInterval(slideTimer);
  }, []);

  // Auto-slide combos
  useEffect(() => {
    const comboSlideTimer = setInterval(() => {
      setCurrentComboSlide(prev => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(comboSlideTimer);
  }, []);

  return (
    <div className="min-h-screen bg-minsah-light pb-20">
      {/* Header */}
      <header className="bg-minsah-dark text-minsah-light sticky top-0 z-50 shadow-md">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs">9:41</span>
            </div>
            <h1 className="text-xl font-bold font-[\'Tenor_Sans\']">Home</h1>
            <div className="w-12"></div>
          </div>

          {/* Search Bar */}
          <div ref={searchRef} className="relative">
            <button
              onClick={handleSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-minsah-secondary z-10"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search here"
              className="w-full pl-10 pr-4 py-2.5 bg-minsah-accent text-minsah-dark placeholder:text-minsah-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-minsah-primary"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-minsah-accent rounded-lg shadow-lg z-50 overflow-hidden">
                {suggestions.map((s, i) => (
                  <li key={i}>
                    <Link
                      href={s.slug ? `/products/${s.slug}` : `/shop?q=${encodeURIComponent(s.text)}`}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-minsah-accent/50 transition-colors"
                    >
                      {s.image && (
                        <img src={s.image} alt={s.productName} className="w-9 h-9 object-cover rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-minsah-dark truncate">{s.productName || s.text}</p>
                        {s.price > 0 && (
                          <p className="text-xs text-minsah-secondary">৳{s.price.toLocaleString()}</p>
                        )}
                      </div>
                      <Search size={14} className="text-minsah-secondary flex-shrink-0" />
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    onClick={handleSearch}
                    className="w-full text-left px-4 py-2.5 text-sm text-minsah-primary font-medium hover:bg-minsah-accent/50 transition-colors border-t border-minsah-accent"
                  >
                    See all results for &ldquo;{searchQuery}&rdquo;
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </header>

      {/* Browse by Categories */}
      <section className="px-4 py-6 bg-white">
        <h2 className="text-lg font-bold text-minsah-dark mb-4">Browse by Categories</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <Link
              key={category.id ?? category.name}
              href={`/categories/${category.slug ?? category.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center text-3xl overflow-hidden`}>
                {category.icon && (category.icon.startsWith('/') || category.icon.startsWith('http'))
                  ? <img src={category.icon} alt={category.name} className="w-full h-full object-cover" />
                  : (category.icon || DEFAULT_CATEGORY_ICON)
                }
              </div>
              <span className="text-xs text-minsah-dark font-medium text-center">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Promotion Section */}
      <section className="px-4 py-6">
        <h2 className="text-lg font-bold text-minsah-dark mb-4">Promotion Section</h2>
        <div className="relative">
          {/* Carousel */}
          <div className="bg-gradient-to-br from-pink-500 via-pink-400 to-orange-400 rounded-3xl p-6 min-h-[200px] flex items-center justify-between overflow-hidden">
            <div className="text-white z-10">
              <h3 className="text-2xl font-bold mb-2">Exclusive<br/>Winter<br/>2022-23</h3>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-16 h-16 bg-white/30 rounded-full"></div>
              <div className="w-20 h-20 bg-white/40 rounded-full"></div>
              <div className="w-16 h-16 bg-white/30 rounded-full"></div>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-1.5 mt-3">
            <div className={`h-1.5 rounded-full transition-all ${currentSlide === 0 ? 'w-6 bg-minsah-primary' : 'w-1.5 bg-minsah-secondary'}`}></div>
            <div className={`h-1.5 rounded-full transition-all ${currentSlide === 1 ? 'w-6 bg-minsah-primary' : 'w-1.5 bg-minsah-secondary'}`}></div>
          </div>
        </div>
      </section>

      {/* Browse by Combos */}
      <section className="px-4 py-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-minsah-dark">Browse by Combos</h2>
          <Link href="/combos" className="text-sm text-minsah-primary font-semibold flex items-center gap-1">
            View all <ChevronRight size={16} />
          </Link>
        </div>
        <div className="relative">
          {/* Combo Carousel */}
          <Link href="/combos" className="block">
            <div className={`bg-gradient-to-br ${comboSlides[currentComboSlide].gradient} rounded-3xl p-6 min-h-[200px] flex items-center justify-between overflow-hidden transition-all duration-500`}>
              <div className="text-white z-10 flex-1">
                <h3 className="text-2xl font-bold mb-2">{comboSlides[currentComboSlide].title}</h3>
                <p className="text-sm opacity-90">{comboSlides[currentComboSlide].description}</p>
              </div>
              <div className="text-7xl opacity-20">
                {comboSlides[currentComboSlide].image}
              </div>
            </div>
          </Link>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-1.5 mt-3">
            <div className={`h-1.5 rounded-full transition-all ${currentComboSlide === 0 ? 'w-6 bg-minsah-primary' : 'w-1.5 bg-minsah-secondary'}`}></div>
            <div className={`h-1.5 rounded-full transition-all ${currentComboSlide === 1 ? 'w-6 bg-minsah-primary' : 'w-1.5 bg-minsah-secondary'}`}></div>
            <div className={`h-1.5 rounded-full transition-all ${currentComboSlide === 2 ? 'w-6 bg-minsah-primary' : 'w-1.5 bg-minsah-secondary'}`}></div>
          </div>
        </div>

        {/* Combo Categories Preview */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link href="/combos" className="bg-minsah-accent rounded-xl p-4 flex items-center gap-3">
            <div className="text-3xl">💄</div>
            <div>
              <h4 className="font-semibold text-sm text-minsah-dark">Makeup Combos</h4>
              <p className="text-xs text-minsah-secondary">From Tk 1001</p>
            </div>
          </Link>
          <Link href="/combos" className="bg-minsah-accent rounded-xl p-4 flex items-center gap-3">
            <div className="text-3xl">✨</div>
            <div>
              <h4 className="font-semibold text-sm text-minsah-dark">Skincare Sets</h4>
              <p className="text-xs text-minsah-secondary">From Tk 1001</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Flash Sale */}
      <section className="px-4 py-6 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="text-orange-500" size={24} />
            <h2 className="text-lg font-bold text-minsah-dark">Flash Sale</h2>
          </div>
          <Link href="/flash-sale" className="text-sm text-minsah-primary font-semibold">
            Shop Now
          </Link>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-minsah-secondary">Ends in:</span>
          <div className="flex gap-1">
            <div className="bg-minsah-primary text-white px-2 py-1 rounded text-xs font-bold min-w-[24px] text-center">
              {String(timeLeft.days).padStart(2, '0')}
            </div>
            <span className="text-minsah-dark">:</span>
            <div className="bg-minsah-primary text-white px-2 py-1 rounded text-xs font-bold min-w-[24px] text-center">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <span className="text-minsah-dark">:</span>
            <div className="bg-minsah-primary text-white px-2 py-1 rounded text-xs font-bold min-w-[24px] text-center">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <span className="text-minsah-dark">:</span>
            <div className="bg-minsah-primary text-white px-2 py-1 rounded text-xs font-bold min-w-[24px] text-center">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Flash Sale Products */}
        <div className="grid grid-cols-2 gap-3">
          {flashSaleProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl p-3 shadow-sm relative">
              <Link href={`/products/${product.id}`}>
                <div className="relative mb-2">
                  <div className="w-full aspect-square bg-minsah-accent rounded-lg flex items-center justify-center overflow-hidden mb-2">
                    <ProductImage src={product.image} alt={product.name} />
                  </div>
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {product.discount}%
                  </div>
                </div>
                <h3 className="text-xs font-semibold text-minsah-dark mb-1 line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-minsah-primary">
                    {formatPrice(convertUSDtoBDT(product.price))}
                  </span>
                  <span className="text-xs text-minsah-secondary line-through">
                    {formatPrice(convertUSDtoBDT(product.originalPrice))}
                  </span>
                </div>
              </Link>
              <button
                onClick={(e) => handleAddToCart(e, product)}
                className={`w-full py-1.5 rounded-lg text-xs font-semibold transition ${addedIds.has(product.id) ? 'bg-green-500 text-white' : 'bg-minsah-primary text-white hover:bg-minsah-dark'}`}
              >
                {addedIds.has(product.id) ? '✓ Added' : '🛒 Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrival */}
      <section className="px-4 py-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-minsah-dark">New Arrival</h2>
          <Link href="/new-arrivals" className="text-sm text-minsah-primary font-semibold flex items-center gap-1">
            View all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {newArrivals.slice(0, 4).map((product) => (
            <div key={product.id} className="bg-minsah-accent rounded-2xl p-3">
              <Link href={`/products/${product.id}`}>
                <div className="relative mb-2">
                  <div className="w-full aspect-square bg-white rounded-xl flex items-center justify-center overflow-hidden mb-2">
                    <ProductImage src={product.image} alt={product.name} />
                  </div>
                  <div className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Heart size={16} className="text-minsah-secondary" />
                  </div>
                </div>
                <h3 className="text-xs font-semibold text-minsah-dark mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-xs text-minsah-secondary mb-1">{product.sku}</p>
                <span className="text-sm font-bold text-minsah-primary mb-2 block">
                  {formatPrice(convertUSDtoBDT(product.price))}
                </span>
              </Link>
              <button
                onClick={(e) => handleAddToCart(e, product)}
                className={`w-full py-1.5 rounded-lg text-xs font-semibold transition ${addedIds.has(product.id) ? 'bg-green-500 text-white' : 'bg-minsah-primary text-white hover:bg-minsah-dark'}`}
              >
                {addedIds.has(product.id) ? '✓ Added' : '+ Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* For You */}
      <section className="px-4 py-6 bg-minsah-light">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-minsah-dark">For You</h2>
          <Link href="/for-you" className="text-sm text-minsah-primary font-semibold flex items-center gap-1">
            View all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {forYouProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl p-3 flex-shrink-0 w-36">
              <Link href={`/products/${product.id}`}>
                <div className="relative mb-2">
                  <div className="w-full aspect-square bg-minsah-accent rounded-xl flex items-center justify-center overflow-hidden mb-2">
                    <ProductImage src={product.image} alt={product.name} />
                  </div>
                  <div className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Heart size={14} className="text-minsah-secondary" />
                  </div>
                </div>
                <h3 className="text-xs font-semibold text-minsah-dark mb-1 line-clamp-2">{product.name}</h3>
                <span className="text-sm font-bold text-minsah-primary block mb-2">
                  {formatPrice(convertUSDtoBDT(product.price))}
                </span>
              </Link>
              <button
                onClick={(e) => handleAddToCart(e, product)}
                className={`w-full py-1 rounded-lg text-[10px] font-semibold transition ${addedIds.has(product.id) ? 'bg-green-500 text-white' : 'bg-minsah-primary text-white hover:bg-minsah-dark'}`}
              >
                {addedIds.has(product.id) ? '✓' : '+ Cart'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Recommendation */}
      <section className="px-4 py-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-minsah-dark">Recommendation</h2>
          <Link href="/recommendations" className="text-sm text-minsah-primary font-semibold flex items-center gap-1">
            View all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {recommendations.slice(0, 6).map((product) => (
            <div key={product.id} className="bg-minsah-accent rounded-xl p-2">
              <Link href={`/products/${product.id}`}>
                <div className="relative mb-2">
                  <div className="w-full aspect-square bg-white rounded-lg flex items-center justify-center overflow-hidden mb-1">
                    <ProductImage src={product.image} alt={product.name} />
                  </div>
                  <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Heart size={12} className="text-minsah-secondary" />
                  </div>
                </div>
                <h3 className="text-[10px] font-semibold text-minsah-dark mb-1 line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs font-bold text-minsah-primary">
                    {formatPrice(convertUSDtoBDT(product.price))}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex text-yellow-400 text-[10px]">
                    {'★'.repeat(product.rating)}{'☆'.repeat(5 - product.rating)}
                  </div>
                  <span className="text-[8px] text-minsah-secondary">({product.reviews})</span>
                </div>
              </Link>
              <button
                onClick={(e) => handleAddToCart(e, product)}
                className={`w-full py-1 rounded text-[10px] font-semibold transition ${addedIds.has(product.id) ? 'bg-green-500 text-white' : 'bg-minsah-primary text-white hover:bg-minsah-dark'}`}
              >
                {addedIds.has(product.id) ? '✓' : '+ Cart'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Favourite */}
      <section className="px-4 py-6 bg-minsah-light">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-minsah-dark">Favourite</h2>
          <Link href="/favourites" className="text-sm text-minsah-primary font-semibold flex items-center gap-1">
            View all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {favourites.slice(0, 6).map((product) => (
            <div key={product.id} className="bg-white rounded-xl p-2">
              <Link href={`/products/${product.id}`}>
                <div className="relative mb-2">
                  <div className="w-full aspect-square bg-minsah-accent rounded-lg flex items-center justify-center overflow-hidden mb-1">
                    <ProductImage src={product.image} alt={product.name} />
                  </div>
                  <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Heart size={12} className="text-red-500 fill-red-500" />
                  </div>
                </div>
                <h3 className="text-[10px] font-semibold text-minsah-dark mb-1 line-clamp-2">{product.name}</h3>
                <span className="text-xs font-bold text-minsah-primary block mb-2">
                  {formatPrice(convertUSDtoBDT(product.price))}
                </span>
              </Link>
              <button
                onClick={(e) => handleAddToCart(e, product)}
                className={`w-full py-1 rounded text-[10px] font-semibold transition ${addedIds.has(product.id) ? 'bg-green-500 text-white' : 'bg-minsah-primary text-white hover:bg-minsah-dark'}`}
              >
                {addedIds.has(product.id) ? '✓' : '+ Cart'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Browse Popular Brand */}
      <section className="px-4 py-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-minsah-dark">Browse Popular Brand</h2>
          <Link href="/brands" className="text-sm text-minsah-primary font-semibold flex items-center gap-1">
            View all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              href={`/brands/${brand.name.toLowerCase().replace(' ', '-')}`}
              className="bg-white border-2 border-minsah-accent rounded-full aspect-square flex items-center justify-center p-2 hover:border-minsah-primary transition"
            >
              <span className="text-xs font-bold text-minsah-dark text-center whitespace-pre-line">
                {brand.logo}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-minsah-accent shadow-lg z-50">
        <div className="flex items-center justify-around py-3">
          <Link href="/" className="flex flex-col items-center gap-1 text-minsah-primary">
            <HomeIcon size={24} />
            <span className="text-xs font-semibold">Home</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center gap-1 text-minsah-secondary hover:text-minsah-primary transition">
            <Search size={24} />
            <span className="text-xs">Search</span>
          </Link>
          <Link href="/wishlist" className="flex flex-col items-center gap-1 text-minsah-secondary hover:text-minsah-primary transition">
            <Heart size={24} />
            <span className="text-xs">Wishlist</span>
          </Link>
          <Link href="/cart" className="flex flex-col items-center gap-1 text-minsah-secondary hover:text-minsah-primary transition relative">
            <ShoppingCart size={24} />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
            <span className="text-xs">Cart</span>
          </Link>
          <Link href="/login" className="flex flex-col items-center gap-1 text-minsah-secondary hover:text-minsah-primary transition">
            <User size={24} />
            <span className="text-xs">Account</span>
          </Link>
        </div>
      </nav>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
