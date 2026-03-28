'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, Save, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { defaultCategories } from '@/lib/homeData';
import { HomeSectionCategory } from '@/types/admin';

export default function CategoriesManagementPage() {
  const [categories, setCategories] = useState<HomeSectionCategory[]>(defaultCategories);
  const [editingCategory, setEditingCategory] = useState<HomeSectionCategory | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<HomeSectionCategory>>({
    name: '',
    icon: 'ICON',
    color: 'bg-pink-100',
    isVisible: true,
  });

  // Load from database on mount
  useEffect(() => {
    fetch('/api/admin/site-config?key=homeCategories')
      .then(res => res.json())
      .then(data => {
        if (data.value) {
          setCategories(data.value);
        }
      })
      .catch(() => {
        // keep default categories on error
      });
  }, []);

  // Save to database via API
  const saveCategories = async () => {
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'homeCategories', value: categories }),
      });
      if (!res.ok) throw new Error('Save failed');
      alert('Categories saved successfully!');
    } catch {
      alert('Failed to save changes. Please try again.');
    }
  };

  // Add new category
  const addCategory = () => {
    if (!newCategory.name) {
      alert('Please enter a category name');
      return;
    }

    const category: HomeSectionCategory = {
      id: `cat-${Date.now()}`,
      name: newCategory.name!,
      slug: newCategory.name!.toLowerCase().replace(/\s+/g, '-'),
      icon: newCategory.icon!,
      color: newCategory.color!,
      isVisible: newCategory.isVisible!,
      order: categories.length + 1,
      productCount: 0,
    };

    setCategories([...categories, category]);
    setNewCategory({ name: '', icon: 'ICON', color: 'bg-pink-100', isVisible: true });
    setShowAddForm(false);
  };

  // Toggle visibility
  const toggleVisibility = (id: string) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, isVisible: !cat.isVisible } : cat
    ));
  };

  // Delete category
  const deleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  // Move category
  const moveCategory = (id: string, direction: 'up' | 'down') => {
    const index = categories.findIndex(cat => cat.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === categories.length - 1)
    ) {
      return;
    }

    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];

    newCategories.forEach((cat, i) => {
      cat.order = i + 1;
    });

    setCategories(newCategories);
  };

  // Update category
  const updateCategory = (id: string, updates: Partial<HomeSectionCategory>) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, ...updates } : cat
    ));
  };

  const colorOptions = [
    'bg-pink-100',
    'bg-blue-100',
    'bg-purple-100',
    'bg-yellow-100',
    'bg-green-100',
    'bg-red-100',
    'bg-orange-100',
    'bg-teal-100',
  ];

  const iconOptions = ['MAKEUP', 'SKIN', 'HAIR', 'FRAG', 'TOOL', 'FACE', 'EYE', 'LIP', 'NAIL', 'BODY', 'CARE', 'GIFT'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/home-sections" className="p-2 hover:bg-white rounded-lg transition">
            <ArrowLeft size={24} className="text-minsah-dark" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-minsah-dark">Manage Categories</h1>
            <p className="text-minsah-secondary mt-1">Add, edit, or remove product categories</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Plus size={20} />
            Add Category
          </button>
          <button
            onClick={saveCategories}
            className="flex items-center gap-2 px-4 py-2 bg-minsah-primary text-white rounded-lg hover:bg-minsah-dark transition"
          >
            <Save size={20} />
            Save Changes
          </button>
        </div>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-2 border-green-500">
          <h3 className="text-xl font-bold text-minsah-dark mb-4">Add New Category</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-minsah-secondary mb-2">Name</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full px-3 py-2 border border-minsah-accent rounded-lg focus:outline-none focus:border-minsah-primary"
                placeholder="Category name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-minsah-secondary mb-2">Icon</label>
              <select
                value={newCategory.icon}
                onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                className="w-full px-3 py-2 border border-minsah-accent rounded-lg focus:outline-none focus:border-minsah-primary"
              >
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-minsah-secondary mb-2">Color</label>
              <select
                value={newCategory.color}
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                className="w-full px-3 py-2 border border-minsah-accent rounded-lg focus:outline-none focus:border-minsah-primary"
              >
                {colorOptions.map(color => (
                  <option key={color} value={color}>{color.replace('bg-', '').replace('-100', '')}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={addCategory}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-minsah-dark text-white px-6 py-4 flex items-center gap-4">
          <span className="w-16 text-center font-semibold">Icon</span>
          <span className="flex-1 font-semibold">Name</span>
          <span className="w-32 text-center font-semibold">Color</span>
          <span className="w-24 text-center font-semibold">Products</span>
          <span className="w-24 text-center font-semibold">Visibility</span>
          <span className="w-48 text-center font-semibold">Actions</span>
        </div>

        <div className="divide-y divide-minsah-accent">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={`px-6 py-4 flex items-center gap-4 ${
                !category.isVisible ? 'bg-gray-50 opacity-60' : 'hover:bg-minsah-accent/20'
              }`}
            >
              {/* Icon */}
              <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center text-xs font-bold`}>
                {category.icon}
              </div>

              {/* Name */}
              <div className="flex-1">
                <input
                  type="text"
                  value={category.name}
                  onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                  className="font-semibold text-lg text-minsah-dark bg-transparent border-b border-transparent hover:border-minsah-primary focus:border-minsah-primary focus:outline-none transition w-full"
                />
                <div className="text-xs text-minsah-secondary mt-1">
                  Slug: {category.slug} | Order: #{category.order}
                </div>
              </div>

              {/* Color */}
              <div className="w-32">
                <select
                  value={category.color}
                  onChange={(e) => updateCategory(category.id, { color: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-minsah-accent rounded focus:outline-none focus:border-minsah-primary"
                >
                  {colorOptions.map(color => (
                    <option key={color} value={color}>{color.replace('bg-', '')}</option>
                  ))}
                </select>
              </div>

              {/* Product Count */}
              <div className="w-24 text-center text-minsah-secondary">
                {category.productCount || 0}
              </div>

              {/* Visibility */}
              <div className="w-24 flex justify-center">
                <button
                  onClick={() => toggleVisibility(category.id)}
                  className={`p-2 rounded-lg transition ${
                    category.isVisible
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {category.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              {/* Actions */}
              <div className="w-48 flex items-center justify-center gap-2">
                <button
                  onClick={() => moveCategory(category.id, 'up')}
                  disabled={index === 0}
                  className="p-2 rounded hover:bg-minsah-accent disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronUp size={18} />
                </button>
                <button
                  onClick={() => moveCategory(category.id, 'down')}
                  disabled={index === categories.length - 1}
                  className="p-2 rounded hover:bg-minsah-accent disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronDown size={18} />
                </button>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="p-2 rounded hover:bg-red-100 text-red-600 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
