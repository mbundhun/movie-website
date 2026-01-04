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
 * Note: This requires React to be imported when used in components
 */
export const useImageLoader = (src) => {
  // This is a utility function that should be used with React hooks
  // Import React and useState, useEffect in the component that uses this
  // Example usage in a component:
  // import React, { useState, useEffect } from 'react';
  // import { useImageLoader } from '../utils/imageLoader';
  // const { imageSrc, isLoading, hasError } = useImageLoader(imageUrl);
  
  // For now, we'll use native browser lazy loading via loading="lazy" attribute
  // which is more performant and doesn't require additional JavaScript
  return { imageSrc: src, isLoading: false, hasError: false };
};

