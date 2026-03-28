import Link from 'next/link';
import Navbar from './components/Header';
import TopBar from './components/TopBar';
import Footer from './components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-pink-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-block bg-pink-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-pink-700 transition"
          >
            Go Back Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

