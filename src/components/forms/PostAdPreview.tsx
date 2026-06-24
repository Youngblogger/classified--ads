'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  ChevronLeft, ChevronRight, MapPin, Clock, Eye, Heart, Share2,
  Shield, CheckCircle, AlertTriangle, MessageCircle, Phone, Loader2,
  ChevronDown, ChevronUp, Tag, X
} from 'lucide-react';
import { formatPrice, FALLBACK_IMAGE } from '@/lib/utils';
import AdSpecifications from '@/components/ads/AdSpecifications';
import type { SpecField } from '@/config/category-fields';

interface ImageFile {
  id: string;
  preview: string;
  uploadedUrl?: string;
  status: string;
}

interface PostAdPreviewProps {
  title: string;
  description: string;
  price: string;
  negotiable: boolean;
  condition: string;
  locationBreadcrumb: string;
  categoryBreadcrumb: string;
  images: ImageFile[];
  phone: string;
  whatsapp: string;
  specFields: SpecField[];
  specValues: Record<string, any>;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

const conditionLabels: Record<string, string> = {
  new: 'New',
  good: 'Used',
  fair: 'Refurbished',
};

function getConditionBadge(condition: string): { label: string; className: string } {
  const c = condition.toLowerCase();
  if (c === 'new' || c === 'brand_new') return { label: 'New', className: 'bg-green-50 text-green-700  ' };
  if (c === 'like_new' || c === 'like new') return { label: 'Like New', className: 'bg-blue-50 text-blue-700  ' };
  if (c === 'good') return { label: 'Used', className: 'bg-amber-50 text-amber-700  ' };
  if (c === 'fair') return { label: 'Refurbished', className: 'bg-yellow-50 text-yellow-800  ' };
  return { label: c, className: 'bg-gray-50 text-gray-600  ' };
}

function buildSpecItems(fields: SpecField[], values: Record<string, any>) {
  return fields
    .filter(f => values[f.name] !== undefined && values[f.name] !== '' && values[f.name] !== null)
    .map(f => ({
      name: f.name,
      label: f.label,
      value: f.type === 'boolean' ? (values[f.name] ? 'Yes' : 'No') : String(values[f.name]),
      raw_value: values[f.name],
      type: f.type,
      options: f.options || [],
      group_name: f.group_name || null,
      sort_order: 0,
    }));
}

function formatPhoneDisplay(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11 && clean.startsWith('0')) {
    const n = '234' + clean.slice(1);
    return `+234 ${n.slice(3, 6)} ${n.slice(6, 9)} ${n.slice(9)}`;
  }
  if (clean.length >= 10) {
    const n = clean.length > 10 ? clean.slice(-10) : clean;
    return `+234 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
  }
  return phone;
}

export default function PostAdPreview({
  title, description, price, negotiable, condition, locationBreadcrumb,
  categoryBreadcrumb, images, phone, whatsapp, specFields, specValues,
  isSubmitting, onSubmit, onBack,
}: PostAdPreviewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAllDesc, setShowAllDesc] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const touchStartX = useRef(0);
  const descRef = useRef<HTMLDivElement>(null);
  const [descOverflow, setDescOverflow] = useState(false);

  useEffect(() => {
    if (descRef.current) {
      setDescOverflow(descRef.current.scrollHeight > descRef.current.clientHeight);
    }
  }, [description]);

  const previewImages = useMemo(() => {
    if (images.length === 0) return [{ id: 'fallback', preview: FALLBACK_IMAGE, status: 'completed' }];
    return images.filter(i => i.status === 'completed' || i.status === 'uploading').slice(0, 5);
  }, [images]);

  const handlePrev = useCallback(() => {
    setActiveIndex(prev => (prev === 0 ? previewImages.length - 1 : prev - 1));
  }, [previewImages.length]);

  const handleNext = useCallback(() => {
    setActiveIndex(prev => (prev === previewImages.length - 1 ? 0 : prev + 1));
  }, [previewImages.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
  };

  const priceNum = parseFloat(price) || 0;

  const specItems = useMemo(() => buildSpecItems(specFields, specValues), [specFields, specValues]);

  const previewUrl = previewImages[activeIndex]?.preview || FALLBACK_IMAGE;

  return (
    <div className="space-y-0">
      {/* Image Gallery Carousel */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-6">
        <div
          className="relative aspect-[4/3] sm:aspect-[21/9] bg-gray-100  overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={previewUrl}
            alt={title || 'Ad preview'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1000px"
            className="object-cover"
            priority
            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
          />

          {activeIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {activeIndex < previewImages.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {previewImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex ? 'bg-white w-5' : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className="w-9 h-9 rounded-full bg-white/90  flex items-center justify-center hover:bg-white  transition-all shadow-sm backdrop-blur-sm"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600 '}`} />
            </button>
            <button className="w-9 h-9 rounded-full bg-white/90  flex items-center justify-center hover:bg-white  transition-all shadow-sm backdrop-blur-sm">
              <Share2 className="w-4 h-4 text-gray-600 " />
            </button>
          </div>

          {previewImages.length > 1 && (
            <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-lg backdrop-blur-sm">
              {activeIndex + 1}/{previewImages.length}
            </div>
          )}
        </div>

        {previewImages.length > 1 && (
          <div className="flex gap-2 px-4 sm:px-6 lg:px-8 mt-2 overflow-x-auto pb-2">
            {previewImages.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveIndex(i)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                  i === activeIndex ? 'border-primary-500 ring-2 ring-primary-200' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={img.preview}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-0 sm:px-2 space-y-6 pb-32 sm:pb-6">
        {/* Price & Title */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900  leading-tight">
                {title || 'Untitled Ad'}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getConditionBadge(condition).className}`}>
                  <Tag className="w-3 h-3" />
                  {conditionLabels[condition] || condition}
                </span>
                {categoryBreadcrumb && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50  text-primary-700 ">
                    {categoryBreadcrumb}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-gray-900 ">
              ₦{price ? Number(price).toLocaleString() : '0'}
            </span>
            {negotiable && (
              <span className="text-xs font-semibold bg-green-50  text-green-700  px-2 py-0.5 rounded-full border border-green-200 ">
                Negotiable
              </span>
            )}
          </div>
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-50  rounded-xl p-3 border border-gray-100 ">
            <div className="flex items-center gap-2 text-gray-400  text-xs font-medium mb-1">
              <MapPin className="w-3.5 h-3.5" />
              Location
            </div>
            <p className="text-sm font-semibold text-gray-900  truncate">
              {locationBreadcrumb || 'Not specified'}
            </p>
          </div>
          <div className="bg-gray-50  rounded-xl p-3 border border-gray-100 ">
            <div className="flex items-center gap-2 text-gray-400  text-xs font-medium mb-1">
              <Tag className="w-3.5 h-3.5" />
              Category
            </div>
            <p className="text-sm font-semibold text-gray-900  truncate">
              {categoryBreadcrumb || 'Not specified'}
            </p>
          </div>
          <div className="bg-gray-50  rounded-xl p-3 border border-gray-100 ">
            <div className="flex items-center gap-2 text-gray-400  text-xs font-medium mb-1">
              <Eye className="w-3.5 h-3.5" />
              Views
            </div>
            <p className="text-sm font-semibold text-gray-900 ">
              Just posted
            </p>
          </div>
          <div className="bg-gray-50  rounded-xl p-3 border border-gray-100 ">
            <div className="flex items-center gap-2 text-gray-400  text-xs font-medium mb-1">
              <Clock className="w-3.5 h-3.5" />
              Posted
            </div>
            <p className="text-sm font-semibold text-gray-900 ">
              Just now
            </p>
          </div>
        </div>

        {/* Specifications */}
        {specItems.length > 0 && (
          <AdSpecifications specifications={specItems} />
        )}

        {/* Description */}
        {description && (
          <div className="bg-white  rounded-xl border border-gray-200  overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100 ">
              <h3 className="text-sm font-bold text-gray-900 ">Description</h3>
            </div>
            <div className="px-4 py-3">
              <div
                ref={descRef}
                className={`text-sm text-gray-600  leading-relaxed whitespace-pre-wrap ${
                  showAllDesc ? '' : 'line-clamp-4'
                }`}
              >
                {description}
              </div>
              {descOverflow && (
                <button
                  onClick={() => setShowAllDesc(!showAllDesc)}
                  className="mt-2 text-sm font-semibold text-primary-600  hover:text-primary-700  flex items-center gap-1"
                >
                  {showAllDesc ? (
                    <>Show less <ChevronUp className="w-3.5 h-3.5" /></>
                  ) : (
                    <>Read more <ChevronDown className="w-3.5 h-3.5" /></>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Seller Card */}
        <div className="bg-white  rounded-xl border border-gray-200  overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 ">
            <h3 className="text-sm font-bold text-gray-900 ">Seller Information</h3>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
                U
              </div>
              <div>
                <p className="font-semibold text-gray-900 ">You</p>
                <p className="text-xs text-gray-500 ">Verified Seller</p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50  text-green-700  rounded-full text-xs font-semibold">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-3 w-full px-4 py-2.5 bg-primary-50  text-primary-700  rounded-xl hover:bg-primary-100  transition-colors font-semibold text-sm"
                >
                  <Phone className="w-4 h-4" />
                  {formatPhoneDisplay(phone)}
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-4 py-2.5 bg-green-50  text-green-700  rounded-xl hover:bg-green-100  transition-colors font-semibold text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  {formatPhoneDisplay(whatsapp)}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Trust & Safety */}
        <div className="bg-white  rounded-xl border border-gray-200  overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 ">
            <h3 className="text-sm font-bold text-gray-900 ">Safety Tips</h3>
          </div>
          <div className="p-4 space-y-3">
            {[
              { icon: Shield, text: 'Meet in a safe public place for inspection', color: 'text-blue-500' },
              { icon: AlertTriangle, text: 'Never pay in advance for any item', color: 'text-amber-500' },
              { icon: CheckCircle, text: 'Verify the item condition before purchasing', color: 'text-green-500' },
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <tip.icon className={`w-4 h-4 ${tip.color} mt-0.5 flex-shrink-0`} />
                <p className="text-xs text-gray-500 ">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Mobile Publish Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white  border-t border-gray-200  p-4 sm:hidden z-40 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-black text-gray-900 ">
              ₦{price ? Number(price).toLocaleString() : '0'}
            </span>
            {negotiable && <span className="text-xs text-green-600  ml-2 font-semibold">Negotiable</span>}
          </div>
          <button
            onClick={onBack}
            className="text-sm text-gray-500  font-medium hover:text-gray-700  transition-colors"
          >
            Edit
          </button>
        </div>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              Publish Ad
            </>
          )}
        </button>
      </div>

      {/* Desktop Publish Button */}
      <div className="hidden sm:flex items-center justify-between pt-6 border-t border-gray-200  mt-6">
        <button
          onClick={onBack}
          className="px-5 py-2.5 border-2 border-gray-200  text-gray-600  rounded-xl text-sm font-semibold hover:border-primary-300  hover:text-primary-600  transition-all flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Edit Details
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2 shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              Publish Ad
              <CheckCircle className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

