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

// Generic response wrapper based on your API's pattern
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
}