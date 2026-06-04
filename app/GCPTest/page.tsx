'use client';

import { useState } from 'react';
import ImageUploadTest from './ImageUploadTest';
import PdfUploadTest from './PdfUploadTest';

export default function GCPTestPage() {
  const [activeTab, setActiveTab] = useState<'images' | 'pdfs'>('images');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Tab Navigation */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('images')}
              className={`px-4 py-2 font-medium rounded-lg transition ${
                activeTab === 'images'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              📷 Image Upload
            </button>
            <button
              onClick={() => setActiveTab('pdfs')}
              className={`px-4 py-2 font-medium rounded-lg transition ${
                activeTab === 'pdfs'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              📄 PDF Upload
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'images' && <ImageUploadTest />}
        {activeTab === 'pdfs' && <PdfUploadTest />}
      </div>
    </div>
  );
}
