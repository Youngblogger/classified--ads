'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { X, Search, MapPin, ChevronRight, Check, Loader2, Globe } from 'lucide-react';
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
  const { isLocationModalOpen, closeAllModals } = useUIStore();
  const { selectedLocation, setSelectedLocation } = useGlobalStore();
  
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<LocationData | null>(null);
  const [selectedLGA, setSelectedLGA] = useState<LocationData | null>(null);
  const [showLGAView, setShowLGAView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  useEffect(() => {
    if (isLocationModalOpen && locations.length === 0) {
      fetchLocations();
    }
    if (isLocationModalOpen) {
      setShowLGAView(false);
      setSearchQuery('');
      setSelectedLGA(null);
    }
  }, [isLocationModalOpen, locations]);

  const handleClose = useCallback(() => {
    setSearchQuery('');
    setSelectedState(null);
    setSelectedLGA(null);
    setShowLGAView(false);
    closeAllModals();
  }, [closeAllModals]);

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locations;
    
    const query = searchQuery.toLowerCase();
    return locations.filter(loc => 
      loc.name.toLowerCase().includes(query) ||
      loc.children?.some(lga => lga.name.toLowerCase().includes(query))
    );
  }, [locations, searchQuery]);

  const filteredLGAs = useMemo(() => {
    if (!selectedState?.children) return [];
    if (!searchQuery.trim()) return selectedState.children;
    const query = searchQuery.toLowerCase();
    return selectedState.children.filter(lga => 
      lga.name.toLowerCase().includes(query)
    );
  }, [selectedState, searchQuery]);

  const handleStateClick = useCallback((state: LocationData) => {
    setSelectedState(state);
    setSelectedLGA(null);
    setSearchQuery('');
    
    if (!state.children || state.children.length === 0) {
      setSelectedLocation({
        id: state.id,
        name: state.name,
        slug: state.slug,
        lga: null,
      });
      handleClose();
    } else {
      setShowLGAView(true);
    }
  }, [setSelectedLocation, handleClose]);

  const handleLGASelect = useCallback((lga: LocationData) => {
    setSelectedLGA(lga);
    setSearchQuery('');
    
    // Immediately save the location when LGA is selected
    if (selectedState) {
      setSelectedLocation({
        id: lga.id,
        name: selectedState.name,
        slug: selectedState.slug,
        lga: lga.name,
        lgaId: lga.id,
      });
      // Close the modal
      handleClose();
    } else {
    }
  }, [selectedState, setSelectedLocation, handleClose]);

  // Removed auto-save useEffect - now handled directly in handleLGASelect

  const handleConfirm = () => {
    if (selectedLGA && selectedState) {
      setSelectedLocation({
        id: selectedLGA.id,
        name: selectedState.name,
        slug: selectedState.slug,
        lga: selectedLGA.name,
        lgaId: selectedLGA.id,
      });
      handleClose();
    }
  };

  const handleBack = () => {
    setShowLGAView(false);
    setSelectedState(null);
    setSelectedLGA(null);
    setSearchQuery('');
  };

  if (!isLocationModalOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[200]"
        onClick={handleClose}
      />
      
      {/* Modal Container - Mobile Top */}
      <div className="fixed inset-x-2 top-8 z-[201] sm:fixed sm:top-16 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto sm:flex sm:justify-center sm:p-0">
        <div 
          className="bg-white w-full max-w-md sm:w-[480px] rounded-xl flex flex-col sm:animate-scale-in h-[60vh] sm:h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-2 pb-1 sm:pt-3">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* State Selection View */}
          {!showLGAView && (
            <>
              {/* Header */}
              <div className="flex justify-between items-center px-3 pb-2 sm:px-4 sm:pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1E3A8A]" />
                  <h2 className="text-base sm:text-lg font-bold text-dark">Select Location</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Current Selection */}
              {selectedLocation && (
                <div className="mx-3 mb-2 px-3 py-2 bg-[#1E3A8A]/5 rounded-lg sm:mx-4">
                  <p className="text-xs text-gray-600">
                    Current: <span className="font-medium text-[#1E3A8A]">
                      {selectedLocation.lga ? `${selectedLocation.name}, ${selectedLocation.lga}` : selectedLocation.name}
                    </span>
                  </p>
                </div>
              )}

              {/* Search */}
              <div className="px-3 pb-2 sm:px-4 sm:pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search state..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* States List */}
              <div className="flex-1 overflow-y-auto px-3 pb-3 sm:px-4 h-full" style={{ maxHeight: 'calc(85vh - 160px)' }}>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-[#1E3A8A] animate-spin" />
                    <span className="ml-2 text-gray-500 text-sm">Loading...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500 mb-2 text-sm">{error}</p>
                    <button 
                      onClick={fetchLocations}
                      className="text-[#1E3A8A] hover:underline font-medium text-sm"
                    >
                      Try again
                    </button>
                  </div>
                ) : filteredLocations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No locations found matching &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {/* All Nigeria Button */}
                    <button
                      onClick={() => {
                        setSelectedLocation(null);
                        handleClose();
                      }}
                      className={`w-full flex items-center gap-2 p-2.5 sm:p-3 rounded-lg transition-colors border ${
                        !selectedState ? 'bg-[#1E3A8A]/5 border-[#1E3A8A]/30' : 'bg-white border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        !selectedState ? 'bg-[#1E3A8A] text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Globe className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-dark text-sm">All Nigeria</span>
                    </button>

                    {filteredLocations.map((state) => (
                      <button
                        key={state.id}
                        onClick={() => handleStateClick(state)}
                        className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-lg transition-colors border ${
                          selectedState?.id === state.id 
                            ? 'bg-[#1E3A8A]/5 border-[#1E3A8A]/30' 
                            : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            selectedState?.id === state.id ? 'bg-[#1E3A8A] text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <span className="font-medium text-dark text-sm">{state.name}</span>
                            {state.children && state.children.length > 0 && (
                              <span className="text-xs text-gray-400 ml-1">({state.children.length})</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer - Desktop only */}
              {!isMobile && (
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 sm:rounded-b-2xl">
                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (selectedState) {
                          setSelectedLocation({
                            id: selectedState.id,
                            name: selectedState.name,
                            slug: selectedState.slug,
                            lga: selectedLGA?.name || null,
                          });
                          handleClose();
                        }
                      }}
                      disabled={!selectedState}
                      className="flex-1 px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* LGA Selection View */}
          {showLGAView && selectedState && (
            <>
              {/* Header */}
              <div className="flex justify-between items-center px-3 pb-2 sm:px-4 sm:pb-3">
                <div className="flex items-center gap-2">
                  <button onClick={handleBack} className="p-1 -ml-1 hover:bg-gray-100 rounded-lg">
                    <ChevronRight className="w-4 h-4 text-gray-600 rotate-180" />
                  </button>
                  <h2 className="text-base sm:text-lg font-bold text-dark">{selectedState.name}</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* State Badge */}
              <div className="mx-3 mb-2 px-3 py-2 bg-[#1E3A8A]/5 rounded-lg sm:mx-4">
                <button 
                  onClick={handleBack}
                  className="text-xs text-[#1E3A8A] hover:underline flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3 rotate-180" />
                  Change state
                </button>
              </div>

              {/* Search */}
              <div className="px-3 pb-2 sm:px-4 sm:pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search area..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* LGAs List */}
              <div className="flex-1 overflow-y-auto px-3 pb-3 sm:px-4 h-full" style={{ maxHeight: 'calc(85vh - 160px)' }}>
                {!selectedState.children || selectedState.children.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2 text-sm">No areas available</p>
                    <button
                      onClick={() => {
                        setSelectedLocation({
                          id: selectedState.id,
                          name: selectedState.name,
                          slug: selectedState.slug,
                          lga: null,
                        });
                        handleClose();
                      }}
                      className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg font-medium text-sm"
                    >
                      Select {selectedState.name} anyway
                    </button>
                  </div>
                ) : filteredLGAs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No areas found matching &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {/* All Areas in State Button */}
                    <button
                      onClick={() => {
                        setSelectedLocation({
                          id: selectedState.id,
                          name: selectedState.name,
                          slug: selectedState.slug,
                          lga: null,
                        });
                        handleClose();
                      }}
                      className="w-full flex items-center gap-2 p-2.5 sm:p-3 rounded-lg transition-colors border bg-white border-gray-100 hover:bg-gray-50"
                    >
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-dark text-sm">All areas in {selectedState.name}</span>
                    </button>

                    {filteredLGAs.map((lga) => (
                      <button
                        key={lga.id}
                        onClick={() => handleLGASelect(lga)}
                        className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-lg transition-colors border ${
                          selectedLGA?.id === lga.id 
                            ? 'bg-[#1E3A8A]/5 border-[#1E3A8A]/30' 
                            : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                        }`}
                      >
                        <span className="font-medium text-dark text-sm">{lga.name}</span>
                        {selectedLGA?.id === lga.id ? (
                          <Check className="w-4 h-4 text-[#1E3A8A]" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {isMobile ? (
                <div className="px-4 py-3 border-t border-gray-100 bg-white sm:rounded-b-2xl">
                  <div className="flex gap-3">
                    <button
                      onClick={handleBack}
                      className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={!selectedLGA}
                      className="flex-1 px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                    >
                      {selectedLGA ? `Apply: ${selectedLGA.name}` : 'Select an area'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 sm:rounded-b-2xl">
                  <div className="flex gap-3">
                    <button
                      onClick={handleBack}
                      className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={!selectedLGA}
                      className="flex-1 px-4 py-3 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                    >
                      {selectedLGA ? `Apply: ${selectedLGA.name}` : 'Apply'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
