'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signup, getOtpSignup, verifyOtp } from '@/lib/api';

// Interface for SignUp Form State
export interface SignUpFormData {
  username: string;
  email: string;
  password: string; // Required field
  is_admin: boolean;
  is_writer: boolean;
}

// Interface for Validation Errors
export interface SignUpFormErrors {
  username?: string;
  email?: string;
  password?: string;
  otp?: string;
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

  // OTP Step States
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');

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
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 1: Submit Handler to request OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiSuccess(null);

    // Client-side validation check for signup details
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await getOtpSignup(formData.email);
      
      if (res.success) {
        setApiSuccess(res.message || 'Verification code sent! Please check your email.');
        setIsOtpStep(true);
      } else {
        setErrors({
          apiError: res.message || 'Failed to send verification code. Please try again.',
        });
      }
    } catch (error: any) {
      setErrors({
        apiError: error.message || 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Verify OTP and then immediately register User
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiSuccess(null);

    // Basic validation of OTP input code
    if (!otpCode.trim()) {
      setErrors({ otp: 'Verification code is required.' });
      return;
    } else if (otpCode.trim().length !== 6 || isNaN(Number(otpCode))) {
      setErrors({ otp: 'Code must be a 6-digit number.' });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Verify OTP first
      const verifyRes = await verifyOtp(Number(otpCode));
      
      if (!verifyRes.success) {
        setErrors({
          otp: verifyRes.message || 'Verification failed. Incorrect or expired code.',
        });
        setIsLoading(false);
        return;
      }

      // 2. Fire the registration call on success
      const signupRes = await signup(formData);

      if (signupRes.success) {
        setApiSuccess(signupRes.message || 'Registration complete! Redirecting to sign in...');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setErrors({
          apiError: signupRes.message || 'Registration failed. Please check your credentials.',
        });
      }
    } catch (error: any) {
      setErrors({
        apiError: error.message || 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      setIsLoading(false);
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
            Sign up
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

          {/* SignUp Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-6 font-jakarta">
            
            {/* Username Input Container */}
            <div className="relative group transition-all duration-300">
              <label className="block text-[10px] font-medium tracking-[0.2em] text-white/40 uppercase mb-1 transition-colors duration-300 group-focus-within:text-white">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Enter username"
                className="w-full bg-transparent border-b border-white/20 focus:border-white focus:outline-none transition-all duration-300 py-2.5 text-white placeholder-white/20 text-sm focus:ring-0 disabled:opacity-40"
              />
              {errors.username && (
                <p className="text-rose-400/90 text-xs mt-1.5 font-medium flex items-center gap-1.5 animate-fade-in">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {errors.username}
                </p>
              )}
            </div>

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
              <label className="block text-[10px] font-medium tracking-[0.2em] text-white/40 uppercase mb-1 transition-colors duration-300 group-focus-within:text-white">
                Password
              </label>
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

            {/* Premium Role Toggles */}
            <div className="flex flex-col gap-4 pt-3.5">
              
              {/* Writer Custom Slide Toggle */}
              <label className="flex items-center justify-between group cursor-pointer select-none">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white/60 group-hover:text-white transition-colors duration-300">
                    Become a Writer
                  </span>
                  <span className="text-[10px] text-white/30">
                    Write, publish, and distribute ebooks
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    name="is_writer"
                    checked={formData.is_writer}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/5 border border-white/10 rounded-full peer-focus:ring-0 peer-checked:bg-white peer-checked:border-white transition-all duration-300 relative" />
                  <div className="absolute top-[3px] left-[3px] w-[14px] h-[14px] bg-white/40 rounded-full transition-all duration-300 peer-checked:translate-x-4 peer-checked:bg-[#080B11]" />
                </div>
              </label>

              {/* Admin Custom Slide Toggle */}
              <label className="flex items-center justify-between group cursor-pointer select-none">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white/60 group-hover:text-white transition-colors duration-300">
                    Is Admin
                  </span>
                  <span className="text-[10px] text-white/30">
                    Gain system administrator privileges
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    name="is_admin"
                    checked={formData.is_admin}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/5 border border-white/10 rounded-full peer-focus:ring-0 peer-checked:bg-white peer-checked:border-white transition-all duration-300 relative" />
                  <div className="absolute top-[3px] left-[3px] w-[14px] h-[14px] bg-white/40 rounded-full transition-all duration-300 peer-checked:translate-x-4 peer-checked:bg-[#080B11]" />
                </div>
              </label>
            </div>

            {/* Primary Action Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-[#080B11] hover:bg-neutral-100 font-semibold py-3.5 rounded-md text-xs tracking-widest uppercase transition-all duration-300 disabled:opacity-40 mt-6 active:scale-[0.98] shadow-[0_8px_30px_rgba(255,255,255,0.06)] flex items-center justify-center gap-2.5 cursor-pointer"
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
                'Sign up'
              )}
            </button>
          </form>

          {/* Navigation Redirect Footer */}
          <div className="text-center mt-8 pt-4 border-t border-white/[0.05]">
            <p className="text-xs text-white/35 tracking-wider font-normal">
              Already have an account?{' '}
              <a
                href="/login"
                className="text-white/60 hover:text-white hover:underline underline-offset-4 transition-colors font-medium pl-1.5"
              >
                Sign in.
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
