'use client';

import { useState } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Shield,
  User,
  Mail,
  Calendar,
  Lock,
  Unlock,
} from 'lucide-react';
import { clsx } from 'clsx';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
  permissions: string[];
}

export default function UsersManagementPage() {
  const { hasPermission } = useAdminAuth();
  const [users, setUsers] = useState<AdminUser[]>([
    {
      id: '1',
      name: 'Admin',
      email: 'sahal',
      role: 'super_admin',
      status: 'active',
      lastLogin: new Date().toISOString(),
      createdAt: '2024-01-01',
      permissions: ['all'],
    },
    {
      id: '2',
      name: 'John Doe',
      email: 'john.doe@minsahbeauty.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-20',
      createdAt: '2024-01-05',
      permissions: ['products', 'orders', 'customers'],
    },
    {
      id: '3',
      name: 'Jane Smith',
      email: 'jane.smith@minsahbeauty.com',
      role: 'editor',
      status: 'active',
      lastLogin: '2024-01-19',
      createdAt: '2024-01-10',
      permissions: ['content', 'blog'],
    },
    {
      id: '4',
      name: 'Mike Wilson',
      email: 'mike.wilson@minsahbeauty.com',
      role: 'moderator',
      status: 'inactive',
      lastLogin: '2024-01-15',
      createdAt: '2024-01-12',
      permissions: ['reviews', 'comments'],
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  if (!hasPermission(PERMISSIONS.USERS_MANAGE)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to manage users.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDeleteUser = (userId: string) => {
    if (userId === '1') {
      alert('Cannot delete super admin user!');
      return;
    }
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleToggleStatus = (userId: string) => {
    if (userId === '1') {
      alert('Cannot modify super admin status!');
      return;
    }
    setUsers(users.map(u =>
      u.id === userId
        ? { ...u, status: u.status === 'active' ? 'inactive' as const : 'active' as const }
        : u
    ));
  };

  const getStatusColor = (status: AdminUser['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: AdminUser['role']) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'editor':
        return 'bg-green-100 text-green-800';
      case 'moderator':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage admin users and their permissions</p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
          <Plus className="w-5 h-5 mr-2" />
          Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{users.length}</p>
            </div>
            <User className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-600 mt-2">
                {users.filter(u => u.status === 'inactive').length}
              </p>
            </div>
            <Lock className="w-8 h-8 text-gray-500" />
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
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="moderator">Moderator</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getRoleColor(user.role)
                    )}>
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getStatusColor(user.status)
                    )}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                        disabled={user.id === '1'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={clsx(
                          'hover:opacity-80',
                          user.status === 'active' ? 'text-red-600' : 'text-green-600'
                        )}
                        title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                        disabled={user.id === '1'}
                      >
                        {user.status === 'active' ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Unlock className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                        disabled={user.id === '1'}
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Permissions Reference */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <h4 className="font-medium text-purple-900 mb-2">Super Admin</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>&bull; All permissions</li>
              <li>&bull; User management</li>
              <li>&bull; Settings control</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Admin</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>&bull; Products & Orders</li>
              <li>&bull; Customers</li>
              <li>&bull; Analytics</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-green-900 mb-2">Editor</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>&bull; Blog posts</li>
              <li>&bull; Content management</li>
              <li>&bull; Media library</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-yellow-900 mb-2">Moderator</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>&bull; Reviews moderation</li>
              <li>&bull; Comments</li>
              <li>&bull; User reports</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
