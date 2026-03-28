'use client';

import { useState } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';

export default function PagesManagementPage() {
  const { hasPermission } = useAdminAuth();

  if (!hasPermission(PERMISSIONS.CONTENT_MANAGE)) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">No permission</p></div>;
  }

  const pages = [
    { id: '1', title: 'About Us', slug: '/about', status: 'published', lastModified: '2024-01-15' },
    { id: '2', title: 'Contact', slug: '/contact', status: 'published', lastModified: '2024-01-15' },
    { id: '3', title: 'FAQ', slug: '/faq', status: 'published', lastModified: '2024-01-15' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="text-gray-600">Manage static pages</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <Plus className="w-5 h-5 mr-2" />
          New Page
        </button>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Modified</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{page.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{page.slug}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">{page.status}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{page.lastModified}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600"><Edit className="w-4 h-4" /></button>
                    <button className="text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
