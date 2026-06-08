'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BookDetailOverlay, { BookDetailData } from '@/components/BookDetailOverlay';
import BookCoverImage from '@/components/BookCoverImage';
import * as api from '@/lib/api';
import { Book } from '@/types';

// Global cache for resolving and keeping author names to optimize API requests
const authorCache: { [id: string]: string } = {};

const resolveAuthorName = async (authorId: string, bookTitle?: string): Promise<string> => {
  if (!authorId) return 'Unknown Author';
  if (authorCache[authorId]) return authorCache[authorId];
  try {
    const res = await api.getAuthorById(authorId);
    if (res.success && res.data) {
      authorCache[authorId] = res.data.name;
      return res.data.name;
    }
  } catch (err) {
    console.error(`Failed to fetch author: ${authorId}`, err);
  }

  // Fallback: search Open Library using the book's title if database record is missing
  if (bookTitle) {
    try {
      const cleanTitle = bookTitle.split(':')[0].split('&')[0].trim();
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(cleanTitle)}&limit=1`);
      const data = await response.json();
      if (data.docs && data.docs.length > 0 && data.docs[0].author_name) {
        const authorName = data.docs[0].author_name[0];
        authorCache[authorId] = authorName;
        return authorName;
      }
    } catch (err) {
      console.error('Failed to resolve author name fallback from Open Library:', err);
    }
  }

  return 'Unknown Author';
};

const resolveAuthorNames = async (authorIds: string[], bookTitle?: string): Promise<string> => {
  if (!authorIds || authorIds.length === 0) return 'Unknown Author';
  const names = await Promise.all(authorIds.map((id) => resolveAuthorName(id, bookTitle)));
  const filtered = names.filter((n) => n !== 'Unknown Author');
  return filtered.length > 0 ? filtered.join(', ') : 'Unknown Author';
};

const cleanImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('https://storage.cloud.google.com/')) {
    return url.replace('https://storage.cloud.google.com/', 'https://storage.googleapis.com/');
  }
  return url;
};

const ALLOWED_GENRES = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Biography',
  'History',
  'Romance',
  'Horror'
];

export default function HomePage() {
  const router = useRouter();

  // Authentication State
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Book of the Day State
  const [featuredBook, setFeaturedBook] = useState<BookDetailData | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  // Detail Modal Overlay Hooks
  const [selectedBook, setSelectedBook] = useState<BookDetailData | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // Menu Drawer and Collections State Hooks
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollectionListOpen, setIsCollectionListOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [collections, setCollections] = useState<any[]>([]);
  const [collectionError, setCollectionError] = useState<string | null>(null);

  // Fetch user collections on authentication success
  useEffect(() => {
    if (currentUser) {
      async function loadCollections() {
        try {
          const res = await api.getUserCollections(currentUser._id);
          if (res.success && res.data) {
            setCollections(res.data);
          }
        } catch (err) {
          console.error('Failed to load collections:', err);
        }
      }
      loadCollections();
    }
  }, [currentUser]);

  // Handler to add a new collection
  const handleAddCollection = async () => {
    if (!collectionName.trim() || !currentUser) return;
    setCollectionError(null);
    try {
      const res = await api.createCollection({
        name: collectionName.trim(),
        user_id: currentUser._id,
        public: true
      });
      if (res.success && res.data) {
        setCollections((prev) => [...prev, res.data]);
        setCollectionName('');
        setCollectionError(null);
        setIsCollectionModalOpen(false);
      } else {
        setCollectionError(res.message || 'Failed to create collection');
      }
    } catch (err: any) {
      console.error('Failed to create collection:', err);
      setCollectionError(err.message || 'Failed to create collection');
    }
  };

  // Load session storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const resolved = parsed.user || parsed.data || parsed;
        if (resolved && resolved._id) {
          setCurrentUser(resolved);
        }
      } catch (err) {
        console.error('Failed to parse session:', err);
      }
    }
    setAuthChecking(false);
  }, []);

  // Fetch Book of the Day dynamically
  useEffect(() => {
    async function loadFeaturedBook() {
      try {
        const res = await api.getBooks();
        if (res.success && res.data && res.data.length > 0) {
          // Attempt to find Percy Jackson or default to the first cataloged book
          const found = res.data.find((b) =>
            b.book_title.toLowerCase().includes('percy jackson')
          ) || res.data[0];

          const authorName = await resolveAuthorNames(found.book_author_id, found.book_title);
          setFeaturedBook({
            _id: found._id,
            book_title: found.book_title,
            author_name: authorName,
            genre: found.genre,
            description: found.description,
            image_url: cleanImageUrl(found.image_url),
            pdf_url: found.pdf_url,
            rating: 4.8
          });
        } else {
          // Use high-fidelity mock fallback if library database is empty
          setFeaturedBook({
            _id: 'featured-default',
            book_title: 'Percy Jackson and the Olympians: The Lightning Thief',
            author_name: 'Rick Riordan',
            genre: ['Fantasy'],
            description: "Twelve-year-old Percy Jackson is on the most dangerous quest of his life. With the help of a satyr and a daughter of Athena, Percy must journey across the United States to catch a thief who has stolen the original weapon of mass destruction – Zeus' master bolt.",
            image_url: 'https://covers.openlibrary.org/b/id/10523487-L.jpg',
            pdf_url: 'https://luminary-api.example.com/books/percy-jackson.pdf',
            rating: 4.8
          });
        }
      } catch (err) {
        console.error('Failed to load featured book:', err);
        // Fallback
        setFeaturedBook({
          _id: 'featured-default',
          book_title: 'Percy Jackson and the Olympians: The Lightning Thief',
          author_name: 'Rick Riordan',
          genre: ['Fantasy'],
          description: "Twelve-year-old Percy Jackson is on the most dangerous quest of his life. With the help of a satyr and a daughter of Athena, Percy must journey across the United States to catch a thief who has stolen the original weapon of mass destruction – Zeus' master bolt.",
          image_url: 'https://covers.openlibrary.org/b/id/10523487-L.jpg',
          pdf_url: 'https://luminary-api.example.com/books/percy-jackson.pdf',
          rating: 4.8
        });
      } finally {
        setFeaturedLoading(false);
      }
    }

    loadFeaturedBook();
  }, []);

  // Handler to open book detail overlay
  const handleOpenBook = (book: BookDetailData) => {
    setSelectedBook(book);
    setIsOverlayOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#080B11] text-white flex flex-col relative font-sans">
      {/* Scrollbar-none custom styling block */}
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-slate-800/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Top Navigation Bar */}
      <nav className="w-full max-w-[1200px] mx-auto px-6 md:px-12 py-6 flex items-center justify-between z-10 relative select-none">
        {/* Menu Hamburger */}
        <button
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
          className="text-white/80 hover:text-white transition-all duration-200 cursor-pointer p-2 rounded-lg hover:bg-white/5 active:scale-95 flex items-center justify-center border border-transparent"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Centered Brand Title */}
        <h1 className="font-serif text-2xl md:text-3xl font-extralight tracking-[0.25em] text-white uppercase text-center absolute left-1/2 -translate-x-1/2 cursor-pointer select-none" onClick={() => router.push('/')}>
          LUMINARY
        </h1>

        {/* User Profile Avatar shortcut */}
        <button
          onClick={() => router.push(currentUser ? '/profile' : '/login')}
          aria-label="User profile"
          className="w-9 h-9 rounded-full border border-white/20 hover:border-white/40 flex items-center justify-center transition-all duration-200 active:scale-95 overflow-hidden bg-white/5 cursor-pointer"
        >
          {currentUser ? (
            <span className="text-sm font-semibold text-white/90 uppercase select-none">
              {currentUser.username ? currentUser.username.charAt(0) : 'U'}
            </span>
          ) : (
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </button>
      </nav>

      {/* Main Content Layout Dashboard */}
      <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12 pb-16 z-10 relative flex flex-col gap-10">
        
        {/* Section Row A - "Book of the Day" */}
        {featuredLoading ? (
          <section className="mt-6 animate-pulse text-left">
            <div className="h-3.5 bg-white/10 w-24 rounded mb-4" />
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 bg-white/[0.02] border border-white/[0.04] p-6 rounded-2xl">
              <div className="aspect-[3/4.4] w-full max-w-[180px] bg-white/5 rounded-xl" />
              <div className="flex-1 space-y-3 pt-2">
                <div className="h-6 bg-white/10 w-3/4 rounded" />
                <div className="h-3 bg-white/10 w-1/3 rounded" />
                <div className="h-4 bg-white/10 w-1/4 rounded" />
                <div className="h-16 bg-white/10 w-full rounded" />
              </div>
            </div>
          </section>
        ) : (
          featuredBook && (
            <section className="mt-6 animate-fade-in text-left">
              <p className="text-[10px] font-semibold tracking-[0.25em] text-white/40 uppercase mb-3 select-none">
                Book of the Day
              </p>
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start bg-white/[0.02] border border-white/[0.04] p-6 rounded-2xl shadow-xl backdrop-blur-md">
                {/* Premium featured book cover */}
                <div 
                  onClick={() => handleOpenBook(featuredBook)}
                  className="aspect-[3/4.4] w-full max-w-[160px] md:max-w-[180px] bg-slate-800 rounded-xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.6)] border border-white/10 flex-shrink-0 transition-transform duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  <BookCoverImage
                    src={featuredBook.image_url}
                    alt={featuredBook.book_title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Featured metadata stack */}
                <div className="flex-1 flex flex-col justify-between h-full pt-1">
                  <div>
                    <h2 className="font-serif text-2xl md:text-3xl font-light text-white leading-tight mb-2">
                      {featuredBook.book_title}
                    </h2>
                    <p className="text-xs font-medium text-white/50 mb-3">
                      {featuredBook.author_name} <span className="mx-2 text-white/20">|</span> {featuredBook.genre.join(', ')}
                    </p>

                    {/* Rating / Actions line */}
                    <div className="flex items-center gap-3 mb-4 select-none">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isGold = featuredBook.rating && star <= Math.round(featuredBook.rating);
                          return (
                            <svg
                              key={star}
                              className={`w-3.5 h-3.5 ${isGold ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'}`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          );
                        })}
                      </div>
                      <div className="w-[1px] h-3 bg-white/15" />
                      <button className="text-white/45 hover:text-white transition-colors duration-200">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </button>
                      <div className="w-[1px] h-3 bg-white/15" />
                      <button 
                        onClick={() => handleOpenBook(featuredBook)}
                        className="bg-white text-[#080B11] hover:bg-neutral-100 font-bold px-3 py-1.5 rounded text-[9px] tracking-wider uppercase transition-all duration-200 active:scale-[0.98] shadow-md flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span className="text-[8px]">▸</span> Read Now
                      </button>
                    </div>

                    <p className="text-xs font-light text-white/70 leading-relaxed max-w-2xl select-text">
                      {featuredBook.description}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )
        )}

        {/* Section Row B - "Continue Reading" (Bookmarks Tracker) */}
        {!authChecking && currentUser && (
          <BookmarksRow userId={currentUser._id} onSelectBook={handleOpenBook} />
        )}

        {/* Dynamic Genre Rows Engine */}
        <section className="flex flex-col gap-8">
          {ALLOWED_GENRES.map((genre) => (
            <GenreRow key={genre} genre={genre} onSelectBook={handleOpenBook} />
          ))}
        </section>

      </div>

      {/* BookDetailOverlay Modal */}
      {selectedBook && (
        <BookDetailOverlay
          isOpen={isOverlayOpen}
          onClose={() => setIsOverlayOpen(false)}
          book={selectedBook}
          onReadNow={() => {
            if (selectedBook.pdf_url) {
              window.open(selectedBook.pdf_url, '_blank');
            }
          }}
        />
      )}

      {/* Side Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Drawer Content */}
          <div className="relative w-[300px] max-w-[85vw] h-full bg-gradient-to-br from-[#1C2230] via-[#121620] to-[#0A0D14] border-r border-white/[0.08] p-6 md:p-8 flex flex-col shadow-2xl rounded-r-3xl z-50 transform transition-transform duration-300 animate-slide-in-left select-none">
            
            {/* Top Close Button (Hamburger Icon) */}
            <div className="flex justify-end mb-12">
              <button
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
                className="text-white hover:text-white/80 transition-all duration-200 cursor-pointer p-2 rounded-lg hover:bg-white/5 active:scale-95 flex items-center justify-center"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Menu Items Stack */}
            <div className="flex flex-col gap-8 flex-1 px-2">
              
              {/* Item: Search */}
              <div 
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push('/search');
                }}
                className="flex items-center justify-between border-b border-white/20 pb-2.5 cursor-pointer hover:border-white transition-colors duration-200 group"
              >
                <span className="font-luxury-serif italic text-2xl font-light tracking-wide text-white/90 group-hover:text-white transition-colors duration-200">
                  Search
                </span>
                <svg className="w-5 h-5 text-white/50 group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Item: Collections */}
              <div className="flex flex-col gap-3">
                <div 
                  onClick={() => {
                    if (!currentUser) {
                      setIsMenuOpen(false);
                      router.push('/login');
                    } else {
                      setIsCollectionListOpen(!isCollectionListOpen);
                    }
                  }}
                  className="flex items-center justify-between border-b border-white/20 pb-2.5 cursor-pointer hover:border-white transition-colors duration-200 group"
                >
                  <span className="font-luxury-serif italic text-2xl font-light tracking-wide text-white/90 group-hover:text-white transition-colors duration-200">
                    Collections
                  </span>
                  <div className="flex items-center gap-2">
                    {currentUser && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCollectionError(null);
                          setIsCollectionModalOpen(true);
                        }}
                        className="text-white/60 hover:text-white p-1 rounded hover:bg-white/5 transition-colors duration-200"
                        title="Add Collection"
                      >
                        <span className="text-xl font-bold">+</span>
                      </button>
                    )}
                    <svg className="w-5 h-5 text-white/50 group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>

                {/* Nested Collections List Submenu */}
                {currentUser && isCollectionListOpen && (
                  <div className="flex flex-col gap-2 pl-4 py-1 max-h-[160px] overflow-y-auto custom-scrollbar select-none text-left animate-fade-in">
                    {collections.length === 0 ? (
                      <p className="text-xs italic text-white/30">No collections created yet.</p>
                    ) : (
                      collections.map((col) => (
                        <div 
                          key={col._id}
                          className="text-sm font-light text-white/65 hover:text-white transition-colors duration-150 cursor-pointer py-1 truncate"
                        >
                          📚 {col.name}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Item: Favorites */}
              <div 
                onClick={() => {
                  if (!currentUser) {
                    setIsMenuOpen(false);
                    router.push('/login');
                  } else {
                    setIsMenuOpen(false);
                    router.push('/profile');
                  }
                }}
                className="flex items-center justify-between border-b border-white/20 pb-2.5 cursor-pointer hover:border-white transition-colors duration-200 group"
              >
                <span className="font-luxury-serif italic text-2xl font-light tracking-wide text-white/90 group-hover:text-white transition-colors duration-200">
                  Favorites
                </span>
                <svg className="w-5 h-5 text-white/50 group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Add Collection Modal */}
      {isCollectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080B11]/85 backdrop-blur-xs p-4 animate-fade-in">
          {/* Card Container */}
          <div className="w-full max-w-[400px] bg-gradient-to-br from-[#1C2230] via-[#121620] to-[#0A0D14] border border-white/[0.08] rounded-2xl p-6 shadow-[0_30px_70px_rgba(0,0,0,0.8)] relative flex flex-col">
            
            {/* Header section */}
            <div className="flex items-center justify-between mb-6 select-none">
              {/* Close Button on Left */}
              <button
                onClick={() => {
                  setIsCollectionModalOpen(false);
                  setCollectionName('');
                  setCollectionError(null);
                }}
                aria-label="Close modal"
                className="text-white/45 hover:text-white transition-colors duration-200 cursor-pointer p-1 rounded hover:bg-white/5"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Title Centered */}
              <h3 className="font-luxury-serif text-xl font-light text-white tracking-wide">
                Add Collection
              </h3>

              {/* Plus Action Button on Right */}
              <button
                onClick={handleAddCollection}
                disabled={!collectionName.trim()}
                aria-label="Add collection"
                className="text-white/45 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer p-1 rounded hover:bg-white/5 active:scale-95"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Validation Banner Messages */}
            {collectionError && (
              <div className="mb-4 p-3.5 bg-rose-950/45 border border-rose-500/20 text-rose-400/90 rounded-lg text-xs font-sans tracking-wide flex items-center gap-2 animate-fade-in text-left select-none">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{collectionError}</span>
              </div>
            )}

            {/* Input Box container */}
            <div className="bg-[#181D29] border border-white/[0.06] rounded-xl p-4 flex items-center">
              <input
                type="text"
                value={collectionName}
                onChange={(e) => {
                  setCollectionName(e.target.value);
                  if (collectionError) setCollectionError(null);
                }}
                placeholder="Enter collection name..."
                className="w-full bg-transparent focus:outline-none text-white text-sm font-light placeholder-white/20 select-text focus:ring-0"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// -------------------------------------------------------------
// Component: BookmarksRow (User's Bookmarked Pipeline)
// -------------------------------------------------------------
interface BookmarksRowProps {
  userId: string;
  onSelectBook: (book: BookDetailData) => void;
}

function BookmarksRow({ userId, onSelectBook }: BookmarksRowProps) {
  const [bookmarks, setBookmarks] = useState<{ book: BookDetailData; page: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBookmarks() {
      try {
        // Fetch all books
        const booksRes = await api.getBooks();
        if (booksRes.success && booksRes.data) {
          const list = booksRes.data;
          
          // Isolated Fault Isolation: check bookmarks in parallel defensively
          const results = await Promise.all(
            list.map(async (book): Promise<{ book: BookDetailData; page: number } | null> => {
              try {
                const markRes = await api.getBookmarksForBook(book._id, userId);
                if (markRes.success && markRes.data) {
                  const authorName = await resolveAuthorNames(book.book_author_id, book.book_title);
                  return {
                    book: {
                      _id: book._id,
                      book_title: book.book_title,
                      author_name: authorName,
                      genre: book.genre,
                      description: book.description,
                      image_url: cleanImageUrl(book.image_url),
                      pdf_url: book.pdf_url,
                      rating: 4.5
                    },
                    page: markRes.data.page
                  };
                }
              } catch {
                // Return null if bookmark fetch fails or returns 404
              }
              return null;
            })
          );

          const filtered = results.filter((r): r is { book: BookDetailData; page: number } => r !== null);
          setBookmarks(filtered);
        }
      } catch (err: any) {
        console.error('Bookmarks fetch pipeline failed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadBookmarks();
  }, [userId]);

  if (loading) {
    return (
      <section className="text-left animate-pulse">
        <div className="h-4 bg-white/10 w-32 rounded mb-4" />
        <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
          {[1, 2, 3, 4].map((id) => (
            <div key={id} className="aspect-[3/4.4] w-[120px] md:w-[140px] bg-white/5 rounded-xl flex-shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  // Gracefully hide the entire row if bookmarks list is empty
  if (bookmarks.length === 0 || error) {
    return null;
  }

  return (
    <section className="text-left animate-fade-in select-none">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-serif text-lg md:text-xl font-light text-white select-none">
          Continue Reading
        </h3>
        <span className="text-white/40 text-sm">▸</span>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
        {bookmarks.map(({ book }) => (
          <div
            key={book._id}
            onClick={() => onSelectBook(book)}
            className="aspect-[3/4.4] w-[120px] md:w-[140px] bg-[#121620]/60 rounded-xl overflow-hidden shadow-lg border border-white/10 flex-shrink-0 transition-transform duration-300 hover:scale-[1.03] cursor-pointer hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:border-blue-400/30"
          >
            <BookCoverImage
              src={book.image_url}
              alt={book.book_title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// Component: GenreRow (Dynamic sliders with Isolated Faults)
// -------------------------------------------------------------
interface GenreRowProps {
  genre: string;
  onSelectBook: (book: BookDetailData) => void;
}

function GenreRow({ genre, onSelectBook }: GenreRowProps) {
  const [books, setBooks] = useState<BookDetailData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGenreBooks() {
      try {
        const res = await api.getBooks();
        if (res.success && res.data) {
          // Filter matching category
          const matching = res.data.filter((b) => b.genre.includes(genre));
          
          const resolved = await Promise.all(
            matching.map(async (book) => {
              const authorName = await resolveAuthorNames(book.book_author_id, book.book_title);
              return {
                _id: book._id,
                book_title: book.book_title,
                author_name: authorName,
                genre: book.genre,
                description: book.description,
                image_url: cleanImageUrl(book.image_url),
                pdf_url: book.pdf_url,
                rating: 4.5
              };
            })
          );
          setBooks(resolved);
        }
      } catch (err: any) {
        console.error(`Error loading category: ${genre}`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadGenreBooks();
  }, [genre]);

  if (loading) {
    return (
      <section className="text-left animate-pulse">
        <div className="h-4 bg-white/10 w-24 rounded mb-4" />
        <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
          {[1, 2, 3, 4].map((id) => (
            <div key={id} className="aspect-[3/4.4] w-[120px] md:w-[140px] bg-white/5 rounded-xl flex-shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="text-left animate-fade-in select-none">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-serif text-lg md:text-xl font-light text-white uppercase tracking-wider select-none">
          {genre}
        </h3>
        <span className="text-white/40 text-sm">▸</span>
      </div>

      {books.length === 0 || error ? (
        <p className="text-xs italic text-white/35 py-6">
          No titles cataloged under this category yet.
        </p>
      ) : (
        <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
          {books.map((book) => (
            <div
              key={book._id}
              onClick={() => onSelectBook(book)}
              className="aspect-[3/4.4] w-[120px] md:w-[140px] bg-[#121620]/60 rounded-xl overflow-hidden shadow-lg border border-white/10 flex-shrink-0 transition-transform duration-300 hover:scale-[1.03] cursor-pointer hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]"
            >
              <BookCoverImage
                src={book.image_url}
                alt={book.book_title}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
