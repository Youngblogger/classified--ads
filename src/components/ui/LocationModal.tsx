'use client';

import { useState, useMemo, useEffect } from 'react';
import { X, Search, MapPin, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { useUIStore, useGlobalStore } from '@/lib/store';

interface LocationData {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  is_active: boolean;
  children?: LocationData[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export default function LocationModal() {
  const { isLocationModalOpen, toggleLocationModal, closeAllModals } = useUIStore();
  const { selectedLocation, setSelectedLocation } = useGlobalStore();
  
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<LocationData | null>(null);
  const [selectedLGA, setSelectedLGA] = useState<LocationData | null>(null);
  const [showLGAModal, setShowLGAModal] = useState(false);

  useEffect(() => {
    if (isLocationModalOpen && locations.length === 0) {
      fetchLocations();
    }
  }, [isLocationModalOpen]);

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/locations`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data = await response.json();
      setLocations(data.data || []);
    } catch (err: any) {
      console.error('Error fetching locations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locations;
    
    const query = searchQuery.toLowerCase();
    return locations.filter(loc => 
      loc.name.toLowerCase().includes(query) ||
      loc.children?.some(lga => lga.name.toLowerCase().includes(query))
    );
  }, [locations, searchQuery]);

  const handleStateClick = (state: LocationData) => {
    setSelectedState(state);
    setSelectedLGA(null);
    setSearchQuery('');
    setShowLGAModal(true);
  };

  const handleLGASelect = (lga: LocationData) => {
    setSelectedLGA(lga);
  };

  const handleConfirmLGA = () => {
    if (selectedState && selectedLGA) {
      setSelectedLocation({
        id: selectedLGA.id,
        name: `${selectedLGA.name}, ${selectedState.name}`,
        slug: `${selectedLGA.slug}-${selectedState.slug}`,
      });
      handleClose();
    }
  };

  const handleConfirmState = () => {
    if (selectedState) {
      setSelectedLocation({
        id: selectedState.id,
        name: selectedState.name,
        slug: selectedState.slug,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedState(null);
    setSelectedLGA(null);
    setShowLGAModal(false);
    closeAllModals();
  };

  const handleBack = () => {
    setShowLGAModal(false);
    setSelectedState(null);
    setSelectedLGA(null);
    setSearchQuery('');
  };

  const filteredLGAs = useMemo(() => {
    if (!selectedState?.children) return [];
    if (!searchQuery.trim()) return selectedState.children;
    const query = searchQuery.toLowerCase();
    return selectedState.children.filter(lga => 
      lga.name.toLowerCase().includes(query)
    );
  }, [selectedState, searchQuery]);

  return (
    <div className={isLocationModalOpen ? '' : 'hidden'}>
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <div 
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold text-dark">Select Location</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                <span className="ml-2 text-gray-500">Loading locations...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-2">{error}</p>
                <button 
                  onClick={fetchLocations}
                  className="text-primary-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No locations found matching "{searchQuery}"
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredLocations.map((state) => (
                  <button
                    key={state.id}
                    onClick={() => handleStateClick(state)}
                    className={`flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100 ${
                      selectedLocation?.name?.includes(state.name) ? 'bg-primary-50 border-primary-200' : ''
                    }`}
                  >
                    <span className="font-medium text-dark">{state.name}</span>
                    <span className="text-sm text-gray-400">{state.children?.length || 0} LGAs</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div>
                {selectedLocation && (
                  <p className="text-sm text-gray-600">
                    Selected: <span className="font-medium text-dark">{selectedLocation.name}</span>
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      {showLGAModal && selectedState && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onClick={() => setShowLGAModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <button onClick={handleBack} className="p-1 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-xl font-bold text-dark">{selectedState.name}</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search LGA..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {!selectedState.children || selectedState.children.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No LGAs available for this state
                </div>
              ) : filteredLGAs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No LGAs found matching "{searchQuery}"
                </div>
              ) : (
                filteredLGAs.map((lga) => (
                  <button
                    key={lga.id}
                    onClick={() => handleLGASelect(lga)}
                    className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100 mb-2 ${
                      selectedLGA?.id === lga.id ? 'bg-primary-50 border-primary-200' : ''
                    }`}
                  >
                    <span className="font-medium text-dark">{lga.name}</span>
                    {selectedLGA?.id === lga.id && (
                      <Check className="w-5 h-5 text-primary-600" />
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={handleConfirmLGA}
                disabled={!selectedLGA}
                className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
