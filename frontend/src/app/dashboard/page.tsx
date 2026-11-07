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
    link: '/learn',
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
    link: '/learn',
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
    link: '/learn',
  },
];

const colorStyles = {
  teal: {
    banner: 'bg-teal-50',
    badge: 'bg-teal-100 text-teal-950',
    bar: 'bg-teal-700',
    btn: 'bg-brand text-white hover:bg-brand-hover',
  },
  blue: {
    banner: 'bg-sky-50',
    badge: 'bg-sky-100 text-sky-950',
    bar: 'bg-sky-700',
    btn: 'bg-brand text-white hover:bg-brand-hover',
  },
  yellow: {
    banner: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-950',
    bar: 'bg-amber-500',
    btn: 'bg-brand text-white hover:bg-brand-hover',
  },
  coral: {
    banner: 'bg-rose-50',
    badge: 'bg-rose-100 text-rose-950',
    bar: 'bg-rose-700',
    btn: 'bg-brand text-white hover:bg-brand-hover',
  },
  green: {
    banner: 'bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-950',
    bar: 'bg-emerald-700',
    btn: 'bg-brand text-white hover:bg-brand-hover',
  },
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-10">

        {/* Dashboard Header */}
        <header className="flex flex-col justify-between gap-8 border-b border-border pb-8 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-950">
                <Sparkles size={14} /> Junior Scholar
              </span>
              <span className="inline-flex min-h-8 items-center rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-muted">
                Grades 6–12
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Welcome back, Explorer
            </h1>
            <p className="mt-2 max-w-xl leading-7 text-muted">
              Ready to learn something new? Pick up where you left off or explore a
              different topic.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[130px] rounded-2xl border border-border bg-white px-5 py-4">
              <span className="block text-xs font-semibold uppercase tracking-wider text-muted">Progress</span>
              <span className="mt-1 block text-2xl font-black">48%</span>
            </div>
            <div className="min-w-[130px] rounded-2xl border border-border bg-white px-5 py-4">
              <span className="block text-xs font-semibold uppercase tracking-wider text-muted">Time learned</span>
              <span className="mt-1 block text-2xl font-black">5h 15m</span>
            </div>
            <Link
              href="/tutor/upload"
              className="hidden min-h-12 items-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-bold transition hover:border-brand hover:text-brand lg:flex"
              title="Add lesson via Tutor Studio"
            >
              <PlusCircle size={18} />
              <span>Tutor Studio</span>
            </Link>
          </div>
        </header>

        {/* Active Modules Section */}
        <section id="learning-track" className="scroll-mt-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black">Your learning track</h2>
              <p className="mt-1 text-sm leading-6 text-muted">Interactive lessons and AI chats, one step at a time.</p>
            </div>
            <span className="text-sm font-semibold text-muted">{activeModules.length} lessons in progress</span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            {activeModules.map((mod) => {
              const theme = colorStyles[mod.themeColor];
              return (
                <div
                  key={mod.id}
                  className="flex flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Card Header Strip */}
                  <div className={`flex items-center justify-between border-b border-border px-5 py-4 ${theme.banner}`}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-black text-foreground shadow-sm">
                      {mod.stepNumber}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${theme.badge}`}>
                      {mod.grade}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <span className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">
                      {mod.category}
                    </span>
                    <h3 className="mb-4 text-lg font-bold leading-snug">
                      {mod.title}
                    </h3>

                    {/* Progress */}
                    <div className="mt-auto space-y-2 pt-2">
                      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-muted">
                        <span>{mod.progress}% Complete</span>
                        <span className="flex items-center gap-1">
                          <Clock aria-hidden="true" size={14} /> {mod.timeSpent}
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`${mod.title} completion`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={mod.progress}
                        className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
                      >
                        <div
                          aria-hidden="true"
                          className={`h-full rounded-full transition-all duration-500 ${theme.bar}`}
                          style={{ width: `${mod.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Resume Action */}
                    <Link
                      href={mod.link}
                      className={`mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-colors ${theme.btn}`}
                    >
                      <PlayCircle aria-hidden="true" size={17} />
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