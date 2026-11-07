'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, UserPlus } from 'lucide-react';
import Image from 'next/image';

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        throw new Error('Could not create account. Please try again.');
      }

      const data = await res.json();
      
      // Save the access token returned by the backend to the browser
      localStorage.setItem('token', data.access_token);
      
      // Auto-redirect to dashboard after creating the account
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      
      {/* Left Column - Branding (Hidden on mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-border bg-rose-800 p-12 lg:flex">
        
        {/* Desktop Logo */}
        <Link href="/" className="relative z-10 block hover:opacity-90 transition-opacity w-fit">
          <Image 
            src="/edubridge_logo1.png" 
            alt="EduBridge AI Logo" 
            width={200} 
            height={60} 
            className="h-24 md:h-32 w-auto object-contain object-left mix-blend-multiply -ml-4"
            priority
          />
        </Link>
        
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
        
        <div className="relative z-10 text-sm font-semibold text-white">
          © 2026 EduBridge AI. All rights reserved.
        </div>
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-white rounded-full border-4 border-[#1E293B] opacity-10 pointer-events-none"></div>
      </div>

      {/* Right Column - Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 md:px-12 lg:px-24">
        <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-10">
          
          {/* Mobile Logo */}
          <div className="mb-8 lg:hidden">
            <Link href="/" className="block hover:opacity-90 transition-opacity w-fit">
              <Image 
                src="/edubridge_logo1.png" 
                alt="EduBridge AI Logo" 
                width={200} 
                height={60} 
                className="h-16 w-auto object-contain object-left mix-blend-multiply -ml-2"
                priority
              />
            </Link>
          </div>

          <h2 className="mb-2 text-3xl font-black">Create account</h2>
          <p className="mb-6 font-medium text-muted">Sign up to get started with EduBridge.</p>

          {error && (
            <div role="alert" className="mb-6 rounded-xl border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-bold">Full name</label>
              <input
                type="text"
                id="name"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="min-h-12 w-full rounded-xl border border-border px-4 py-3 font-medium transition-shadow focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-bold">Student email</label>
              <input
                type="email"
                id="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-12 w-full rounded-xl border border-border px-4 py-3 font-medium transition-shadow focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="student@school.edu"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-bold">Password</label>
              <input
                type="password"
                id="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-12 w-full rounded-xl border border-border px-4 py-3 font-medium transition-shadow focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-8 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-lg font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Creating account...' : 'Create account'} <ArrowRight aria-hidden="true" size={20} />
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-muted">
            Already have an account?{' '}
            <Link href="/sign-in" className="font-bold text-brand hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}