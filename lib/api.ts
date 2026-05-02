// lib/api.ts
import { Book, Author, ApiResponse, User, Bookmark, Note, Collection, Comment } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://luminary-backend-chi.vercel.app/api/v1';

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
// --- HEALTH CHECK ---
export const healthCheck = () => fetcher<string>('/');

// --- AUTHENTICATION ROUTES ---
export const signup = (data: any) => fetcher<User>('/authenticate/signup', { method: 'POST', body: JSON.stringify(data) }); 
export const login = (data: any) => fetcher<any>('/authenticate/login', { method: 'POST', body: JSON.stringify(data) });
export const refreshTokens = (data: any) => fetcher<any>('/authenticate/refresh', { method: 'POST', body: JSON.stringify(data) });
export const signout = () => fetcher<void>('/authenticate/signout', { method: 'POST' });

// --- USER ROUTES ---
export const getUsers = () => fetcher<User[]>('/users');
export const getUserById = (id: string) => fetcher<User>(`/users/getbyid/${id}`);
export const searchUsers = (username: string) => fetcher<User[]>(`/users/getbyname?q=${username}`);

// --- BOOK ROUTES ---
export const getBooks = () => fetcher<Book[]>('/books');
export const getBookById = (id: string) => fetcher<Book>(`/books/getbyid/${id}`); //
export const getBooksByAuthor = (authorId: string) => fetcher<Book[]>(`/books/getbyauthor/${authorId}`);
export const searchBooks = (title: string) => fetcher<Book[]>(`/books/getbyname?q=${title}`);
export const createBook = (data: Partial<Book>) => fetcher<Book>('/books', { method: 'POST', body: JSON.stringify(data) });
export const updateBook = (id: string, data: Partial<Book>) => fetcher<Book>(`/books/update/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteBook = (id: string) => fetcher<void>(`/books/delete/${id}`, { method: 'DELETE' });

// --- AUTHOR ROUTES ---
export const getAuthors = () => fetcher<Author[]>('/authors');
export const getAuthorById = (id: string) => fetcher<Author>(`/authors/getbyid/${id}`); //
export const searchAuthors = (name: string) => fetcher<Author[]>(`/authors/getbyname?q=${name}`); //
export const createAuthor = (data: Partial<Author>) => fetcher<Author>('/authors', { method: 'POST', body: JSON.stringify(data) });
export const updateAuthor = (id: string, data: Partial<Author>) => fetcher<Author>(`/authors/update/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAuthor = (id: string) => fetcher<void>(`/authors/delete/${id}`, { method: 'DELETE' });

// --- COLLECTIONS ---
export const getCollectionEbooks = () => fetcher<any[]>('/collection-ebooks');
export const getEbooksByCollectionId = (id: string) => fetcher<any[]>(`/collection-ebooks/getbycollectionid/${id}`);
export const addBookToCollection = (data: { collection_id: string, book_id: string }) => fetcher<any>('/collection-ebooks', { method: 'POST', body: JSON.stringify(data) });
export const getUserCollections = (userId: string) => fetcher<Collection[]>(`/collections/user/${userId}`);
export const searchCollections = (name: string) => fetcher<Collection[]>(`/collections/getbyname?q=${name}`);
export const createCollection = (data: Partial<Collection>) => fetcher<Collection>('/collections', { method: 'POST', body: JSON.stringify(data) });
export const deleteCollection = (id: string) => fetcher<void>(`/collections/delete/${id}`, { method: 'DELETE' });

// --- BOOKMARKS ---
export const getBookmarksForBook = (bookId: string, userId: string) => fetcher<Bookmark>(`/bookmarks/book/${bookId}/user/${userId}`);

// --- COMMENTS & NOTES ---
export const createComment = (data: Partial<Comment>) => fetcher<Comment>('/comments', { method: 'POST', body: JSON.stringify(data) });
export const getComments = () => fetcher<Comment[]>('/comments');
export const getCommentsByBook = (bookId: string) => fetcher<Comment[]>(`/comments/book/${bookId}`);
export const getNotes = () => fetcher<Note[]>('/notes');
export const getNoteById = (id: string) => fetcher<Note>(`/notes/getbyid/${id}`);
export const getNotesByBookAndUser = (bookId: string, userId: string) => fetcher<Note[]>(`/notes/book/${bookId}/user/${userId}`);

// --- GEMINI CHATBOT ---
export const getChatContext = (bookId: string, userId: string) => fetcher<any>(`/gemini-chatbot/conversation/${bookId}/${userId}`);
export const sendChatPrompt = (data: any) => fetcher<any>('/gemini-chatbot/prompt-text', { method: 'POST', body: JSON.stringify(data) });