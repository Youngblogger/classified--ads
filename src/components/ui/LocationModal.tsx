'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { X, Search, MapPin, ChevronRight, Check, Loader2, Globe, Navigation, RefreshCw } from 'lucide-react';
import { useUIStore, useGlobalStore } from '@/lib/store';

function GpsCrosshair({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

interface LocationData {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  is_active: boolean;
  children?: LocationData[];
}

interface CachedDetection {
  formattedAddress: string;
  matchedLocation: { id?: number; name: string; slug: string; lga: string | null; lgaId?: number } | null;
  timestamp: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const CACHED_DETECTION_KEY = 'ilist-cached-detection';
const SELECTED_LOCATION_KEY = 'ilist-selected-location';
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

  // GPS redesign state
  const [gpsState, setGpsState] = useState<GpsState>('idle');
  const [detectedAddress, setDetectedAddress] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gpsContainerRef = useRef<HTMLDivElement>(null);
  const gpsWatchIdRef = useRef<number | null>(null);
  const gpsFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Clean up old localStorage entries — location is now session-based
    try {
      localStorage.removeItem('ilist-global-storage');
      localStorage.removeItem('ilist-cached-detection');
      localStorage.removeItem('ilist-selected-location');
    } catch {}

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

  const cacheDetection = useCallback((data: CachedDetection) => {
    try {
      sessionStorage.setItem(CACHED_DETECTION_KEY, JSON.stringify(data));
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
    }
  }, [isLocationModalOpen, locations]);

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
    if (gpsWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      gpsWatchIdRef.current = null;
    }
    if (gpsFallbackTimerRef.current !== null) {
      clearTimeout(gpsFallbackTimerRef.current);
      gpsFallbackTimerRef.current = null;
    }
    closeAllModals();
  }, [closeAllModals]);

  const selectAndClose = useCallback((loc: { id?: number; name: string; slug: string; lga: string | null; lgaId?: number }) => {
    setSelectedLocation(loc);
    try { sessionStorage.setItem(SELECTED_LOCATION_KEY, JSON.stringify({ name: loc.name, slug: loc.slug, lga: loc.lga, lgaId: loc.lgaId })); } catch {}
    handleClose();
  }, [setSelectedLocation, handleClose]);

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
  }, []);

  const handleConfirm = () => {
    if (selectedLGA && selectedState) selectAndClose({ id: selectedLGA.id, name: selectedState.name, slug: selectedState.slug, lga: selectedLGA.name, lgaId: selectedLGA.id });
  };

  const handleBack = () => {
    setShowLGAView(false);
    setSelectedState(null);
    setSelectedLGA(null);
    setSearchQuery('');
  };

  // Reverse geocode via server-side proxy — returns human-readable address
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<{ state: string; city: string; area: string; display: string; formattedAddress: string } | null> => {
    const parseAddress = (addr: any): { state: string; city: string; area: string; formattedAddress: string } | null => {
      const state = addr.state || addr.region || '';
      const country = addr.country || '';

      if (!state && !country) return null;

      // Use locality/town/city only — NEVER road/street/building
      const locality = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || addr.county || '';
      const city = addr.city || addr.town || addr.village || addr.county || '';

      const stateLabel = state.toLowerCase().includes('federal capital') || state.toLowerCase() === 'abuja'
        ? 'Federal Capital Territory (Abuja)'
        : state ? `${state} State` : '';

      // Priority 1: Locality + State (e.g. "Ikeja, Lagos State")
      if (locality && stateLabel) {
        return { state, city, area: locality, formattedAddress: `${locality}, ${stateLabel}` };
      }
      // Priority 2: Locality + State (short form) (e.g. "Lekki, Lagos")
      if (locality && state) {
        return { state, city, area: locality, formattedAddress: `${locality}, ${state}` };
      }
      // Priority 3: City + Country (e.g. "Abuja, Nigeria")
      if (city && country) {
        return { state, city, area: locality, formattedAddress: `${city}, ${country}` };
      }
      // Priority 4: State only (e.g. "Kwara State")
      if (stateLabel) {
        return { state, city, area: '', formattedAddress: stateLabel };
      }

      return null;
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`/api/geocode?lat=${lat}&lon=${lng}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('Geocoding failed');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const result = parseAddress(data.address || {});
      if (result) {
        return { ...result, display: data.display_name || '' };
      }
    } catch {}

    return null;
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
    closeTimerRef.current = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        selectAndClose(matched);
      }, 400);
    }, 3000);
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
    try { sessionStorage.removeItem(CACHED_DETECTION_KEY); } catch {}

    let resolved = false;
    let bestCoords: { latitude: number; longitude: number } | null = null;
    let bestAccuracy = Infinity;

    // Clean up any previous GPS watch
    if (gpsWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      gpsWatchIdRef.current = null;
    }
    if (gpsFallbackTimerRef.current !== null) {
      clearTimeout(gpsFallbackTimerRef.current);
      gpsFallbackTimerRef.current = null;
    }

    const processCoords = async (lat: number, lng: number) => {
      if (resolved) return;
      resolved = true;
      if (gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
      if (gpsFallbackTimerRef.current !== null) {
        clearTimeout(gpsFallbackTimerRef.current);
        gpsFallbackTimerRef.current = null;
      }
      try {
        const geo = await reverseGeocode(lat, lng);
        if (geo) {
          const matched = matchToLocation(geo);
          const address = geo.formattedAddress;

          if (matched) {
            setDetectedAddress(address);
            setGpsState('success');
            cacheDetection({ formattedAddress: address, matchedLocation: matched, timestamp: Date.now() });
            autoCloseAfterSuccess(matched, address);
          } else {
            setDetectedAddress(address);
            setGpsState('success');
            const fallbackSlug = address.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const fallback = { name: address, slug: fallbackSlug, lga: null };
            cacheDetection({ formattedAddress: address, matchedLocation: fallback, timestamp: Date.now() });
            autoCloseAfterSuccess(fallback, address);
          }
        } else {
          setDetectedAddress('Could not identify location');
          setGpsState('error');
        }
      } catch (err) {
        console.error('[GEO] Reverse geocode threw:', err);
        setDetectedAddress('Could not identify location');
        setGpsState('error');
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      if (resolved) return;
      resolved = true;
      if (gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
      if (gpsFallbackTimerRef.current !== null) {
        clearTimeout(gpsFallbackTimerRef.current);
        gpsFallbackTimerRef.current = null;
      }
      console.error('[GPS] Positioning failed:', err);
      setGpsState('error');
      switch (err.code) {
        case err.PERMISSION_DENIED: setDetectedAddress('Location access denied'); break;
        case err.POSITION_UNAVAILABLE: setDetectedAddress('Location unavailable'); break;
        case err.TIMEOUT: setDetectedAddress('Location request timed out'); break;
        default: setDetectedAddress('An error occurred');
      }
    };

    // Use watchPosition to get progressively better accuracy
    gpsWatchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        if (resolved) return;

        if (accuracy < bestAccuracy) {
          bestAccuracy = accuracy;
          bestCoords = { latitude, longitude };
        }

        if (accuracy < 100) {
          processCoords(latitude, longitude);
        }
      },
      handleError,
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 5000 }
    );

    // Fallback timer: use best available fix after 20s
    gpsFallbackTimerRef.current = setTimeout(() => {
      if (resolved) return;
      if (bestCoords) {
        processCoords(bestCoords.latitude, bestCoords.longitude);
      } else {
        if (gpsWatchIdRef.current !== null) {
          navigator.geolocation.clearWatch(gpsWatchIdRef.current);
          gpsWatchIdRef.current = null;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            processCoords(position.coords.latitude, position.coords.longitude);
          },
          (err) => {
            if (resolved) return;
            resolved = true;
            console.error('[GPS] Final fallback failed:', err);
            setGpsState('error');
            switch (err.code) {
              case err.PERMISSION_DENIED: setDetectedAddress('Location access denied'); break;
              case err.POSITION_UNAVAILABLE: setDetectedAddress('Location unavailable'); break;
              case err.TIMEOUT: setDetectedAddress('Location request timed out'); break;
              default: setDetectedAddress('An error occurred');
            }
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 }
        );
      }
    }, 20000);
  }, [reverseGeocode, matchToLocation, autoCloseAfterSuccess, cacheDetection]);

  const getGpsErrorDescription = (): string => {
    switch (detectedAddress) {
      case 'Location access denied':
        return 'Please enable GPS access in your browser settings and try again, or select your location manually.';
      case 'Location unavailable':
        return 'GPS signal not found. Please move to an open area and try again, or select manually.';
      case 'Location request timed out':
        return 'The request took too long. Please check your connection and try again.';
      case 'Could not identify location':
        return 'We found your coordinates but could not determine the address. Please select manually.';
      case 'Could not get GPS fix':
      case 'Could not get accurate GPS fix':
        return 'Unable to get a GPS position. Try moving to an open area or select your location manually.';
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
            : 'w-full max-w-md sm:w-[480px] rounded-xl sm:animate-scale-in h-[50vh] sm:h-[78vh]'
        }`} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="bg-primary-600 px-4 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-white" />
              <h2 className="text-sm font-bold text-white">Select Location</h2>
            </div>
            <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* State Selection View */}
          {!showLGAView && (
            <>
              {/* Current Selection */}
              {selectedLocation && (
                <div className="mx-3 px-3 py-1.5 bg-primary-50 rounded-lg sm:mx-4 mt-2.5">
                  <p className="text-[11px] text-gray-600">
                    Current: <span className="font-medium text-primary-600">
                      {selectedLocation.lga ? `${selectedLocation.name}, ${selectedLocation.lga}` : selectedLocation.name}
                    </span>
                  </p>
                </div>
              )}

              {/* Search */}
              <div className="px-3 pb-1.5 sm:px-4 sm:pb-2 sticky top-0 bg-white z-10 mt-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search state, city or area..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full">
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-3 pb-3 sm:px-4 space-y-1.5">
                {/* GPS Precise Location Card */}
                <div ref={gpsContainerRef} className="overflow-hidden transition-all duration-500 rounded-xl border border-gray-100">
                  {gpsState === 'idle' && (
                    <button
                      onClick={handleDetectLocation}
                      className="w-full flex items-center gap-3 p-3 transition-all group"
                    >
                      <div className="relative flex-shrink-0 flex items-center justify-center w-9 h-9">
                        <div className="absolute inset-0 rounded-full bg-primary-100/40 animate-gps-pulse-idle" />
                        <div className="relative flex items-center justify-center w-5 h-5 drop-shadow-[0_0_6px_rgba(79,70,229,0.4)]">
                          <GpsCrosshair className="w-full h-full text-primary-600 animate-gps-float" />
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

                      <div className="w-6 h-6 rounded-full bg-primary-100/60 group-hover:bg-primary-200/60 flex items-center justify-center flex-shrink-0 transition-colors">
                        <Navigation className="w-3 h-3 text-primary-600" />
                      </div>
                    </button>
                  )}

                  {gpsState === 'detecting' && (
                    <div className="flex items-center gap-3 p-3">
                      <div className="relative flex-shrink-0 flex items-center justify-center w-9 h-9">
                        <div className="absolute inset-0 rounded-full border border-primary-300 animate-gps-radar-1" />
                        <div className="absolute inset-0 rounded-full border border-primary-300 animate-gps-radar-2" />
                        <div className="absolute inset-0 rounded-full border-t-2 border-primary-400 animate-gps-rotate" />
                        <div className="relative flex items-center justify-center w-5 h-5 animate-gps-blink-dot">
                          <GpsCrosshair className="w-full h-full text-primary-600" />
                        </div>
                      </div>

                      <div className="flex-1 text-left min-w-0">
                        <span className="text-sm font-semibold text-gray-900 block">
                          Getting your precise location...
                        </span>
                        <span className="text-[11px] text-gray-500 block truncate">
                          Determining your location
                        </span>
                      </div>

                      <Loader2 className="w-4 h-4 text-primary-500 animate-spin flex-shrink-0" />
                    </div>
                  )}

                  {gpsState === 'success' && (
                    <div className="flex items-center gap-3 p-3">
                      <div className="relative flex-shrink-0 flex items-center justify-center w-9 h-9">
                        <div className="absolute inset-0 rounded-full bg-green-100/40 animate-gps-pulse-success" />
                        <div className="relative flex items-center justify-center">
                          <div className="relative w-5 h-5">
                            <GpsCrosshair className="w-full h-full text-green-600" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="w-1.5 h-1.5 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 text-left min-w-0">
                        <span className="text-sm font-semibold text-gray-900 block truncate">
                          {detectedAddress || 'Location detected'}
                        </span>
                        {detectedAddress && (
                          <span className="text-[11px] text-green-600 block truncate">
                            GPS verified location
                          </span>
                        )}
                      </div>

                      <div className="w-6 h-6 rounded-full bg-green-100/60 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                    </div>
                  )}

                  {gpsState === 'error' && (
                    <div className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0 flex items-center justify-center w-9 h-9 animate-gps-error-shake">
                          <div className="relative flex items-center justify-center">
                            <div className="relative w-5 h-5">
                              <GpsCrosshair className="w-full h-full text-red-500" />
                              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full flex items-center justify-center">
                                <X className="w-1.5 h-1.5 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 text-left min-w-0">
                          <span className="text-sm font-semibold text-red-700 block">
                            {detectedAddress || 'Location access denied'}
                          </span>
                          <span className="text-[11px] text-red-500 block truncate">
                            {getGpsErrorDescription()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-2.5 pl-11">
                        <button
                          onClick={handleDetectLocation}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Retry
                        </button>
                        <button
                          onClick={() => setGpsState('idle')}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
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
                  <div className="space-y-0.5">
                    {/* All Nigeria */}
                    <button
                      onClick={() => selectAndClose({ name: 'All Nigeria', slug: '', lga: null })}
                      className={`w-full flex items-center gap-2 p-2.5 rounded-lg transition-colors border ${
                        !selectedState ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        !selectedState ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Globe className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-dark text-sm">All Nigeria</span>
                    </button>

                    {filteredLocations.map((state) => (
                      <button
                        key={state.id}
                        onClick={() => handleStateClick(state)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors border ${
                          selectedState?.id === state.id
                            ? 'bg-primary-50 border-primary-200'
                            : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            selectedState?.id === state.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-left">
                            <span className="font-medium text-dark text-sm">{state.name}</span>
                            {state.children && state.children.length > 0 && (
                              <span className="text-xs text-gray-400 ml-1">({state.children.length})</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {!isMobile && (
                <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 sm:rounded-b-2xl">
                  <div className="flex gap-2.5">
                    <button onClick={handleClose} className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium text-sm transition-colors">Cancel</button>
                    <button
                      onClick={() => { if (selectedState) selectAndClose({ id: selectedState.id, name: selectedState.name, slug: selectedState.slug, lga: selectedLGA?.name || null }); }}
                      disabled={!selectedState}
                      className="flex-1 px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors"
                    >Apply</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* LGA Selection View */}
          {showLGAView && selectedState && (
            <>
              <div className="bg-primary-600 px-4 py-2.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <button onClick={handleBack} className="p-1 -ml-1 hover:bg-white/20 rounded-lg">
                    <ChevronRight className="w-4 h-4 text-white rotate-180" />
                  </button>
                  <h2 className="text-sm font-bold text-white">{selectedState.name}</h2>
                </div>
                <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="mx-3 mt-2.5 mb-1 px-3 py-1.5 bg-primary-50 rounded-lg sm:mx-4">
                <button onClick={handleBack} className="text-[11px] text-primary-600 hover:underline flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 rotate-180" /> Change state
                </button>
              </div>

              <div className="px-3 pb-1.5 sm:px-4 sm:pb-2 sticky top-0 bg-white z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search area..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-2 text-sm">No areas available</p>
                    <button onClick={() => selectAndClose({ id: selectedState.id, name: selectedState.name, slug: selectedState.slug, lga: null })} className="px-3 py-1.5 bg-primary-600 text-white rounded-lg font-medium text-sm">
                      Select {selectedState.name} anyway
                    </button>
                  </div>
                ) : filteredLGAs.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-sm">No areas found matching &quot;{searchQuery}&quot;</div>
                ) : (
                  <div className="space-y-0.5">
                    <button
                      onClick={() => selectAndClose({ id: selectedState.id, name: selectedState.name, slug: selectedState.slug, lga: null })}
                      className="w-full flex items-center gap-2 p-2 rounded-lg transition-colors border bg-white border-gray-100 hover:bg-gray-50"
                    >
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-medium text-dark text-sm">All areas in {selectedState.name}</span>
                    </button>
                    {filteredLGAs.map((lga) => (
                      <button
                        key={lga.id}
                        onClick={() => handleLGASelect(lga)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors border ${
                          selectedLGA?.id === lga.id
                            ? 'bg-primary-50 border-primary-200'
                            : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                        }`}
                      >
                        <span className="font-medium text-dark text-sm">{lga.name}</span>
                        {selectedLGA?.id === lga.id ? (
                          <Check className="w-3.5 h-3.5 text-primary-600" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-4 py-2.5 border-t border-gray-100 bg-white">
                <div className="flex gap-2.5">
                  <button onClick={handleBack} className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-colors">Back</button>
                  <button onClick={handleConfirm} disabled={!selectedLGA} className="flex-1 px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-colors">
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
