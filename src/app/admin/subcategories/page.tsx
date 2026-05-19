'use client';

import { useState, useEffect, useRef } from 'react';
import { FolderTree, Plus, Edit, Trash2, X, ChevronRight, Upload, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { getCategoryIcon } from '@/lib/categoryIcons';
import toast from 'react-hot-toast';
import IconPicker from '@/components/ui/IconPicker';

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  category?: { name: string };
  icon?: string;
  image?: string;
  is_active?: boolean;
  is_featured?: boolean;
  is_trending?: boolean;
  category_badge?: string;
  ads_count?: number;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const BADGE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'new', label: 'New' },
  { value: 'trending', label: 'Trending' },
  { value: 'popular', label: 'Popular' },
  { value: 'verified', label: 'Verified' },
];

export default function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    icon: '',
    image: '',
    is_active: true,
    is_featured: false,
    is_trending: false,
    category_badge: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subcategoriesRes, categoriesRes] = await Promise.all([
        adminApi.getCategories(),
        adminApi.getCategories(),
      ]);
      setSubcategories(subcategoriesRes.data.data || subcategoriesRes.data || []);
      setCategories(categoriesRes.data.data || categoriesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSubcategory) {
        await adminApi.updateCategory(editingSubcategory.id, {
          name: formData.name,
          slug: formData.slug,
          category_id: formData.category_id,
          icon: formData.icon,
          image: formData.image,
          is_active: formData.is_active,
          is_featured: formData.is_featured,
          is_trending: formData.is_trending,
          category_badge: formData.category_badge,
        });
        toast.success('Subcategory updated successfully');
      } else {
        await adminApi.createCategory({
          name: formData.name,
          slug: formData.slug,
          category_id: formData.category_id,
          icon: formData.icon,
          image: formData.image,
          is_active: formData.is_active,
          is_featured: formData.is_featured,
          is_trending: formData.is_trending,
          category_badge: formData.category_badge,
          parent_id: formData.category_id,
        });
        toast.success('Subcategory created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save subcategory');
    }
  };

  const handleEdit = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({
      name: subcategory.name,
      slug: subcategory.slug,
      category_id: subcategory.category_id.toString(),
      icon: subcategory.icon || '',
      image: subcategory.image || '',
      is_active: subcategory.is_active ?? true,
      is_featured: subcategory.is_featured ?? false,
      is_trending: subcategory.is_trending ?? false,
      category_badge: subcategory.category_badge || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;
    
    try {
      await adminApi.deleteCategory(id);
      toast.success('Subcategory deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete subcategory');
    }
  };

  const resetForm = () => {
    setEditingSubcategory(null);
    setFormData({
      name: '',
      slug: '',
      category_id: '',
      icon: '',
      image: '',
      is_active: true,
      is_featured: false,
      is_trending: false,
      category_badge: '',
    });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-36 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subcategories</h1>
          <p className="text-gray-500 mt-1">Manage subcategories for your classifieds</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
        >
          <Plus className="w-5 h-5" />
          Add Subcategory
        </button>
      </div>

      {/* Subcategories Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ads Count
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subcategories.filter((sub: any) => sub.parent_id).map((subcategory) => (
              <tr key={subcategory.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {subcategory.image ? (
                      <img src={subcategory.image} alt="" className="w-6 h-6 rounded object-cover" />
                    ) : subcategory.icon ? (
                      (() => { const I = getCategoryIcon(subcategory.icon); return <I className="w-5 h-5 text-gray-500" />; })()
                    ) : (
                      <FolderTree className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="font-medium text-gray-900">{subcategory.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-gray-500">
                    {subcategory.category?.name || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-gray-500 font-mono text-sm">{subcategory.slug}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    subcategory.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {subcategory.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {subcategory.ads_count || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(subcategory)}
                      className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(subcategory.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {subcategories.filter((sub: any) => sub.parent_id).length === 0 && (
          <div className="text-center py-12">
            <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No subcategories found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.filter((cat: any) => !cat.parent_id).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g., Cars in NYC"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="cars-nyc"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon
                  </label>
                  <button type="button" onClick={() => setShowIconPicker(true)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-3 hover:bg-gray-50 text-sm"
                  >
                    {formData.icon ? (
                      <>{(() => { const I = getCategoryIcon(formData.icon); return <I className="w-5 h-5 text-gray-600" />; })()}<span className="text-gray-700">{formData.icon}</span></>
                    ) : (
                      <><FolderTree className="w-5 h-5 text-gray-400" /><span className="text-gray-400">Choose icon</span></>
                    )}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
                  <select
                    value={formData.category_badge}
                    onChange={(e) => setFormData({ ...formData, category_badge: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {BADGE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Image URL"
                    />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingImage(true);
                      try {
                        const res = await adminApi.uploadCategoryImage(file);
                        setFormData(prev => ({ ...prev, image: res.data.url }));
                        toast.success('Image uploaded');
                      } catch { toast.error('Upload failed'); }
                      finally { setUploadingImage(false); }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  </button>
                </div>
                {formData.image && (
                  <div className="relative mt-2 inline-block">
                    <img src={formData.image} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                    <button type="button" onClick={() => setFormData({ ...formData, image: '' })}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500" />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500" />
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_trending}
                    onChange={(e) => setFormData({ ...formData, is_trending: e.target.checked })}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                  <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-sm text-gray-700">Trending</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                >
                  {editingSubcategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showIconPicker && (
        <IconPicker
          value={formData.icon}
          onChange={(icon) => { setFormData({ ...formData, icon }); setShowIconPicker(false); }}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </div>
  );
}
