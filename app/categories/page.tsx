import Navbar from '../components/Header';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import {
  Brush,
  Package,
  Flower,
  Star,
  Sparkles,
  Droplets,
  ArrowRight
} from 'lucide-react';

const categories = [
  { name: 'Make Up', href: '/categories/makeup', icon: <Brush className="w-16 h-16" />, count: 24 },
  { name: 'SPA', href: '/categories/spa', icon: <Package className="w-16 h-16" />, count: 18 },
  { name: 'Perfume', href: '/categories/perfume', icon: <Flower className="w-16 h-16" />, count: 32 },
  { name: 'Nails', href: '/categories/nails', icon: <Star className="w-16 h-16" />, count: 15 },
  { name: 'Skin care', href: '/categories/skincare', icon: <Sparkles className="w-16 h-16" />, count: 28 },
  { name: 'Hair care', href: '/categories/haircare', icon: <Droplets className="w-16 h-16" />, count: 20 },
];

const categoryProducts = [
  { id: '1', name: 'Premium Face Serum', price: 29.99, originalPrice: 49.99, category: 'Skin care' },
  { id: '2', name: 'Luxury Lipstick Set', price: 24.99, originalPrice: 39.99, category: 'Make Up' },
  { id: '3', name: 'Aromatherapy Perfume', price: 34.99, originalPrice: 54.99, category: 'Perfume' },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Categories</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse our wide range of beauty and care products organized by category
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="relative bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg p-8 hover:shadow-lg transition group"
              >
                <div className="text-6xl mb-4">{category.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 group-hover:text-pink-600 transition flex items-center">
                  {category.count} products <ArrowRight className="w-4 h-4 ml-2" />
                </p>
              </Link>
            ))}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} {...product} image="/product-placeholder.jpg" />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

