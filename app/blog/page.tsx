import Navbar from '../components/Header';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import Link from 'next/link';
import { Flower2, Sparkles, Leaf, ArrowRight } from 'lucide-react';

const blogPosts = [
  {
    id: '1',
    title: 'Perfumes, perfumed or eau de toilette?',
    date: 'June 21',
    excerpt: 'Nourish your skin with toxin-free cosmetic products. With the offers that you can\'t refuse.',
    icon: Flower2,
  },
  {
    id: '2',
    title: 'Best multi-step skin care treatment',
    date: 'June 21',
    excerpt: 'Nourish your skin with toxin-free cosmetic products. With the offers that you can\'t refuse.',
    icon: Sparkles,
  },
  {
    id: '3',
    title: 'Natural ingredients for healthy skin',
    date: 'June 15',
    excerpt: 'Discover the benefits of natural ingredients in your skincare routine.',
    icon: Leaf,
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The Latest News At Minsah Beauty. Nourish your skin with toxin-free cosmetic products.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => {
              const Icon = post.icon;
              return (
              <article key={post.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition overflow-hidden">
                <div className="bg-gradient-to-br from-pink-100 to-purple-100 h-48 flex items-center justify-center">
                  <Icon className="w-24 h-24 text-pink-400" />
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-2">{post.date}</p>
                  <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <Link href={`/blog/${post.id}`} className="text-pink-600 font-semibold hover:underline inline-flex items-center gap-1">
                    Read more
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            )})}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

