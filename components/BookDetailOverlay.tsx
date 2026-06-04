'use client';

import React, { useState } from 'react';

// Interface for Chapter structures
export interface Chapter {
  id: string;
  title: string;
  chapterNumber: number;
}

// Interface for Review structures
export interface BookReview {
  _id: string;
  username: string;
  rating: number;
  content: string;
  createdAt: string;
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
  reviews?: BookReview[];
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

  // Reviews state hooks
  const defaultMockReviews: BookReview[] = [
    {
      _id: 'rev-1',
      username: 'Sarah_Readz',
      rating: 5,
      content: 'Absolutely spellbinding. The pacing was flawless and the mystery kept me hooked until the final page!',
      createdAt: '2 days ago',
    },
    {
      _id: 'rev-2',
      username: 'BookWorm99',
      rating: 4,
      content: 'A fantastic second installment. Loved the lore expansion around the Hogwarts houses.',
      createdAt: '1 week ago',
    },
  ];

  const [reviewsList, setReviewsList] = useState<BookReview[]>(book.reviews || defaultMockReviews);
  const [inputRating, setInputRating] = useState<number>(5);
  const [inputText, setInputText] = useState<string>('');

  const handleReviewSubmit = () => {
    if (!inputText.trim()) return;

    const newReview: BookReview = {
      _id: `rev-${Date.now()}`,
      username: 'AnonymousReader',
      rating: inputRating,
      content: inputText.trim(),
      createdAt: 'Just now',
    };

    setReviewsList((prev) => [newReview, ...prev]);
    setInputText('');
    setInputRating(5);
  };

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
      <div className="w-full max-w-[840px] bg-gradient-to-br from-[#1C2230] via-[#121620] to-[#0A0D14] border border-white/[0.08] rounded-2xl p-6 md:p-10 shadow-[0_30px_90px_rgba(0,0,0,0.9)] relative overflow-y-auto max-h-[90vh] scrollbar-thin flex flex-col md:min-h-[460px]">

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

        {/* Upper Section Wrapper (Row 1) */}
        <div className="flex flex-col md:flex-row gap-8 items-start w-full select-none z-10">
          
          {/* Left Element Column (Cover & Navigation Toggles) */}
          <div className="w-full md:w-[200px] flex flex-col items-center flex-shrink-0 select-none">
            
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
            <div className="flex items-center justify-center gap-4 mt-6 w-full max-w-[200px]">
              
              {/* Primary action "Read Now" */}
              <button
                onClick={handleReadNowClick}
                className="bg-white text-[#080B11] hover:bg-neutral-100 font-bold px-4 py-2 rounded text-[11px] tracking-wider uppercase transition-all duration-200 active:scale-[0.98] shadow-md flex items-center justify-center gap-1 cursor-pointer h-8"
              >
                <span className="text-[9px]">▸</span> Read Now
              </button>

              {/* Chapter List Toggle button */}
              <button
                onClick={() => setActiveTab(activeTab === 'details' ? 'chapters' : 'details')}
                className="text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer h-8 flex flex-col justify-center items-center relative"
              >
                <span className={`${activeTab === 'chapters' ? 'text-white' : 'text-white/60 hover:text-white'}`}>
                  Chapter List
                </span>
                {activeTab === 'chapters' && (
                  <div className="absolute -bottom-1.5 left-0 right-0 h-[2.5px] bg-white rounded-full animate-fade-in" />
                )}
              </button>
            </div>
          </div>

          {/* Right-hand text section (metadata, stars, description) */}
          <div className="w-full md:flex-1 flex flex-col text-left select-text font-jakarta">
            {/* Book Title */}
            <h3 className="font-luxury-serif text-2xl md:text-3xl font-light text-white leading-tight tracking-wide mb-1.5 select-text">
              {book.book_title}
            </h3>

            {/* Metadata Line */}
            <p className="text-[11px] font-medium text-white/50 mb-2 select-none">
              {book.author_name} <span className="mx-1.5 text-white/20">|</span> {book.genre.join(', ')}
            </p>

            {/* Icon Rating / Collection list */}
            <div className="flex items-center gap-3 mb-3 select-none">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isGold = book.rating && star <= Math.round(book.rating);
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

              <button 
                aria-label="Add to collection"
                className="text-white/45 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </button>
            </div>

            {/* Summary Description Box / Chapter List toggled */}
            {activeTab === 'details' ? (
              <p className="text-xs font-light text-white/70 leading-relaxed line-clamp-3 select-text">
                {book.description}
              </p>
            ) : (
              /* --- CHAPTER LIST VIEW --- */
              <div className="w-full flex flex-col text-left select-none animate-fade-in mt-1">
                {/* Chapters list header */}
                <h3 className="font-luxury-serif text-lg font-light text-white mb-2">
                  Chapters:
                </h3>

                {/* Chapters vertical row elements */}
                <div className="overflow-y-auto pr-2 max-h-[140px] border-t border-white/[0.06] scrollbar-thin">
                  {book.chapters && book.chapters.length > 0 ? (
                    book.chapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        onClick={() => handleChapterClick(chapter.id)}
                        className="flex items-center justify-between py-2.5 border-b border-white/[0.06] hover:bg-white/[0.02] px-2 transition-colors duration-200 cursor-pointer group"
                      >
                        <span className="text-xs font-light text-white/70 group-hover:text-white transition-colors duration-200">
                          {chapter.title}
                        </span>
                        <span className="text-white/40 group-hover:text-white transition-colors duration-200 font-light text-xs">
                          →
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs italic text-white/30 py-4 text-center">
                      No chapters uploaded for this ebook yet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Divider Line & Bottom Full-Width Scroll Zone (Row 2) */}
        {/* Global Divider Line */}
        <div className="border-t border-white/[0.06] w-full my-5 z-10" />

        {/* Bottom Full-Width Scroll Zone (Row 2) */}
        <div className="w-full z-10 animate-fade-in text-left space-y-4">
          
          {/* Review Input Box Form */}
          <div className="bg-white/[0.015] border border-white/[0.05] rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold text-white/40 uppercase tracking-widest">
                Rate this book
              </span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setInputRating(star)}
                    className="transition-transform duration-100 hover:scale-110 cursor-pointer"
                  >
                    <svg
                      className={`w-3.5 h-3.5 ${
                        star <= inputRating ? 'text-yellow-400 fill-yellow-400' : 'text-white/10 hover:text-white/30'
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Share your thoughts on this book..."
                className="w-full bg-transparent border-b border-white/10 focus:border-white focus:outline-none transition-all duration-200 py-1 text-white placeholder-white/20 text-xs resize-none h-10 focus:ring-0"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleReviewSubmit}
                  disabled={!inputText.trim()}
                  className="bg-white text-[#080B11] hover:bg-neutral-100 font-bold px-3 py-1.5 rounded text-[10px] tracking-wider uppercase transition-all duration-200 active:scale-[0.97] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>

          {/* Reviews List Feed */}
          <div className="space-y-4 pt-1">
            {reviewsList.map((review) => (
              <div key={review._id} className="flex gap-3 text-left">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-semibold text-white/50 select-none flex-shrink-0">
                  {review.username.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white/80">{review.username}</span>
                    <span className="text-[10px] text-white/35">{review.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-2.5 h-2.5 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-xs font-light text-white/60 leading-relaxed">
                    {review.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
