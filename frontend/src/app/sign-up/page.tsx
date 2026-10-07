'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ArrowRight, UserPlus } from 'lucide-react';

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Adjust the endpoint path if your backend engineer named it differently (e.g., /api/v1/auth/register)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        throw new Error('Could not create account. Please try again.');
      }

      const data = await res.json();
      // Auto-redirect to sign in or dashboard after creating the account
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FFFDF8] text-[#1E293B] font-sans selection:bg-[#FBBF24] selection:text-[#1E293B]">
      
      {/* Left Column - Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#FB7185] border-r-4 border-[#1E293B] p-12 flex-col justify-between relative overflow-hidden">
        <div className="flex items-center gap-2 relative z-10">
          <div className="relative flex items-center justify-center w-10 h-10 bg-white border-2 border-[#1E293B] rounded-xl shadow-[2px_2px_0px_#1E293B] overflow-hidden">
            <BookOpen className="h-6 w-6 text-[#1E293B] absolute bottom-1" />
            <div className="absolute top-1 w-full h-2 bg-[#FBBF24] rounded-t-full opacity-80" />
          </div>
          <span className="font-black text-2xl tracking-tight text-white">
            EduBridge <span className="text-[#1E293B]">AI</span>
          </span>
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E293B] text-white font-black text-xs uppercase tracking-wider mb-6 shadow-[2px_2px_0px_white]">
            <UserPlus size={14} /> Join the Beta
          </div>
          <h1 className="text-5xl font-black leading-[1.1] mb-6 text-white drop-shadow-md">
            Start your interactive <br/>
            <span className="bg-[#FBBF24] text-[#1E293B] px-2 py-1 rounded-lg border-2 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] inline-block mt-2">learning</span> journey today.
          </h1>
          <p className="text-white font-bold text-lg max-w-md mt-4 drop-shadow-sm">
            Create an account to track your progress, save your chat history, and unlock all STEM & history modules.
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
          
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="relative flex items-center justify-center w-10 h-10 bg-white border-2 border-[#1E293B] rounded-xl shadow-[2px_2px_0px_#1E293B] overflow-hidden">
              <BookOpen className="h-6 w-6 text-[#1E293B] absolute bottom-1" />
              <div className="absolute top-1 w-full h-2 bg-[#14B8A6] rounded-t-full opacity-80" />
            </div>
            <span className="font-black text-2xl tracking-tight text-[#1E293B]">
              EduBridge <span className="text-[#14B8A6]">AI</span>
            </span>
          </div>

          <h2 className="text-3xl font-black text-[#1E293B] mb-2">Create Account</h2>
          <p className="text-slate-500 font-bold mb-6">Sign up to get started with EduBridge.</p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border-2 border-red-500 text-red-700 text-sm font-bold rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-black text-[#1E293B] mb-2 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border-2 border-[#1E293B] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] font-medium transition-shadow"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-black text-[#1E293B] mb-2 uppercase tracking-wider">Student Email</label>
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
              <label htmlFor="password" className="block text-sm font-black text-[#1E293B] mb-2 uppercase tracking-wider">Password</label>
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

            <button
              type="submit"
              disabled={isLoading}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#14B8A6] px-4 py-4 text-white font-black text-lg border-2 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] hover:bg-[#0D9488] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1E293B] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={20} />
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-bold text-slate-600">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-[#14B8A6] font-black hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}