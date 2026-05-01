// types/index.ts

export interface Author {
  _id: string;
  name: string;
  author_description: string;
  createdAt: string;
  updatedAt: string;
} // [cite: 6]

export interface Book {
  _id: string;
  book_title: string;
  book_author_id: string[];
  date_published: string;
  genre: string[];
  description: string;
  image_url: string;
  pdf_url: string;
} // [cite: 16]

export interface User {
  _id: string;
  username: string;
  email: string;
  is_admin: boolean;
  is_writer: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  _id: string;
  book_id: string;
  user_id: string;
  page: number; // Added from updated README
}

export interface Collection {
  _id: string;
  name: string;
  user_id: string;
  public: boolean; // Added from updated README[cite: 1, 2]
}

export interface Comment {
  _id: string;
  user_id: string;
  book_id: string;
  like_count: number;
  rating: number;
  content: string;
  replying_to: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  book_id: string;
  user_id: string;
  noteContent: string;
  page: number;
}

// Generic response wrapper based on your API's pattern
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
}