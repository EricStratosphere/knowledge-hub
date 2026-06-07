'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BookDetailOverlay, { BookDetailData } from '@/components/BookDetailOverlay';
import * as api from '@/lib/api';
import { Book } from '@/types';

export default function HomePage() {
  const router = useRouter();

  // Authentication State
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Book of the Day State
  const [featuredBook, setFeaturedBook] = useState<BookDetailData | null>({
    _id: 'featured-default',
    book_title: 'Percy Jackson and the Olympians: The Lightning Thief',
    author_name: 'Rick Riordan',
    genre: ['Fantasy'],
    description: "Twelve-year-old Percy Jackson is on the most dangerous quest of his life. With the help of a satyr and a daughter of Athena, Percy must journey across the United States to catch a thief who has stolen the original weapon of mass destruction – Zeus' master bolt.",
    image_url: 'https://covers.openlibrary.org/b/id/10523487-L.jpg',
    pdf_url: 'https://luminary-api.example.com/books/percy-jackson.pdf',
    rating: 4.8,
  });

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
  }, []);

  return (
    <main className="min-h-screen bg-[#080B11] text-white flex flex-col relative overflow-hidden font-sans">
      {/* Background Decorative Glows */}
      <div className="absolute -top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute -bottom-1/4 right-1/4 w-[500px] h-[500px] bg-slate-800/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Top Navigation Bar */}
      <nav className="w-full max-w-[1200px] mx-auto px-6 md:px-12 py-6 flex items-center justify-between z-10 relative select-none">
        {/* Menu Hamburger */}
        <button
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
        {featuredBook && (
          <section className="mt-6 animate-fade-in text-left">
            <p className="text-[10px] font-semibold tracking-[0.25em] text-white/40 uppercase mb-3 select-none">
              Book of the Day
            </p>
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start bg-white/[0.02] border border-white/[0.04] p-6 rounded-2xl shadow-xl backdrop-blur-md">
              {/* Premium featured book cover */}
              <div className="aspect-[3/4.4] w-full max-w-[160px] md:max-w-[180px] bg-slate-800 rounded-xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.6)] border border-white/10 flex-shrink-0 transition-transform duration-300 hover:scale-[1.02] cursor-pointer">
                <img
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
                            viewBox="0 0 20 20; fill=currentColor"
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
                    <button className="bg-white text-[#080B11] hover:bg-neutral-100 font-bold px-3 py-1.5 rounded text-[9px] tracking-wider uppercase transition-all duration-200 active:scale-[0.98] shadow-md flex items-center justify-center gap-1 cursor-pointer">
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
        )}

      </div>
    </main>
  );
}
