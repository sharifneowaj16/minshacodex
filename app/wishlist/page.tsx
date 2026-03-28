import Navbar from '../components/Header';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import Link from 'next/link';

const wishlistItems = [
  { id: '1', name: 'Premium Face Serum', price: 29.99, originalPrice: 49.99, category: 'Skin care' },
  { id: '3', name: 'Aromatherapy Perfume', price: 34.99, originalPrice: 54.99, category: 'Perfume' },
  { id: '5', name: 'SPA Body Lotion', price: 27.99, originalPrice: 44.99, category: 'SPA' },
];

export default function WishlistPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Wishlist</h1>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Your wishlist is empty</p>
              <Link
                href="/shop"
                className="inline-block bg-pink-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-pink-700 transition"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((product) => (
                <ProductCard key={product.id} {...product} image="/product-placeholder.jpg" />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

