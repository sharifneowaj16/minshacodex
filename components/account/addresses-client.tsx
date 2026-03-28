'use client';

import { useState } from 'react';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Star,
  Home,
  CreditCard
} from 'lucide-react';
import { Star as StarSolidIcon } from 'lucide-react';
import type { UserAddress } from '@/types/user';

interface AddressesClientProps {
  initialAddresses: UserAddress[];
}

const BLANK_FORM: Partial<UserAddress> = {
  type: 'shipping',
  isDefault: false,
  firstName: '',
  lastName: '',
  company: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Bangladesh',
  phone: '',
};

// Map DB record to UserAddress format
function dbToUserAddress(db: Record<string, unknown>): UserAddress {
  return {
    id: db.id as string,
    type: (db.type as string).toLowerCase() as 'shipping' | 'billing',
    isDefault: db.isDefault as boolean,
    firstName: (db.firstName as string) ?? '',
    lastName: (db.lastName as string) ?? '',
    company: (db.company as string) ?? '',
    addressLine1: (db.street1 as string) ?? '',
    addressLine2: (db.street2 as string) ?? '',
    city: (db.city as string) ?? '',
    state: (db.state as string) ?? '',
    postalCode: (db.postalCode as string) ?? '',
    country: (db.country as string) ?? 'Bangladesh',
    phone: (db.phone as string) ?? '',
  };
}

async function refreshAddresses(): Promise<UserAddress[]> {
  const res = await fetch('/api/addresses', { credentials: 'include' });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.addresses ?? []).map(dbToUserAddress);
}

export function AddressesClient({ initialAddresses }: AddressesClientProps) {
  const [addresses, setAddresses] = useState<UserAddress[]>(initialAddresses);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<UserAddress>>(BLANK_FORM);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const body = {
      type: (formData.type ?? 'shipping').toUpperCase(),
      isDefault: formData.isDefault ?? false,
      firstName: formData.firstName,
      lastName: formData.lastName,
      company: formData.company,
      street1: formData.addressLine1,
      street2: formData.addressLine2,
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode ?? '',
      country: formData.country ?? 'Bangladesh',
      phone: formData.phone,
    };

    try {
      if (editingAddress) {
        await fetch(`/api/addresses/${editingAddress.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        });
      }
      const updated = await refreshAddresses();
      setAddresses(updated);
    } catch { /* ignore */ }

    setFormData(BLANK_FORM);
    setShowAddForm(false);
    setEditingAddress(null);
    setSaving(false);
  };

  const handleEdit = (address: UserAddress) => {
    setEditingAddress(address);
    setFormData(address);
    setShowAddForm(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    setAddresses(prev => prev.filter(addr => addr.id !== addressId));
    try {
      await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch {
      const updated = await refreshAddresses();
      setAddresses(updated);
    }
  };

  const handleSetDefault = async (addressId: string, type: 'shipping' | 'billing') => {
    // Optimistic update
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId && addr.type === type,
    })));
    try {
      await fetch(`/api/addresses/${addressId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isDefault: true, type: type.toUpperCase() }),
      });
    } catch {
      const updated = await refreshAddresses();
      setAddresses(updated);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingAddress(null);
    setFormData({
      type: 'shipping',
      isDefault: false,
      firstName: '',
      lastName: '',
      company: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      phone: ''
    });
  };

  const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Germany',
    'France',
    'Italy',
    'Spain',
    'Japan',
    'China'
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Addresses</h1>
              <p className="text-gray-600">Manage your shipping and billing addresses</p>
            </div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Address
              </button>
            )}
          </div>
        </div>

        {/* Add/Edit Address Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Address Type */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="shipping"
                    checked={formData.type === 'shipping'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-gray-700">Shipping Address</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="billing"
                    checked={formData.type === 'billing'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-gray-700">Billing Address</span>
                </label>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Company (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company (Optional)
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Address Lines */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* City, State, Postal Code */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Country and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Default Address */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isDefault"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="isDefault" className="ml-2 text-gray-700">
                  Set as default {formData.type} address
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses List */}
        <div className="space-y-6">
          {/* Shipping Addresses */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2" />
              Shipping Addresses
            </h2>
            <div className="space-y-4">
              {addresses.filter(addr => addr.type === 'shipping').map(address => (
                <div key={address.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                        <h3 className="font-medium text-gray-900">
                          {address.firstName} {address.lastName}
                        </h3>
                        {address.isDefault && (
                          <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <StarSolidIcon className="w-3 h-3 mr-1" />
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-gray-600 space-y-1">
                        {address.company && <p>{address.company}</p>}
                        <p>{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        <p>
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p>{address.country}</p>
                        <p>{address.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefault(address.id, 'shipping')}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="Set as default"
                        >
                          <Star className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(address)}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Edit address"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete address"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Addresses */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Billing Addresses
            </h2>
            <div className="space-y-4">
              {addresses.filter(addr => addr.type === 'billing').map(address => (
                <div key={address.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <CreditCard className="w-5 h-5 text-gray-400 mr-2" />
                        <h3 className="font-medium text-gray-900">
                          {address.firstName} {address.lastName}
                        </h3>
                        {address.isDefault && (
                          <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <StarSolidIcon className="w-3 h-3 mr-1" />
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-gray-600 space-y-1">
                        {address.company && <p>{address.company}</p>}
                        <p>{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        <p>
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p>{address.country}</p>
                        <p>{address.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefault(address.id, 'billing')}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="Set as default"
                        >
                          <Star className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(address)}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Edit address"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete address"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
