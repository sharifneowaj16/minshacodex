'use client';

import { useState } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';

export default function BannersPage() {
  const { hasPermission } = useAdminAuth();

  if (!hasPermission(PERMISSIONS.CONTENT_MANAGE)) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">No permission</p></div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Banners & Sliders</h1>
          <p className="text-gray-600">Manage homepage banners and promotional sliders</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <Plus className="w-5 h-5 mr-2" />
          Add Banner
        </button>
      </div>

      <div className="bg-white rounded-lg border p-12 text-center">
        <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Banners Yet</h3>
        <p className="text-gray-600 mb-6">Create your first homepage banner</p>
        <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          Add Banner
        </button>
      </div>
    </div>
  );
}
