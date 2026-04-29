// app/books/page.tsx
import { getBooks } from '@/lib/api';

export default async function BooksPage() {
  // Fetching the data directly on the server!
  const response = await getBooks();
  const books = response.data || [];

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <h1 className="text-4xl font-bold mb-8 text-slate-900">Knowledge Hub Library</h1>
      
      {response.success ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <div key={book._id} className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
              {/* Fallback image if the stub URL is broken */}
              <img 
                src={book.image_url} 
                alt={book.book_title} 
                className="w-full h-48 object-cover rounded-lg mb-4 bg-slate-200"
              />
              <h2 className="text-xl font-semibold mb-2">{book.book_title}</h2>
              <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                {book.description}
              </p>
              <div className="flex gap-2 mb-4">
                {book.genre.map((g) => (
                  <span key={g} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-red-500">Whoops! Something went wrong: {response.message}</p>
      )}
    </main>
  );
}