'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  GripVertical,
  Loader2,
  FolderTree
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import IconPicker from '@/components/ui/IconPicker';

const iconNames = [
  'car', 'truck', 'bus', 'bike', 'house', 'building', 'laptop', 'tv', 'camera', 'watch',
  'cpu', 'database', 'cloud', 'bed', 'table', 'lamp', 'shirt', 'dress', 'briefcase', 'backpack',
  'graduation-cap', 'book', 'users', 'user', 'clock', 'star', 'target', 'medal',
  'dog', 'cat', 'fish', 'bird', 'heart', 'trophy', 'football', 'basketball', 'tree',
  'pill', 'brain', 'bank', 'dollar-sign', 'credit-card', 'wallet', 'chart-line',
  'utensils', 'coffee', 'beer', 'wine', 'pizza', 'hamburger', 'cake', 'cookie',
  'palette', 'image', 'video', 'music', 'code', 'terminal', 'tag', 'flag', 'bell',
  'settings', 'lock', 'key', 'shield', 'zap', 'power', 'map-pin', 'globe', 'search'
];

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  ads_count?: number;
  subcategories_count?: number;
  is_active?: boolean;
  isActive?: boolean;
  order?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    description: '',
    is_active: true
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCategories();
      setCategories(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, formData);
        toast.success('Category updated');
      } else {
        await adminApi.createCategory(formData);
        toast.success('Category created');
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon || '',
      description: category.description || '',
      is_active: category.is_active ?? category.isActive ?? true
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await adminApi.deleteCategory(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      icon: '',
      description: '',
      is_active: true
    });
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full sm:w-80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <button
          onClick={() => { resetForm(); setEditingCategory(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gray-200"></div>
                  <div className="space-y-2">
                    <div className="h-5 w-24 bg-gray-200 rounded"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No categories found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                    {category.icon ? (
                      <span className="text-2xl">{category.icon}</span>
                    ) : (
                      <FolderTree className="w-7 h-7 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">/{category.slug}</p>
                  </div>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <GripVertical className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-500">{category.subcategories_count || 0} subcategories</span>
                <span className="font-medium text-gray-900">{category.ads_count?.toLocaleString() || 0} ads</span>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  (category.is_active ?? category.isActive) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {(category.is_active ?? category.isActive) ? 'Active' : 'Inactive'}
                </span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleEdit(category)}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g., Vehicles"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g., vehicles"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                <button
                  type="button"
                  onClick={() => setShowIconPicker(true)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 flex items-center gap-3 hover:bg-gray-50"
                >
                  {formData.icon ? (
                    <>
                      <span className="text-2xl">{formData.icon}</span>
                      <span className="text-gray-700">{formData.icon}</span>
                    </>
                  ) : (
                    <>
                      <FolderTree className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-400">Choose an icon</span>
                    </>
                  )}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  rows={3}
                  placeholder="Category description..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-sky-600"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showIconPicker && (
        <IconPicker
          value={formData.icon}
          onChange={(icon) => {
            setFormData({ ...formData, icon });
            setShowIconPicker(false);
          }}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </div>
  );
}
