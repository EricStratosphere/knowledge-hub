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

// --- BOOK ROUTES ---
export const getBooks = () => fetcher<Book[]>('/books'); // [cite: 16]
export const getBookById = (id: string) => fetcher<Book>(`/books/${id}`); // [cite: 19]

// --- AUTHOR ROUTES ---
export const getAuthors = () => fetcher<Author[]>('/authors'); // [cite: 6]
export const getAuthorById = (id: string) => fetcher<Author>(`/authors/${id}`); // [cite: 8]