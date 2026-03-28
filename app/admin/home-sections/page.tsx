'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Eye, EyeOff, Edit, Trash2, Plus, GripVertical, Save,
  ChevronDown, ChevronUp, Settings, Layout, Image as ImageIcon
} from 'lucide-react';
import { defaultHomeSections } from '@/lib/homeData';
import { HomeSection, SectionType } from '@/types/admin';

export default function HomeSectionsPage() {
  const [sections, setSections] = useState<HomeSection[]>(defaultHomeSections);
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null);
  const [showSettings, setShowSettings] = useState<string | null>(null);

  // Toggle section visibility
  const toggleVisibility = (id: string) => {
    setSections(sections.map(section =>
      section.id === id ? { ...section, isVisible: !section.isVisible } : section
    ));
  };

  // Move section up/down
  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(s => s.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return;
    }

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];

    // Update order numbers
    newSections.forEach((section, i) => {
      section.order = i + 1;
    });

    setSections(newSections);
  };

  // Delete section
  const deleteSection = (id: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      setSections(sections.filter(s => s.id !== id));
    }
  };

  // Update section settings
  const updateSectionSettings = (id: string, settings: Partial<HomeSection['settings']>) => {
    setSections(sections.map(section =>
      section.id === id
        ? { ...section, settings: { ...section.settings, ...settings } }
        : section
    ));
  };

  // Update section title
  const updateSectionTitle = (id: string, title: string) => {
    setSections(sections.map(section =>
      section.id === id ? { ...section, title } : section
    ));
  };

  // Save changes to database via API
  const saveChanges = async () => {
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'homeSections', value: sections }),
      });
      if (!res.ok) throw new Error('Save failed');
      alert('Changes saved successfully!');
    } catch {
      alert('Failed to save changes. Please try again.');
    }
  };

  // Load from database on mount
  useEffect(() => {
    fetch('/api/admin/site-config?key=homeSections')
      .then(res => res.json())
      .then(data => {
        if (data.value) {
          setSections(data.value);
        }
      })
      .catch(() => {
        // keep default sections on error
      });
  }, []);

  const getSectionIcon = (type: SectionType) => {
    const icons: Record<SectionType, string> = {
      'categories': 'CAT',
      'promotion': 'PROMO',
      'combos': 'COMBO',
      'flash-sale': 'FLASH',
      'new-arrivals': 'NEW',
      'for-you': 'YOU',
      'recommendations': 'REC',
      'favourites': 'FAV',
      'brands': 'BRAND',
    };
    return icons[type];
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-minsah-dark">Home Page Sections</h1>
            <p className="text-minsah-secondary mt-1">Manage all sections displayed on the homepage</p>
          </div>
          <button
            onClick={saveChanges}
            className="flex items-center gap-2 px-4 py-2 bg-minsah-primary text-white rounded-lg hover:bg-minsah-dark transition"
          >
            <Save size={20} />
            Save Changes
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg border border-minsah-accent">
            <div className="text-2xl font-bold text-minsah-primary">{sections.length}</div>
            <div className="text-sm text-minsah-secondary">Total Sections</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-minsah-accent">
            <div className="text-2xl font-bold text-green-600">{sections.filter(s => s.isVisible).length}</div>
            <div className="text-sm text-minsah-secondary">Visible</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-minsah-accent">
            <div className="text-2xl font-bold text-gray-600">{sections.filter(s => !s.isVisible).length}</div>
            <div className="text-sm text-minsah-secondary">Hidden</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-minsah-accent">
            <div className="text-2xl font-bold text-blue-600">
              {sections.reduce((sum, s) => sum + (s.settings.itemsToShow || 0), 0)}
            </div>
            <div className="text-sm text-minsah-secondary">Total Items</div>
          </div>
        </div>
      </div>

      {/* Management Links */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <Link
          href="/admin/home-sections/categories"
          className="bg-white p-4 rounded-lg border-2 border-minsah-accent hover:border-minsah-primary transition text-center"
        >
          <div className="text-sm font-bold mb-2 text-minsah-primary">CAT</div>
          <div className="font-semibold text-minsah-dark text-sm">Categories</div>
        </Link>
        <Link
          href="/admin/home-sections/products"
          className="bg-white p-4 rounded-lg border-2 border-minsah-accent hover:border-minsah-primary transition text-center"
        >
          <div className="text-sm font-bold mb-2 text-minsah-primary">PROD</div>
          <div className="font-semibold text-minsah-dark text-sm">Products</div>
        </Link>
        <Link
          href="/admin/home-sections/combos"
          className="bg-white p-4 rounded-lg border-2 border-minsah-accent hover:border-minsah-primary transition text-center"
        >
          <div className="text-sm font-bold mb-2 text-minsah-primary">COMBO</div>
          <div className="font-semibold text-minsah-dark text-sm">Combos</div>
        </Link>
        <Link
          href="/admin/home-sections/brands"
          className="bg-white p-4 rounded-lg border-2 border-minsah-accent hover:border-minsah-primary transition text-center"
        >
          <div className="text-sm font-bold mb-2 text-minsah-primary">BRAND</div>
          <div className="font-semibold text-minsah-dark text-sm">Brands</div>
        </Link>
        <Link
          href="/admin/home-sections/slides"
          className="bg-white p-4 rounded-lg border-2 border-minsah-accent hover:border-minsah-primary transition text-center"
        >
          <div className="text-sm font-bold mb-2 text-minsah-primary">SLIDE</div>
          <div className="font-semibold text-minsah-dark text-sm">Slides</div>
        </Link>
      </div>

      {/* Sections List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-minsah-dark text-white px-6 py-4 flex items-center gap-4">
          <GripVertical size={20} />
          <span className="flex-1 font-semibold">Section</span>
          <span className="w-24 text-center font-semibold">Visibility</span>
          <span className="w-32 text-center font-semibold">Layout</span>
          <span className="w-24 text-center font-semibold">Items</span>
          <span className="w-48 text-center font-semibold">Actions</span>
        </div>

        <div className="divide-y divide-minsah-accent">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={`px-6 py-4 flex items-center gap-4 transition ${
                !section.isVisible ? 'bg-gray-50 opacity-60' : 'hover:bg-minsah-accent/20'
              }`}
            >
              {/* Drag Handle & Icon */}
              <div className="flex items-center gap-3">
                <GripVertical size={20} className="text-minsah-secondary cursor-move" />
                <span className="text-xs font-bold px-2 py-1 bg-minsah-accent rounded text-minsah-primary">{getSectionIcon(section.type)}</span>
              </div>

              {/* Section Info */}
              <div className="flex-1">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                  className="font-semibold text-minsah-dark bg-transparent border-b border-transparent hover:border-minsah-primary focus:border-minsah-primary focus:outline-none transition w-full"
                />
                <div className="text-xs text-minsah-secondary mt-1">
                  Type: {section.type} | Order: #{section.order}
                </div>
              </div>

              {/* Visibility Toggle */}
              <div className="w-24 flex justify-center">
                <button
                  onClick={() => toggleVisibility(section.id)}
                  className={`p-2 rounded-lg transition ${
                    section.isVisible
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {section.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              {/* Layout */}
              <div className="w-32 text-center">
                <select
                  value={section.settings.layout}
                  onChange={(e) => updateSectionSettings(section.id, { layout: e.target.value as any })}
                  className="px-2 py-1 text-sm border border-minsah-accent rounded focus:outline-none focus:border-minsah-primary"
                >
                  <option value="grid-2">Grid 2</option>
                  <option value="grid-3">Grid 3</option>
                  <option value="grid-4">Grid 4</option>
                  <option value="horizontal-scroll">Scroll</option>
                </select>
              </div>

              {/* Items Count */}
              <div className="w-24 text-center">
                <input
                  type="number"
                  value={section.settings.itemsToShow}
                  onChange={(e) => updateSectionSettings(section.id, { itemsToShow: parseInt(e.target.value) })}
                  className="w-16 px-2 py-1 text-center border border-minsah-accent rounded focus:outline-none focus:border-minsah-primary"
                  min="1"
                  max="20"
                />
              </div>

              {/* Actions */}
              <div className="w-48 flex items-center justify-center gap-2">
                <button
                  onClick={() => moveSection(section.id, 'up')}
                  disabled={index === 0}
                  className="p-2 rounded hover:bg-minsah-accent disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronUp size={18} />
                </button>
                <button
                  onClick={() => moveSection(section.id, 'down')}
                  disabled={index === sections.length - 1}
                  className="p-2 rounded hover:bg-minsah-accent disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronDown size={18} />
                </button>
                <button
                  onClick={() => setShowSettings(showSettings === section.id ? null : section.id)}
                  className="p-2 rounded hover:bg-blue-100 text-blue-600 transition"
                >
                  <Settings size={18} />
                </button>
                <button
                  onClick={() => deleteSection(section.id)}
                  className="p-2 rounded hover:bg-red-100 text-red-600 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Advanced Settings Panel */}
              {showSettings === section.id && (
                <div className="absolute right-6 mt-2 w-96 bg-white border-2 border-minsah-primary rounded-lg shadow-lg p-4 z-10">
                  <h4 className="font-bold text-minsah-dark mb-3">Advanced Settings</h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-minsah-secondary mb-1">
                        Background Color
                      </label>
                      <input
                        type="color"
                        value={section.settings.backgroundColor}
                        onChange={(e) => updateSectionSettings(section.id, { backgroundColor: e.target.value })}
                        className="w-full h-10 rounded border border-minsah-accent"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-minsah-secondary">
                        <input
                          type="checkbox"
                          checked={section.settings.showViewAll}
                          onChange={(e) => updateSectionSettings(section.id, { showViewAll: e.target.checked })}
                          className="w-4 h-4 text-minsah-primary rounded"
                        />
                        Show "View All" Link
                      </label>
                    </div>

                    <button
                      onClick={() => setShowSettings(null)}
                      className="w-full px-4 py-2 bg-minsah-primary text-white rounded-lg hover:bg-minsah-dark transition"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save Button (Bottom) */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={saveChanges}
          className="flex items-center gap-2 px-6 py-3 bg-minsah-primary text-white rounded-lg hover:bg-minsah-dark transition font-semibold"
        >
          <Save size={20} />
          Save All Changes
        </button>
      </div>
    </div>
  );
}
