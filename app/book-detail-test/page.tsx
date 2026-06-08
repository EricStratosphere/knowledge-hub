'use client';

import React, { useState } from 'react';
import BookDetailOverlay, { BookDetailData } from '@/components/BookDetailOverlay';

// Mock Book Data matching our database and Figma schema
const mockBook: BookDetailData = {
  _id: 'hp-chamber-of-secrets-id',
  book_title: 'Harry Potter and the Chamber of Secrets',
  author_name: 'J.K. Rowling',
  genre: ['Fantasy', 'Adventure', 'Mystery'],
  description: 'In Harry Potter and the Chamber of Secrets, Harry\'s second year at Hogwarts is disrupted by mysterious attacks that leave students petrified, while a voice whispers in the school walls, warning of the opening of the ancient Chamber of Secrets.',
  image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400', // Premium high-res book cover placeholder
  pdf_url: 'https://luminary-api.example.com/books/hp2.pdf',
  rating: 4.8,
  chapters: [
    { id: 'ch1', title: 'Chapter 1: The Worst Birthday', chapterNumber: 1 },
    { id: 'ch2', title: 'Chapter 2: Dobby\'s Warning', chapterNumber: 2 },
    { id: 'ch3', title: 'Chapter 3: The Burrow', chapterNumber: 3 },
    { id: 'ch4', title: 'Chapter 4: At Flourish and Blotts', chapterNumber: 4 },
  ],
  reviews: [],
};

export default function BookDetailTestPage() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog((prev) => [
      `[${new Date().toLocaleTimeString()}] ${message}`,
      ...prev.slice(0, 4), // Keep last 5 entries
    ]);
  };

  const handleReadNow = (bookId: string) => {
    addLog(`Read Now clicked! Fetching PDF reader for Book ID: ${bookId}`);
  };

  const handleChapterSelect = (bookId: string, chapterId: string) => {
    const chapter = mockBook.chapters?.find((c) => c.id === chapterId);
    addLog(`Chapter Selected! Navigating to: "${chapter?.title || chapterId}" (Book: ${bookId})`);
  };

  return (
    <main className="min-h-screen bg-[#080B11] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-jakarta">
      {/* Visual background atmospheric radial flows */}
      <div className="absolute -bottom-1/4 left-1/4 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute -top-1/4 right-1/4 w-[500px] h-[500px] bg-slate-800/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Brand Title */}
      <header className="text-center z-10 mb-12 select-none">
        <h1 className="font-luxury-serif text-5xl font-extralight tracking-[0.3em] text-white mb-4">
          LUMINARY
        </h1>
        <p className="font-luxury-serif italic text-white/40 text-lg">
          Catalog detail overlay component sandbox.
        </p>
      </header>

      {/* Control panel and button */}
      <section className="bg-[#111622]/60 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-8 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-center z-10 relative">
        <h2 className="text-lg font-semibold tracking-wide text-white/80 mb-6 uppercase text-xs">
          Component Sandbox Options
        </h2>

        {/* Trigger Button */}
        <button
          onClick={() => {
            setIsOverlayOpen(true);
            addLog('Overlay launched.');
          }}
          className="w-full bg-white text-[#080B11] hover:bg-neutral-100 font-bold py-3.5 rounded-md text-xs tracking-wider uppercase transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-md mb-8"
        >
          Preview Book Overlay
        </button>

        {/* Action Logs */}
        <div className="text-left bg-black/40 border border-white/[0.05] rounded-xl p-4 min-h-[140px] flex flex-col justify-start">
          <p className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-2">
            Interaction Logs
          </p>
          <div className="space-y-1.5 overflow-y-auto max-h-[110px]">
            {log.length > 0 ? (
              log.map((item, idx) => (
                <p key={idx} className="text-xs font-mono text-white/70 leading-relaxed">
                  {item}
                </p>
              ))
            ) : (
              <p className="text-xs italic text-white/20 select-none">
                No click actions logged yet. Press "Preview Book Overlay" and click on options.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* BookDetailOverlay Component Instance */}
      <BookDetailOverlay
        isOpen={isOverlayOpen}
        onClose={() => {
          setIsOverlayOpen(false);
          addLog('Overlay closed.');
        }}
        book={mockBook}
        onReadNow={handleReadNow}
        onChapterSelect={handleChapterSelect}
      />
    </main>
  );
}
