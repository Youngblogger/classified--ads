'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FolderTree,
  Upload,
  X,
  Sparkles,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Loader2,
  Save,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { getCategoryIcon } from '@/lib/categoryIcons';
import toast from 'react-hot-toast';
import IconPicker from '@/components/ui/IconPicker';

const BADGE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'new', label: 'New' },
  { value: 'trending', label: 'Trending' },
  { value: 'popular', label: 'Popular' },
  { value: 'verified', label: 'Verified' },
];

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  image?: string;
  description?: string;
  parent_id?: number | null;
  ads_count?: number;
  subcategories_count?: number;
  is_active?: boolean;
  is_featured?: boolean;
  is_trending?: boolean;
  category_badge?: string;
  sort_order?: number;
  children?: Category[];
}

export default function CategoriesPage() {
  const [tree, setTree] = useState<Category[]>([]);
  const [allCats, setAllCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [sortOrders, setSortOrders] = useState<Record<number, number>>({});
  const [reordering, setReordering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    image: '',
    description: '',
    parent_id: '',
    is_active: true,
    is_featured: false,
    is_trending: false,
    category_badge: '',
  });

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCategories();
      const data = res.data;
      if (data.tree) {
        setTree(data.tree);
        setAllCats(data.all || []);
      } else {
        setTree(data.data || data || []);
        setAllCats(data.data || data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const orders: Record<number, number> = {};
    const collect = (cats: Category[]) => {
      cats.forEach(c => {
        orders[c.id] = c.sort_order ?? 0;
        if (c.children) collect(c.children);
      });
    };
    collect(tree);
    setSortOrders(orders);
  }, [tree]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        parent_id: formData.parent_id ? Number(formData.parent_id) : undefined,
      };
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, payload);
        toast.success('Category updated');
      } else {
        await adminApi.createCategory(payload);
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
      image: category.image || '',
      description: category.description || '',
      parent_id: category.parent_id?.toString() || '',
      is_active: category.is_active ?? true,
      is_featured: category.is_featured ?? false,
      is_trending: category.is_trending ?? false,
      category_badge: category.category_badge || '',
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
      image: '',
      description: '',
      parent_id: '',
      is_active: true,
      is_featured: false,
      is_trending: false,
      category_badge: '',
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await adminApi.uploadCategoryImage(file);
      setFormData(prev => ({ ...prev, image: res.data.url }));
      toast.success('Image uploaded');
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const moveItem = async (items: Category[], index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const updated = [...items];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    const reorderItems = updated.map((item, i) => ({
      id: item.id,
      sort_order: i,
    }));

    setReordering(true);
    try {
      await adminApi.reorderCategories(reorderItems);
      toast.success('Reordered');
      fetchCategories();
    } catch (error) {
      console.error('Failed to reorder:', error);
      toast.error('Failed to reorder');
    } finally {
      setReordering(false);
    }
  };

  const saveSortOrders = async () => {
    const items = Object.entries(sortOrders).map(([id, order]) => ({
      id: Number(id),
      sort_order: order,
    }));
    setReordering(true);
    try {
      await adminApi.reorderCategories(items);
      toast.success('Sort orders saved');
      fetchCategories();
    } catch (error) {
      console.error('Failed to save sort orders:', error);
      toast.error('Failed to save');
    } finally {
      setReordering(false);
    }
  };

  const parentsForSelect = allCats.filter(c => !c.parent_id);

  const renderIcon = (cat: Category, size: 'sm' | 'md' = 'md') => {
    const cls = size === 'sm' ? 'w-6 h-6' : 'w-10 h-10';
    if (cat.image) return <img src={cat.image} alt="" className={`${cls} rounded object-cover`} />;
    const IconComp = getCategoryIcon(cat.icon);
    return (
      <span className={`${cls} flex items-center justify-center rounded-lg bg-gray-100`}>
        <IconComp className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'} style={{ color: '#6b7280' }} />
      </span>
    );
  };

  const renderCatRow = (cat: Category, cats: Category[], index: number, depth: number) => {
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = expandedIds.has(cat.id);
    const isFirst = index === 0;
    const isLast = index === cats.length - 1;
    const productCats = allCats.filter(c => !c.parent_id);

    return (
      <div key={cat.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-b-0 ${depth === 0 ? 'bg-white' : depth === 1 ? 'bg-gray-50/50' : 'bg-gray-100/30'
            }`}
          style={{ paddingLeft: `${12 + depth * 24}px` }}
        >
          {/* Expand */}
          <button
            onClick={() => toggleExpand(cat.id)}
            className={`p-0.5 rounded hover:bg-gray-200 transition-colors flex-shrink-0 ${hasChildren ? '' : 'invisible'}`}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
          </button>

          {/* Icon */}
          <div className="flex-shrink-0">{renderIcon(cat, 'sm')}</div>

          {/* Name & badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-sm font-medium truncate ${depth === 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                {cat.name}
              </span>
              {cat.category_badge && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-emerald-100 text-emerald-700">
                  {cat.category_badge}
                </span>
              )}
              {cat.is_featured && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-amber-100 text-amber-700">
                  Featured
                </span>
              )}
              {cat.is_trending && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-orange-100 text-orange-700">
                  Trending
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-400">
              <span>/{cat.slug}</span>
              <span>{cat.ads_count || 0} ads</span>
              {cat.children && <span>{cat.children.length} children</span>}
            </div>
          </div>

          {/* Sort order */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              value={sortOrders[cat.id] ?? 0}
              onChange={e => setSortOrders(prev => ({ ...prev, [cat.id]: Math.max(0, parseInt(e.target.value) || 0) }))}
              className="w-14 px-1.5 py-1 text-[11px] border border-gray-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>

          {/* Move up/down */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => moveItem(cats, index, 'up')}
              disabled={isFirst || reordering}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 text-gray-400 hover:text-gray-700"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => moveItem(cats, index, 'down')}
              disabled={isLast || reordering}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 text-gray-400 hover:text-gray-700"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Status */}
          <span className={`flex-shrink-0 w-2 h-2 rounded-full ${cat.is_active ? 'bg-green-400' : 'bg-gray-300'}`} title={cat.is_active ? 'Active' : 'Inactive'} />

          {/* Actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => handleEdit(cat)} className="p-1 rounded text-gray-400 hover:text-sky-600 hover:bg-sky-50" title="Edit">
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => handleDelete(cat.id)} className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50" title="Delete">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div>
            {cat.children!.map((child, childIdx) =>
              renderCatRow(child, cat.children!, childIdx, depth + 1)
            )}
            {cat.children!.length === 0 && (
              <div className="text-xs text-gray-400 italic px-3 py-2" style={{ paddingLeft: `${36 + (depth + 1) * 24}px` }}>
                No subcategories
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const filteredTree = searchTerm
    ? tree.filter(c => {
      const matches =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase());
      if (matches) return true;
      if (c.children) {
        return c.children.some(
          child =>
            child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            child.slug.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return false;
    })
    : tree;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={saveSortOrders}
            disabled={reordering}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {reordering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Order</span>
          </button>
          <button
            onClick={() => { resetForm(); setEditingCategory(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>
      </div>

      {/* Tree Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="w-4 h-4 bg-gray-200 rounded" />
              <div className="w-8 h-8 bg-gray-200 rounded" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredTree.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 text-center py-12 text-gray-500">
          <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium">
            {searchTerm ? 'No categories match your search' : 'No categories yet'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => { resetForm(); setEditingCategory(null); setIsModalOpen(true); }}
              className="mt-3 text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              Create your first category
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="text-xs text-gray-400 px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <span className="w-4" />
            <span className="flex-1">Category</span>
            <span className="w-16 text-center">Order</span>
            <span className="w-12 text-center">Status</span>
            <span className="w-14 text-center">Actions</span>
          </div>
          <div className="divide-y divide-gray-50">
            {filteredTree.map((cat, idx) => renderCatRow(cat, filteredTree, idx, 0))}
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCategory ? `Edit: ${editingCategory.name}` : 'Add Category'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    placeholder="e.g., Vehicles" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input type="text" value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    placeholder="e.g., vehicles" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                  <select value={formData.parent_id}
                    onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  >
                    <option value="">None (top-level)</option>
                    {parentsForSelect.filter(p => p.id !== editingCategory?.id).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
                  <select value={formData.category_badge}
                    onChange={e => setFormData({ ...formData, category_badge: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  >
                    {BADGE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <button type="button" onClick={() => setShowIconPicker(true)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg flex items-center gap-3 hover:bg-gray-50 text-sm"
                  >
                    {formData.icon ? (
                      <>{(() => { const I = getCategoryIcon(formData.icon); return <I className="w-5 h-5 text-gray-600" />; })()}<span className="text-gray-700">{formData.icon}</span></>
                    ) : (
                      <><FolderTree className="w-5 h-5 text-gray-400" /><span className="text-gray-400">Choose icon</span></>
                    )}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <div className="flex gap-2">
                    <input type="text" value={formData.image}
                      onChange={e => setFormData({ ...formData, image: e.target.value })}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                      placeholder="URL" />
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      onChange={handleImageUpload} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}
                      className="px-3 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    </button>
                  </div>
                  {formData.image && (
                    <div className="relative mt-2 inline-block">
                      <img src={formData.image} alt="" className="w-16 h-16 rounded-lg object-cover border"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <button type="button" onClick={() => setFormData({ ...formData, image: '' })}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  rows={2} placeholder="Optional description..." />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">Flags</label>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={formData.is_active}
                      onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-sky-600" />
                    Active
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={formData.is_featured}
                      onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-amber-500" />
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Featured
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={formData.is_trending}
                      onChange={e => setFormData({ ...formData, is_trending: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-orange-500" />
                    <TrendingUp className="w-3.5 h-3.5 text-orange-500" /> Trending
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50">
                  {saving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
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
