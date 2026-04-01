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
  ['#22c55e', '#16a34a'], // green
  ['#059669', '#047857'], // emerald
  ['#10b981', '#0d9488'], // teal-green
  ['#15803d', '#166534'], // dark green
  ['#4ade80', '#22c55e'], // light green
];

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder = '/placeholder.svg',
  onLoad,
  onError,
  loading = 'lazy'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  const shouldLoad = loading === 'eager' || isVisible;

  // Fallback: nice gradient with lawn icon based on alt text
  if (isError || !src || src === '/placeholder.svg') {
    const hash = hashString(alt || 'lawn');
    const pair = GRADIENT_PAIRS[hash % GRADIENT_PAIRS.length];
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{
          width: width || '100%',
          height: height || '200px',
          background: `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`,
        }}
      >
        <div className="flex flex-col items-center gap-2 text-white/80">
          <Leaf className="h-10 w-10" />
          <span className="text-xs font-medium px-3 text-center line-clamp-2 max-w-[200px]">{alt}</span>
        </div>
        {/* Hidden img to trigger observer */}
        <img ref={imgRef} className="hidden" alt={alt} />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Loading state */}
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
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={shouldLoad ? src : placeholder}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        loading={loading}
        decoding="async"
        style={{
          width: width || '100%',
          height: height || 'auto'
        }}
      />
    </div>
  );
};

export default LazyImage;