'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api';

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

export default function AddBookPage() {
  const router = useRouter();

  // Authentication State
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Form Field States
  const [title, setTitle] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [datePublished, setDatePublished] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // UI States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dropdown reference for click-outside closure
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Authenticate user session and configure restrictions on mount
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
        console.error('Session loading error:', err);
      }
    }
    setAuthChecking(false);
  }, []);

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Genre selection toggle handler
  const handleToggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation checks
    if (!title.trim()) return setErrorMsg('Book title is required.');
    if (!authorId.trim()) return setErrorMsg('Author ID is required.');
    if (!datePublished) return setErrorMsg('Publication date is required.');
    if (selectedGenres.length === 0) return setErrorMsg('Please select at least one genre.');
    if (!imageUrl.trim()) return setErrorMsg('Cover image URL is required.');
    if (!pdfUrl.trim()) return setErrorMsg('PDF URL is required.');
    if (!description.trim()) return setErrorMsg('Description is required.');

    setIsLoading(true);

    try {
      const finalAuthorId = authorId.trim();

      // Build serialized payload mapping to database model contracts
      const payload = {
        book_title: title.trim(),
        book_author_id: [finalAuthorId], // Wrapping single author ID into a 1-element string array payload
        date_published: datePublished,
        genre: selectedGenres,
        description: description.trim(),
        image_url: imageUrl.trim(),
        pdf_url: pdfUrl.trim()
      };

      const res = await api.createBook(payload);

      if (res.success) {
        setSuccessMsg(res.message || 'Book created successfully in the library suite!');
        // Clear fields on success
        setTitle('');
        setAuthorId('');
        setDatePublished('');
        setImageUrl('');
        setPdfUrl('');
        setDescription('');
        setSelectedGenres([]);
      } else {
        setErrorMsg(res.message || 'Failed to create the book. Please verify values.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected database error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Loading Authentication State Screen
  if (authChecking) {
    return (
      <main className="min-h-screen bg-[#080B11] text-white flex flex-col items-center justify-center p-6 font-jakarta">
        <svg className="animate-spin h-8 w-8 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-xs text-white/45 tracking-[0.2em] uppercase font-medium">Verifying Authentication...</p>
      </main>
    );
  }

  // 2. Unauthenticated Screen
  if (!currentUser) {
    return (
      <main className="min-h-screen bg-[#080B11] text-white flex flex-col items-center justify-center p-6 font-jakarta">
        <section className="w-full max-w-[420px] bg-gradient-to-br from-[#1C2230] via-[#121620] to-[#0A0D14] border border-white/[0.08] rounded-2xl p-8 md:p-10 shadow-2xl text-center relative overflow-hidden animate-fade-in">
          <h2 className="font-luxury-serif text-2xl font-light text-white tracking-wide mb-3 select-none">
            Authentication Required
          </h2>
          <p className="text-xs text-white/40 leading-relaxed mb-6 font-light select-none">
            Please sign in to access the Library Database Suite.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-white text-[#080B11] hover:bg-neutral-100 font-semibold py-3 rounded-md text-xs tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer shadow-md"
          >
            Sign in
          </button>
        </section>
      </main>
    );
  }

  // 3. Unauthorized Screen (Not Admin)
  if (!currentUser.is_admin) {
    return (
      <main className="min-h-screen bg-[#080B11] text-white flex flex-col items-center justify-center p-6 font-jakarta">
        <section className="w-full max-w-[420px] bg-gradient-to-br from-[#1C2230] via-[#121620] to-[#0A0D14] border border-white/[0.08] rounded-2xl p-8 md:p-10 shadow-2xl text-center relative overflow-hidden animate-fade-in">
          <h2 className="font-luxury-serif text-2xl font-light text-white tracking-wide mb-3 select-none">
            Access Denied
          </h2>
          <p className="text-xs text-white/40 leading-relaxed mb-6 font-light select-none">
            Only administrator accounts are permitted to register library editions.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-transparent border border-white/20 hover:border-white/40 text-white font-semibold py-3 rounded-md text-xs tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer"
          >
            Return Home
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080B11] text-white flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden font-jakarta">
      {/* Decorative Background Glows */}
      <div className="absolute -bottom-1/4 left-1/4 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute -top-1/4 right-1/4 w-[500px] h-[500px] bg-slate-800/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Back button home navigation */}
      <header className="w-full max-w-[540px] flex items-center justify-between mb-8 z-10 relative select-none">
        <button
          onClick={() => router.push('/')}
          aria-label="Navigate home"
          className="text-white/60 hover:text-white transition-all duration-200 cursor-pointer p-2.5 rounded-lg hover:bg-white/5 active:scale-95 flex items-center justify-center border border-transparent hover:border-white/5"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>

        <h1 className="font-luxury-serif text-xl font-extralight tracking-[0.2em] text-white uppercase text-center absolute left-1/2 -translate-x-1/2 pointer-events-none">
          LUMINARY
        </h1>
      </header>

      {/* Elegant glassmorphic card container centered on page */}
      <section className="w-full max-w-[540px] bg-gradient-to-br from-[#1C2230] via-[#121620] to-[#0A0D14] border border-white/[0.08] rounded-2xl p-8 md:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden animate-fade-in">
        
        {/* Subtle highlights */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        {/* Database typography header */}
        <div className="mb-8 select-none">
          <p className="text-[10px] font-semibold tracking-[0.25em] text-white/40 uppercase mb-1">
            Library Database Suite
          </p>
          <h2 className="font-luxury-serif text-3xl font-light text-white tracking-wide">
            Add Book Catalog
          </h2>
        </div>

        {/* Action Banners */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-950/45 border border-rose-500/20 text-rose-400/90 rounded-lg text-xs flex items-center justify-between gap-3 animate-fade-in shadow-md">
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-400/60 hover:text-rose-300 font-bold px-1.5 cursor-pointer">✕</button>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-950/45 border border-emerald-500/20 text-emerald-400/95 rounded-lg text-xs flex items-center justify-between gap-3 animate-fade-in shadow-md">
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-400/60 hover:text-emerald-300 font-bold px-1.5 cursor-pointer">✕</button>
          </div>
        )}

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-6 font-jakarta text-left">
          
          {/* Book Title field */}
          <div className="relative group transition-all duration-300">
            <label className="block text-[10px] font-medium tracking-[0.2em] text-white/40 uppercase mb-1 transition-colors duration-300 group-focus-within:text-white">
              Book Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              placeholder="e.g. Percy Jackson & The Lightning Thief"
              className="w-full bg-transparent border-b border-white/20 focus:border-white focus:outline-none transition-all duration-300 py-2 text-white placeholder-white/20 text-sm focus:ring-0 disabled:opacity-40"
              required
            />
          </div>

          {/* Author ID field */}
          <div className="relative group transition-all duration-300">
            <label className="block text-[10px] font-medium tracking-[0.2em] text-white/40 uppercase mb-1 transition-colors duration-300 group-focus-within:text-white">
              Author Object ID
            </label>
            <input
              type="text"
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              disabled={isLoading}
              placeholder="e.g. 64b85c13e4b0258d4a7f1a92"
              className="w-full bg-transparent border-b border-white/20 focus:border-white focus:outline-none transition-all duration-300 py-2 text-white placeholder-white/20 text-sm focus:ring-0 font-mono disabled:opacity-60"
              required
            />
          </div>

          {/* Date Published field */}
          <div className="relative group transition-all duration-300">
            <label className="block text-[10px] font-medium tracking-[0.2em] text-white/40 uppercase mb-1 transition-colors duration-300 group-focus-within:text-white">
              Publication Date
            </label>
            <input
              type="date"
              value={datePublished}
              onChange={(e) => setDatePublished(e.target.value)}
              disabled={isLoading}
              className="w-full bg-transparent border-b border-white/20 focus:border-white focus:outline-none transition-all duration-300 py-2 text-white placeholder-white/20 text-sm focus:ring-0 [color-scheme:dark] disabled:opacity-40"
              required
            />
          </div>

          {/* Custom Genre Selector dropdown container */}
          <div ref={dropdownRef} className="relative transition-all duration-300">
            <label className="block text-[10px] font-medium tracking-[0.2em] text-white/40 uppercase mb-1.5">
              Genre Categorization
            </label>
            
            {/* Custom select trigger row */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="w-full bg-[#121620]/60 border border-white/10 hover:border-white/20 rounded-md py-2.5 px-3.5 text-left text-sm text-white/80 hover:text-white transition duration-200 flex items-center justify-between shadow-inner select-none disabled:opacity-40 cursor-pointer"
            >
              <span className="truncate tracking-wide pr-2">
                {selectedGenres.length > 0 ? selectedGenres.join(', ') : 'Select Genre Tags...'}
              </span>
              <svg
                className={`w-4 h-4 text-white/40 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Custom drop panel checklist */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 mt-1.5 max-h-[220px] overflow-y-auto bg-[#121620] border border-white/10 rounded-md shadow-2xl z-20 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent animate-fade-in">
                <div className="p-1.5 space-y-0.5">
                  {ALLOWED_GENRES.map((genre) => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => handleToggleGenre(genre)}
                        className={`w-full text-left px-3 py-2 rounded text-xs font-medium tracking-wide flex items-center justify-between transition-colors duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-white/5 text-white'
                            : 'text-white/60 hover:bg-white/[0.02] hover:text-white'
                        }`}
                      >
                        <span>{genre}</span>
                        {isSelected && (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Cover image URL field */}
          <div className="relative group transition-all duration-300">
            <label className="block text-[10px] font-medium tracking-[0.2em] text-white/40 uppercase mb-1 transition-colors duration-300 group-focus-within:text-white">
              Cover Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={isLoading}
              placeholder="e.g. https://covers.openlibrary.org/b/id/..."
              className="w-full bg-transparent border-b border-white/20 focus:border-white focus:outline-none transition-all duration-300 py-2 text-white placeholder-white/20 text-sm focus:ring-0 disabled:opacity-40"
              required
            />
          </div>

          {/* PDF book reader URL field */}
          <div className="relative group transition-all duration-300">
            <label className="block text-[10px] font-medium tracking-[0.2em] text-white/40 uppercase mb-1 transition-colors duration-300 group-focus-within:text-white">
              PDF Document URL
            </label>
            <input
              type="url"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              disabled={isLoading}
              placeholder="e.g. https://luminary-api.example.com/books/..."
              className="w-full bg-transparent border-b border-white/20 focus:border-white focus:outline-none transition-all duration-300 py-2 text-white placeholder-white/20 text-sm focus:ring-0 disabled:opacity-40"
              required
            />
          </div>

          {/* Description multi-line field */}
          <div className="relative group transition-all duration-300">
            <label className="block text-[10px] font-medium tracking-[0.2em] text-white/40 uppercase mb-1.5 transition-colors duration-300 group-focus-within:text-white">
              Synopsis & Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              placeholder="Provide a detailed outline of the book contents..."
              rows={4}
              className="w-full bg-[#121620]/60 border border-white/10 focus:border-white focus:outline-none transition-all duration-300 p-3.5 rounded-md text-white placeholder-white/20 text-sm focus:ring-0 resize-none shadow-inner disabled:opacity-40"
              required
            />
          </div>

          {/* Submission action button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-[#080B11] hover:bg-neutral-100 font-semibold py-3.5 rounded-md text-xs tracking-widest uppercase transition-all duration-300 disabled:opacity-40 mt-8 active:scale-[0.98] shadow-[0_8px_30px_rgba(255,255,255,0.06)] flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-[#080B11]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Cataloging Book...
              </>
            ) : (
              'Catalog Book'
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
