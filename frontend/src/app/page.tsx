import Link from 'next/link';
import { BookOpen, Search, ArrowRight, BrainCircuit, Globe2, Lightbulb } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#1E293B] font-sans selection:bg-[#FBBF24] selection:text-[#1E293B]">
      
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto border-b-2 border-[#1E293B]/10">
        <div className="flex items-center gap-2">
          {/* Simulated Logo: Book & Bridge motif */}
          <div className="relative flex items-center justify-center w-10 h-10 bg-white border-2 border-[#1E293B] rounded-xl shadow-[2px_2px_0px_#1E293B] overflow-hidden">
            <BookOpen className="h-6 w-6 text-[#1E293B] absolute bottom-1" />
            <div className="absolute top-1 w-full h-2 bg-[#14B8A6] rounded-t-full opacity-80" />
          </div>
          <span className="font-black text-2xl tracking-tight text-[#1E293B]">
            EduBridge <span className="text-[#14B8A6]">AI</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-bold text-sm">
          <Link href="#" className="hover:text-[#14B8A6] transition-colors">Courses</Link>
          <Link href="#" className="hover:text-[#14B8A6] transition-colors">Tutors</Link>
          <Link href="/sign-in" className="text-slate-500 hover:text-[#1E293B] transition-colors">Sign In</Link>
          <Link href="/dashboard" className="px-6 py-2.5 bg-[#14B8A6] text-white rounded-full border-2 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] hover:bg-[#0D9488] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all">
            Start Learning
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 pt-20 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FBBF24] border-2 border-[#1E293B] text-[#1E293B] font-black text-xs uppercase tracking-wider mb-8 shadow-[2px_2px_0px_#1E293B]">
          <span className="animate-pulse">●</span> For JSS & SSS Students
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-[#1E293B] tracking-tight mb-8 leading-[1.1]">
          Master Math, Science & <br className="hidden md:block" />
          <span className="relative inline-block">
            <span className="relative z-10">AI Skills</span>
            <span className="absolute bottom-1 left-0 w-full h-4 md:h-6 bg-[#FBBF24] -z-10 rounded-sm"></span>
          </span> for the Future.
        </h1>
        
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
          From Nigerian History to Prompt Engineering, learn through interactive stories and a conversational AI tutor that adapts to your grade.
        </p>

        {/* Discovery Search Bar */}
        <div className="max-w-2xl mx-auto mb-10 relative">
          <div className="flex items-center bg-white border-4 border-[#1E293B] rounded-full p-2 shadow-[6px_6px_0px_#14B8A6]">
            <div className="pl-4 pr-2 text-slate-400">
              <Search size={24} />
            </div>
            <input 
              type="text" 
              placeholder="What do you want to learn today? (e.g. Plate Tectonics, JSS2 Math)"
              className="flex-1 bg-transparent py-3 px-2 outline-none text-[#1E293B] font-bold placeholder:font-medium placeholder:text-slate-400"
            />
            <Link href="/dashboard" className="hidden sm:flex px-8 py-4 bg-[#1E293B] text-white font-black rounded-full hover:bg-slate-800 transition-colors">
              Search
            </Link>
          </div>
        </div>
        
        {/* Quick Filters */}
        <div className="flex flex-wrap justify-center gap-3">
          <span className="px-4 py-2 rounded-full border-2 border-[#1E293B] bg-[#38BDF8] font-bold text-sm shadow-[2px_2px_0px_#1E293B] hover:-translate-y-0.5 transition-transform cursor-pointer">
            Grades 6-8 (JSS)
          </span>
          <span className="px-4 py-2 rounded-full border-2 border-[#1E293B] bg-[#FB7185] text-white font-bold text-sm shadow-[2px_2px_0px_#1E293B] hover:-translate-y-0.5 transition-transform cursor-pointer">
            Grades 9-12 (SSS)
          </span>
          <span className="px-4 py-2 rounded-full border-2 border-[#1E293B] bg-[#34D399] font-bold text-sm shadow-[2px_2px_0px_#1E293B] hover:-translate-y-0.5 transition-transform cursor-pointer">
            Tech & AI Skills
          </span>
        </div>
      </main>

      {/* How It Works (Based on the Graphic Sequence) */}
      <section className="bg-white border-t-4 border-[#1E293B] py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-[#1E293B] mb-4">How AI Understands You</h2>
            <p className="text-lg font-bold text-slate-500">From the words you type to the answer you get, in 3 easy steps.</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 relative z-10">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="w-24 h-24 rounded-3xl bg-[#FBBF24] border-4 border-[#1E293B] shadow-[6px_6px_0px_#1E293B] flex items-center justify-center mb-6 relative">
                <span className="absolute -top-4 -left-4 w-8 h-8 bg-white border-2 border-[#1E293B] rounded-full font-black flex items-center justify-center">1</span>
                <Lightbulb size={40} className="text-[#1E293B]" />
              </div>
              <h3 className="text-xl font-black text-[#1E293B] mb-2">Your Prompt</h3>
              <p className="text-slate-600 font-medium">Ask any question like "Explain photosynthesis like I am 13."</p>
            </div>

            <ArrowRight className="hidden md:block text-[#1E293B] opacity-50" size={32} />

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center max-w-xs mt-8 md:mt-0">
              <div className="w-24 h-24 rounded-3xl bg-[#14B8A6] border-4 border-[#1E293B] shadow-[6px_6px_0px_#1E293B] flex items-center justify-center mb-6 relative">
                <span className="absolute -top-4 -left-4 w-8 h-8 bg-white border-2 border-[#1E293B] rounded-full font-black flex items-center justify-center text-[#1E293B]">2</span>
                <BrainCircuit size={40} className="text-white" />
              </div>
              <h3 className="text-xl font-black text-[#1E293B] mb-2">AI Focus</h3>
              <p className="text-slate-600 font-medium">The AI reads your curriculum and translates it into simple terms.</p>
            </div>

            <ArrowRight className="hidden md:block text-[#1E293B] opacity-50" size={32} />

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center max-w-xs mt-8 md:mt-0">
              <div className="w-24 h-24 rounded-3xl bg-[#FB7185] border-4 border-[#1E293B] shadow-[6px_6px_0px_#1E293B] flex items-center justify-center mb-6 relative">
                <span className="absolute -top-4 -left-4 w-8 h-8 bg-white border-2 border-[#1E293B] rounded-full font-black flex items-center justify-center text-[#1E293B]">3</span>
                <Globe2 size={40} className="text-white" />
              </div>
              <h3 className="text-xl font-black text-[#1E293B] mb-2">The Answer</h3>
              <p className="text-slate-600 font-medium">Get a personalized lesson, voice feedback, or an interactive 3D model.</p>
            </div>
          </div>

          <div className="mt-20 text-center">
             <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-[#14B8A6] text-white font-black text-lg rounded-full border-2 border-[#1E293B] shadow-[6px_6px_0px_#1E293B] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1E293B] transition-all">
                Try it now <ArrowRight size={20} />
             </Link>
          </div>

        </div>
        
        {/* Decorative Background Elements based on graphic */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FBBF24] rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      </section>

    </div>
  );
}