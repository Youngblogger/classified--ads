'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  ChevronDown,
  GripVertical
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CategoryField {
  id?: number;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multi_select' | 'boolean';
  options?: string[];
  is_required?: boolean;
  sort_order?: number;
  group_name?: string | null;
  category_id?: number;
  category?: Category;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number Input' },
  { value: 'select', label: 'Dropdown Select' },
  { value: 'multi_select', label: 'Multi-Select (Checkboxes)' },
  { value: 'boolean', label: 'Yes/No Toggle' },
];

export default function CategoryFieldsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [fields, setFields] = useState<CategoryField[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<CategoryField | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: 'text' as 'text' | 'number' | 'select' | 'multi_select' | 'boolean',
    options: '',
    is_required: false,
    sort_order: 0,
    group_name: '',
    category_id: null as number | null,
  });

  useEffect(() => {
    fetchCategories();
    fetchFields();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await adminApi.getCategories();
      const cats = res.data.data || res.data || [];
      setCategories(cats);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchFields = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {};
      if (selectedCategory) {
        params.category_id = selectedCategory;
      }
      const res = await adminApi.getCategoryFields(params);
      setFields(res.data.flat || res.data || []);
    } catch (error) {
      console.error('Failed to fetch fields:', error);
      toast.error('Failed to load fields');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, [selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        options: formData.type === 'select' || formData.type === 'multi_select'
          ? formData.options.split(',').map(o => o.trim()).filter(Boolean)
          : null,
      };

      if (editingField?.id) {
        await adminApi.updateCategoryField(editingField.id, payload);
        toast.success('Field updated successfully');
      } else {
        await adminApi.createCategoryField(formData.category_id!, payload);
        toast.success('Field created successfully');
      }

      setIsModalOpen(false);
      resetForm();
      fetchFields();
    } catch (error: any) {
      console.error('Failed to save field:', error);
      toast.error(error.response?.data?.message || 'Failed to save field');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this field?')) return;
    
    try {
      await adminApi.deleteCategoryField(id);
      toast.success('Field deleted successfully');
      fetchFields();
    } catch (error) {
      console.error('Failed to delete field:', error);
      toast.error('Failed to delete field');
    }
  };

  const openEditModal = (field: CategoryField) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      label: field.label,
      type: field.type,
      options: field.options?.join(', ') || '',
      is_required: field.is_required || false,
      sort_order: field.sort_order || 0,
      group_name: field.group_name || '',
      category_id: field.category_id || null,
    });
    setIsModalOpen(true);
  };

  const openCreateModal = (categoryId?: number) => {
    resetForm();
    if (categoryId) {
      setFormData(prev => ({ ...prev, category_id: categoryId }));
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingField(null);
    setFormData({
      name: '',
      label: '',
      type: 'text',
      options: '',
      is_required: false,
      sort_order: 0,
      group_name: '',
      category_id: null,
    });
  };

  const getTypeLabel = (type: string) => {
    return FIELD_TYPES.find(t => t.value === type)?.label || type;
  };

  const filteredFields = fields.filter(field => {
    const matchesSearch = !searchTerm || 
      field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const groupedFields = filteredFields.reduce((acc, field) => {
    const catName = field.category?.name || 'Unknown Category';
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(field);
    return acc;
  }, {} as Record<string, CategoryField[]>);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => openCreateModal(selectedCategory || undefined)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Field
        </button>
      </div>

      {/* Fields List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
          </div>
        ) : filteredFields.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No fields found. Create your first field to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {Object.entries(groupedFields).map(([categoryName, categoryFields]) => (
              <div key={categoryName}>
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{categoryName}</h3>
                  <button
                    onClick={() => {
                      const cat = categories.find(c => c.name === categoryName);
                      if (cat) openCreateModal(cat.id);
                    }}
                    className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                  >
                    + Add Field
                  </button>
                </div>
                <div className="divide-y divide-gray-100">
                  {categoryFields.map((field) => (
                    <div key={field.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <GripVertical className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{field.label}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{field.name}</span>
                            <span>•</span>
                            <span>{getTypeLabel(field.type)}</span>
                            {field.group_name && (
                              <>
                                <span>•</span>
                                <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded">{field.group_name}</span>
                              </>
                            )}
                            {field.is_required && (
                              <span className="text-red-500">*Required</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(field)}
                          className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(field.id!)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingField ? 'Edit Field' : 'Add Field'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: Number(e.target.value) || null }))}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                    placeholder="e.g. make, model"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Internal name (lowercase, underscores)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g. Make, Model"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {FIELD_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {(formData.type === 'select' || formData.type === 'multi_select') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Options <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.options}
                    onChange={(e) => setFormData(prev => ({ ...prev, options: e.target.value }))}
                    placeholder="Option 1, Option 2, Option 3"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma-separated values</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={formData.group_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, group_name: e.target.value }))}
                  placeholder="e.g. Basic Info, Specifications"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <p className="text-xs text-gray-500 mt-1">Optional: group fields together in UI</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_required}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_required: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Required field</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingField ? 'Update Field' : 'Create Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
