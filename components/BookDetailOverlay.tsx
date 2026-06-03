'use client';

import React, { useState } from 'react';

// Interface for Chapter structures
export interface Chapter {
  id: string;
  title: string;
  chapterNumber: number;
}

// Interface for Book details structures
export interface BookDetailData {
  _id: string;
  book_title: string;
  author_name: string;
  genre: string[];
  description: string;
  image_url: string;
  pdf_url: string;
  rating?: number;
  chapters?: Chapter[];
}

// Interface for component Props
export interface BookDetailOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookDetailData;
  onReadNow?: (bookId: string) => void;
  onChapterSelect?: (bookId: string, chapterId: string) => void;
}

export default function BookDetailOverlay({
  isOpen,
  onClose,
  book,
  onReadNow,
  onChapterSelect,
}: BookDetailOverlayProps) {
  // Dual-Tab Interaction State switching between 'details' and 'chapters'
  const [activeTab, setActiveTab] = useState<'details' | 'chapters'>('details');

  if (!isOpen) return null;

  const handleReadNowClick = () => {
    if (onReadNow) {
      onReadNow(book._id);
    }
  };

  const handleChapterClick = (chapterId: string) => {
    if (onChapterSelect) {
      onChapterSelect(book._id, chapterId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080B11]/90 backdrop-blur-sm p-4 md:p-8 font-jakarta">
      {/* Container Card */}
      <div className="w-full max-w-[840px] bg-gradient-to-br from-[#1C2230] via-[#121620] to-[#0A0D14] border border-white/[0.08] rounded-2xl p-6 md:p-10 shadow-[0_30px_90px_rgba(0,0,0,0.9)] relative overflow-hidden flex flex-col md:min-h-[460px]">
        
        {/* Top Highlight line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 select-none z-10">
          {/* Close button X */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-white/45 hover:text-white transition-colors duration-200 cursor-pointer p-1 rounded hover:bg-white/5 active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Centered LUMINARY Serif Brand Header */}
          <h2 className="font-luxury-serif text-2xl md:text-3xl font-extralight tracking-[0.25em] text-white uppercase text-center absolute left-1/2 -translate-x-1/2">
            LUMINARY
          </h2>

          {/* Empty spacer for alignment balance */}
          <div className="w-8" />
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-stretch flex-1 z-10">
          
          {/* Left Element Stack - Columns 1 to 4 */}
          <div className="col-span-1 md:col-span-4 flex flex-col items-center justify-between select-none">
            
            {/* Book Cover Container with Shadow */}
            <div 
              onClick={() => setActiveTab('details')}
              className={`aspect-[3/4.4] w-full max-w-[200px] bg-slate-800 rounded-xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.7)] border border-white/10 transition-transform duration-300 hover:scale-[1.02] cursor-pointer`}
            >
              <img
                src={book.image_url}
                alt={book.book_title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Action buttons below the cover */}
            <div className="w-full max-w-[200px] flex flex-col gap-3 mt-6">
              
              {/* Primary action "Read Now" */}
              <button
                onClick={handleReadNowClick}
                className="w-full bg-white text-[#080B11] hover:bg-neutral-100 font-semibold py-2.5 rounded-md text-xs tracking-wider uppercase transition-all duration-200 active:scale-[0.98] shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="text-[10px]">▸</span> Read Now
              </button>

              {/* Secondary tab trigger labels */}
              <div className="flex items-center justify-center gap-4 mt-2">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`text-[10px] font-semibold uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                    activeTab === 'details' ? 'text-white border-b border-white pb-0.5' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('chapters')}
                  className={`text-[10px] font-semibold uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                    activeTab === 'chapters' ? 'text-white border-b border-white pb-0.5' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  Chapter List
                </button>
              </div>

            </div>
          </div>

          {/* Right Panel View - Columns 5 to 12 */}
          <div className="col-span-1 md:col-span-8 flex flex-col justify-start">
            
            {/* Conditional Tab Rendering */}
            {activeTab === 'details' ? (
              /* --- DETAILS PANEL VIEW --- */
              <div className="flex flex-col h-full animate-fade-in">
                {/* Book Title */}
                <h3 className="font-luxury-serif text-3xl md:text-4xl font-light text-white leading-tight tracking-wide mb-3">
                  {book.book_title}
                </h3>

                {/* Metadata Line */}
                <p className="text-sm font-medium text-white/50 mb-4 select-none">
                  {book.author_name} <span className="mx-2 text-white/20">|</span> {book.genre.join(', ')}
                </p>

                {/* Icon Rating / Collection list */}
                <div className="flex items-center gap-3.5 mb-6 select-none">
                  {/* Rating Stars mock placeholder */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isGold = book.rating && star <= Math.round(book.rating);
                      return (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${isGold ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  <div className="w-[1px] h-3 bg-white/15" />

                  {/* Bookmark/Collection mock icon */}
                  <button 
                    aria-label="Add to collection"
                    className="text-white/45 hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </button>
                </div>

                {/* Summary Description Box */}
                <div className="flex-1 overflow-y-auto pr-2 max-h-[220px] scrollbar-thin">
                  <p className="text-sm font-light text-white/70 leading-relaxed">
                    {book.description}
                  </p>
                </div>
              </div>
            ) : (
              /* --- CHAPTER LIST VIEW --- */
              <div className="flex flex-col h-full animate-fade-in select-none">
                {/* Chapters list header */}
                <h3 className="font-luxury-serif text-2xl font-light text-white mb-6">
                  Chapters:
                </h3>

                {/* Chapters vertical row elements */}
                <div className="flex-1 overflow-y-auto pr-2 max-h-[260px] border-t border-white/[0.06] scrollbar-thin">
                  {book.chapters && book.chapters.length > 0 ? (
                    book.chapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        onClick={() => handleChapterClick(chapter.id)}
                        className="flex items-center justify-between py-4 border-b border-white/[0.06] hover:bg-white/[0.02] px-2.5 transition-colors duration-200 cursor-pointer group"
                      >
                        <span className="text-sm font-light text-white/70 group-hover:text-white transition-colors duration-200">
                          {chapter.title}
                        </span>
                        <span className="text-white/40 group-hover:text-white transition-colors duration-200 font-light text-sm">
                          →
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs italic text-white/30 py-6 text-center">
                      No chapters uploaded for this ebook yet.
                    </p>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
