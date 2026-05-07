'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Calendar, Loader2, ArrowUpDown, ArrowUp, ArrowDown, DollarSign, Zap, Share2, BookmarkPlus, Eye, TrendingUp } from 'lucide-react';
import { adminApi } from '@/lib/api';

interface AnalyticsData {
  user_growth?: { name: string; users: number }[];
  ads_posted?: { name: string; ads: number }[];
  category_distribution?: { name: string; value: number; color: string }[];
  revenue?: { name: string; revenue: number }[];
  ad_status?: { name: string; value: number; color: string }[];
}

interface StateAnalytics {
  state: string;
  total_ads: number;
  top_categories: string[];
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#6366f1', '#64748b'];

const CATEGORY_COLORS: Record<string, string> = {
  'Electronics': '#0ea5e9',
  'Fashion': '#ec4899',
  'Vehicles': '#f59e0b',
  'Real Estate': '#10b981',
  'Jobs': '#8b5cf6',
  'Services': '#6366f1',
  'Mobile Phones': '#0ea5e9',
  'Computers': '#3b82f6',
  'Furniture': '#a855f7',
  'Food': '#f97316',
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({});
  const [statesData, setStatesData] = useState<StateAnalytics[]>([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string; order: 'asc' | 'desc' }>({ key: 'total_ads', order: 'desc' });

  useEffect(() => {
    fetchAnalytics();
    fetchStatesAnalytics();
    
    // Real-time polling every 30 seconds for both analytics
    const analyticsInterval = setInterval(() => {
      fetchAnalytics();
    }, 30000);
    
    const statesInterval = setInterval(() => {
      fetchStatesAnalytics();
    }, 30000);
    
    return () => {
      clearInterval(analyticsInterval);
      clearInterval(statesInterval);
    };
  }, [dateRange, sortConfig]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAnalytics({ period: dateRange });
      setAnalytics(res.data || {});
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatesAnalytics = async () => {
    try {
      setStatesLoading(true);
      const res = await adminApi.getStatesAnalytics({ sort_by: sortConfig.key, sort_order: sortConfig.order });
      setStatesData(res.data || []);
    } catch (error) {
      console.error('Failed to fetch states analytics:', error);
    } finally {
      setStatesLoading(false);
    }
  };

  const handleSort = (key: string) => {
    const newOrder = sortConfig.key === key && sortConfig.order === 'desc' ? 'asc' : 'desc';
    setSortConfig({ key, order: newOrder });
    fetchStatesAnalytics();
  };

  const categoryData = analytics.category_distribution || [];
  const adStatusData = analytics.ad_status || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="year">This year</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-72 bg-gray-100 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.user_growth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Area type="monotone" dataKey="users" stroke="#0ea5e9" fill="#e0f2fe" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Ads Posted */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ads Posted</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.ads_posted || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="ads" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend 
                    layout="vertical" 
                    align="right" 
                    verticalAlign="middle"
                    formatter={(value, entry) => {
                      const data = entry.payload as { value?: number };
                      return <span className="text-sm text-gray-700">{value} ({data?.value || 0})</span>;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No category data available
              </div>
            )}
          </div>

          {/* Ad Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ad Status Distribution</h3>
            {adStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={adStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {adStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No ad status data available
              </div>
            )}
          </div>

          {/* Revenue Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            {(analytics.revenue || []).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.revenue || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No revenue data available
              </div>
            )}
          </div>

          {/* Top States by Ad Posts */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top States by Ad Posts</h3>
            
            {statesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
              </div>
            ) : statesData.length > 0 ? (
              <>
                {/* Bar Chart */}
                <div className="mb-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={statesData.slice(0, 10)} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
                      <XAxis type="number" stroke="#64748b" fontSize={12} />
                      <YAxis 
                        dataKey="state" 
                        type="category" 
                        stroke="#64748b" 
                        fontSize={12} 
                        width={80}
                        tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        formatter={(value: any) => [
                          `${Number(value).toLocaleString()} ads`,
                          'Total'
                        ]}
                        labelFormatter={(label) => label}
                        cursor={{ fill: '#f1f5f9' }}
                      />
                      <Bar 
                        dataKey="total_ads" 
                        fill="#0ea5e9" 
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                          <button 
                            onClick={() => handleSort('state')}
                            className="flex items-center gap-1 hover:text-gray-900"
                          >
                            State
                            {sortConfig.key === 'state' ? (
                              sortConfig.order === 'desc' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />
                            ) : <ArrowUpDown className="w-4 h-4" />}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                          <button 
                            onClick={() => handleSort('total_ads')}
                            className="flex items-center gap-1 hover:text-gray-900"
                          >
                            Total Ads
                            {sortConfig.key === 'total_ads' ? (
                              sortConfig.order === 'desc' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />
                            ) : <ArrowUpDown className="w-4 h-4" />}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Top Categories</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statesData.map((state, index) => (
                        <tr key={state.state} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              {index < 3 && (
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                  index === 0 ? 'bg-amber-100 text-amber-700' :
                                  index === 1 ? 'bg-gray-100 text-gray-700' :
                                  'bg-orange-100 text-orange-700'
                                }`}>
                                  {index + 1}
                                </span>
                              )}
                              {state.state}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{state.total_ads.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {state.top_categories.map((category, catIndex) => (
                                <span 
                                  key={category}
                                  className="px-2 py-1 rounded-full text-xs font-medium"
                                  style={{ 
                                    backgroundColor: CATEGORY_COLORS[category] || COLORS[catIndex % COLORS.length],
                                    color: 'white'
                                  }}
                                >
                                  {category}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500">
                No state data available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
