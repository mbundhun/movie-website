/**
 * Utility for lazy loading images
 * Returns a placeholder image URL or the actual image URL
 */
export const getImageUrl = (url, placeholder = null) => {
  if (!url) return placeholder || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300"%3E%3Crect fill="%23e0e0e0" width="200" height="300"/%3E%3C/svg%3E';
  return url;
};

/**
 * Preload an image
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Lazy load image component helper
 */
export const useImageLoader = (src) => {
  const [imageSrc, setImageSrc] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (!src) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };
    img.src = src;
  }, [src]);

  return { imageSrc, isLoading, hasError };
};

