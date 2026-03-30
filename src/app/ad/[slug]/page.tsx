'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/home/Header';
import Footer from '@/components/layout/Footer';
import SellerProfileCard from '@/components/ui/SellerProfileCard';
import RelatedAds from '@/components/ads/RelatedAds';
import LatestReviews from '@/components/reviews/LatestReviews';
import { DynamicChatModal } from '@/lib/dynamicImports';
import { useAuthStore, useUIStore } from '@/lib/store';
import { Heart, MapPin, Eye, Phone, ChevronRight, MessageCircle, Home, Clock, CheckCircle, ArrowLeft, ArrowRight, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice, formatRelativeTime, BACKEND_URL } from '@/lib/utils';
import { getAuthToken } from '@/lib/cookies';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.218 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const EmailIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

export default function AdDetailPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  
  console.log('[AdDetailPage] Rendering, slug:', slug);
  
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { toggleLoginModal } = useUIStore();

  useEffect(() => {
    if (!slug || slug === '[slug]') {
      setLoading(false);
      setError('Invalid ad URL');
      return;
    }
    
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const fetchAd = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('[AdDetailPage] Fetching ad:', `${API_URL}/ads/${slug}`);
        
        const response = await fetch(`${API_URL}/ads/${slug}`, { 
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('[AdDetailPage] Response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Ad not found');
          }
          throw new Error('Failed to load ad');
        }
        
        const data = await response.json();
        console.log('[AdDetailPage] Received data:', data ? 'success' : 'empty');
        
        if (!isMounted) return;
        
        if (data && data.data) {
          setAd(data.data);
        } else if (data && data.id) {
          setAd(data);
        } else {
          throw new Error('Invalid ad data');
        }
        setLoading(false);
      } catch (err: any) {
        console.error('[AdDetailPage] Error:', err);
        if (!isMounted) return;
        
        if (err.name === 'AbortError') {
          setError('Request timed out. Please try again.');
        } else {
          setError(err.message || 'Failed to load ad');
        }
        setLoading(false);
      }
    };
    
    fetchAd();
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [slug]);

  // Auto-slide images
  useEffect(() => {
    if (!ad || !ad.images || ad.images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % ad.images.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [ad]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) { toggleLoginModal(); return; }
    if (favoriteLoading || !ad) return;
    setFavoriteLoading(true);
    setIsFavorited(!isFavorited);
    try {
      const token = getAuthToken();
      if (isFavorited) {
        await fetch(`${API_URL}/favorites/${ad.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } });
      } else {
        await fetch(`${API_URL}/favorites`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ ad_id: ad.id }) });
      }
    } catch { setIsFavorited(isFavorited); }
    setFavoriteLoading(false);
  };

  const handleWhatsApp = () => {
    if (!ad) return;
    const phone = ad.whatsapp || ad.phone;
    if (!phone) {
      toast.error('WhatsApp number not available');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Hi, I'm interested in: ${ad.title} - ${formatPrice(ad.price, ad.currency)}`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleCall = () => {
    if (!ad?.phone) return;
    window.location.href = `tel:${ad.phone}`;
  };

  const handleChat = () => {
    if (!isAuthenticated) {
      toggleLoginModal();
      return;
    }
    if (!ad?.user) {
      toast.error('Cannot start chat');
      return;
    }
    setShowChat(true);
  };

  const nextImage = () => {
    if (imagesArray.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % imagesArray.length);
    }
  };

  const prevImage = () => {
    if (imagesArray.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + imagesArray.length) % imagesArray.length);
    }
  };

  const getImageUrl = (img: any) => {
    if (!img) return null;
    const url = img.full_url || img.full_thumbnail_url || img.display_url || img.thumbnail_url || img.thumbnail || img.url || img.original_url;
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/storage/')) return `${BACKEND_URL}${url}`;
    return `${BACKEND_URL}/storage/${url}`;
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
            <div className="aspect-video max-h-[500px] bg-gray-200 rounded-xl mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );

  if (error || !ad) return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Ad Not Found</h1>
          <p className="mb-8">{error || 'This ad may have been removed.'}</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl"><Home className="w-5 h-5" />Back to Home</Link>
        </div>
      </main>
      <Footer />
    </div>
  );

  const imagesArray = Array.isArray(ad.images) ? ad.images : [];
  const currentImage = imagesArray[currentImageIndex];
  const currentImageUrl = currentImage ? getImageUrl(currentImage) : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary-600 flex items-center gap-1"><Home className="w-4 h-4" />Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/ads?category=${ad.category?.slug}`} className="hover:text-primary-600">{ad.category?.name || 'Category'}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 truncate max-w-[200px]">{ad.title}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Images & Details */}
            <div className="lg:col-span-2 space-y-px">
              {/* Image Gallery */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="relative aspect-[4/3] bg-gray-100">
                  {currentImageUrl ? (
                    <img src={currentImageUrl} alt={ad.title} className="w-full h-full object-cover" style={{ imageRendering: 'auto' }} loading="eager" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {ad.condition === 'new' && <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full">New</span>}
                    {ad.is_featured && <span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full">Featured</span>}
                  </div>

                  {/* Navigation Arrows */}
                  {imagesArray.length > 1 && (
                    <>
                      <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 p-2 rounded-full shadow-lg border border-gray-200">
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                      </button>
                      <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 p-2 rounded-full shadow-lg border border-gray-200">
                        <ArrowRight className="w-5 h-5 text-gray-700" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {imagesArray.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {imagesArray.map((img: any, idx: number) => (
                      <button
                        key={img.id || idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${currentImageIndex === idx ? 'border-primary-500' : 'border-transparent'}`}
                      >
                        <img src={getImageUrl(img) || ''} alt="" className="w-full h-full object-cover" style={{ imageRendering: 'auto' }} loading="eager" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price, Title, Description - All in One Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-[2px]">
                {/* Price */}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-3xl font-bold text-primary-600">{formatPrice(ad.price, ad.currency)}</span>
                  <div className="flex items-center gap-2">
                    <a href="/report-abuse" className="p-3 rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                      <Flag className="w-5 h-5" />
                    </a>
                    <button onClick={toggleFavorite} className={`p-3 rounded-full ${isFavorited ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500'}`}>
                      <Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{ad.title}</h1>

                {/* Description with Show More on right */}
                <div className="text-gray-600 whitespace-pre-wrap pt-2">
                  {ad.description && ad.description.length > 300 ? (
                    <>
                      <p className={showFullDescription ? '' : 'line-clamp-2'}>
                        {ad.description}
                      </p>
                      <div className="flex justify-end">
                        <button 
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center mt-2"
                        >
                          {showFullDescription ? 'Show less' : 'Show more'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <p>{ad.description || 'No description provided.'}</p>
                  )}
                </div>

                {/* Location and Views at bottom */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pt-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{ad.location?.name}</span>
                    {ad.lga && <span>, {ad.lga}</span>}
                  </div>
                  {ad.is_verified && <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" />Verified</span>}
                  <div className="flex items-center gap-1"><Eye className="w-4 h-4" /><span>{ad.views || 0} views</span></div>
                </div>

                {/* Share Section - Inline Social Icons */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-4">
                  <span className="text-sm text-gray-500">Share:</span>
                  <a 
                    href={`https://wa.me/?text=${encodeURIComponent(`Check out this "${ad.title}" - ${formatPrice(ad.price, ad.currency)}\n${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                  </a>
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                  <a 
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this "${ad.title}" - ${formatPrice(ad.price, ad.currency)}`)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                  >
                    <TwitterIcon className="w-4 h-4" />
                  </a>
                  <a 
                    href={`mailto:?subject=${encodeURIComponent(ad.title)}&body=${encodeURIComponent(`Check out this "${ad.title}" - ${formatPrice(ad.price, ad.currency)}\n${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >
                    <EmailIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Details */}
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                <h2 className="font-semibold text-gray-900 mb-4">Details</h2>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-gray-100 rounded-lg text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Category</p>
                    <p className="font-bold text-gray-900">{ad.category?.name || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Condition</p>
                    <p className="font-bold text-gray-900 capitalize">{ad.condition || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ad ID</p>
                    <p className="font-bold text-gray-900">#{ad.id}</p>
                  </div>
                </div>
              </div>

              {/* Related Ads - Full Width */}
              <div className="w-full">
                <RelatedAds currentAdId={ad.id} categoryId={ad.category?.id} />
              </div>
            </div>

            {/* Right Column - Seller & Contact - No Parent Card */}
            <div className="space-y-px">
              {/* Seller Card */}
              {ad.user && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Seller Info</h2>
                  <SellerProfileCard
                    seller={{
                      id: ad.user.id,
                      name: ad.user.name,
                      avatar: ad.user.avatar,
                      avatar_url: ad.user.avatar_url,
                      full_avatar_url: ad.user.full_avatar_url || (ad.user.avatar ? `${BACKEND_URL}/storage/${ad.user.avatar}` : null),
                      google_avatar: ad.user.google_avatar,
                      facebook_avatar: ad.user.facebook_avatar,
                      verified: ad.user.verified,
                      created_at: ad.user.created_at,
                    }}
                    showFollowButton={true}
                    showJoinedDate={true}
                  />
                </div>
              )}

              {/* Contact Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Contact Seller</h2>
                
                {ad.phone ? (
                  showPhone ? (
                    <a href={`tel:${ad.phone}`} className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 mb-3">
                      <Phone className="w-5 h-5" />{ad.phone}
                    </a>
                  ) : (
                    <button onClick={() => setShowPhone(true)} className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 mb-3">
                      <Phone className="w-5 h-5" />Show Phone Number
                    </button>
                  )
                ) : (
                  <p className="text-sm text-gray-500 mb-3 text-center">No phone number available</p>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  {(ad.phone || ad.whatsapp) ? (
                    <button onClick={handleWhatsApp} className="py-3 px-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                      <WhatsAppIcon className="w-5 h-5" />WhatsApp
                    </button>
                  ) : (
                    <button disabled className="py-3 px-3 bg-gray-300 text-gray-500 rounded-xl font-medium cursor-not-allowed flex items-center justify-center gap-2">
                      <WhatsAppIcon className="w-5 h-5" />WhatsApp
                    </button>
                  )}
                  <button onClick={handleChat} className="py-3 px-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />Chat
                  </button>
                </div>

              </div>

              {/* Latest Reviews - Separate Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <LatestReviews adId={ad.id} adSlug={ad.slug} />
              </div>

              {/* Safety Tips */}
              <div className="bg-blue-50 rounded-2xl p-6">
                <h3 className="font-semibold text-blue-900 mb-2">Safety Tips</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Meet in public places</li>
                  <li>Don&apos;t send payments in advance</li>
                  <li>• Check item before paying</li>
                  <li>• Report suspicious sellers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Chat Modal */}
      <DynamicChatModal
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        adId={ad.id}
        adTitle={ad.title}
        sellerId={ad.user?.id || 0}
        sellerName={ad.user?.name || 'Seller'}
      />
    </div>
  );
}
