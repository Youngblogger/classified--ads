'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/home/Header';
import Footer from '@/components/layout/Footer';
import SellerProfileCard from '@/components/ui/SellerProfileCard';
import RelatedAds from '@/components/ads/RelatedAds';
import LatestReviews from '@/components/reviews/LatestReviews';
import { DynamicShareModal } from '@/lib/dynamicImports';
import { useAuthStore, useUIStore } from '@/lib/store';
import { Heart, Share2, MapPin, Eye, Phone, ChevronRight, CheckCircle, MessageCircle, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { formatPrice, formatRelativeTime, getAdImageUrl, BACKEND_URL } from '@/lib/utils';
import { getAuthToken } from '@/lib/cookies';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.218 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function AdDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { toggleLoginModal } = useUIStore();

  useEffect(() => {
    let isMounted = true;
    
    const fetchAd = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_URL}/ads/${slug}?_t=${Date.now()}`, { 
          headers: { 
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
          cache: 'no-store',
        });
        
        console.log('Response status:', response.status);
        if (!response.ok) throw new Error('Ad not found');
        const data = await response.json();
        console.log('Raw API response:', data);
        if (isMounted) {
          const adData = data.data || data;
          console.log('Ad data:', adData);
          setAd(adData);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error fetching ad:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load ad');
          setLoading(false);
        }
      }
    };
    
    fetchAd();
    
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout - forcing to stop loading');
        setLoading(false);
        setError('Request timed out. Please try again.');
      }
    }, 15000);
    
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [slug]);

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

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
            <div className="aspect-square max-h-96 bg-gray-200 rounded-xl mb-6"></div>
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
        <div className="max-w-5xl mx-auto text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Ad Not Found</h1>
          <p className="mb-8">{error || 'This ad may have been removed.'}</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl"><Home className="w-5 h-5" />Back to Home</Link>
        </div>
      </main>
      <Footer />
    </div>
  );

  const imagesArray = Array.isArray(ad.images) ? ad.images : [];
  const primaryImage = imagesArray.find((img: any) => img?.is_primary) || imagesArray[0];
  const getImageUrl = (img: any) => {
    if (!img) return null;
    const url = img.full_url || img.full_thumbnail_url || img.display_url || img.thumbnail_url || img.thumbnail || img.url || img.original_url;
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/storage/')) return `${BACKEND_URL}${url}`;
    return `${BACKEND_URL}/storage/${url}`;
  };
  const imageUrl = primaryImage ? getImageUrl(primaryImage) : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/ads?category=${ad.category?.slug}`} className="hover:text-primary-600">{ad.category?.name}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 truncate">{ad.title}</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative bg-gray-100 aspect-square md:aspect-auto min-h-[300px]">
                {imageUrl ? (
                  <img src={imageUrl} alt={ad.title} className="w-full h-full object-contain md:object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  {ad.condition === 'new' && <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full">New</span>}
                  {ad.is_featured && <span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full">Featured</span>}
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{ad.title}</h1>
                    <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{ad.location?.name}</span>
                    </div>
                  </div>
                  <button onClick={toggleFavorite} className={`p-2 rounded-full ${isFavorited ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500'}`}>
                    <Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="mt-4">
                  <span className="text-3xl font-bold text-primary-600">{formatPrice(ad.price, ad.currency)}</span>
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1"><Eye className="w-4 h-4" /><span>{ad.views || 0} views</span></div>
                  <div className="flex items-center gap-1"><span>{formatRelativeTime(ad.created_at)}</span></div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h2 className="font-semibold text-gray-900 mb-3">Contact Seller</h2>
                  {ad.phone && <a href={`tel:${ad.phone}`} className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"><Phone className="w-5 h-5" />{ad.phone}</a>}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <button className="py-3 px-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"><WhatsAppIcon className="w-5 h-5" />WhatsApp</button>
                    <button onClick={() => !isAuthenticated ? toggleLoginModal() : setShowChat(true)} className="py-3 px-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"><MessageCircle className="w-5 h-5" />Chat</button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button onClick={() => setShowShareModal(true)} className="w-full py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"><Share2 className="w-5 h-5" />Share Ad</button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{ad.description}</p>
          </div>

          <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><p className="text-sm text-gray-500">Category</p><p className="font-medium">{ad.category?.name}</p></div>
              <div><p className="text-sm text-gray-500">Location</p><p className="font-medium">{ad.location?.name}</p></div>
              <div><p className="text-sm text-gray-500">Condition</p><p className="font-medium capitalize">{ad.condition || 'N/A'}</p></div>
              <div><p className="text-sm text-gray-500">Posted</p><p className="font-medium">{formatRelativeTime(ad.created_at)}</p></div>
              <div><p className="text-sm text-gray-500">Ad ID</p><p className="font-medium">#{ad.id}</p></div>
            </div>
          </div>

          {ad.user && (
            <div className="mt-6">
              <h2 className="font-semibold text-gray-900 mb-4">Seller</h2>
              <SellerProfileCard
                seller={{
                  id: ad.user.id,
                  name: ad.user.name,
                  avatar: ad.user.avatar,
                  avatar_url: ad.user.avatar_url,
                  full_avatar_url: ad.user.full_avatar_url,
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

          <div className="mt-6">
            <LatestReviews adId={ad.id} adSlug={ad.slug} />
          </div>

          <div className="mt-6">
            <RelatedAds currentAdId={ad.id} categoryId={ad.category?.id} />
          </div>
        </div>
      </main>
      <Footer />
      <DynamicShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={ad.title}
        price={formatPrice(ad.price, ad.currency)}
      />
    </div>
  );
}
