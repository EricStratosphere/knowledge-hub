'use client';

import React, { useState } from 'react';

interface UploadResponse {
  success: boolean;
  message: string;
  data: any;
  error: any;
}

export default function PdfUploadTest() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      setSelectedFile(null);
      setFileName('');
      return;
    }

    // Validate file size (50MB limit for PDFs)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      setSelectedFile(null);
      setFileName('');
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setError('');
    setResponse(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const data: UploadResponse = await res.json();
      setResponse(data);

      if (!data.success) {
        const errorMsg = data.error?.message || (typeof data.error === 'string' ? data.error : JSON.stringify(data.error)) || 'Upload failed';
        setError(errorMsg);
      } else {
        setSelectedFile(null);
        setFileName('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-8 transition-colors">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">PDF Upload Test</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Test the addContent function by uploading PDFs to Google Cloud Storage</p>

          {/* File Input Section */}
          <div className="border-2 border-dashed border-amber-300 dark:border-amber-600 rounded-lg p-8 mb-6 hover:border-amber-500 dark:hover:border-amber-400 transition">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              disabled={loading}
              className="w-full cursor-pointer"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Maximum file size: 50MB</p>
          </div>

          {/* Selected File Display */}
          {fileName && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Selected: <span className="font-mono break-all">{fileName}</span>
              </p>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition mb-6"
          >
            {loading ? 'Uploading...' : 'Upload PDF'}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-red-700 dark:text-red-200 text-sm font-medium">Error: {error}</p>
            </div>
          )}

          {/* Success Response */}
          {response?.success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <p className="text-green-700 dark:text-green-200 text-sm font-medium mb-2">✓ {response.message}</p>
              <div className="text-xs text-green-600 dark:text-green-300 font-mono break-all bg-white dark:bg-slate-900 p-2 rounded">
                <p className="mb-1"><strong>Response:</strong></p>
                <pre>{JSON.stringify(response.data, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Failure Response */}
          {response && !response.success && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-red-700 dark:text-red-200 text-sm font-medium mb-2">✗ {response.message}</p>
              <div className="text-xs text-red-600 dark:text-red-300 font-mono break-all bg-white dark:bg-slate-900 p-2 rounded">
                <p className="mb-1"><strong>Error:</strong></p>
                <pre>{JSON.stringify(response.error, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
