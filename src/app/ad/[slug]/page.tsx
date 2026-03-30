'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/home/Header';
import Footer from '@/components/layout/Footer';
import SellerProfileCard from '@/components/ui/SellerProfileCard';
import RelatedAds from '@/components/ads/RelatedAds';
import LatestReviews from '@/components/reviews/LatestReviews';
import { DynamicShareModal, DynamicChatModal } from '@/lib/dynamicImports';
import { useAuthStore, useUIStore } from '@/lib/store';
import { Heart, Share2, MapPin, Eye, Phone, ChevronRight, MessageCircle, Home, Clock, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice, formatRelativeTime, BACKEND_URL } from '@/lib/utils';
import { getAuthToken } from '@/lib/cookies';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.218 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
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
  const [showShareModal, setShowShareModal] = useState(false);
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
                      <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg">
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg">
                        <ArrowRight className="w-5 h-5" />
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
                  <button onClick={toggleFavorite} className={`p-3 rounded-full ${isFavorited ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500'}`}>
                    <Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{ad.title}</h1>

                {/* Description with Show More on right */}
                <div className="text-gray-600 whitespace-pre-wrap pt-2">
                  {ad.description && ad.description.length > 300 ? (
                    <>
                      <p className={showFullDescription ? '' : 'line-clamp-3'}>
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
              </div>

              {/* Details */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{ad.category?.name || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Condition</p>
                    <p className="font-medium capitalize">{ad.condition || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Ad ID</p>
                    <p className="font-medium">#{ad.id}</p>
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
                <button onClick={() => setShowShareModal(true)} className="w-full mt-3 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-5 h-5" />Share Ad
                </button>
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

      {/* Share Modal */}
      <DynamicShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={ad.title}
        price={formatPrice(ad.price, ad.currency)}
      />

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
