import {
  HomeSection,
  HomeSectionCategory,
  HomeSectionProduct,
  HomeSectionCombo,
  HomeSectionBrand,
  PromotionSlide,
  ComboSlide,
} from '@/types/admin';

// Default Home Sections Configuration
export const defaultHomeSections: HomeSection[] = [
  {
    id: 'section-categories',
    type: 'categories',
    title: 'Browse by Categories',
    isVisible: true,
    order: 1,
    settings: {
      showViewAll: false,
      itemsToShow: 5,
      layout: 'horizontal-scroll',
      backgroundColor: '#FFFFFF',
    },
  },
  {
    id: 'section-promotion',
    type: 'promotion',
    title: 'Promotion Section',
    isVisible: true,
    order: 2,
    settings: {
      showViewAll: false,
      itemsToShow: 2,
      layout: 'horizontal-scroll',
      backgroundColor: '#FFE6D2',
    },
  },
  {
    id: 'section-combos',
    type: 'combos',
    title: 'Browse by Combos',
    isVisible: true,
    order: 3,
    settings: {
      showViewAll: true,
      itemsToShow: 3,
      layout: 'horizontal-scroll',
      backgroundColor: '#FFFFFF',
    },
  },
  {
    id: 'section-flash-sale',
    type: 'flash-sale',
    title: 'Flash Sale',
    isVisible: true,
    order: 4,
    settings: {
      showViewAll: true,
      itemsToShow: 4,
      layout: 'grid-2',
      backgroundColor: '#FFF7ED',
    },
  },
  {
    id: 'section-new-arrivals',
    type: 'new-arrivals',
    title: 'New Arrival',
    isVisible: true,
    order: 5,
    settings: {
      showViewAll: true,
      itemsToShow: 4,
      layout: 'grid-2',
      backgroundColor: '#FFFFFF',
    },
  },
  {
    id: 'section-for-you',
    type: 'for-you',
    title: 'For You',
    isVisible: true,
    order: 6,
    settings: {
      showViewAll: true,
      itemsToShow: 3,
      layout: 'horizontal-scroll',
      backgroundColor: '#FFE6D2',
    },
  },
  {
    id: 'section-recommendations',
    type: 'recommendations',
    title: 'Recommendation',
    isVisible: true,
    order: 7,
    settings: {
      showViewAll: true,
      itemsToShow: 6,
      layout: 'grid-3',
      backgroundColor: '#FFFFFF',
    },
  },
  {
    id: 'section-favourites',
    type: 'favourites',
    title: 'Favourite',
    isVisible: true,
    order: 8,
    settings: {
      showViewAll: true,
      itemsToShow: 6,
      layout: 'grid-3',
      backgroundColor: '#FFE6D2',
    },
  },
  {
    id: 'section-brands',
    type: 'brands',
    title: 'Browse Popular Brand',
    isVisible: true,
    order: 9,
    settings: {
      showViewAll: true,
      itemsToShow: 4,
      layout: 'grid-4',
      backgroundColor: '#FFFFFF',
    },
  },
];

// Default Categories
export const defaultCategories: HomeSectionCategory[] = [
  { id: 'cat-1', name: 'Makeup', slug: 'makeup', icon: 'MAKEUP', color: 'bg-pink-100', isVisible: true, order: 1, productCount: 156 },
  { id: 'cat-2', name: 'Skincare', slug: 'skincare', icon: 'SKIN', color: 'bg-blue-100', isVisible: true, order: 2, productCount: 203 },
  { id: 'cat-3', name: 'Hair Care', slug: 'hair-care', icon: 'HAIR', color: 'bg-purple-100', isVisible: true, order: 3, productCount: 89 },
  { id: 'cat-4', name: 'Fragrance', slug: 'fragrance', icon: 'FRAG', color: 'bg-yellow-100', isVisible: true, order: 4, productCount: 67 },
  { id: 'cat-5', name: 'Tools', slug: 'tools', icon: 'TOOL', color: 'bg-green-100', isVisible: true, order: 5, productCount: 45 },
];

// Default Brands
export const defaultBrands: HomeSectionBrand[] = [
  { id: 'brand-1', name: 'MAC', slug: 'mac', logo: 'MAC', productCount: 312, isVisible: true, order: 1 },
  { id: 'brand-2', name: 'Dior', slug: 'dior', logo: 'Dior', productCount: 234, isVisible: true, order: 2 },
  { id: 'brand-3', name: 'Fenty Beauty', slug: 'fenty-beauty', logo: 'FENTY\nBEAUTY', productCount: 145, isVisible: true, order: 3 },
  { id: 'brand-4', name: 'Chanel', slug: 'chanel', logo: 'CHANEL', productCount: 289, isVisible: true, order: 4 },
];

// Default Promotion Slides
export const defaultPromotionSlides: PromotionSlide[] = [
  {
    id: 'promo-1',
    title: 'Exclusive\nWinter\n2022-23',
    gradient: 'from-pink-500 via-pink-400 to-orange-400',
    isVisible: true,
    order: 1,
  },
  {
    id: 'promo-2',
    title: 'Summer\nSale\n2023',
    gradient: 'from-blue-500 via-cyan-400 to-teal-400',
    isVisible: true,
    order: 2,
  },
];

// Default Combo Slides
export const defaultComboSlides: ComboSlide[] = [
  {
    id: 'combo-slide-1',
    title: 'Best Value Combos',
    description: 'Save More with Our Curated Sets',
    gradient: 'from-minsah-primary via-minsah-secondary to-minsah-dark',
    image: 'COMBO',
    isVisible: true,
    order: 1,
  },
  {
    id: 'combo-slide-2',
    title: 'Premium Combo Deals',
    description: 'Luxury Beauty at Great Prices',
    gradient: 'from-purple-600 via-pink-500 to-orange-400',
    image: 'COMBO',
    isVisible: true,
    order: 2,
  },
  {
    id: 'combo-slide-3',
    title: 'Complete Care Sets',
    description: 'Everything You Need in One Box',
    gradient: 'from-blue-500 via-teal-400 to-green-400',
    image: 'COMBO',
    isVisible: true,
    order: 3,
  },
];

// Default Products - populated from database
export const defaultProducts: HomeSectionProduct[] = [];

// Default Combos - populated from database
export const defaultCombos: HomeSectionCombo[] = [];
