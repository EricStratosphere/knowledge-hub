// lib/api.ts
import { Book, Author, ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://luminary-backend-chi.vercel.app/api/v1'; // 

// Helper function to handle fetch and errors
async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

// --- AUTHENTICATION ROUTES ---


// --- USER ROUTES ---


// --- BOOK ROUTES ---
export const getBookById = (id: string) => fetcher<Book>(`/books/getbyid/${id}`); //
export const getBooksByAuthor = (authorId: string) => fetcher<Book[]>(`/books/getbyauthor/${authorId}`); //[cite: 2]
export const searchBooks = (title: string) => fetcher<Book[]>(`/books/getbyname?q=${title}`); //[cite: 2]

// --- AUTHOR ROUTES ---
export const getAuthorById = (id: string) => fetcher<Author>(`/authors/getbyid/${id}`); //
export const searchAuthors = (name: string) => fetcher<Author[]>(`/authors/getbyname?q=${name}`); //

// --- COLLECTIONS ---

// --- BOOKMARKS ---

// --- COMMENTS & NOTES ---