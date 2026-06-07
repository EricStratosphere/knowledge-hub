'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api';
import { User, Book, Collection } from '@/types';
import BookDetailOverlay, { BookDetailData } from '@/components/BookDetailOverlay';

// Interface for resolved collections containing book details
interface ResolvedCollection extends Omit<Collection, 'user_id'> {
  user_id: string;
  books: BookDetailData[];
}

// High-fidelity fallback books matching the provided images and schemas
const fallbackBooks: BookDetailData[] = [
  {
    _id: 'hp-1',
    book_title: 'Harry Potter and the Sorcerer\'s Stone',
    author_name: 'J.K. Rowling',
    genre: ['Fantasy', 'Adventure', 'Magic'],
    description: 'Harry Potter has no idea how famous he is. That\'s because he\'s being raised by his miserable aunt and uncle who are terrified he will discover that he\'s a wizard, just as his parents were.',
    image_url: 'https://covers.openlibrary.org/b/id/10521270-L.jpg',
    pdf_url: 'https://luminary-api.example.com/books/hp1.pdf',
    rating: 4.9,
    chapters: [
      { id: 'hp1-ch1', title: 'Chapter 1: The Boy Who Lived', chapterNumber: 1 }
    ],
    reviews: []
  },
  {
    _id: 'ho-1',
    book_title: 'The Heroes of Olympus: The Lost Hero',
    author_name: 'Rick Riordan',
    genre: ['Fantasy', 'Adventure', 'Mythology'],
    description: 'Jason has a problem. He doesn\'t remember anything before waking up on a school bus holding hands with a girl. Apparently she\'s his girlfriend Piper, his best friend is a kid named Leo, and they\'re all students at the Wilderness School.',
    image_url: 'https://covers.openlibrary.org/b/id/11494793-L.jpg',
    pdf_url: 'https://luminary-api.example.com/books/ho1.pdf',
    rating: 4.6,
    chapters: [
      { id: 'ho1-ch1', title: 'Chapter 1: Jason', chapterNumber: 1 }
    ],
    reviews: []
  },
  {
    _id: 'hp-4',
    book_title: 'Harry Potter and the Goblet of Fire',
    author_name: 'J.K. Rowling',
    genre: ['Fantasy', 'Adventure', 'Magic'],
    description: 'Harry Potter is midway through his training as a wizard and his coming of age. Harry wants to get away from the pernicious Dursleys and go to the International Quidditch Cup.',
    image_url: 'https://covers.openlibrary.org/b/id/10521287-L.jpg',
    pdf_url: 'https://luminary-api.example.com/books/hp4.pdf',
    rating: 4.8,
    chapters: [
      { id: 'hp4-ch1', title: 'Chapter 1: The Riddle House', chapterNumber: 1 }
    ],
    reviews: []
  },
  {
    _id: 'hp-2',
    book_title: 'Harry Potter and the Chamber of Secrets',
    author_name: 'J.K. Rowling',
    genre: ['Fantasy', 'Adventure', 'Magic'],
    description: 'In Harry Potter and the Chamber of Secrets, Harry\'s second year at Hogwarts is disrupted by mysterious attacks that leave students petrified, while a voice whispers in the school walls, warning of the opening of the ancient Chamber of Secrets.',
    image_url: 'https://covers.openlibrary.org/b/id/10521282-L.jpg',
    pdf_url: 'https://luminary-api.example.com/books/hp2.pdf',
    rating: 4.8,
    chapters: [
      { id: 'hp2-ch1', title: 'Chapter 1: The Worst Birthday', chapterNumber: 1 }
    ],
    reviews: []
  }
];

// Fallback user and collection data matching figma image_5aee9e.png
const mockUser: User = {
  _id: 'guest-user-id',
  username: 'John Doe',
  email: 'ramasynigo@gmail.com',
  is_admin: false,
  is_writer: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockCollections: ResolvedCollection[] = [
  {
    _id: 'col-fantasy',
    name: 'FantasyCollection',
    public: true,
    books: fallbackBooks,
    user_id: 'guest-user-id'
  }
];

export default function ProfilePage() {
  const router = useRouter();

  // Profile data states
  const [user, setUser] = useState<User | null>(null);
  const [collections, setCollections] = useState<ResolvedCollection[]>([]);
  const [authorsMap, setAuthorsMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Edit states
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [promotingWriter, setPromotingWriter] = useState(false);

  // Message states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Overlay state
  const [selectedBook, setSelectedBook] = useState<BookDetailData | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // Fetch helper mapping for authors
  useEffect(() => {
    api.getAuthors()
      .then((res) => {
        if (res.success && res.data) {
          const map: Record<string, string> = {};
          res.data.forEach((author) => {
            map[author._id] = author.name;
          });
          setAuthorsMap(map);
        }
      })
      .catch((err) => console.error('Failed to load authors map:', err));
  }, []);

  // Main session and data loading pipeline
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed: User = JSON.parse(stored);
        setUser(parsed);
        setNewUsername(parsed.username);
        fetchUserData(parsed._id);
      } catch (err) {
        console.error('Local user parsing error:', err);
        loadMockData();
      }
    } else {
      loadMockData();
    }
  }, [authorsMap]);

  // Load mock data fallbacks
  const loadMockData = () => {
    setUser(mockUser);
    setNewUsername(mockUser.username);
    setCollections(mockCollections);
    setIsLoading(false);
  };

  // Sync user details and fetch collections from API
  const fetchUserData = async (userId: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Refresh current user info
      const userRes = await api.getUserById(userId);
      let activeUser = user;
      if (userRes.success && userRes.data) {
        setUser(userRes.data);
        setNewUsername(userRes.data.username);
        localStorage.setItem('user', JSON.stringify(userRes.data));
        activeUser = userRes.data;
      }

      // Retrieve collections
      const colRes = await api.getUserCollections(userId);
      if (colRes.success && colRes.data && colRes.data.length > 0) {
        const resolved: ResolvedCollection[] = await Promise.all(
          colRes.data.map(async (col) => {
            try {
              const relsRes = await api.getEbooksByCollectionId(col._id);
              if (relsRes.success && relsRes.data && relsRes.data.length > 0) {
                const books = await Promise.all(
                  relsRes.data.map(async (rel) => {
                    const bookId = typeof rel.book_id === 'string' ? rel.book_id : rel.book_id?._id;
                    if (!bookId) return null;
                    const bookRes = await api.getBookById(bookId);
                    if (bookRes.success && bookRes.data) {
                      const authorName = bookRes.data.book_author_id
                        ?.map((id) => authorsMap[id] || 'Unknown Author')
                        .join(', ') || 'Unknown Author';
                      return {
                        _id: bookRes.data._id,
                        book_title: bookRes.data.book_title,
                        author_name: authorName,
                        genre: bookRes.data.genre || [],
                        description: bookRes.data.description || '',
                        image_url: bookRes.data.image_url || '',
                        pdf_url: bookRes.data.pdf_url || '',
                        rating: 4.5,
                        chapters: [],
                        reviews: []
                      } as BookDetailData;
                    }
                    return null;
                  })
                );
                const resolvedBooks = books.filter((b): b is BookDetailData => b !== null);
                return {
                  ...col,
                  books: resolvedBooks.length > 0 ? resolvedBooks : fallbackBooks
                };
              }
              return { ...col, books: fallbackBooks };
            } catch {
              return { ...col, books: fallbackBooks };
            }
          })
        );
        setCollections(resolved);
      } else {
        setCollections(mockCollections);
      }
    } catch (err: any) {
      console.error('Error loading API collections:', err);
      setCollections(mockCollections);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit edit username PUT request
  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const trimmed = newUsername.trim();
    if (!trimmed) {
      setErrorMsg('Username cannot be empty.');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.updateUser(user._id, { username: trimmed });
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        setSuccessMsg('Username updated successfully!');
        setIsEditingUsername(false);
      } else {
        setErrorMsg(res.message || 'Failed to update username.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while updating username.');
    }
  };

  // Submit become writer request
  const handleBecomeWriter = async () => {
    if (!user) return;
    setPromotingWriter(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.updateUser(user._id, { is_writer: true });
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        setSuccessMsg('Account role updated! You are now a Writer.');
      } else {
        setErrorMsg(res.message || 'Failed to update role.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during promotion request.');
    } finally {
      setPromotingWriter(false);
    }
  };

  // Trigger book details overlay
  const handleBookClick = (book: BookDetailData) => {
    setSelectedBook(book);
    setIsOverlayOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#080B11] text-white flex flex-col items-center p-6 md:p-12 relative overflow-hidden font-jakarta">
      {/* Premium Font Injection and Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        
        .font-luxury-serif {
          font-family: 'Playfair Display', Georgia, serif;
        }
        .font-jakarta {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* Decorative High-End Background Glows */}
      <div className="absolute -bottom-1/4 left-1/4 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute -top-1/4 right-1/4 w-[500px] h-[500px] bg-slate-800/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Top Navigation Bar */}
      <header className="w-full max-w-6xl flex items-center justify-between mb-10 z-10 relative select-none h-12">
        <button
          onClick={() => router.push('/')}
          aria-label="Navigate home"
          className="text-white/60 hover:text-white transition-all duration-200 cursor-pointer p-2.5 rounded-lg hover:bg-white/5 active:scale-95 flex items-center justify-center border border-transparent hover:border-white/5"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>

        {/* Brand layout title */}
        <h1 className="font-luxury-serif text-2xl font-extralight tracking-[0.25em] text-white uppercase text-center absolute left-1/2 -translate-x-1/2 pointer-events-none">
          LUMINARY
        </h1>

        {/* Right Nav Menu Profile Launcher mock matching image_5aee9e.png */}
        <div className="flex items-center gap-2 select-none border border-white/[0.08] bg-white/[0.02] backdrop-blur-md rounded-full px-3 py-1 shadow-md hover:bg-white/[0.04] transition-all cursor-pointer">
          <span className="text-[11px] font-medium tracking-wide text-white/50 pl-0.5">
            {user?.username ? user.username.split(' ')[0] : 'Guest'}
          </span>
          <div className="w-7 h-7 rounded-full bg-slate-700/60 border border-white/20 flex items-center justify-center font-bold text-xs text-white/95">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'J'}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <section className="w-full max-w-4xl z-10 relative flex-1 animate-fade-in">

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-950/45 border border-rose-500/20 text-rose-400/90 rounded-xl text-xs flex items-center justify-between gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
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
          <div className="mb-6 p-4 bg-emerald-950/45 border border-emerald-500/20 text-emerald-400/95 rounded-xl text-xs flex items-center justify-between gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-400/60 hover:text-emerald-300 font-bold px-1.5 cursor-pointer">✕</button>
          </div>
        )}

        {/* Profile Card Banner */}
        <div className="bg-[#121620]/60 backdrop-blur-xl border border-white/[0.04] rounded-[24px] p-8 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] mb-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            
            {/* Double-Ring Circular Avatar Frame outline */}
            <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full border border-white/10 flex items-center justify-center p-3 bg-black/35 shadow-inner">
              <div className="w-full h-full rounded-full border border-white/20 flex items-center justify-center relative overflow-hidden bg-white/[0.03]">
                <svg className="w-16 h-16 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            </div>

            {/* Profile identity info container */}
            <div className="flex-1 text-center md:text-left flex flex-col justify-center h-32">
              {isEditingUsername ? (
                <form onSubmit={handleSaveUsername} className="flex flex-col sm:flex-row items-center gap-3 w-full animate-fade-in">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-transparent border-b border-white/30 text-white font-luxury-serif text-3xl font-light tracking-wide focus:outline-none focus:border-white py-1 w-full max-w-[280px] text-center md:text-left"
                    maxLength={25}
                    placeholder="Enter Username"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-white text-[#080B11] text-xs font-semibold uppercase tracking-wider rounded hover:bg-neutral-100 transition duration-150 active:scale-95 cursor-pointer shadow-md"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingUsername(false);
                        setNewUsername(user?.username || 'John Doe');
                      }}
                      className="px-4 py-2 bg-transparent border border-white/20 text-white/60 text-xs font-semibold uppercase tracking-wider rounded hover:text-white hover:border-white/40 transition duration-150 active:scale-95 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <h2 className="font-luxury-serif text-4xl md:text-5xl font-extralight tracking-wider text-white select-text">
                    {user?.username || 'John Doe'}
                  </h2>
                  <p className="text-white/40 text-sm font-light mt-3 tracking-wide font-mono select-text">
                    {user?.email || 'ramasynigo@gmail.com'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Identity Buttons Action Area */}
          <div className="mt-8 pt-6 border-t border-white/[0.04] flex flex-wrap gap-4 justify-center md:justify-start">
            <button
              onClick={() => {
                setNewUsername(user?.username || 'John Doe');
                setIsEditingUsername(true);
              }}
              className="px-6 py-3 bg-transparent border border-white/10 hover:border-white/20 hover:bg-white/[0.02] rounded-md text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-white transition-all active:scale-[0.98] cursor-pointer"
            >
              Edit Username
            </button>

            <button
              onClick={handleBecomeWriter}
              disabled={user?.is_writer || promotingWriter}
              className={`px-6 py-3 bg-transparent border rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                user?.is_writer
                  ? 'border-emerald-500/20 text-emerald-400/50 cursor-not-allowed bg-emerald-500/[0.01]'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02] text-white/80 hover:text-white active:scale-[0.98] cursor-pointer'
              }`}
            >
              {promotingWriter ? 'Processing...' : user?.is_writer ? 'Writer Status Active' : 'Become A Writer!'}
            </button>
          </div>
        </div>

        {/* Collections Catalog Section */}
        <div className="w-full">
          <div className="w-full border-b border-white/[0.08] pb-3.5 mb-8">
            <h2 className="font-luxury-serif text-3xl font-light tracking-[0.15em] uppercase text-white/90">
              Collections
            </h2>
          </div>

          {isLoading ? (
            /* Collection Skeleton Loading */
            <div className="space-y-10">
              {Array.from({ length: 1 }).map((_, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="h-6 w-44 bg-white/[0.04] rounded animate-pulse" />
                  <div className="flex flex-row gap-5 pb-6">
                    {Array.from({ length: 4 }).map((_, bIdx) => (
                      <div
                        key={bIdx}
                        className="aspect-[3/4.4] w-[140px] md:w-[160px] bg-white/[0.02] border border-white/[0.03] rounded-xl animate-pulse flex-shrink-0"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : collections.length > 0 ? (
            <div className="space-y-12">
              {collections.map((col) => (
                <div key={col._id} className="space-y-4 animate-fade-in">
                  
                  {/* Underlined Collection Header link */}
                  <a
                    href={`#collection-${col._id}`}
                    className="font-luxury-serif text-2xl font-light text-white/95 hover:text-white underline underline-offset-8 decoration-white/20 hover:decoration-white transition-all cursor-pointer inline-block"
                  >
                    {col.name}
                  </a>

                  {/* Horizontal scroll flex container */}
                  <div className="flex flex-row overflow-x-auto gap-5 pb-6 pt-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {col.books.map((book) => (
                      <div
                        key={book._id}
                        onClick={() => handleBookClick(book)}
                        className="flex-shrink-0 aspect-[3/4.4] w-[140px] md:w-[160px] bg-[#111622]/40 rounded-xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.5)] border border-white/5 relative group cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:border-white/20 hover:shadow-[0_20px_45px_rgba(0,0,0,0.7)]"
                      >
                        {/* Book cover image */}
                        <img
                          src={book.image_url}
                          alt={book.book_title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          loading="lazy"
                        />
                        
                        {/* Hover Overlay detail panel */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3.5">
                          <p className="text-[11px] font-semibold tracking-wide text-white leading-normal truncate">
                            {book.book_title}
                          </p>
                          <p className="text-[9px] text-white/50 truncate mt-0.5 font-light">
                            {book.author_name}
                          </p>
                        </div>

                        {/* Edge lighting helper */}
                        <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 rounded-xl pointer-events-none transition-colors duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl select-none">
              <p className="font-luxury-serif italic text-white/30 text-lg mb-2">No collections cataloged yet.</p>
              <p className="text-xs text-white/20">Create or add books to start building your literary deck.</p>
            </div>
          )}
        </div>
      </section>

      {/* BookDetailOverlay Component Overlay Portal */}
      {selectedBook && (
        <BookDetailOverlay
          isOpen={isOverlayOpen}
          onClose={() => {
            setIsOverlayOpen(false);
            setSelectedBook(null);
          }}
          book={selectedBook}
          onReadNow={(id) => console.log(`Reading book: ${id}`)}
          onChapterSelect={(bookId, chapterId) => console.log(`Selected chapter: ${chapterId} on book: ${bookId}`)}
        />
      )}
    </main>
  );
}
