import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SignIn() {
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

          <form className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="student@uniben.edu"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                Remember me
              </label>
              <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Forgot password?</a>
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Sign In <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/sign-up" className="font-semibold text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      
    </div>
  );
}