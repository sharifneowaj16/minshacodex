'use client';

import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Plus, Check, Building2, Home as HomeIcon } from 'lucide-react';

export default function SelectAddressPage() {
  const router = useRouter();
  const { addresses, selectedAddress, setSelectedAddress } = useCart();

  const handleSelectAddress = (address: typeof addresses[0]) => {
    setSelectedAddress(address);
    router.back();
  };

  return (
    <div className="min-h-screen bg-minsah-light pb-24">
      {/* Header */}
      <header className="bg-minsah-dark text-minsah-light sticky top-0 z-50 shadow-md">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/checkout" className="p-2 hover:bg-minsah-primary rounded-lg transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-semibold">Select Address</h1>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Map Placeholder */}
      <div className="relative h-64 bg-gradient-to-br from-minsah-accent to-minsah-secondary">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <MapPin size={64} className="text-minsah-primary mb-4" />
          <p className="text-minsah-dark font-semibold">Map Integration</p>
          <p className="text-sm text-minsah-secondary">Google Maps or similar service</p>
        </div>

        {/* Search Location */}
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-white rounded-xl shadow-lg p-3 flex items-center gap-2">
            <MapPin size={20} className="text-minsah-primary" />
            <input
              type="text"
              placeholder="Search Location"
              className="flex-1 outline-none text-sm text-minsah-dark placeholder:text-minsah-secondary"
            />
          </div>
        </div>

        {/* Use Current Location Button */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <button className="bg-white px-6 py-2 rounded-full shadow-lg font-semibold text-sm text-minsah-primary hover:bg-minsah-accent transition">
            Use Current Location
          </button>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Saved Addresses */}
        <div className="space-y-3 mb-6">
          {addresses.map((address) => (
            <button
              key={address.id}
              onClick={() => handleSelectAddress(address)}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                selectedAddress?.id === address.id
                  ? 'border-minsah-primary bg-minsah-accent shadow-md'
                  : 'border-transparent bg-white hover:border-minsah-secondary'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Radio Button */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  selectedAddress?.id === address.id
                    ? 'border-minsah-primary bg-minsah-primary'
                    : 'border-minsah-secondary'
                }`}>
                  {selectedAddress?.id === address.id && (
                    <Check size={16} className="text-white" />
                  )}
                </div>

                {/* Address Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-minsah-primary rounded-lg flex items-center justify-center">
                      {address.type === 'home' ? (
                        <HomeIcon size={16} className="text-white" />
                      ) : (
                        <Building2 size={16} className="text-white" />
                      )}
                    </div>
                    <span className="font-semibold text-minsah-dark capitalize">
                      {address.type}
                    </span>
                    {address.isDefault && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-minsah-dark mb-1">
                    {address.address}
                  </p>
                  <p className="text-xs text-minsah-secondary mb-1">
                    {address.city}, {address.zone}
                  </p>
                  <p className="text-xs text-minsah-secondary">
                    {address.fullName} • {address.phoneNumber}
                  </p>
                  {address.landmark && (
                    <p className="text-xs text-minsah-secondary mt-1">
                      Landmark: {address.landmark}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Add New Address Button */}
        <Link
          href="/checkout/add-address"
          className="block w-full bg-white border-2 border-dashed border-minsah-secondary p-4 rounded-2xl text-center hover:border-minsah-primary hover:bg-minsah-accent transition"
        >
          <div className="flex items-center justify-center gap-2 text-minsah-primary font-semibold">
            <Plus size={20} />
            <span>Add New Address</span>
          </div>
        </Link>

        {/* Confirm Button */}
        {selectedAddress && (
          <button
            onClick={() => router.back()}
            className="mt-6 w-full bg-minsah-primary text-minsah-light py-4 rounded-xl font-bold shadow-lg hover:bg-minsah-dark transition"
          >
            Confirm Address
          </button>
        )}
      </div>
    </div>
  );
}
