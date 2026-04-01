import React, { useState, useRef, useEffect } from 'react';
import { Leaf } from 'lucide-react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
}

// Deterministic color from string for consistent fallback gradients
const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const GRADIENT_PAIRS = [
  ['#22c55e', '#16a34a'],
  ['#059669', '#047857'],
  ['#10b981', '#0d9488'],
  ['#15803d', '#166534'],
  ['#4ade80', '#22c55e'],
];

/** Optimize Unsplash URLs: compress quality, enforce format & dimensions */
const optimizeImageUrl = (url: string, w = 800, q = 75): string => {
  if (!url) return url;
  if (url.includes('images.unsplash.com')) {
    const base = url.split('?')[0];
    return `${base}?auto=format&fit=crop&w=${w}&q=${q}`;
  }
  return url;
};

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width = 800,
  height = 400,
  placeholder = '/placeholder.svg',
  onLoad,
  onError,
  loading = 'lazy',
  fetchPriority = 'auto',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isVisible, setIsVisible] = useState(loading === 'eager');
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading === 'eager') return;
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  const optimizedSrc = optimizeImageUrl(src);
  const numWidth = typeof width === 'string' ? parseInt(width, 10) || 800 : width;
  const numHeight = typeof height === 'string' ? parseInt(height, 10) || 400 : height;

  // Fallback: nice gradient with lawn icon
  if (isError || !src || src === '/placeholder.svg') {
    const hash = hashString(alt || 'lawn');
    const pair = GRADIENT_PAIRS[hash % GRADIENT_PAIRS.length];
    return (
      <div
        ref={imgRef}
        className={`relative flex items-center justify-center ${className}`}
        style={{
          width: width || '100%',
          height: height || '200px',
          background: `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`,
          aspectRatio: `${numWidth}/${numHeight}`,
        }}
      >
        <div className="flex flex-col items-center gap-2 text-white/80">
          <Leaf className="h-10 w-10" />
          <span className="text-xs font-medium px-3 text-center line-clamp-2 max-w-[200px]">{alt}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={`relative ${className}`}
      style={{
        width: width || '100%',
        height: height || 'auto',
        aspectRatio: `${numWidth}/${numHeight}`,
      }}
    >
      {/* Loading placeholder */}
      {!isLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded"
          style={{
            background: `linear-gradient(135deg, ${GRADIENT_PAIRS[hashString(alt || '') % GRADIENT_PAIRS.length][0]}40, ${GRADIENT_PAIRS[hashString(alt || '') % GRADIENT_PAIRS.length][1]}40)`,
          }}
        >
          <Leaf className="h-8 w-8 text-primary/40 animate-pulse" />
        </div>
      )}

      {/* Actual image — only load when visible */}
      {isVisible && (
        <img
          src={optimizedSrc}
          alt={alt}
          width={numWidth}
          height={numHeight}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          style={{
            width: width || '100%',
            height: height || 'auto',
          }}
        />
      )}
    </div>
  );
};

export default LazyImage;