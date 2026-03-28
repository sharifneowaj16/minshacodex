'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  FileText,
  Sparkles,
} from 'lucide-react';
import { clsx } from 'clsx';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  status: 'published' | 'draft' | 'scheduled';
  publishedDate: string;
  views: number;
}

export default function BlogManagementPage() {
  const { hasPermission } = useAdminAuth();
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: '1',
      title: 'Perfumes, perfumed or eau de toilette?',
      slug: 'perfumes-perfumed-eau-de-toilette',
      excerpt: 'Nourish your skin with toxin-free cosmetic products. With the offers that you can\'t refuse.',
      content: 'Full content here...',
      author: 'Admin',
      category: 'Beauty Tips',
      tags: ['perfume', 'fragrance'],
      status: 'published',
      publishedDate: '2024-01-21',
      views: 1234,
    },
    {
      id: '2',
      title: 'Best multi-step skin care treatment',
      slug: 'best-multi-step-skin-care-treatment',
      excerpt: 'Discover the best multi-step skincare routine for glowing skin.',
      content: 'Full content here...',
      author: 'Admin',
      category: 'Skin Care',
      tags: ['skincare', 'routine'],
      status: 'published',
      publishedDate: '2024-01-20',
      views: 2156,
    },
    {
      id: '3',
      title: 'Natural ingredients for healthy skin',
      slug: 'natural-ingredients-healthy-skin',
      excerpt: 'Discover the benefits of natural ingredients in your skincare routine.',
      content: 'Full content here...',
      author: 'Admin',
      category: 'Skin Care',
      tags: ['natural', 'ingredients', 'organic'],
      status: 'draft',
      publishedDate: '2024-01-15',
      views: 567,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (!hasPermission(PERMISSIONS.CONTENT_MANAGE)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to manage blog posts.</p>
      </div>
    );
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeletePost = (postId: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      setPosts(posts.filter(p => p.id !== postId));
    }
  };

  const getStatusColor = (status: BlogPost['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600">Create and manage blog content</p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
          <Plus className="w-5 h-5 mr-2" />
          New Post
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{posts.length}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {posts.filter(p => p.status === 'published').length}
              </p>
            </div>
            <Sparkles className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-gray-600 mt-2">
                {posts.filter(p => p.status === 'draft').length}
              </p>
            </div>
            <Edit className="w-8 h-8 text-gray-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {posts.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
              </p>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
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
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      {/* Blog Posts Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                      <div className="text-xs text-gray-500">{post.excerpt.substring(0, 60)}...</div>
                      <div className="flex items-center space-x-1 mt-1">
                        {post.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{post.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <User className="w-4 h-4 mr-1 text-gray-400" />
                      {post.author}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getStatusColor(post.status)
                    )}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <Eye className="w-4 h-4 mr-1 text-gray-400" />
                      {post.views.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      {new Date(post.publishedDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="text-purple-600 hover:text-purple-800"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button className="text-blue-600 hover:text-blue-800" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No blog posts found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
