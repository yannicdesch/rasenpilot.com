import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

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

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Placeholder/Loading state */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center rounded">
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
      )}
      
      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded border border-gray-300">
          <div className="text-center text-gray-500">
            <div className="text-sm">Bild konnte nicht geladen werden</div>
          </div>
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