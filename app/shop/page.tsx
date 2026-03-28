import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Loader2 } from 'lucide-react';
import { parseSearchParams, generatePageTitle, generateMetaDescription } from '@/lib/shopUtils';
import ShopGrid from '@/app/components/shop/ShopGrid';
import ShopSearchBar from '@/app/components/shop/ShopSearchBar';

// Generate dynamic metadata
export async function generateMetadata({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }): Promise<Metadata> {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.set(key, Array.isArray(value) ? value.join(',') : value);
  });

  const filters = parseSearchParams(params);
  const title = generatePageTitle(filters);
  const description = generateMetaDescription(filters, 0);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

// Loading skeleton
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
          <div className="w-full aspect-square bg-minsah-accent/30 rounded-lg mb-3" />
          <div className="h-4 bg-minsah-accent/30 rounded w-3/4 mb-2" />
          <div className="h-4 bg-minsah-accent/30 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

// Main Shop Page Component
export default function ShopPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  return (
    <div className="min-h-screen bg-minsah-light pb-20">
      {/* Header */}
      <div className="bg-white border-b border-minsah-accent sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-minsah-secondary mb-3">
            <Link href="/" className="hover:text-minsah-primary transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-minsah-dark font-medium">Shop</span>
          </div>

          {/* Page Title */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-minsah-dark">
                Shop Beauty Products
              </h1>
              <p className="text-sm text-minsah-secondary mt-1">
                Discover premium beauty products from top brands
              </p>
            </div>
          </div>

          {/* Search bar */}
          <Suspense fallback={null}>
            <ShopSearchBar />
          </Suspense>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 size={48} className="text-minsah-primary animate-spin mb-4" />
              <p className="text-minsah-secondary">Loading products...</p>
            </div>
          }
        >
          <ShopGrid />
        </Suspense>
      </div>

      {/* Free Shipping Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 text-center text-sm font-medium shadow-lg md:hidden z-30">
        &#128666; Free Shipping on orders above ৳1,000
      </div>
    </div>
  );
}
