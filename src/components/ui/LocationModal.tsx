'use client';

import { useState, useMemo } from 'react';
import { X, Search, MapPin, ChevronLeft, Check } from 'lucide-react';
import { useUIStore, useGlobalStore } from '@/lib/store';
import { nigeriaLocations, NigeriaLocation } from '@/lib/nigeriaLocations';

export default function LocationModal() {
  const { isLocationModalOpen, toggleLocationModal, closeAllModals } = useUIStore();
  const { selectedLocation, setSelectedLocation } = useGlobalStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<NigeriaLocation | null>(null);
  const [selectedLGA, setSelectedLGA] = useState<string | null>(null);
  const [showLGAModal, setShowLGAModal] = useState(false);

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return nigeriaLocations;
    
    const query = searchQuery.toLowerCase();
    return nigeriaLocations.filter(loc => 
      loc.name.toLowerCase().includes(query) ||
      loc.lgas?.some(lga => lga.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const handleStateClick = (state: NigeriaLocation) => {
    setSelectedState(state);
    setShowLGAModal(true);
  };

  const handleLGASelect = (lga: string) => {
    setSelectedLGA(lga);
  };

  const handleConfirmLGA = () => {
    if (selectedState && selectedLGA) {
      setSelectedLocation({
        id: selectedState.id.charCodeAt(0),
        name: `${selectedLGA}, ${selectedState.name}`,
        slug: `${selectedLGA.toLowerCase().replace(/\s+/g, '-')}-${selectedState.slug}`,
      });
      handleClose();
    }
  };

  const handleConfirmState = () => {
    if (selectedState) {
      setSelectedLocation({
        id: selectedState.id.charCodeAt(0),
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
  };

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
            {filteredLocations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No locations found matching &quot;{searchQuery}&quot;
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
                    <span className="text-sm text-gray-400">{state.lgas?.length} LGAs</span>
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
          onClick={handleBack}
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
              {selectedState.lgas?.filter(lga => 
                !searchQuery || lga.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((lga) => (
                <button
                  key={lga}
                  onClick={() => handleLGASelect(lga)}
                  className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100 mb-2 ${
                    selectedLGA === lga ? 'bg-primary-50 border-primary-200' : ''
                  }`}
                >
                  <span className="font-medium text-dark">{lga}</span>
                  {selectedLGA === lga && (
                    <Check className="w-5 h-5 text-primary-600" />
                  )}
                </button>
              ))}
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
