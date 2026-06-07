'use client';

import React, { useState, useEffect } from 'react';

interface BookCoverImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function BookCoverImage({ src, alt, className }: BookCoverImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setFallbackAttempted(false);
  }, [src]);

  const handleError = async () => {
    if (fallbackAttempted) return;
    setFallbackAttempted(true);

    try {
      // Split by colon to search only the primary title for better matches
      const cleanTitle = alt.split(':')[0].split('&')[0].trim();
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(cleanTitle)}&limit=1`
      );
      const data = await response.json();
      
      if (data.docs && data.docs.length > 0 && data.docs[0].cover_i) {
        const coverId = data.docs[0].cover_i;
        setCurrentSrc(`https://covers.openlibrary.org/b/id/${coverId}-L.jpg`);
      } else {
        // Fallback to high-quality generic book mockup
        setCurrentSrc('https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80');
      }
    } catch (err) {
      console.error('Failed to resolve fallback cover from Open Library:', err);
      setCurrentSrc('https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80');
    }
  };

  return (
    <img
      src={currentSrc || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80'}
      alt={alt}
      onError={handleError}
      className={className}
    />
  );
}
