// app/test/page.tsx
import * as api from '@/lib/api'; // Easier to access everything via api.functionName

export default async function TestPage() {
  // We only fetch public data to avoid 500 errors from missing tokens or invalid IDs
  const [booksRes, authorsRes] = await Promise.all([
    api.getBooks(),
    api.getAuthors()
  ]);

  const books = booksRes.data || [];
  const authors = authorsRes.data || [];

  return (
    <main className="min-h-screen p-8 bg-slate-50 text-slate-900 space-y-12">
      <header>
        <h1 className="text-4xl font-bold">Luminary Public Library 📚</h1>
        <p className="text-slate-500 mt-2">Testing public API connectivity and data flow.</p>
      </header>
      
      {/* CONNECTION STATUS DASHBOARD */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl border shadow-sm">
          <p className="text-xs uppercase font-bold text-slate-400 mb-1">Books Available</p>
          <p className="text-3xl font-mono text-emerald-600">{books.length}</p>
        </div>
        <div className="p-6 bg-white rounded-xl border shadow-sm">
          <p className="text-xs uppercase font-bold text-slate-400 mb-1">Featured Authors</p>
          <p className="text-3xl font-mono text-blue-600">{authors.length}</p>
        </div>
        <div className="p-6 bg-white rounded-xl border shadow-sm">
          <p className="text-xs uppercase font-bold text-slate-400 mb-1">API Health</p>
          <p className={`text-xl font-bold ${booksRes.success ? 'text-green-600' : 'text-red-600'}`}>
            {booksRes.success ? 'Connected ✅' : 'Connection Failed ❌'}
          </p>
        </div>
      </section>

      {/* FEATURE: Authors List */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Our Authors</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {authors.length > 0 ? (
            authors.map((author) => (
              <div key={author._id} className="min-w-[250px] p-5 bg-white rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg">{author.name}</h3>
                <p className="text-xs text-slate-400 font-mono mb-2">{author._id}</p>
                <p className="text-sm text-slate-600 line-clamp-2 italic">
                  {author.author_description || "No description provided."}
                </p>
              </div>
            ))
          ) : (
            <p className="text-slate-400 italic">No authors loaded from the backend.</p>
          )}
        </div>
      </section>

      {/* FEATURE: Books Discovery Grid */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Browse Collection</h2>
        {books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {books.map((book) => (
              <div key={book._id} className="group p-4 bg-white rounded-2xl shadow-sm border border-slate-200 transition-hover hover:shadow-md">
                <div className="aspect-[3/4] w-full bg-slate-200 rounded-lg mb-4 overflow-hidden">
                  <img 
                    src={book.image_url} 
                    alt={book.book_title} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <h3 className="text-lg font-bold line-clamp-1">{book.book_title}</h3>
                <p className="text-[10px] text-slate-400 font-mono mb-3">{book._id}</p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {book.genre.map((g) => (
                    <span key={g} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] uppercase font-bold rounded">
                      {g}
                    </span>
                  ))}
                </div>
                
                <button className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800">
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-400">The library shelves are empty... check your DB connection!</p>
          </div>
        )}
      </section>
    </main>
  );
}