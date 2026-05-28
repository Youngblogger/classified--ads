'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Star,
  ArrowUpCircle,
  Zap,
  Loader2,
  Package,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface PromotionPlan {
  id: number;
  name: string;
  type: string;
  description: string | null;
  price: number;
  duration_days: number;
  order: number;
  is_active: boolean;
  features: string[] | null;
  created_at: string;
}

interface Promotion {
  id: number;
  ad: {
    id: number;
    title: string;
    image?: string;
    price?: string;
    seller?: string;
  };
  type: string;
  price: number;
  duration: number;
  status: string;
  started_at?: string;
  expires_at?: string;
}

export default function PromotionsPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'promotions'>('plans');
  const [plans, setPlans] = useState<PromotionPlan[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getImageUrl = (url: string | undefined): string => {
    if (!url) return '/placeholder.jpg';
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
    return `${baseUrl}/${url.replace(/^\/+/, '')}`;
  };
  
  // Plan form state
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PromotionPlan | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    type: '',
    description: '',
    price: '',
    duration_days: '',
    order: '0',
    is_active: true,
    features: ''
  });
  const [savingPlan, setSavingPlan] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, promotionsRes] = await Promise.all([
        adminApi.getPromotionPlans(),
        adminApi.getPromotions()
      ]);
      const plansData = Array.isArray(plansRes.data) ? plansRes.data : (plansRes.data?.data || []);
      setPlans(plansData.map((plan: any) => {
        let features: string[] = [];
        if (Array.isArray(plan.features)) {
          features = plan.features;
        } else if (typeof plan.features === 'string' && plan.features) {
          try {
            features = JSON.parse(plan.features);
          } catch (e) {
            features = [];
          }
        }
        return { ...plan, features };
      }));
      setPromotions(promotionsRes.data?.data || promotionsRes.data || []);
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

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPlan(true);
    
    try {
      const data = {
        ...planForm,
        price: parseFloat(planForm.price),
        duration_days: parseInt(planForm.duration_days),
        order: parseInt(planForm.order),
        features: planForm.features ? planForm.features.split('\n').filter(f => f.trim()) : []
      };

      if (editingPlan) {
        await adminApi.updatePromotionPlan(editingPlan.id, data);
        toast.success('Plan updated successfully');
      } else {
        await adminApi.createPromotionPlan(data);
        toast.success('Plan created successfully');
      }
      
      setShowPlanModal(false);
      resetPlanForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save plan');
    } finally {
      setSavingPlan(false);
    }
  };

  const handleEditPlan = (plan: PromotionPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      type: plan.type,
      description: plan.description || '',
      price: plan.price.toString(),
      duration_days: plan.duration_days.toString(),
      order: plan.order.toString(),
      is_active: plan.is_active,
      features: plan.features?.join('\n') || ''
    });
    setShowPlanModal(true);
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await adminApi.deletePromotionPlan(id);
      toast.success('Plan deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  const resetPlanForm = () => {
    setEditingPlan(null);
    setPlanForm({
      name: '',
      type: '',
      description: '',
      price: '',
      duration_days: '',
      order: '0',
      is_active: true,
      features: ''
    });
  };

  const filteredPromotions = promotions.filter(promo => {
    const matchesSearch = (promo.ad?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || promo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'featured': return Star;
      case 'top': return ArrowUpCircle;
      case 'bump': return Zap;
      default: return Star;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString || dateString === '-') return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="border-b border-gray-200">
          <div className="flex gap-6">
            <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab('plans')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'plans'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="w-4 h-4 inline-block mr-2" />
            Promotion Plans
          </button>
          <button
            onClick={() => setActiveTab('promotions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'promotions'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Star className="w-4 h-4 inline-block mr-2" />
            Active Promotions
          </button>
        </nav>
      </div>

      {activeTab === 'plans' && (
        <>
          {/* Plans Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Manage Promotion Plans</h2>
            <button
              onClick={() => { resetPlanForm(); setShowPlanModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Plan
            </button>
          </div>

          {/* Plans Grid */}
          {plans.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No promotion plans found. Create your first plan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                      <span className="text-sm text-gray-500 capitalize">{plan.type}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {plan.description && (
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                  )}
                  
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-bold text-gray-900">₦{plan.price?.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">/ {plan.duration_days} days</span>
                  </div>
                  
                  {plan.features && plan.features.length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'promotions' && (
        <>
          {/* Promotions Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-2">
              {['all', 'active', 'pending', 'expired'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-sky-100 text-sky-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search promotions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full sm:w-80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Promotions Grid */}
          {filteredPromotions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No promotions found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPromotions.map((promo) => {
                const TypeIcon = getTypeIcon(promo.type);
                return (
                  <div key={promo.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex gap-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                        {promo.ad?.image ? (
                          <Image
                            src={promo.ad.image}
                            alt={promo.ad.title || 'Ad'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <TypeIcon className="w-4 h-4 text-sky-600" />
                          <span className="text-sm font-medium text-gray-900 capitalize">{promo.type}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">{promo.ad?.title || 'Unknown Ad'}</p>
                        <p className="text-xs text-gray-500">{promo.ad?.seller || 'Unknown Seller'}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-gray-900">₦{promo.price?.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{promo.duration} days</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        promo.status === 'active' ? 'bg-green-100 text-green-700' :
                        promo.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {promo.status}
                      </span>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <span>Started: {formatDate(promo.started_at)}</span>
                      <span>Expires: {formatDate(promo.expires_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingPlan ? 'Edit Promotion Plan' : 'Create Promotion Plan'}
              </h3>
            </div>
            <form onSubmit={handleSavePlan} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g., Premium Package"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type (unique)</label>
                <input
                  type="text"
                  required
                  value={planForm.type}
                  onChange={(e) => setPlanForm({ ...planForm, type: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g., featured, top, premium"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  rows={2}
                  placeholder="Optional description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={planForm.duration_days}
                    onChange={(e) => setPlanForm({ ...planForm, duration_days: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  min="0"
                  value={planForm.order}
                  onChange={(e) => setPlanForm({ ...planForm, order: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
                <textarea
                  value={planForm.features}
                  onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  rows={4}
                  placeholder="Featured in homepage&#10;Appears at top of listings&#10;Verified badge"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={planForm.is_active}
                  onChange={(e) => setPlanForm({ ...planForm, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowPlanModal(false); resetPlanForm(); }}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPlan}
                  className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingPlan && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
