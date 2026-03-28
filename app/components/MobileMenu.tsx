"use client";
import Link from 'next/link';
import { Fragment, useState } from 'react';
import { categories } from '@/data/categories';
import { Menu, X, ChevronDown, Heart, ShoppingCart } from 'lucide-react';

export default function MobileMenu({ itemCount }: { itemCount: number }) {
  const [open, setOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const toggleCategory = (categoryName: string) => {
    setOpenCategory(openCategory === categoryName ? null : categoryName);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-black transition-colors duration-300"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed inset-y-0 right-0 w-screen max-w-xs bg-white shadow-xl z-50 overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-5 pb-2 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-pink-600">Minsah Beauty</h2>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="mt-5 space-y-2 px-2 flex-1">
                <Link
                  href="/"
                  className="block px-3 py-2 text-sm font-medium text-gray-900 hover:bg-pink-50 hover:text-pink-600 rounded-md"
                  onClick={() => setOpen(false)}
                >
                  Home
                </Link>

                {/* Categories */}
                {categories.map((category) => (
                  <div key={category.name}>
                    <button
                      onClick={() => toggleCategory(category.name)}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-pink-50"
                    >
                      <Link
                        href={category.href}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen(false);
                        }}
                        className="flex-1 text-left"
                      >
                        {category.name}
                      </Link>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          openCategory === category.name ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openCategory === category.name && (
                      <div className="mt-1 space-y-1 pl-6">
                        {category.subcategories.map((sub) => (
                          <div key={sub.name}>
                            <Link
                              href={`${category.href}&subcategory=${sub.name.toLowerCase()}`}
                              className="block px-3 py-1 text-sm text-gray-600 hover:text-pink-600"
                              onClick={() => setOpen(false)}
                            >
                              {sub.name}
                            </Link>
                            {sub.items.map((item) => (
                              <Link
                                key={item}
                                href={`${category.href}&subcategory=${item.toLowerCase().replace(/ /g, '-')}`}
                                className="block pl-6 py-1 text-xs text-gray-500 hover:text-pink-600"
                                onClick={() => setOpen(false)}
                              >
                                {item}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Other Links */}
                <Link
                  href="/login"
                  className="block px-3 py-2 text-sm font-medium text-gray-900 hover:bg-pink-50 hover:text-pink-600 rounded-md"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 text-sm font-medium text-gray-900 hover:bg-pink-50 hover:text-pink-600 rounded-md"
                  onClick={() => setOpen(false)}
                >
                  Register
                </Link>
                <Link
                  href="/wishlist"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:bg-pink-50 hover:text-pink-600 rounded-md"
                  onClick={() => setOpen(false)}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Wishlist
                </Link>
                <Link
                  href="/cart"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:bg-pink-50 hover:text-pink-600 rounded-md"
                  onClick={() => setOpen(false)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart ({itemCount})
                </Link>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}

