'use client';

import { useState, useCallback, memo } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  containerClassName?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  onLoad?: () => void;
  objectFit?: 'cover' | 'contain' | 'fill';
}

const FALLBACK_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23e2e8f0' width='400' height='300'/%3E%3Ctext x='200' y='150' font-family='Arial' font-size='16' fill='%2394a3b8' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E`;

const BLUR_DATA_URL = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='30' viewBox='0 0 40 30'%3E%3Crect fill='%23e2e8f0' width='40' height='30'/%3E%3C/svg%3E`;

function SafeImageComponent({
  src,
  alt,
  className = '',
  fallback,
  containerClassName = '',
  width,
  height,
  aspectRatio,
  loading = 'lazy',
  priority = false,
  onLoad,
  objectFit = 'cover',
}: SafeImageProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleError = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[DIAG] [IMG_FAIL]', { src: src?.slice(0, 120), alt, fallback });
    }
    setImgError(true);
  }, [src, alt, fallback]);

  const handleLoad = useCallback(() => {
    setImgLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const imageSrc = imgError ? (fallback || FALLBACK_SVG) : (src || FALLBACK_SVG);
  const showBlur = !imgLoaded && !imgError;

  const aspectStyle = aspectRatio ? { aspectRatio } :
    (width && height ? { aspectRatio: `${width} / ${height}` } : undefined);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`} style={aspectStyle}>
      {showBlur && (
        <img
          src={BLUR_DATA_URL}
          alt=""
          className={`absolute inset-0 w-full h-full ${objectFit === 'cover' ? 'object-cover' : objectFit === 'contain' ? 'object-contain' : 'object-fill'}`}
          aria-hidden="true"
        />
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'} ${objectFit === 'cover' ? 'object-cover' : objectFit === 'contain' ? 'object-contain' : 'object-fill'}`}
        loading={priority ? 'eager' : loading}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
}

export const SafeImage = memo(SafeImageComponent);
