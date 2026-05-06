'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface CloudinaryImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  containerClassName?: string;
  crop?: 'fill' | 'crop' | 'scale' | 'fit' | 'pad';
  gravity?: 'auto' | 'face' | 'center' | 'faces' | 'north' | 'south' | 'east' | 'west';
  quality?: number | 'auto';
  responsive?: boolean;
  breakpoints?: number[];
  placeholder?: 'blur' | 'empty' | 'default';
  blurDataUrl?: string;
  loading?: 'eager' | 'lazy';
  sizes?: string;
  priority?: boolean;
  fallbackUrl?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  rounded?: boolean | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: boolean;
  onClick?: () => void;
  onError?: () => void;
}

const DEFAULT_BREAKPOINTS = [320, 640, 768, 1024, 1280, 1600];

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dcklcvihq';

const PLACEHOLDER_IMAGES: Record<string, string> = {
  default: `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_800,h_600,c_fill,g_auto,q_auto,f_auto/v1/placeholder/default`,
  avatar: `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_200,h_200,c_fill,g_face,q_auto,f_auto/v1/placeholder/avatar`,
  banner: `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_1200,h_400,c_fill,g_auto,q_auto,f_auto/v1/placeholder/banner`,
  thumbnail: `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_300,h_300,c_fill,g_auto,q_auto,f_auto/v1/placeholder/thumbnail`,
};

export default function CloudinaryImage({
  publicId,
  alt,
  width,
  height,
  fill = false,
  className = '',
  containerClassName = '',
  crop = 'fill',
  gravity = 'auto',
  quality = 'auto',
  responsive = true,
  breakpoints = DEFAULT_BREAKPOINTS,
  placeholder = 'blur',
  blurDataUrl,
  loading = 'lazy',
  sizes,
  priority = false,
  fallbackUrl,
  objectFit = 'cover',
  rounded = false,
  shadow = false,
  onClick,
  onError,
}: CloudinaryImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [inView, setInView] = useState(!responsive || priority);
  const containerRef = useRef<HTMLDivElement>(null);

  const getTransformations = (): string => {
    const parts: string[] = [];

    if (width && !fill) parts.push(`w_${width}`);
    if (height && !fill) parts.push(`h_${height}`);
    if (crop) parts.push(`c_${crop}`);
    if (gravity) parts.push(`g_${gravity}`);
    parts.push(`q_${quality}`);
    parts.push('f_auto');

    return parts.join(',');
  };

  const getSrc = (): string => {
    if (!publicId) {
      return fallbackUrl || PLACEHOLDER_IMAGES.default;
    }

    if (imageError) {
      return fallbackUrl || PLACEHOLDER_IMAGES.default;
    }

    const transformations = getTransformations();
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
  };

  const getSrcSet = (): string => {
    if (!publicId || imageError) return '';

    const transformations = getTransformations();
    const effectiveBreakpoints = fill
      ? breakpoints.filter((bp) => bp <= 1600)
      : breakpoints.filter((bp) => bp <= (width || 800));

    return effectiveBreakpoints
      .map((bp) => {
        const bpTransformations = transformations.replace(/w_\d+/, `w_${bp}`);
        return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${bpTransformations}/${publicId} ${bp}w`;
      })
      .join(', ');
  };

  const getDefaultSizes = (): string => {
    if (sizes) return sizes;
    if (fill) return '100vw';
    if (width && width <= 640) return `${width}px`;
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  };

  const getBlurUrl = (): string => {
    if (!publicId || imageError) return '';
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_50,e_blur:500,q_1,f_auto/${publicId}`;
  };

  const getRoundedClass = (): string => {
    if (!rounded) return '';
    if (rounded === true) return 'rounded-xl';
    return `rounded-${rounded}`;
  };

  useEffect(() => {
    if (!responsive || priority || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [responsive, priority]);

  const handleLoad = () => {
    setImageLoaded(true);
  };

  const handleError = () => {
    setImageError(true);
    setImageLoaded(true);
    onError?.();
  };

  const containerClasses = [
    'relative overflow-hidden',
    getRoundedClass(),
    shadow ? 'shadow-lg' : '',
    containerClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const imageClasses = [
    'transition-opacity duration-300',
    imageLoaded ? 'opacity-100' : 'opacity-0',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (!publicId && !fallbackUrl) {
    return (
      <div className={containerClasses}>
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      </div>
    );
  }

  const src = getSrc();

  return (
    <div ref={containerRef} className={containerClasses} onClick={onClick}>
      {inView ? (
        <>
          {placeholder === 'blur' && !imageLoaded && !imageError && (
            <Image
              src={blurDataUrl || getBlurUrl()}
              alt=""
              fill={fill}
              width={width || 40}
              height={height || 40}
              className="absolute inset-0 blur-xl scale-110 transition-opacity duration-300"
              style={{ objectFit }}
              aria-hidden="true"
            />
          )}

          <Image
            src={src}
            alt={alt}
            fill={fill}
            width={width}
            height={height}
            className={imageClasses}
            style={{ objectFit }}
            sizes={getDefaultSizes()}
            srcSet={responsive && !fill ? getSrcSet() : undefined}
            loading={priority ? 'eager' : loading}
            priority={priority}
            onLoad={handleLoad}
            onError={handleError}
          />
        </>
      ) : (
        <div className="w-full h-full bg-gray-100" />
      )}
    </div>
  );
}

export function CloudinaryAvatar({
  publicId,
  alt = 'User avatar',
  size = 40,
  className = '',
  ...props
}: {
  publicId: string;
  alt?: string;
  size?: number;
  className?: string;
  [key: string]: any;
}) {
  return (
    <CloudinaryImage
      publicId={publicId}
      alt={alt}
      width={size}
      height={size}
      crop="fill"
      gravity="face"
      quality={80}
      responsive={false}
      placeholder="blur"
      fallbackUrl={PLACEHOLDER_IMAGES.avatar}
      rounded="full"
      className={className}
      {...props}
    />
  );
}

export function CloudinaryBanner({
  publicId,
  alt = 'Banner',
  className = '',
  ...props
}: {
  publicId: string;
  alt?: string;
  className?: string;
  [key: string]: any;
}) {
  return (
    <CloudinaryImage
      publicId={publicId}
      alt={alt}
      width={1200}
      height={400}
      crop="fill"
      gravity="auto"
      quality="auto"
      responsive
      breakpoints={[640, 768, 1024, 1200]}
      placeholder="blur"
      fallbackUrl={PLACEHOLDER_IMAGES.banner}
      rounded="lg"
      className={className}
      {...props}
    />
  );
}

export function CloudinaryThumbnail({
  publicId,
  alt = 'Thumbnail',
  size = 300,
  className = '',
  ...props
}: {
  publicId: string;
  alt?: string;
  size?: number;
  className?: string;
  [key: string]: any;
}) {
  return (
    <CloudinaryImage
      publicId={publicId}
      alt={alt}
      width={size}
      height={size}
      crop="fill"
      gravity="auto"
      quality={80}
      responsive={false}
      placeholder="blur"
      fallbackUrl={PLACEHOLDER_IMAGES.thumbnail}
      rounded="md"
      className={className}
      {...props}
    />
  );
}
