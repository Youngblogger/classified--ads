'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { favoritesApi } from '@/lib/api';
import toast from 'react-hot-toast';

// Icons
const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

interface Favorite {
  id: number;
  ad: {
    id: number;
    title: string;
    slug: string;
    price: string;
    image?: string;
    location?: string;
    user?: {
      name: string;
    };
    created_at: string;
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await favoritesApi.getAll();
      setFavorites(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (adId: number) => {
    try {
      await favoritesApi.remove(adId);
      setFavorites(favorites.filter(f => f.ad.id !== adId));
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      toast.error('Failed to remove');
    }
  };

  const filteredFavorites = favorites.filter(item => 
    item.ad?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Favorite Ads</h2>
          <p className="text-gray-500 text-sm mt-1">Items you've saved for later</p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredFavorites.length} items saved
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search favorites..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-2xl aspect-square animate-pulse"></div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredFavorites.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-card">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HeartIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-500 mb-6">
            Start browsing and save items you like
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            Browse Ads
          </Link>
        </div>
      )}

      {/* Favorites Grid */}
      {!loading && filteredFavorites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredFavorites.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative aspect-square bg-gray-100">
                {item.ad?.image ? (
                  <img
                    src={item.ad.image}
                    alt={item.ad.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                <button
                  onClick={() => handleRemoveFavorite(item.ad.id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50 transition-colors"
                  title="Remove from favorites"
                >
                  <HeartIcon className="w-5 h-5 fill-current" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <Link href={`/ad/${item.ad.slug}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 hover:text-primary-600">
                    {item.ad.title}
                  </h3>
                </Link>
                <p className="text-xl font-bold text-primary-600 mb-3">
                  {item.ad.price}
                </p>

                {/* Details */}
                <div className="space-y-1 text-sm text-gray-500 mb-4">
                  {item.ad.location && (
                    <div className="flex items-center gap-1">
                      <span>{item.ad.location}</span>
                    </div>
                  )}
                  {item.ad.user && (
                    <div className="flex items-center gap-1">
                      <span>By {item.ad.user.name}</span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/ad/${item.ad.slug}`}
                  className="block w-full py-2 text-center bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}