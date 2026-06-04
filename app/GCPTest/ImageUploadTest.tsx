'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface UploadResponse {
  success: boolean;
  message: string;
  data: any;
  error: any;
}

export default function ImageUploadTest() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      setSelectedFile(null);
      setPreview('');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      setSelectedFile(null);
      setPreview('');
      return;
    }

    setSelectedFile(file);
    setError('');
    setResponse(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
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

      const res = await fetch('/api/upload', {
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
        setPreview('');
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">GCP Upload Test</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Test the addContent function by uploading images to Google Cloud Storage</p>

          {/* File Input Section */}
          <div className="border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-lg p-8 mb-6 hover:border-indigo-500 dark:hover:border-indigo-400 transition">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full cursor-pointer accent-indigo-600 dark:accent-indigo-400"
              disabled={loading}
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Supported formats: JPEG, PNG, GIF, WebP. Max size: 10MB
            </p>
          </div>

          {/* Preview Section */}
          {preview && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Preview</h2>
              <div className="relative w-full h-64 bg-gray-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
              {selectedFile && (
                <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                  <p><strong>Filename:</strong> {selectedFile.name}</p>
                  <p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
                  <p><strong>Type:</strong> {selectedFile.type}</p>
                </div>
              )}
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            {loading ? 'Uploading...' : 'Upload Image'}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-300 font-semibold">Error</p>
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Success Response */}
          {response && response.success && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-300 font-semibold">✓ {response.message}</p>
              <div className="mt-3 bg-gray-50 dark:bg-slate-800 p-3 rounded border border-green-100 dark:border-green-800 text-sm text-gray-700 dark:text-gray-300 max-h-48 overflow-auto">
                <pre>{JSON.stringify(response.data, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Failed Response */}
          {response && !response.success && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-300 font-semibold">✗ Upload Failed</p>
              <div className="mt-3 bg-gray-50 dark:bg-slate-800 p-3 rounded border border-red-100 dark:border-red-800 text-sm text-gray-700 dark:text-gray-300 max-h-48 overflow-auto">
                <pre>{JSON.stringify(response.error, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
