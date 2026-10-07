'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Lock } from 'lucide-react';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error('Invalid credentials. Please try again.');
      }

      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      router.push('/dashboard'); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FFFDF8] text-[#1E293B] font-sans selection:bg-[#FBBF24] selection:text-[#1E293B]">
      
      {/* Left Column - Branding (Hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 bg-[#14B8A6] border-r-4 border-[#1E293B] p-12 flex-col justify-between relative overflow-hidden">
        
        <Link href="/" className="relative z-10 block hover:opacity-90 transition-opacity w-fit mt-4">
          <Image 
            src="/edubridge_logo1.png" 
            alt="EduBridge AI Logo" 
            width={400} 
            height={400} 
            className="h-24 md:h-32 w-auto object-contain object-left mix-blend-multiply -ml-4"
            priority
          />
        </Link>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E293B] text-white font-black text-xs uppercase tracking-wider mb-6 shadow-[2px_2px_0px_white]">
            <Lock size={14} /> Welcome Back
          </div>
          <h1 className="text-5xl font-black leading-[1.1] mb-6 text-white drop-shadow-md">
            Ready to continue your <br/>
            <span className="bg-[#FBBF24] text-[#1E293B] px-2 py-1 rounded-lg border-2 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] inline-block mt-2">learning</span> journey?
          </h1>
          <p className="text-white font-bold text-lg max-w-md mt-4 drop-shadow-sm">
            Sign in to pick up right where you left off in your science, history, and AI modules.
          </p>
        </div>
        
        <div className="text-sm font-bold text-[#1E293B] relative z-10">
          © 2026 EduBridge AI. All rights reserved.
        </div>
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-white rounded-full border-4 border-[#1E293B] opacity-10 pointer-events-none"></div>
      </div>

      {/* Right Column - Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 md:px-12 lg:px-24">
        <div className="mx-auto w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border-4 border-[#1E293B] shadow-[6px_6px_0px_#1E293B]">
          
          <div className="mb-8 lg:hidden">
            <Link href="/" className="block hover:opacity-90 transition-opacity w-fit">
              <Image 
                src="/edubridge_logo1.png" 
                alt="EduBridge AI Logo" 
                width={300} 
                height={300} 
                className="h-24 w-auto object-contain object-left mix-blend-multiply -ml-2" 
                priority
              />
            </Link>
          </div>

          <h2 className="text-3xl font-black text-[#1E293B] mb-2">Sign In</h2>
          <p className="text-slate-500 font-bold mb-6">Enter your details to access your dashboard.</p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border-2 border-red-500 text-red-700 text-sm font-bold rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-black text-[#1E293B] mb-2 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border-2 border-[#1E293B] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] font-medium transition-shadow"
                placeholder="student@school.edu"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-black text-[#1E293B] uppercase tracking-wider">Password</label>
                <Link href="#" className="text-xs font-black text-[#14B8A6] hover:underline">
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border-2 border-[#1E293B] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] font-medium transition-shadow"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center gap-2">
               <input 
                 type="checkbox" 
                 id="remember"
                 className="w-4 h-4 rounded border-2 border-[#1E293B] text-[#14B8A6] focus:ring-[#14B8A6]" 
               />
               <label htmlFor="remember" className="text-sm font-bold text-slate-600 cursor-pointer">
                 Remember me
               </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#1E293B] px-4 py-4 text-white font-black text-lg border-2 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] hover:bg-slate-800 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1E293B] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connecting...' : 'Sign In'} <ArrowRight size={20} />
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-bold text-slate-600">
            Don't have an account?{' '}
            <Link href="/sign-up" className="text-[#FB7185] font-black hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}