'use client';

import { useCart, Address } from '@/contexts/CartContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Home as HomeIcon } from 'lucide-react';

export default function AddAddressPage() {
  const router = useRouter();
  const { addAddress } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    landmark: '',
    provinceRegion: 'Dhaka',
    city: '',
    zone: '',
    address: '',
    type: 'home' as 'home' | 'office',
    isDefault: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phoneNumber || !formData.address) {
      alert('Please fill in all required fields');
      return;
    }

    addAddress(formData);
    router.back();
  };

  return (
    <div className="min-h-screen bg-minsah-light pb-24">
      {/* Header */}
      <header className="bg-minsah-dark text-minsah-light sticky top-0 z-50 shadow-md">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/checkout/select-address" className="p-2 hover:bg-minsah-primary rounded-lg transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-semibold">Add Address</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-6">
        {/* Form Fields */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4 mb-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-minsah-dark mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="John Doe"
              required
              className="w-full px-4 py-3 border border-minsah-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-minsah-primary"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-minsah-dark mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+880 1234 567890"
              required
              className="w-full px-4 py-3 border border-minsah-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-minsah-primary"
            />
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-sm font-semibold text-minsah-dark mb-2">
              Landmark (Optional)
            </label>
            <input
              type="text"
              name="landmark"
              value={formData.landmark}
              onChange={handleInputChange}
              placeholder="Near City Center"
              className="w-full px-4 py-3 border border-minsah-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-minsah-primary"
            />
          </div>

          {/* Province/Region */}
          <div>
            <label className="block text-sm font-semibold text-minsah-dark mb-2">
              Province/Region *
            </label>
            <select
              name="provinceRegion"
              value={formData.provinceRegion}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-minsah-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-minsah-primary bg-white"
            >
              <option value="Dhaka">Dhaka</option>
              <option value="Chittagong">Chittagong</option>
              <option value="Sylhet">Sylhet</option>
              <option value="Rajshahi">Rajshahi</option>
              <option value="Khulna">Khulna</option>
              <option value="Barisal">Barisal</option>
              <option value="Rangpur">Rangpur</option>
              <option value="Mymensingh">Mymensingh</option>
            </select>
          </div>

          {/* City and Zone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-minsah-dark mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Dhaka"
                required
                className="w-full px-4 py-3 border border-minsah-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-minsah-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-minsah-dark mb-2">
                Zone *
              </label>
              <input
                type="text"
                name="zone"
                value={formData.zone}
                onChange={handleInputChange}
                placeholder="Gulshan"
                required
                className="w-full px-4 py-3 border border-minsah-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-minsah-primary"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-minsah-dark mb-2">
              Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="House#123, Street ABC"
              required
              className="w-full px-4 py-3 border border-minsah-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-minsah-primary"
            />
          </div>
        </div>

        {/* Address Type Selection */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'office' }))}
              className={`p-6 rounded-2xl border-2 transition-all ${
                formData.type === 'office'
                  ? 'border-minsah-primary bg-minsah-accent shadow-md'
                  : 'border-transparent bg-white'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  formData.type === 'office' ? 'bg-minsah-primary' : 'bg-minsah-accent'
                }`}>
                  <Building2 size={32} className={formData.type === 'office' ? 'text-white' : 'text-minsah-primary'} />
                </div>
                <span className={`font-semibold ${formData.type === 'office' ? 'text-minsah-primary' : 'text-minsah-dark'}`}>
                  OFFICE
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'home' }))}
              className={`p-6 rounded-2xl border-2 transition-all ${
                formData.type === 'home'
                  ? 'border-minsah-primary bg-minsah-accent shadow-md'
                  : 'border-transparent bg-white'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  formData.type === 'home' ? 'bg-minsah-primary' : 'bg-minsah-accent'
                }`}>
                  <HomeIcon size={32} className={formData.type === 'home' ? 'text-white' : 'text-minsah-primary'} />
                </div>
                <span className={`font-semibold ${formData.type === 'home' ? 'text-minsah-primary' : 'text-minsah-dark'}`}>
                  HOME
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href="/checkout/select-address"
            className="flex-1 py-4 rounded-xl font-bold text-center text-minsah-primary bg-white border-2 border-minsah-accent hover:border-minsah-primary transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="flex-1 py-4 rounded-xl font-bold bg-minsah-primary text-minsah-light hover:bg-minsah-dark transition shadow-lg"
          >
            SAVE
          </button>
        </div>
      </form>
    </div>
  );
}
