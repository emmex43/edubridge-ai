'use client';

import Link from 'next/link';
import { Clock, PlayCircle, Sparkles, PlusCircle } from 'lucide-react';

interface ModuleItem {
  id: string;
  title: string;
  category: string;
  grade: string;
  stepNumber: number;
  progress: number;
  timeSpent: string;
  themeColor: 'teal' | 'yellow' | 'coral' | 'blue' | 'green';
  link: string;
}

const activeModules: ModuleItem[] = [
  {
    id: '1',
    title: 'Prompt Engineering: Zero-Shot to Few-Shot',
    category: 'AI & Digital Skills',
    grade: 'Grades 6–9',
    stepNumber: 1,
    progress: 70,
    timeSpent: '1h 45m',
    themeColor: 'teal',
    link: '/learn',
  },
  {
    id: '2',
    title: 'Earth Systems & Plate Tectonics',
    category: 'Sciences & Nature',
    grade: 'Grades 7–10',
    stepNumber: 2,
    progress: 45,
    timeSpent: '2h 10m',
    themeColor: 'blue',
    link: '#',
  },
  {
    id: '3',
    title: 'Pre-Colonial Kingdoms & Trade Routes',
    category: 'History & Society',
    grade: 'Grades 8–12',
    stepNumber: 3,
    progress: 25,
    timeSpent: '50m',
    themeColor: 'yellow',
    link: '#',
  },
  {
    id: '4',
    title: 'AI Animation & Creative Storytelling',
    category: 'Creative Tech',
    grade: 'Grades 6–12',
    stepNumber: 4,
    progress: 10,
    timeSpent: '30m',
    themeColor: 'coral',
    link: '#',
  },
];

const colorStyles = {
  teal: {
    banner: 'bg-[#14B8A6]',
    badge: 'bg-[#14B8A6] text-white',
    bar: 'bg-[#14B8A6]',
    btn: 'bg-[#14B8A6] hover:bg-[#0D9488] text-white',
  },
  blue: {
    banner: 'bg-[#38BDF8]',
    badge: 'bg-[#38BDF8] text-[#1E293B]',
    bar: 'bg-[#38BDF8]',
    btn: 'bg-[#38BDF8] hover:bg-[#0284C7] text-white',
  },
  yellow: {
    banner: 'bg-[#FBBF24]',
    badge: 'bg-[#FBBF24] text-[#1E293B]',
    bar: 'bg-[#FBBF24]',
    btn: 'bg-[#FBBF24] hover:bg-[#D97706] text-[#1E293B]',
  },
  coral: {
    banner: 'bg-[#FB7185]',
    badge: 'bg-[#FB7185] text-white',
    bar: 'bg-[#FB7185]',
    btn: 'bg-[#FB7185] hover:bg-[#E11D48] text-white',
  },
  green: {
    banner: 'bg-[#34D399]',
    badge: 'bg-[#34D399] text-[#1E293B]',
    bar: 'bg-[#34D399]',
    btn: 'bg-[#34D399] hover:bg-[#059669] text-white',
  },
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#FFFDF8] text-[#1E293B] p-6 md:p-12">
      <div className="mx-auto max-w-6xl space-y-10">

        {/* Dashboard Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-[#1E293B]/10 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBBF24] border-2 border-[#1E293B] px-3 py-1 text-xs font-black text-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
                <Sparkles size={14} /> Junior Scholar
              </span>
              <span className="text-xs font-bold text-slate-500 bg-white border border-[#1E293B]/20 rounded-full px-2.5 py-0.5">
                Grades 6–12
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#1E293B] tracking-tight">
              Welcome back, <span className="bg-[#FBBF24] px-2 py-0.5 rounded-md border border-[#1E293B]">Explorer</span>
            </h1>
            <p className="text-slate-600 font-medium mt-2">
              Ready to learn science, history, and build cool AI skills today?
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white border-2 border-[#1E293B] rounded-2xl p-4 shadow-[3px_3px_0px_#1E293B] text-center min-w-[110px]">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Progress</span>
              <span className="text-2xl font-black text-[#1E293B]">48%</span>
            </div>
            <div className="bg-white border-2 border-[#1E293B] rounded-2xl p-4 shadow-[3px_3px_0px_#1E293B] text-center min-w-[110px]">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Time</span>
              <span className="text-2xl font-black text-[#1E293B]">5h 15m</span>
            </div>
            <Link
              href="/tutor/upload"
              className="hidden lg:flex items-center gap-2 px-4 py-4 rounded-2xl bg-[#1E293B] text-white font-bold text-sm hover:bg-slate-800 transition"
              title="Add lesson via Tutor Studio"
            >
              <PlusCircle size={18} />
              <span>Tutor Studio</span>
            </Link>
          </div>
        </header>

        {/* Active Modules Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#1E293B]">Your Learning Track</h2>
              <p className="text-sm font-medium text-slate-500">Step-by-step interactive lessons and AI chats</p>
            </div>
            <Link
              href="#"
              className="text-sm font-extrabold text-[#14B8A6] hover:underline flex items-center gap-1"
            >
              Browse All Courses →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            {activeModules.map((mod) => {
              const theme = colorStyles[mod.themeColor];
              return (
                <div
                  key={mod.id}
                  className="flex flex-col rounded-3xl bg-white border-2 border-[#1E293B] shadow-[5px_5px_0px_#1E293B] overflow-hidden transition-transform hover:-translate-y-1"
                >
                  {/* Card Header Strip */}
                  <div className={`p-4 ${theme.banner} border-b-2 border-[#1E293B] flex items-center justify-between`}>
                    <span className="w-8 h-8 rounded-xl bg-white border-2 border-[#1E293B] font-black text-sm flex items-center justify-center shadow-[2px_2px_0px_#1E293B]">
                      {mod.stepNumber}
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider bg-white/90 border border-[#1E293B] rounded-full px-2.5 py-0.5 text-[#1E293B]">
                      {mod.grade}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      {mod.category}
                    </span>
                    <h3 className="text-lg font-black text-[#1E293B] leading-snug mb-4">
                      {mod.title}
                    </h3>

                    {/* Progress */}
                    <div className="mt-auto space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>{mod.progress}% Complete</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {mod.timeSpent}
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-slate-100 border-2 border-[#1E293B] overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full ${theme.bar} transition-all duration-500`}
                          style={{ width: `${mod.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Resume Action */}
                    <Link
                      href={mod.link}
                      className={`mt-5 flex w-full items-center justify-center gap-2 rounded-full py-2.5 px-4 font-extrabold text-sm border-2 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all ${theme.btn}`}
                    >
                      <PlayCircle size={16} />
                      <span>{mod.progress === 100 ? 'Review' : 'Continue'}</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
}