'use client';

import { useState } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { clsx } from 'clsx';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  status: 'published' | 'draft';
  views: number;
}

export default function FAQManagementPage() {
  const { hasPermission } = useAdminAuth();
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: '1',
      question: 'What makes your products natural?',
      answer: 'All our products are made with 100% natural ingredients, free from harmful chemicals and toxins. We source our ingredients from trusted suppliers who share our commitment to quality and sustainability.',
      category: 'Products',
      order: 1,
      status: 'published',
      views: 234,
    },
    {
      id: '2',
      question: 'Do you offer international shipping?',
      answer: 'Yes, we ship worldwide. Shipping costs and delivery times vary by location. Please check our shipping page for more details.',
      category: 'Shipping',
      order: 2,
      status: 'published',
      views: 189,
    },
    {
      id: '3',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy on all unopened products. If you\'re not satisfied with your purchase, please contact our customer service team.',
      category: 'Returns',
      order: 3,
      status: 'published',
      views: 156,
    },
    {
      id: '4',
      question: 'Are your products tested on animals?',
      answer: 'No, we are a cruelty-free brand. None of our products are tested on animals, and we are committed to ethical practices.',
      category: 'Products',
      order: 4,
      status: 'published',
      views: 98,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  if (!hasPermission(PERMISSIONS.CONTENT_MANAGE)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to manage FAQs.</p>
      </div>
    );
  }

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || faq.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.order - b.order);

  const handleDeleteFaq = (faqId: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      setFaqs(faqs.filter(f => f.id !== faqId));
    }
  };

  const categories = Array.from(new Set(faqs.map(f => f.category)));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
          <p className="text-gray-600">Manage frequently asked questions</p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
          <Plus className="w-5 h-5 mr-2" />
          Add FAQ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total FAQs</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{faqs.length}</p>
            </div>
            <HelpCircle className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {faqs.filter(f => f.status === 'published').length}
              </p>
            </div>
            <HelpCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{categories.length}</p>
            </div>
            <HelpCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {faqs.reduce((sum, f) => sum + f.views, 0)}
              </p>
            </div>
            <HelpCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* FAQs List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="divide-y divide-gray-200">
          {filteredFaqs.map((faq) => (
            <div key={faq.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start space-x-3">
                      <HelpCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                          {faq.question}
                          {expandedFaq === faq.id ? (
                            <ChevronUp className="w-5 h-5 ml-2" />
                          ) : (
                            <ChevronDown className="w-5 h-5 ml-2" />
                          )}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {faq.category}
                          </span>
                          <span>{faq.views} views</span>
                          <span className={clsx(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                            faq.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          )}>
                            {faq.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {expandedFaq === faq.id && (
                    <div className="mt-4 ml-8 text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {faq.answer}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button className="text-blue-600 hover:text-blue-800" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No FAQs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
