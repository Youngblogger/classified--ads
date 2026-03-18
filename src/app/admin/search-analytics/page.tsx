'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Search, TrendingUp, Loader2, RefreshCw, BarChart3 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const fetcher = (url: string) => fetch(url).then(r => r.json()).catch(() => null);

interface SearchTerm {
  term: string;
  count: number;
  results_count?: number;
}

export default function SearchAnalyticsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: trendingData, isLoading, mutate } = useSWR<{ trending: SearchTerm[] }>(
    `${API_URL}/search/trending`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await mutate();
    setIsRefreshing(false);
  };

  const trending = trendingData?.trending || [];

  const totalSearches = trending.reduce((sum, item) => sum + item.count, 0);
  const avgResults = trending.length > 0 
    ? Math.round(trending.reduce((sum, item) => sum + (item.results_count || 0), 0) / trending.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Search className="w-6 h-6 text-primary-600" />
            Search Analytics
          </h1>
          <p className="text-gray-500 mt-1">Track popular search terms and trends</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Searches</p>
              <p className="text-2xl font-bold text-gray-900">{totalSearches.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Unique Terms</p>
              <p className="text-2xl font-bold text-gray-900">{trending.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Results/Term</p>
              <p className="text-2xl font-bold text-gray-900">{avgResults}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Searches Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Trending Search Terms</h2>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : trending.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Search Term</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Searches</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trending.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">#{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{item.term}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{item.count.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-600 rounded-full"
                            style={{ width: `${(item.count / totalSearches) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">
                          {Math.round((item.count / totalSearches) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No search data available yet</p>
            <p className="text-sm mt-1">Search analytics will appear once users start searching</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Search analytics are tracked when users perform searches on the platform. 
          The trending list is updated every 30 minutes from actual user searches.
        </p>
      </div>
    </div>
  );
}