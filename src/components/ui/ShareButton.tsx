import { useState } from 'react';
import { Share2, Copy, Check, MessageCircle, Facebook } from 'lucide-react';

interface ShareButtonProps {
  adId: number;
  adSlug: string;
  adTitle: string;
  adPrice?: string;
  adCurrency?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button' | 'dropdown';
  onShare?: () => void;
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

export default function ShareButton({
  adId,
  adSlug,
  adTitle,
  adPrice,
  adCurrency = '$',
  className = '',
  size = 'md',
  variant = 'icon',
  onShare,
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShareLink = async () => {
    if (shareUrl) return shareUrl;

    setLoading(true);
    setError(null);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiBaseUrl}/ads/${adId}/share-link`);

      if (!response.ok) {
        throw new Error('Failed to generate share link');
      }

      const data = await response.json();
      setShareUrl(data.data.url);
      return data.data.url;
    } catch (err) {
      const fallbackUrl = `${window.location.origin}/ads/${adSlug}`;
      setShareUrl(fallbackUrl);
      setError(null);
      return fallbackUrl;
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const url = await fetchShareLink();

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement('input');
        input.setAttribute('value', url);
        input.style.position = 'absolute';
        input.style.left = '-9999px';
        document.body.appendChild(input);
        input.focus();
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare?.();
    } catch {
      setError('Failed to copy link');
    }
  };

  const handleWhatsAppShare = async () => {
    const url = await fetchShareLink();
    const priceText = adPrice ? `${adCurrency}${adPrice}` : '';
    const text = `Check out "${adTitle}" ${priceText ? `for ${priceText}` : ''}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`;
    window.open(whatsappUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
    onShare?.();
  };

  const handleFacebookShare = async () => {
    const url = await fetchShareLink();
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
    onShare?.();
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleToggle}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 font-medium ${className}`}
      >
        <Share2 className="w-4 h-4" />
        Share
        {loading && <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />}
      </button>
    );
  }

  if (variant === 'dropdown' || isOpen) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={handleToggle}
          className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600`}
          title="Share this ad"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-3 min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-1">
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-green-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <WhatsAppIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">WhatsApp</p>
                    <p className="text-xs text-gray-500">Share via WhatsApp</p>
                  </div>
                </button>

                <button
                  onClick={handleFacebookShare}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Facebook className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Facebook</p>
                    <p className="text-xs text-gray-500">Share on Facebook</p>
                  </div>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    {copied ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {copied ? 'Copied!' : 'Copy Link'}
                    </p>
                    <p className="text-xs text-gray-500">Copy shareable link</p>
                  </div>
                </button>
              </div>

              {error && (
                <p className="mt-2 text-xs text-red-500 text-center">{error}</p>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 ${className}`}
      title="Share this ad"
    >
      <Share2 className="w-4 h-4" />
    </button>
  );
}
