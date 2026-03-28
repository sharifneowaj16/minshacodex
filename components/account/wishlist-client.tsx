'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, X, Star, Search, Package } from 'lucide-react';
import { Heart as HeartSolid } from 'lucide-react';
import { formatPrice } from '@/utils/currency';

interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productImage: any;
  price: number;
  originalPrice: number | null;
  inStock: boolean;
  addedAt: Date | string;
  category: string;
  rating: number;
  reviewCount: number;
  discount?: number;
  restockDate?: Date | string;
}

interface WishlistClientProps {
  initialItems: WishlistItem[];
}

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

function ProductImage({ src, name }: { src: any; name: string }) {
  if (typeof src === 'string' && (src.startsWith('/') || src.startsWith('http'))) {
    return <img src={src} alt={name} className="w-full h-full object-cover" />;
  }

  if (src && typeof src === 'object') {
    return src;
  }

  return <Package className="w-10 h-10 text-purple-400" />;
}

export function WishlistClient({ initialItems }: WishlistClientProps) {
  const [wishlistItems, setWishlistItems] = useState(initialItems);
  const [filteredItems, setFilteredItems] = useState(initialItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const categories = ['all', ...Array.from(new Set(initialItems.map((item) => item.category)))];

  useEffect(() => {
    let filtered = [...wishlistItems];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    switch (sortBy) {
      case 'dateAdded':
        filtered.sort((a, b) => toDate(b.addedAt).getTime() - toDate(a.addedAt).getTime());
        break;
      case 'priceLow':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'priceHigh':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.productName.localeCompare(b.productName));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    setFilteredItems(filtered);
  }, [wishlistItems, searchTerm, categoryFilter, sortBy]);

  const handleRemoveItem = (itemId: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));
    setSelectedItems((prev) => prev.filter((id) => id !== itemId));
  };

  const handleRemoveSelected = () => {
    setWishlistItems((prev) => prev.filter((item) => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  };

  const handleMoveToCart = (productId: string) => {
    console.log('Moving item to cart:', productId);
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
      return;
    }

    setSelectedItems(filteredItems.map((item) => item.id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
              <p className="text-gray-600">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            {selectedItems.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">{selectedItems.length} selected</span>
                <button
                  onClick={handleRemoveSelected}
                  className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove Selected
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search wishlist items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="lg:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="dateAdded">Date Added</option>
                <option value="name">Name</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || categoryFilter !== 'all' ? 'No items found' : 'Your wishlist is empty'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || categoryFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start adding items to your wishlist to keep track of products you love'}
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.length > 1 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredItems.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Select all items</span>
                </label>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center overflow-hidden">
                      <ProductImage src={item.productImage} name={item.productName} />
                    </div>

                    <div className="absolute top-2 right-2 flex flex-col space-y-2">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                      <label className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            selectedItems.includes(item.id)
                              ? 'bg-purple-600 border-purple-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedItems.includes(item.id) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </label>
                    </div>

                    {item.discount && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        -{item.discount}%
                      </div>
                    )}

                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white rounded-lg p-4 text-center">
                          <p className="text-gray-900 font-medium mb-1">Out of Stock</p>
                          {item.restockDate && (
                            <p className="text-sm text-gray-600">
                              Expected: {toDate(item.restockDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="mb-2">
                      <span className="text-xs text-purple-600 font-medium uppercase tracking-wide">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{item.productName}</h3>

                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className={`w-4 h-4 ${
                              index < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">
                        {item.rating} ({item.reviewCount})
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-lg font-bold text-gray-900">{formatPrice(item.price)}</span>
                        {item.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            {formatPrice(item.originalPrice)}
                          </span>
                        )}
                      </div>
                      <button className="p-2 text-red-500 hover:bg-red-50 rounded-full transition">
                        {selectedItems.includes(item.id) ? (
                          <HeartSolid className="w-5 h-5 fill-current" />
                        ) : (
                          <Heart className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleMoveToCart(item.productId)}
                        disabled={!item.inStock}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                          item.inStock
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                      <Link
                        href={`/products/${item.productId}`}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
