'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signup } from '@/lib/api';

// Interface for SignUp Form State
export interface SignUpFormData {
  username: string;
  email: string;
  password?: string; // Optional field for safety, though required by form
  is_admin: boolean;
  is_writer: boolean;
}

// Interface for Validation Errors
export interface SignUpFormErrors {
  username?: string;
  email?: string;
  password?: string;
  apiError?: string;
}

export default function SignUpPage() {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState<SignUpFormData>({
    username: '',
    email: '',
    password: '',
    is_admin: false,
    is_writer: false,
  });

  // UI Status States
  const [errors, setErrors] = useState<SignUpFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  // Field change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear validation error on type
    if (errors[name as keyof SignUpFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Custom client-side validation
  const validateForm = (): boolean => {
    const newErrors: SignUpFormErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required.';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters.';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Password validation
    const passwordValue = formData.password || '';
    if (!passwordValue) {
      newErrors.password = 'Password is required.';
    } else if (passwordValue.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiSuccess(null);

    // Client-side validation check
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // In Phase 3 we will integrate full API network flows
      console.log('Sending Form Data:', formData);
      
      // Temporary simulated flow for Phase 1 verification
      // (Actual API connection will be activated and fully bound in Phase 3)
      setIsLoading(false);
      setApiSuccess('State validation complete! Ready for Phase 2 styling.');
    } catch (error: any) {
      setIsLoading(false);
      setErrors({
        apiError: error.message || 'An unexpected error occurred during signup.',
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6 font-sans">
      <div className="w-full max-w-md bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-700">
        <h2 className="text-2xl font-bold mb-2">Create Account</h2>
        <p className="text-slate-400 text-sm mb-6">Phase 1: State & Types Setup Scaffolding</p>

        {apiSuccess && (
          <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 rounded text-sm">
            {apiSuccess}
          </div>
        )}

        {errors.apiError && (
          <div className="mb-4 p-3 bg-rose-950/80 border border-rose-500/30 text-rose-400 rounded text-sm">
            {errors.apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-slate-500 disabled:opacity-50"
            />
            {errors.username && (
              <p className="text-rose-400 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-slate-500 disabled:opacity-50"
            />
            {errors.email && (
              <p className="text-rose-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-slate-500 disabled:opacity-50"
            />
            {errors.password && (
              <p className="text-rose-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                name="is_writer"
                checked={formData.is_writer}
                onChange={handleChange}
                disabled={isLoading}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 focus:ring-0"
              />
              <span>Become a Writer</span>
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                name="is_admin"
                checked={formData.is_admin}
                onChange={handleChange}
                disabled={isLoading}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 focus:ring-0"
              />
              <span>Is Admin</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 font-semibold py-2.5 px-4 rounded text-sm transition-all disabled:opacity-50 mt-4"
          >
            {isLoading ? 'Processing...' : 'Verify Validation State'}
          </button>
        </form>
      </div>
    </div>
  );
}
