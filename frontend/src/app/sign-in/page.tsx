'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { describeError } from '@/lib/api';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const signIn = useAuthStore((s) => s.signIn);
  const user = useAuthStore((s) => s.user);
  const hydrate = useAuthStore((s) => s.hydrate);
  const router = useRouter();

  // Someone who is already signed in shouldn't sit on this page.
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/dashboard');
    } catch (err) {
      setError(describeError(err, 'Could not sign you in. Please try again.'));
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">

      {/* Left Column - Branding (Hidden on small screens) */}
      <div className="hidden w-1/2 bg-blue-600 p-12 text-white lg:flex flex-col justify-between">
        <div className="flex items-center gap-2 font-bold text-2xl">
          <Sparkles className="h-6 w-6" />
          <span>EduBridge AI</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Master complex concepts with interactive intelligence.
          </h1>
          <p className="text-blue-100 text-lg max-w-md">
            Sign in to pick up where you left off and continue your interactive learning journey.
          </p>
        </div>

        <div className="text-sm text-blue-200">
          © 2026 EduBridge AI. All rights reserved.
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-24">
        <div className="mx-auto w-full max-w-sm">

          {/* Mobile Branding */}
          <div className="mb-8 flex items-center gap-2 font-bold text-2xl text-blue-600 lg:hidden">
            <Sparkles className="h-6 w-6" />
            <span>EduBridge AI</span>
          </div>

          <h2 className="mb-2 text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mb-8 text-gray-500">Please enter your details to sign in.</p>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                placeholder="student@uniben.edu"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting || !email.trim() || !password}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
            >
              {submitting ? (
                <>
                  Signing in <Loader2 size={18} className="animate-spin" />
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="font-semibold text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
