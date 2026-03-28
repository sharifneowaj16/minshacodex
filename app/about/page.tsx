import Navbar from '../components/Header';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { Leaf, Star, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">About Us</h1>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Who We Are</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nourish your skin with toxin-free cosmetic products. With the offers that you can't refuse.
                Non aliqua reprehenderit reprehenderit culpa laboris nulla minim anim velit adipisicing ea aliqua alluptate sit do do.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Non aliqua reprehenderit reprehenderit culpa laboris nulla minim anim velit adipisicing ea aliqua alluptate sit do do.
                Non aliqua reprehenderit reprehenderit culpa laboris nulla minim anim velit adipisicing ea aliqua alluptate sit do do.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <Leaf className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Natural</h3>
                <p className="text-gray-600">100% natural ingredients</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="w-10 h-10 text-yellow-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality</h3>
                <p className="text-gray-600">Premium quality products</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <Heart className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Eco-Friendly</h3>
                <p className="text-gray-600">Sustainable and ethical</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

