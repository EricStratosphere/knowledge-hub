'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';

// Interface for Login Form State
export interface LoginFormData {
  email: string;
  password: string;
}

// Interface for Validation Errors
export interface LoginFormErrors {
  email?: string;
  password?: string;
  apiError?: string;
}

export default function LoginPage() {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  // UI Status States
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  // Field change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation error on type
    if (errors[name as keyof LoginFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Custom client-side validation
  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required.';
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
      // In Phase 3 we will integrate live API login flows
      console.log('Sending Login Form Data:', formData);
      
      // Temporary simulated flow for Phase 1 verification
      setIsLoading(false);
      setApiSuccess('Login state validation complete! Ready for Phase 2 styling.');
    } catch (error: any) {
      setIsLoading(false);
      setErrors({
        apiError: error.message || 'An unexpected error occurred during login.',
      });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-[#080B11] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Premium Font Injection and Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        
        .font-luxury-serif {
          font-family: 'Playfair Display', Georgia, serif;
        }
        .font-jakarta {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(3px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* Decorative High-End Background Radial Glows */}
      <div className="absolute -bottom-1/4 left-1/4 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute -top-1/4 right-1/4 w-[500px] h-[500px] bg-slate-800/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Left/Hero Panel - Visible only on Desktop (matching FIGMA brand layout) */}
      <div className="hidden lg:flex flex-col justify-center items-start w-1/2 max-w-xl pr-16 z-10 select-none">
        <h1 className="font-luxury-serif text-6xl xl:text-7xl font-extralight tracking-[0.25em] text-white leading-tight mb-5 uppercase">
          LUMINARY
        </h1>
        <p className="font-luxury-serif italic text-white/40 text-xl font-light tracking-wide leading-relaxed pl-1.5">
          All your books, in one click.
        </p>
      </div>

      {/* Right/Card Panel - Responsive Centered Card */}
      <div className="w-full lg:w-1/2 flex justify-center items-center z-10">
        <div className="w-full max-w-[420px] bg-[#111622]/60 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-8 md:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.8)] relative overflow-hidden transition-all duration-300">
          
          {/* Subtle inner top-edge highlights */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

          {/* Card Header */}
          <h2 className="font-luxury-serif text-3xl font-light text-white tracking-wide mb-8 select-none">
            Sign in
          </h2>

          {/* Validation Banner Messages */}
          {apiSuccess && (
            <div className="mb-6 p-4 bg-emerald-950/45 border border-emerald-500/20 text-emerald-400/90 rounded-lg text-xs font-jakarta tracking-wide flex items-center gap-2.5 animate-fade-in">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {apiSuccess}
            </div>
          )}

          {errors.apiError && (
            <div className="mb-6 p-4 bg-rose-950/45 border border-rose-500/20 text-rose-400/90 rounded-lg text-xs font-jakarta tracking-wide flex items-center gap-2.5 animate-fade-in">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.apiError}
            </div>
          )}

          {/* Login Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-6 font-jakarta">
            
            {/* Email Input Container */}
            <div className="relative group transition-all duration-300">
              <label className="block text-[10px] font-medium tracking-[0.2em] text-white/40 uppercase mb-1 transition-colors duration-300 group-focus-within:text-white">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="user@example.com"
                className="w-full bg-transparent border-b border-white/20 focus:border-white focus:outline-none transition-all duration-300 py-2.5 text-white placeholder-white/20 text-sm focus:ring-0 disabled:opacity-40"
              />
              {errors.email && (
                <p className="text-rose-400/90 text-xs mt-1.5 font-medium flex items-center gap-1.5 animate-fade-in">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Input Container */}
            <div className="relative group transition-all duration-300">
              <div className="flex justify-between items-baseline mb-1">
                <label className="block text-[10px] font-medium tracking-[0.2em] text-white/40 uppercase transition-colors duration-300 group-focus-within:text-white">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => e.preventDefault()}
                  className="text-[10px] font-normal text-white/30 hover:text-white transition-colors duration-300 select-none"
                >
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-white/20 focus:border-white focus:outline-none transition-all duration-300 py-2.5 text-white placeholder-white/20 text-sm focus:ring-0 disabled:opacity-40"
              />
              {errors.password && (
                <p className="text-rose-400/90 text-xs mt-1.5 font-medium flex items-center gap-1.5 animate-fade-in">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Primary Action Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-[#080B11] hover:bg-neutral-100 font-semibold py-3.5 rounded-md text-xs tracking-widest uppercase transition-all duration-300 disabled:opacity-40 mt-8 active:scale-[0.98] shadow-[0_8px_30px_rgba(255,255,255,0.06)] flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-[#080B11]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Navigation Redirect Footer */}
          <div className="text-center mt-8 pt-4 border-t border-white/[0.05]">
            <p className="text-xs text-white/35 tracking-wider font-normal">
              Don't have an account?{' '}
              <a
                href="/signup"
                className="text-white/60 hover:text-white hover:underline underline-offset-4 transition-colors font-medium pl-1.5"
              >
                Sign up.
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
