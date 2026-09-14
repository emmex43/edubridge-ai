'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { describeError } from '@/lib/api';

/** The backend requires a password but sets no minimum; this is a floor the
 *  UI enforces so the form can't be submitted with something trivially weak. */
const MIN_PASSWORD_LENGTH = 8;

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const signUp = useAuthStore((s) => s.signUp);
  const user = useAuthStore((s) => s.user);
  const hydrate = useAuthStore((s) => s.hydrate);
  const router = useRouter();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await signUp(email.trim(), password, name.trim());
      router.replace('/dashboard');
    } catch (err) {
      setError(describeError(err, 'Could not create your account. Please try again.'));
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/50 text-blue-50 font-medium text-sm mb-6 border border-blue-400/50">
            <UserPlus size={16} />
            <span>Join the Beta</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Start your interactive learning journey today.
          </h1>
          <p className="text-blue-100 text-lg max-w-md">
            Create an account to track your progress, save your chat history, and unlock all 3D STEM modules.
          </p>
        </div>

        <div className="text-sm text-blue-200">
          © 2026 EduBridge AI. All rights reserved.
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-24">
        <div className="mx-auto w-full max-w-sm">

          {/* Mobile Branding */}
          <div className="mb-8 flex items-center gap-2 font-bold text-2xl text-blue-600 lg:hidden">
            <Sparkles className="h-6 w-6" />
            <span>EduBridge AI</span>
          </div>

          <h2 className="mb-2 text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mb-8 text-gray-500">Sign up to get started with EduBridge.</p>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                id="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">University Email</label>
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">
                At least {MIN_PASSWORD_LENGTH} characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !email.trim() || !password}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:hover:bg-blue-600"
            >
              {submitting ? (
                <>
                  Creating account <Loader2 size={18} className="animate-spin" />
                </>
              ) : (
                <>
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/sign-in" className="font-semibold text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
