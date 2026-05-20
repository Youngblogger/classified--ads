'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { X, Search, MapPin, ChevronRight, Check, Loader2, Globe, Navigation, Clock, Target, Crosshair, RefreshCw } from 'lucide-react';
import { useUIStore, useGlobalStore } from '@/lib/store';

interface LocationData {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  is_active: boolean;
  children?: LocationData[];
}

interface RecentLocation {
  name: string;
  slug: string;
  lga: string | null;
  lgaId?: number;
  timestamp: number;
}

interface CachedDetection {
  formattedAddress: string;
  matchedLocation: { id?: number; name: string; slug: string; lga: string | null; lgaId?: number } | null;
  timestamp: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const RECENT_LOCATIONS_KEY = 'ilist-recent-locations';
const CACHED_DETECTION_KEY = 'ilist-cached-detection';
const CACHE_TTL = 30 * 60 * 1000;

type GpsState = 'idle' | 'detecting' | 'success' | 'error';

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

  // Geolocation state
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [recentLocations, setRecentLocations] = useState<RecentLocation[]>([]);

  // GPS redesign state
  const [gpsState, setGpsState] = useState<GpsState>('idle');
  const [detectedAddress, setDetectedAddress] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gpsContainerRef = useRef<HTMLDivElement>(null);

  // Load recent locations from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_LOCATIONS_KEY);
      if (saved) setRecentLocations(JSON.parse(saved));
    } catch {}
  }, []);

  const saveRecentLocation = useCallback((loc: { name: string; slug: string; lga: string | null; lgaId?: number }) => {
    const entry: RecentLocation = { ...loc, timestamp: Date.now() };
    setRecentLocations(prev => {
      const filtered = prev.filter(r => r.slug !== loc.slug || r.lga !== loc.lga);
      const next = [entry, ...filtered].slice(0, 5);
      try { localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check for cached detection on modal open
  const getCachedDetection = useCallback((): CachedDetection | null => {
    try {
      const raw = localStorage.getItem(CACHED_DETECTION_KEY);
      if (!raw) return null;
      const cached: CachedDetection = JSON.parse(raw);
      if (Date.now() - cached.timestamp > CACHE_TTL) {
        localStorage.removeItem(CACHED_DETECTION_KEY);
        return null;
      }
      return cached;
    } catch {
      return null;
    }
  }, []);

  const cacheDetection = useCallback((data: CachedDetection) => {
    try {
      localStorage.setItem(CACHED_DETECTION_KEY, JSON.stringify(data));
    } catch {}
  }, []);

  useEffect(() => {
    if (isLocationModalOpen && locations.length === 0) fetchLocations();
    if (isLocationModalOpen) {
      setShowLGAView(false);
      setSearchQuery('');
      setSelectedLGA(null);
      setGeoError(null);
      setGpsState('idle');
      setDetectedAddress(null);
      setIsClosing(false);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }

      // Check cache for quick load
      const cached = getCachedDetection();
      if (cached && cached.matchedLocation) {
        setDetectedAddress(cached.formattedAddress);
        setGpsState('success');
      }
    }
  }, [isLocationModalOpen, locations, getCachedDetection]);

  const handleClose = useCallback(() => {
    setSearchQuery('');
    setSelectedState(null);
    setSelectedLGA(null);
    setShowLGAView(false);
    setDetectingLocation(false);
    setGeoError(null);
    setGpsState('idle');
    setDetectedAddress(null);
    setIsClosing(false);
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    closeAllModals();
  }, [closeAllModals]);

  const selectAndClose = useCallback((loc: { id?: number; name: string; slug: string; lga: string | null; lgaId?: number }) => {
    setSelectedLocation(loc);
    saveRecentLocation(loc);
    handleClose();
  }, [setSelectedLocation, saveRecentLocation, handleClose]);

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
      selectAndClose({ id: state.id, name: state.name, slug: state.slug, lga: null });
    } else {
      setShowLGAView(true);
    }
  }, [selectAndClose]);

  const handleLGASelect = useCallback((lga: LocationData) => {
    setSelectedLGA(lga);
    if (selectedState) selectAndClose({ id: lga.id, name: selectedState.name, slug: selectedState.slug, lga: lga.name, lgaId: lga.id });
  }, [selectedState, selectAndClose]);

  const handleConfirm = () => {
    if (selectedLGA && selectedState) selectAndClose({ id: selectedLGA.id, name: selectedState.name, slug: selectedState.slug, lga: selectedLGA.name, lgaId: selectedLGA.id });
  };

  const handleBack = () => {
    setShowLGAView(false);
    setSelectedState(null);
    setSelectedLGA(null);
    setSearchQuery('');
  };

  // Reverse geocode using Nominatim — returns human-readable address
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<{ state: string; city: string; area: string; display: string; formattedAddress: string } | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { 'User-Agent': 'iList-Classifieds/1.0' } }
      );
      if (!res.ok) throw new Error('Geocoding failed');
      const data = await res.json();
      const addr = data.address || {};
      const state = addr.state || addr.region || '';
      const city = addr.city || addr.town || addr.village || addr.county || '';
      const area = addr.suburb || addr.neighbourhood || addr.road || '';

      // Build human-readable formatted address
      const stateLabel = state.toLowerCase().includes('federal capital') || state.toLowerCase() === 'abuja'
        ? 'Federal Capital Territory (Abuja)'
        : state
          ? `${state} State`
          : '';

      const parts: string[] = [];
      if (area) parts.push(area);
      if (city && city !== area) parts.push(city);
      if (stateLabel) parts.push(stateLabel);

      const formattedAddress = parts.length > 0 ? parts.join(', ') : state || 'Detected Location';

      return { state, city, area, display: data.display_name || '', formattedAddress };
    } catch {
      return null;
    }
  }, []);

  // Match reverse-geocoded address to our location list
  const matchToLocation = useCallback((geo: { state: string; city: string; area: string }) => {
    const stateLower = geo.state.toLowerCase();
    const cityLower = geo.city.toLowerCase();
    const areaLower = geo.area.toLowerCase();

    const matchedState = locations.find(l =>
      l.name.toLowerCase().includes(stateLower) || stateLower.includes(l.name.toLowerCase())
    );
    if (!matchedState) return null;

    if (matchedState.children && matchedState.children.length > 0) {
      const matchedLGA = matchedState.children.find(lga =>
        lga.name.toLowerCase().includes(cityLower) ||
        lga.name.toLowerCase().includes(areaLower) ||
        cityLower.includes(lga.name.toLowerCase()) ||
        areaLower.includes(lga.name.toLowerCase())
      );
      if (matchedLGA) {
        return { id: matchedLGA.id, name: matchedState.name, slug: matchedState.slug, lga: matchedLGA.name, lgaId: matchedLGA.id };
      }
      return { id: matchedState.id, name: matchedState.name, slug: matchedState.slug, lga: null };
    }

    return { id: matchedState.id, name: matchedState.name, slug: matchedState.slug, lga: null };
  }, [locations]);

  // Auto-close after successful detection
  const autoCloseAfterSuccess = useCallback((matched: { id?: number; name: string; slug: string; lga: string | null; lgaId?: number }, formattedAddress: string) => {
    // Show success state for 1.5s, then auto-close
    closeTimerRef.current = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        selectAndClose(matched);
      }, 400);
    }, 1800);
  }, [selectAndClose]);

  const handleDetectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setGpsState('error');
      setDetectedAddress('Geolocation is not supported by your browser');
      return;
    }

    setGpsState('detecting');
    setDetectedAddress(null);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const geo = await reverseGeocode(latitude, longitude);
          if (geo) {
            const matched = matchToLocation(geo);
            const address = geo.formattedAddress;

            if (matched) {
              setDetectedAddress(address);
              setGpsState('success');

              // Cache the successful detection
              cacheDetection({
                formattedAddress: address,
                matchedLocation: matched,
                timestamp: Date.now()
              });

              autoCloseAfterSuccess(matched, address);
            } else {
              // Matched no location in our list, still show readable address
              setDetectedAddress(address);
              setGpsState('success');

              const fallbackSlug = address.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
              const fallback = { name: address, slug: fallbackSlug, lga: null };

              cacheDetection({
                formattedAddress: address,
                matchedLocation: fallback,
                timestamp: Date.now()
              });

              autoCloseAfterSuccess(fallback, address);
            }
          } else {
            // Nominatim failed — show coordinates as last resort
            const coordLabel = `${latitude.toFixed(4)}N, ${longitude.toFixed(4)}E`;
            setDetectedAddress(coordLabel);
            setGpsState('success');
          }
        } catch {
          const coordLabel = `${latitude.toFixed(4)}N, ${longitude.toFixed(4)}E`;
          setDetectedAddress(coordLabel);
          setGpsState('success');
        }
      },
      (err) => {
        setGpsState('error');
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setDetectedAddress('Location access denied');
            break;
          case err.POSITION_UNAVAILABLE:
            setDetectedAddress('Location unavailable');
            break;
          case err.TIMEOUT:
            setDetectedAddress('Location request timed out');
            break;
          default:
            setDetectedAddress('An error occurred');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [reverseGeocode, matchToLocation, autoCloseAfterSuccess, cacheDetection]);

  const getGpsErrorDescription = (): string => {
    switch (detectedAddress) {
      case 'Location access denied':
        return 'Please enable GPS access in your browser settings and try again, or select your location manually.';
      case 'Location unavailable':
        return 'GPS signal not found. Please move to an open area and try again, or select manually.';
      case 'Location request timed out':
        return 'The request took too long. Please check your connection and try again.';
      default:
        return 'We could not detect your location. Please try again or select manually.';
    }
  };

  if (!isLocationModalOpen) return null;

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 z-[200] ${isClosing ? 'animate-gps-fade-out' : ''}`} onClick={handleClose} />
      <div className={`fixed z-[201] ${
        isClosing ? 'animate-gps-fade-out' : ''
      } ${
        isMobile
          ? 'inset-x-0 bottom-0 top-0 animate-slide-up'
          : 'sm:fixed sm:top-16 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto sm:flex sm:justify-center sm:p-0 inset-x-2 top-8'
      }`}>
        <div className={`bg-white flex flex-col ${
          isMobile
            ? 'w-full h-full rounded-none'
            : 'w-full max-w-md sm:w-[480px] rounded-xl sm:animate-scale-in h-[60vh] sm:h-[85vh]'
        }`} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="bg-primary-600 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-white" />
              <h2 className="text-base font-bold text-white">Select Location</h2>
            </div>
            <button onClick={handleClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* State Selection View */}
          {!showLGAView && (
            <>
              {/* Current Selection */}
              {selectedLocation && (
                <div className="mx-3 mb-2 px-3 py-2 bg-primary-50 rounded-lg sm:mx-4 mt-3">
                  <p className="text-xs text-gray-600">
                    Current: <span className="font-medium text-primary-600">
                      {selectedLocation.lga ? `${selectedLocation.name}, ${selectedLocation.lga}` : selectedLocation.name}
                    </span>
                  </p>
                </div>
              )}

              {/* Search */}
              <div className="px-3 pb-2 sm:px-4 sm:pb-3 sticky top-0 bg-white z-10 mt-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search state, city or area..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full">
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-3 pb-3 sm:px-4 space-y-2">
                {/* GPS Precise Location Card */}
                <div ref={gpsContainerRef} className={`overflow-hidden transition-all duration-500 rounded-xl border ${
                  gpsState === 'idle'
                    ? 'border-primary-100 bg-white hover:border-primary-200'
                    : gpsState === 'detecting'
                      ? 'border-primary-200 bg-primary-50/80'
                      : gpsState === 'success'
                        ? 'border-green-200 bg-green-50/80'
                        : 'border-red-200 bg-red-50/80'
                }`}>
                  {gpsState === 'idle' && (
                    <button
                      onClick={handleDetectLocation}
                      className="w-full flex items-center gap-4 p-4 transition-all group"
                    >
                      {/* GPS Icon - Idle State */}
                      <div className="relative w-14 h-14 flex-shrink-0">
                        <div className="absolute inset-0 rounded-full bg-primary-100 animate-gps-pulse-idle" />
                        <div className="absolute inset-0 rounded-full bg-primary-50 group-hover:bg-primary-100 transition-colors" />
                        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-200/50">
                          <Target className="w-6 h-6 text-white animate-gps-float" />
                        </div>
                      </div>

                      <div className="flex-1 text-left">
                        <span className="text-sm font-semibold text-gray-900 block">
                          Use Precise Location
                        </span>
                        <span className="text-[11px] text-gray-500">
                          Turn on GPS to detect your city &amp; area
                        </span>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-primary-100 group-hover:bg-primary-200 flex items-center justify-center flex-shrink-0 transition-colors">
                        <Navigation className="w-4 h-4 text-primary-600" />
                      </div>
                    </button>
                  )}

                  {gpsState === 'detecting' && (
                    <div className="flex items-center gap-4 p-4">
                      {/* GPS Icon - Detecting State */}
                      <div className="relative w-14 h-14 flex-shrink-0">
                        {/* Rotating outer ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-400 animate-gps-rotate" />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-b-primary-300 animate-gps-rotate" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />

                        {/* Radar ripples */}
                        <div className="absolute inset-0 rounded-full border border-primary-300 animate-gps-radar-1" />
                        <div className="absolute inset-0 rounded-full border border-primary-300 animate-gps-radar-2" />
                        <div className="absolute inset-0 rounded-full border border-primary-300 animate-gps-radar-3" />

                        {/* Pulsing background */}
                        <div className="absolute inset-0 rounded-full bg-primary-100 animate-gps-detecting-pulse" />

                        {/* Center dot */}
                        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-300/50 animate-gps-blink-dot">
                          <Crosshair className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 text-left">
                        <span className="text-sm font-semibold text-gray-900 block">
                          Detecting your location...
                        </span>
                        <span className="text-[11px] text-gray-500">
                          Please wait while we find you
                        </span>
                      </div>

                      <Loader2 className="w-5 h-5 text-primary-500 animate-spin flex-shrink-0" />
                    </div>
                  )}

                  {gpsState === 'success' && (
                    <div className="flex items-center gap-4 p-4">
                      {/* GPS Icon - Success State */}
                      <div className="relative w-14 h-14 flex-shrink-0">
                        <div className="absolute inset-0 rounded-full bg-green-100 animate-gps-pulse-success" />
                        <div className="absolute inset-0 rounded-full bg-green-50" />
                        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-200/50">
                          <Check className="w-6 h-6 text-white animate-gps-success-check" />
                        </div>
                      </div>

                      <div className="flex-1 text-left">
                        <span className="text-sm font-semibold text-green-700 block">
                          Location detected!
                        </span>
                        {detectedAddress && (
                          <span className="text-xs font-medium text-green-600 block mt-0.5">
                            {detectedAddress}
                          </span>
                        )}
                      </div>

                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                  )}

                  {gpsState === 'error' && (
                    <div className="p-4">
                      <div className="flex items-center gap-4">
                        {/* GPS Icon - Error State */}
                        <div className="relative w-14 h-14 flex-shrink-0 animate-gps-error-shake">
                          <div className="absolute inset-0 rounded-full bg-red-100" />
                          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-200/50">
                            <X className="w-6 h-6 text-white" />
                          </div>
                        </div>

                        <div className="flex-1 text-left">
                          <span className="text-sm font-semibold text-red-700 block">
                            {detectedAddress || 'Location access denied'}
                          </span>
                          <span className="text-[11px] text-red-500">
                            {getGpsErrorDescription()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3 pl-[72px]">
                        <button
                          onClick={handleDetectLocation}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Retry
                        </button>
                        <button
                          onClick={() => setGpsState('idle')}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Geolocation error (legacy, shown alongside GPS card for non-GPS errors) */}
                {geoError && gpsState === 'idle' && (
                  <div className="px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex items-start gap-2">
                    <X className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span>{geoError}</span>
                  </div>
                )}

                {/* Recent Locations */}
                {!searchQuery && recentLocations.length > 0 && gpsState !== 'success' && gpsState !== 'detecting' && (
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Recent
                    </p>
                    <div className="space-y-1">
                      {recentLocations.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => selectAndClose({ name: r.name, slug: r.slug, lga: r.lga, lgaId: r.lgaId })}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                          <span className="text-sm text-gray-700">{r.lga ? `${r.name}, ${r.lga}` : r.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="my-2 border-t border-gray-100" />
                  </div>
                )}

                {/* Loading / Error / List */}
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                    <span className="ml-2 text-gray-500 text-sm">Loading locations...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500 mb-2 text-sm">{error}</p>
                    <button onClick={fetchLocations} className="text-primary-600 hover:underline font-medium text-sm">Try again</button>
                  </div>
                ) : filteredLocations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">No locations found matching &quot;{searchQuery}&quot;</div>
                ) : (
                  <div className="space-y-1">
                    {/* All Nigeria */}
                    <button
                      onClick={() => selectAndClose({ name: 'All Nigeria', slug: '', lga: null })}
                      className={`w-full flex items-center gap-2.5 p-2.5 sm:p-3 rounded-lg transition-colors border ${
                        !selectedState ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        !selectedState ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'
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
                            ? 'bg-primary-50 border-primary-200'
                            : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            selectedState?.id === state.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'
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

              {/* Footer */}
              {!isMobile && (
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 sm:rounded-b-2xl">
                  <div className="flex gap-3">
                    <button onClick={handleClose} className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors">Cancel</button>
                    <button
                      onClick={() => { if (selectedState) selectAndClose({ id: selectedState.id, name: selectedState.name, slug: selectedState.slug, lga: selectedLGA?.name || null }); }}
                      disabled={!selectedState}
                      className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >Apply</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* LGA Selection View */}
          {showLGAView && selectedState && (
            <>
              <div className="bg-primary-600 px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <button onClick={handleBack} className="p-1 -ml-1 hover:bg-white/20 rounded-lg">
                    <ChevronRight className="w-5 h-5 text-white rotate-180" />
                  </button>
                  <h2 className="text-base font-bold text-white">{selectedState.name}</h2>
                </div>
                <button onClick={handleClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="mx-3 mb-2 px-3 py-2 bg-primary-50 rounded-lg sm:mx-4 mt-3">
                <button onClick={handleBack} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 rotate-180" /> Change state
                </button>
              </div>

              <div className="px-3 pb-2 sm:px-4 sm:pb-3 sticky top-0 bg-white z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search area..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full">
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-3 pb-3 sm:px-4">
                {!selectedState.children || selectedState.children.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2 text-sm">No areas available</p>
                    <button onClick={() => selectAndClose({ id: selectedState.id, name: selectedState.name, slug: selectedState.slug, lga: null })} className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium text-sm">
                      Select {selectedState.name} anyway
                    </button>
                  </div>
                ) : filteredLGAs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">No areas found matching &quot;{searchQuery}&quot;</div>
                ) : (
                  <div className="space-y-1">
                    <button
                      onClick={() => selectAndClose({ id: selectedState.id, name: selectedState.name, slug: selectedState.slug, lga: null })}
                      className="w-full flex items-center gap-2.5 p-2.5 sm:p-3 rounded-lg transition-colors border bg-white border-gray-100 hover:bg-gray-50"
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
                            ? 'bg-primary-50 border-primary-200'
                            : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                        }`}
                      >
                        <span className="font-medium text-dark text-sm">{lga.name}</span>
                        {selectedLGA?.id === lga.id ? (
                          <Check className="w-4 h-4 text-primary-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t border-gray-100 bg-white">
                <div className="flex gap-3">
                  <button onClick={handleBack} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors">Back</button>
                  <button onClick={handleConfirm} disabled={!selectedLGA} className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors">
                    {selectedLGA ? `Apply: ${selectedLGA.name}` : 'Select an area'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
