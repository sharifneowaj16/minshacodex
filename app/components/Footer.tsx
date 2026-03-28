import Link from 'next/link';
import { Mail, Phone, MapPin, CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-pink-400 transition">About us</Link></li>
              <li><Link href="/categories" className="hover:text-pink-400 transition">Categories</Link></li>
              <li><Link href="/shop" className="hover:text-pink-400 transition">Shop</Link></li>
              <li><Link href="/blog" className="hover:text-pink-400 transition">Blog</Link></li>
              <li><Link href="/faq" className="hover:text-pink-400 transition">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-pink-400 transition">Contacts</Link></li>
            </ul>
          </div>

          {/* Categories Section */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><Link href="/categories/makeup" className="hover:text-pink-400 transition">Make up</Link></li>
              <li><Link href="/categories/spa" className="hover:text-pink-400 transition">SPA</Link></li>
              <li><Link href="/categories/perfume" className="hover:text-pink-400 transition">Perfume</Link></li>
              <li><Link href="/categories/nails" className="hover:text-pink-400 transition">Nails</Link></li>
              <li><Link href="/categories/skincare" className="hover:text-pink-400 transition">Skin care</Link></li>
              <li><Link href="/categories/haircare" className="hover:text-pink-400 transition">Hair care</Link></li>
            </ul>
          </div>

          {/* Useful Links Section */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Useful links</h3>
            <ul className="space-y-2">
              <li><Link href="/careers" className="hover:text-pink-400 transition">Careers</Link></li>
              <li><Link href="/privacy" className="hover:text-pink-400 transition">Privacy policy</Link></li>
              <li><Link href="/terms" className="hover:text-pink-400 transition">Terms of use</Link></li>
              <li><Link href="/support" className="hover:text-pink-400 transition">Support</Link></li>
              <li><Link href="/shipping" className="hover:text-pink-400 transition">Shipping details</Link></li>
              <li><Link href="/information" className="hover:text-pink-400 transition">Information</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pink-400" />
                27 Division St, New York, NY 10002, USA
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-pink-400" />
                <a href="tel:+13459971345" className="hover:text-pink-400 transition">+1 345 99 71 345</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-pink-400" />
                <a href="tel:+13457464975" className="hover:text-pink-400 transition">+1 345 74 64 975</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-pink-400" />
                <a href="mailto:info@minsahbeauty.com" className="hover:text-pink-400 transition">info@minsahbeauty.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="max-w-md">
            <h3 className="text-white text-lg font-semibold mb-2">Stay in touch</h3>
            <p className="text-sm mb-4">Nourish your skin with toxin-free cosmetic products.</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Payment Methods & Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-pink-400" />
              Payment methods:
            </p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-gray-800 px-3 py-1 rounded">Visa</span>
              <span className="text-xs bg-gray-800 px-3 py-1 rounded">Mastercard</span>
              <span className="text-xs bg-gray-800 px-3 py-1 rounded">PayPal</span>
            </div>
          </div>
          <p className="text-sm">© All rights reserved. Minsah Beauty 2025</p>
        </div>
      </div>
    </footer>
  );
}

