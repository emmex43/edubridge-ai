import Link from 'next/link';
import { BookOpen, ArrowRight, Lock } from 'lucide-react';

export default function SignIn() {
  return (
    <div className="flex min-h-screen bg-[#FFFDF8] text-[#1E293B] font-sans selection:bg-[#FBBF24] selection:text-[#1E293B]">
      
      {/* Left Column - Branding (Hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 bg-[#14B8A6] border-r-4 border-[#1E293B] p-12 flex-col justify-between relative overflow-hidden">
        {/* Logo */}
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

        {/* Decorative Graphic */}
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-white rounded-full border-4 border-[#1E293B] opacity-10 pointer-events-none"></div>
      </div>

      {/* Right Column - Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 md:px-12 lg:px-24">
        <div className="mx-auto w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border-4 border-[#1E293B] shadow-[6px_6px_0px_#1E293B]">
          
          {/* Mobile Branding */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="relative flex items-center justify-center w-10 h-10 bg-white border-2 border-[#1E293B] rounded-xl shadow-[2px_2px_0px_#1E293B] overflow-hidden">
              <BookOpen className="h-6 w-6 text-[#1E293B] absolute bottom-1" />
              <div className="absolute top-1 w-full h-2 bg-[#14B8A6] rounded-t-full opacity-80" />
            </div>
            <span className="font-black text-2xl tracking-tight text-[#1E293B]">
              EduBridge <span className="text-[#14B8A6]">AI</span>
            </span>
          </div>

          <h2 className="text-3xl font-black text-[#1E293B] mb-2">Sign In</h2>
          <p className="text-slate-500 font-bold mb-8">Enter your details to access your dashboard.</p>

          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-black text-[#1E293B] mb-2 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                id="email"
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
              type="button"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#1E293B] px-4 py-4 text-white font-black text-lg border-2 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] hover:bg-slate-800 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1E293B] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
            >
              Sign In <ArrowRight size={20} />
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