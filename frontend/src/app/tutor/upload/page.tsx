'use client';

import { useState } from 'react';
import { useCourseStore } from '@/store/courseStore';
import { Plus, FileText, Image as ImageIcon, Video, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const LessonEditor = dynamic(() => import('@/components/tutor/LessonEditor'), {
  ssr: false,
  loading: () => (
    <div role="status" className="min-h-96 rounded-xl border border-border bg-surface p-4 text-sm text-muted">
      Loading lesson editor…
    </div>
  ),
});

export default function TutorUpload() {
  // Passcode Lock State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  // Curriculum Builder State (Zustand)
  const {
    courseTitle, setCourseTitle,
    modules, addModule, addLesson,
    activeLessonId, setActiveLesson,
    updateLessonTitle, updateLessonContent
  } = useCourseStore();

  const activeModule = modules.find(m => m.lessons.some(l => l.id === activeLessonId));
  const activeLesson = activeModule?.lessons.find(l => l.id === activeLessonId);

  // Handle Passcode Unlock
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Replace 'admin123' with whatever your actual master passcode is
    if (passcode === 'admin123') {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Incorrect passcode. Access denied.');
    }
  };

  // --- RENDER 1: THE LOCK SCREEN ---
  if (!isUnlocked) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-10 text-foreground">
        <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <Lock aria-hidden="true" size={24} />
          </div>
          <h1 className="mb-2 text-2xl font-black">Tutor Studio</h1>
          <p className="mb-8 text-sm leading-6 text-muted">
            Restricted access. Please enter the master admin passcode to publish modules.
          </p>
          
          {error && (
            <p role="alert" className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-800">
              {error}
            </p>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="text-left">
              <label htmlFor="studio-passcode" className="mb-2 block text-sm font-bold">
                Admin passcode
              </label>
              <input
                id="studio-passcode"
                name="passcode"
                type="password"
                autoComplete="current-password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter your passcode"
                className="min-h-12 w-full rounded-xl border border-border bg-white px-4 py-3 font-medium transition-shadow focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <button
              type="submit"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 font-bold text-white transition-colors hover:bg-brand-hover"
            >
              Unlock Studio <ArrowRight aria-hidden="true" size={18} />
            </button>
          </form>

          <Link href="/dashboard" className="mt-6 inline-flex min-h-11 items-center text-sm font-bold text-brand hover:underline">
            Return to dashboard
          </Link>
        </div>
      </main>
    );
  }

  // --- RENDER 2: THE FULL CURRICULUM BUILDER (Only visible after unlocking) ---
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground md:h-dvh md:flex-row md:overflow-hidden">

      {/* Left Sidebar - Curriculum Builder */}
      <aside aria-label="Course outline" className="flex w-full flex-col border-b border-border bg-surface md:h-full md:w-80 md:shrink-0 md:border-b-0 md:border-r">
        <header className="border-b border-border p-4 sm:p-5">
          <Link href="/dashboard" className="inline-flex min-h-11 items-center text-sm font-semibold text-muted transition-colors hover:text-brand">
            <span aria-hidden="true" className="mr-2">←</span> Back to dashboard
          </Link>
          <h1 className="mt-3 text-xl font-black tracking-tight">Tutor Studio</h1>
          <div className="mt-4">
            <label htmlFor="course-title" className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
              Course title
            </label>
            <input
              id="course-title"
              type="text"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 font-semibold transition-shadow focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              placeholder="Course title"
            />
          </div>
        </header>

        <div className="max-h-72 flex-1 space-y-5 overflow-y-auto p-4 md:max-h-none md:min-h-0">
          {modules.map((module) => (
            <section key={module.id} aria-labelledby={`module-${module.id}`} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h2 id={`module-${module.id}`} className="min-w-0 text-sm font-bold text-foreground">
                  {module.title}
                </h2>
                <button
                  type="button"
                  onClick={() => addLesson(module.id)}
                  aria-label={`Add lesson to ${module.title}`}
                  title={`Add lesson to ${module.title}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-background hover:text-brand"
                >
                  <Plus aria-hidden="true" size={18} />
                </button>
              </div>

              <div className="space-y-1 border-l border-border pl-3">
                {module.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => setActiveLesson(lesson.id)}
                    aria-pressed={activeLessonId === lesson.id}
                    className={`flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                      activeLessonId === lesson.id
                        ? 'bg-brand text-white'
                        : 'text-muted hover:bg-background hover:text-foreground'
                    }`}
                  >
                    <FileText aria-hidden="true" size={16} className="shrink-0" />
                    <span className="truncate">{lesson.title || 'Untitled Lesson'}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}

          <button
            type="button"
            onClick={addModule}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-bold text-muted transition-colors hover:border-brand hover:bg-brand/5 hover:text-brand"
          >
            <Plus aria-hidden="true" size={16} /> Add module
          </button>
        </div>

        <div className="border-t border-border p-4">
          <button
            type="button"
            disabled
            title="Course publishing is not available yet"
            className="flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-full bg-brand px-4 py-3 text-sm font-bold text-white opacity-50"
          >
            Publishing coming soon
          </button>
        </div>
      </aside>

      {/* Main Canvas - Notion Style Editor */}
      <main className="relative flex min-h-[65dvh] flex-1 flex-col bg-background md:min-h-0 md:overflow-y-auto">
        <div className="sticky top-0 z-10 flex min-h-14 items-center justify-between gap-4 border-b border-border bg-background/95 px-5 backdrop-blur-sm sm:px-8">
          <span className="min-w-0 truncate text-sm font-semibold text-muted">{courseTitle}</span>
          <span role="status" className="shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted">
            Draft · Not published
          </span>
        </div>

        <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-8 sm:py-12 lg:px-12">
          {activeLesson ? (
            <div className="space-y-6">
              <div>
                <label htmlFor="lesson-title" className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
                  Lesson title
                </label>
                <input
                  id="lesson-title"
                  type="text"
                  value={activeLesson.title}
                  onChange={(e) => updateLessonTitle(activeLesson.id, e.target.value)}
                  placeholder="Lesson title"
                  className="min-h-14 w-full rounded-xl border border-transparent bg-transparent px-3 py-2 text-3xl font-black leading-tight transition-colors placeholder:text-slate-400 hover:border-border focus:border-brand focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/20 sm:text-4xl"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 border-b border-border pb-5">
                <button
                  type="button"
                  disabled
                  title="Adding a cover image is not available yet"
                  className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted opacity-60"
                >
                  <ImageIcon aria-hidden="true" size={16} /> Cover · Coming soon
                </button>
                <button
                  type="button"
                  disabled
                  title="Adding a video is not available yet"
                  className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted opacity-60"
                >
                  <Video aria-hidden="true" size={16} /> Video · Coming soon
                </button>
              </div>

              <div>
                <h2 id="lesson-content-label" className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
                  Lesson content
                </h2>
                <div
                  aria-labelledby="lesson-content-label"
                  className="min-h-96 rounded-xl border border-border bg-surface px-2 py-3 sm:px-4"
                >
                  <LessonEditor
                    key={activeLesson.id}
                    content={activeLesson.content}
                    onChange={(content) =>
                      updateLessonContent(activeLesson.id, content)
                    }
                  />
                </div>
              </div>
            </div>
          ) : (
            <div role="status" className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface px-6 py-10 text-center">
              <FileText aria-hidden="true" size={28} className="mb-3 text-muted" />
              <p className="font-semibold text-foreground">No lesson selected</p>
              <p className="mt-1 max-w-sm text-sm leading-6 text-muted">
                Select a lesson from the course outline, or add one to a module to begin.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}