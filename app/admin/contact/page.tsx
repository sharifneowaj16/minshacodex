'use client';

import { useState } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import { Search, Mail, Trash2, Eye } from 'lucide-react';

export default function ContactSubmissionsPage() {
  const { hasPermission } = useAdminAuth();

  if (!hasPermission(PERMISSIONS.CONTENT_MANAGE)) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">No permission</p></div>;
  }

  const submissions = [
    { id: '1', name: 'John Doe', email: 'john@example.com', subject: 'Product Inquiry', message: 'I have a question...', date: '2024-01-20', status: 'new' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', subject: 'Order Issue', message: 'My order...', date: '2024-01-19', status: 'replied' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Contact Submissions</h1>
        <p className="text-gray-600">View and respond to customer inquiries</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600">Total Submissions</p>
          <p className="text-2xl font-bold">{submissions.length}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600">New Messages</p>
          <p className="text-2xl font-bold text-blue-600">{submissions.filter(s => s.status === 'new').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {submissions.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{sub.name}</td>
                <td className="px-6 py-4 text-sm">{sub.email}</td>
                <td className="px-6 py-4 text-sm">{sub.subject}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{sub.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${sub.status === 'new' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600"><Eye className="w-4 h-4" /></button>
                    <button className="text-purple-600"><Mail className="w-4 h-4" /></button>
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
