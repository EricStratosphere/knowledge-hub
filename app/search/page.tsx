'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api';
import BookDetailOverlay, { BookDetailData } from '@/components/BookDetailOverlay';
import { Book } from '@/types';

// High-fidelity Mock Dataset matching image_2414fb.jpg
const mockBooks: BookDetailData[] = [
  {
    _id: 'pj-1',
    book_title: 'Percy Jackson & The Olympians: The Lightning Thief',
    author_name: 'Rick Riordan',
    genre: ['Fantasy', 'Adventure', 'Mythology'],
    description: 'Percy Jackson is a good kid, but he can\'t seem to focus on his schoolwork or control his temper. And lately, being away at boarding school is only getting worse—Percy could have sworn his pre-algebra teacher turned into a monster and tried to kill him.',
    image_url: 'https://covers.openlibrary.org/b/id/12643807-L.jpg',
    pdf_url: 'https://luminary-api.example.com/books/pj1.pdf',
    rating: 4.8,
    chapters: [
      { id: 'pj1-ch1', title: 'Chapter 1: I Accidentally Vaporize My Pre-Algebra Teacher', chapterNumber: 1 },
      { id: 'pj1-ch2', title: 'Chapter 2: Three Old Ladies Knit the Socks of Death', chapterNumber: 2 },
      { id: 'pj1-ch3', title: 'Chapter 3: Grover Unexpectedly Loses His Pants', chapterNumber: 3 },
    ],
    reviews: [
      { _id: 'rev-pj1-1', username: 'CampHalfBloodGuy', rating: 5, content: 'Best series opener ever. Rick Riordan is a genius!', createdAt: '3 days ago' }
    ]
  },
  {
    _id: 'pj-2',
    book_title: 'Percy Jackson & The Olympians: The Sea of Monsters',
    author_name: 'Rick Riordan',
    genre: ['Fantasy', 'Adventure', 'Mythology'],
    description: 'After a summer spent trying to prevent a catastrophic war among the Greek gods, Percy Jackson finds his seventh-grade school year unnervingly quiet. His biggest problem is dealing with his new friend, Tyson—a six-foot-three, mentally challenged homeless kid who follows Percy everywhere.',
    image_url: 'https://covers.openlibrary.org/b/id/11130635-L.jpg',
    pdf_url: 'https://luminary-api.example.com/books/pj2.pdf',
    rating: 4.7,
    chapters: [
      { id: 'pj2-ch1', title: 'Chapter 1: My Best Friend Shops for a Wedding Dress', chapterNumber: 1 },
      { id: 'pj2-ch2', title: 'Chapter 2: I Play Dodgeball with Cannibals', chapterNumber: 2 },
    ],
    reviews: []
  },
  {
    _id: 'pj-3',
    book_title: 'Percy Jackson & The Olympians: The Titan\'s Curse',
    author_name: 'Rick Riordan',
    genre: ['Fantasy', 'Adventure', 'Mythology'],
    description: 'When Percy Jackson receives an urgent distress call from his friend Grover, he immediately prepares for battle. He knows he\'ll need his powerful demigod allies at his side, his trusty bronze sword, Riptide, and... a ride from his mom.',
    image_url: 'https://covers.openlibrary.org/b/id/10495147-L.jpg',
    pdf_url: 'https://luminary-api.example.com/books/pj3.pdf',
    rating: 4.9,
    chapters: [
      { id: 'pj3-ch1', title: 'Chapter 1: My Rescue Mission Goes Horribly Wrong', chapterNumber: 1 },
      { id: 'pj3-ch2', title: 'Chapter 2: The Vice Principal Gets a Rocket Launcher', chapterNumber: 2 },
    ],
    reviews: []
  },
  {
    _id: 'pj-4',
    book_title: 'Percy Jackson & The Olympians: The Battle of the Labyrinth',
    author_name: 'Rick Riordan',
    genre: ['Fantasy', 'Adventure', 'Mythology'],
    description: 'Percy Jackson isn\'t expecting freshman orientation to be any fun. But when a mysterious mortal acquaintance appears on campus, followed by demon cheerleaders, things quickly go from bad to worse.',
    image_url: 'https://covers.openlibrary.org/b/id/10574487-L.jpg',
    pdf_url: 'https://luminary-api.example.com/books/pj4.pdf',
    rating: 4.8,
    chapters: [
      { id: 'pj4-ch1', title: 'Chapter 1: I Battle the Cheerleaders', chapterNumber: 1 },
      { id: 'pj4-ch2', title: 'Chapter 2: The Underworld is Closed for Renovation', chapterNumber: 2 },
    ],
    reviews: []
  },
  {
    _id: 'pj-5',
    book_title: 'Percy Jackson & The Olympians: The Last Olympian',
    author_name: 'Rick Riordan',
    genre: ['Fantasy', 'Adventure', 'Mythology'],
    description: 'All year the half-bloods have been preparing for battle against the Titans, knowing the odds of victory are grim. Kronos\'s army is stronger than ever, and with every god and half-blood he recruits, the evil Titan\'s power only grows.',
    image_url: 'https://covers.openlibrary.org/b/id/11130643-L.jpg',
    pdf_url: 'https://luminary-api.example.com/books/pj5.pdf',
    rating: 4.9,
    chapters: [
      { id: 'pj5-ch1', title: 'Chapter 1: I Go Cruising with Explosives', chapterNumber: 1 },
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
      { id: 'ho1-ch1', title: 'Chapter 1: Jason', chapterNumber: 1 },
      { id: 'ho1-ch2', title: 'Chapter 2: Piper', chapterNumber: 2 },
    ],
    reviews: []
  },
  {
    _id: 'ho-2',
    book_title: 'The Heroes of Olympus: The Son of Neptune',
    author_name: 'Rick Riordan',
    genre: ['Fantasy', 'Adventure', 'Mythology'],
    description: 'Percy is confused. When he awoke after his long sleep, he didn\'t know much more than his name. His brain-fuzz is lingering, even after the Lupa told him he is a demigod and trained him for war.',
    image_url: 'https://covers.openlibrary.org/b/id/11494801-L.jpg',
    pdf_url: 'https://luminary-api.example.com/books/ho2.pdf',
    rating: 4.8,
    chapters: [
      { id: 'ho2-ch1', title: 'Chapter 1: Percy', chapterNumber: 1 },
    ],
    reviews: []
  },
  {
    _id: 'ho-4',
    book_title: 'The Heroes of Olympus: The House of Hades',
    author_name: 'Rick Riordan',
    genre: ['Fantasy', 'Adventure', 'Mythology'],
    description: 'At the conclusion of The Mark of Athena, Annabeth and Percy tumble into a pit leading straight to the Underworld. The other five demigods have to put aside their grief and follow Percy\'s instructions to find the mortal side of the Doors of Death.',
    image_url: 'https://covers.openlibrary.org/b/id/11494819-L.jpg',
    pdf_url: 'https://luminary-api.example.com/books/ho4.pdf',
    rating: 4.9,
    chapters: [
      { id: 'ho4-ch1', title: 'Chapter 1: Hazel', chapterNumber: 1 },
    ],
    reviews: []
  },
  {
    _id: 'ho-3',
    book_title: 'The Heroes of Olympus: The Mark of Athena',
    author_name: 'Rick Riordan',
    genre: ['Fantasy', 'Adventure', 'Mythology'],
    description: 'Annabeth is terrified. Just when she\'s about to be reunited with Percy—after six months of being apart thanks to Hera—it seems Camp Jupiter is preparing for war.',
    image_url: 'https://covers.openlibrary.org/b/id/11494812-L.jpg',
    pdf_url: 'https://luminary-api.example.com/books/ho3.pdf',
    rating: 4.7,
    chapters: [
      { id: 'ho3-ch1', title: 'Chapter 1: Annabeth', chapterNumber: 1 },
    ],
    reviews: []
  },
  {
    _id: 'ho-5',
    book_title: 'The Heroes of Olympus: The Blood of Olympus',
    author_name: 'Rick Riordan',
    genre: ['Fantasy', 'Adventure', 'Mythology'],
    description: 'Though the Greek and Roman crew members of the Argo II have made progress in their many quests, they still seem no closer to defeating the earth mother, Gaea. Her giants have all risen, and they\'re stronger than ever.',
    image_url: 'https://covers.openlibrary.org/b/id/10495155-L.jpg',
    pdf_url: 'https://luminary-api.example.com/books/ho5.pdf',
    rating: 4.8,
    chapters: [
      { id: 'ho5-ch1', title: 'Chapter 1: Jason', chapterNumber: 1 },
    ],
    reviews: []
  },
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
      { id: 'hp1-ch1', title: 'Chapter 1: The Boy Who Lived', chapterNumber: 1 },
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
      { id: 'hp4-ch1', title: 'Chapter 1: The Riddle House', chapterNumber: 1 },
    ],
    reviews: []
  }
];

export default function SearchPage() {
  const router = useRouter();

  // State hooks
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<BookDetailData[]>(mockBooks);
  const [isLoading, setIsLoading] = useState(false);

  // Authors mapping cache
  const [authorsMap, setAuthorsMap] = useState<Record<string, string>>({});

  // Overlay Interaction State
  const [selectedBook, setSelectedBook] = useState<BookDetailData | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // Load authors map on mount to map author_id -> author_name
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
      .catch((err) => console.error('Failed to load authors data:', err));
  }, []);

  // Debouncing Effect: waits for 300ms of inactivity before updating debouncedQuery
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search execution pipeline: queries the backend API or filters mock dataset
  useEffect(() => {
    const trimmed = debouncedQuery.trim().toLowerCase();
    
    // Helper to map Book interface from API to BookDetailData expected by the Overlay
    const mapBookToDetail = (book: Book): BookDetailData => {
      const authorName = book.book_author_id
        ?.map((id) => authorsMap[id] || 'Unknown Author')
        .join(', ') || 'Unknown Author';

      return {
        _id: book._id,
        book_title: book.book_title,
        author_name: authorName,
        genre: book.genre || [],
        description: book.description || '',
        image_url: book.image_url || '',
        pdf_url: book.pdf_url || '',
        rating: 4.5, // Default rating for catalogs
        chapters: [],
        reviews: []
      };
    };

    setIsLoading(true);

    if (!trimmed) {
      // Fetch all books from backend first, fall back to high-fidelity mock list
      api.getBooks()
        .then((res) => {
          if (res.success && res.data && res.data.length > 0) {
            setResults(res.data.map(mapBookToDetail));
          } else {
            setResults(mockBooks);
          }
        })
        .catch(() => {
          setResults(mockBooks);
        })
        .finally(() => {
          setIsLoading(false);
        });
      return;
    }

    // Call actual search API
    api.searchBooks(trimmed)
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setResults(res.data.map(mapBookToDetail));
        } else {
          // Client-side fallback search on mockBooks if API is empty
          const filtered = mockBooks.filter((book) => {
            const matchTitle = book.book_title.toLowerCase().includes(trimmed);
            const matchAuthor = book.author_name.toLowerCase().includes(trimmed);
            const matchGenre = book.genre.some((g) => g.toLowerCase().includes(trimmed));
            return matchTitle || matchAuthor || matchGenre;
          });
          setResults(filtered);
        }
      })
      .catch(() => {
        // Fallback filter locally on error
        const filtered = mockBooks.filter((book) => {
          const matchTitle = book.book_title.toLowerCase().includes(trimmed);
          const matchAuthor = book.author_name.toLowerCase().includes(trimmed);
          const matchGenre = book.genre.some((g) => g.toLowerCase().includes(trimmed));
          return matchTitle || matchAuthor || matchGenre;
        });
        setResults(filtered);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [debouncedQuery, authorsMap]);

  // Click handler to launch details modal overlay
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
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          position: relative;
          overflow: hidden;
        }
        .animate-shimmer::after {
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.05) 20%,
            rgba(255, 255, 255, 0.1) 60%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 1.6s infinite;
          content: '';
        }
      `}} />

      {/* Decorative High-End Background Glows */}
      <div className="absolute -bottom-1/4 left-1/4 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute -top-1/4 right-1/4 w-[500px] h-[500px] bg-slate-800/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Top Navigation / Brand Header */}
      <header className="w-full max-w-6xl flex items-center justify-between mb-8 z-10 relative select-none h-12">
        {/* Back Arrow button */}
        <button
          onClick={() => router.back()}
          aria-label="Navigate back"
          className="text-white/60 hover:text-white transition-colors duration-200 cursor-pointer p-2 rounded-lg hover:bg-white/5 active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        {/* Centered LUMINARY Serif Brand Header */}
        <h1 className="font-luxury-serif text-3xl font-extralight tracking-[0.25em] text-white uppercase text-center absolute left-1/2 -translate-x-1/2 pointer-events-none">
          LUMINARY
        </h1>

        {/* Placeholder spacer to balance layout */}
        <div className="w-10" />
      </header>

      {/* Search Input Box */}
      <section className="w-full max-w-2xl mx-auto mb-16 z-10 relative px-4">
        <div className="relative group transition-all duration-300">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Percy Jackson, Harry Potter..."
            className="w-full bg-transparent border-b border-white/10 focus:border-white focus:outline-none transition-all duration-300 py-3 pr-12 text-white font-luxury-serif text-2xl placeholder-white/20 focus:ring-0"
          />
          <div className="absolute right-2 bottom-3 text-white/40 group-focus-within:text-white transition-colors duration-300">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </section>

      {/* Interactive Grid Section / Loading Shimmer */}
      <section className="w-full max-w-6xl mx-auto z-10 relative px-4 flex-1">
        {isLoading ? (
          // Shimmer Placeholders matching the exact grid layout style
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8 justify-items-center">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-[3/4.4] w-full max-w-[220px] bg-[#111622]/20 border border-white/[0.03] rounded-xl animate-shimmer"
              />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8 justify-items-center animate-fade-in">
            {results.map((book) => (
              <div
                key={book._id}
                onClick={() => handleBookClick(book)}
                className="aspect-[3/4.4] w-full max-w-[220px] bg-[#111622]/40 rounded-xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.5)] border border-white/5 transition-all duration-300 hover:scale-[1.03] hover:border-white/20 hover:shadow-[0_20px_45px_rgba(0,0,0,0.8)] cursor-pointer group relative"
              >
                {/* Image element */}
                <img
                  src={book.image_url}
                  alt={book.book_title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  loading="lazy"
                />
                
                {/* Subtle border shine effect */}
                <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 rounded-xl pointer-events-none transition-colors duration-300" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 select-none animate-fade-in">
            <p className="font-luxury-serif italic text-white/30 text-lg mb-2">No matching editions discovered.</p>
            <p className="text-xs text-white/20 tracking-wider">Try searching for other mythical sagas or magical titles.</p>
          </div>
        )}
      </section>

      {/* BookDetailOverlay Component Instance */}
      {selectedBook && (
        <BookDetailOverlay
          isOpen={isOverlayOpen}
          onClose={() => {
            setIsOverlayOpen(false);
            setSelectedBook(null);
          }}
          book={selectedBook}
          onReadNow={(id) => console.log(`Read book: ${id}`)}
          onChapterSelect={(bookId, chapterId) => console.log(`Select chapter: ${chapterId} for book: ${bookId}`)}
        />
      )}
    </main>
  );
}
