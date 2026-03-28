'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Check } from 'lucide-react';
import { SortOption } from '@/types/product';
import { buildSearchParams, parseSearchParams } from '@/lib/shopUtils';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'best-selling', label: 'Best Selling' },
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'price-high-low', label: 'Price: High to Low' },
  { value: 'highest-rated', label: 'Highest Rated' },
  { value: 'biggest-discount', label: 'Biggest Discount' },
  { value: 'a-z', label: 'Name: A to Z' },
  { value: 'z-a', label: 'Name: Z to A' },
];

export default function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = parseSearchParams(searchParams);
  const [isOpen, setIsOpen] = useState(false);

  const currentSort = filters.sort || 'featured';
  const currentLabel = sortOptions.find(opt => opt.value === currentSort)?.label || 'Featured';

  const handleSortChange = (sortValue: SortOption) => {
    const newFilters = { ...filters, sort: sortValue };
    delete newFilters.page; // Reset to page 1 when sorting changes

    const queryString = buildSearchParams(newFilters);
    router.push(`/shop${queryString ? `?${queryString}` : ''}`, { scroll: false });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Desktop Dropdown */}
      <div className="hidden md:block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-minsah-accent rounded-lg hover:border-minsah-primary transition-colors text-sm font-medium text-minsah-dark"
        >
          <span>Sort by: {currentLabel}</span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-minsah-accent z-50 py-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-minsah-accent transition-colors flex items-center justify-between ${
                    currentSort === option.value
                      ? 'text-minsah-primary font-semibold bg-minsah-accent/50'
                      : 'text-minsah-dark'
                  }`}
                >
                  <span>{option.label}</span>
                  {currentSort === option.value && <Check size={16} />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-minsah-accent rounded-lg text-sm font-medium text-minsah-dark w-full justify-between"
        >
          <span>Sort: {currentLabel}</span>
          <ChevronDown size={16} />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
              onClick={() => setIsOpen(false)}
            />

            {/* Bottom Sheet */}
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 animate-slide-up shadow-2xl">
              <div className="px-4 py-3 border-b border-minsah-accent flex items-center justify-between">
                <h3 className="font-semibold text-minsah-dark">Sort By</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-minsah-secondary hover:text-minsah-dark text-2xl leading-none"
                >
                  &times;
                </button>
              </div>

              <div className="py-2 max-h-[60vh] overflow-y-auto">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full px-6 py-3 text-left flex items-center justify-between transition-colors ${
                      currentSort === option.value
                        ? 'bg-minsah-accent text-minsah-primary font-semibold'
                        : 'text-minsah-dark hover:bg-minsah-accent/50'
                    }`}
                  >
                    <span>{option.label}</span>
                    {currentSort === option.value && (
                      <div className="w-5 h-5 bg-minsah-primary rounded-full flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
