'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTutorStore } from '@/store/useTutorStore';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useModuleProgress } from '@/hooks/useModuleProgress';
import * as api from '@/lib/api';
import type { Module } from '@/lib/api';
import PauseAndAskOverlay from '@/components/tutor/PauseAndAskOverlay';
import ModelViewer from '@/components/interactive/ModelViewer';
import { BookOpen, Video, Layers, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Reports study time and engagement for the open module.
 *
 * Mounted only once the stored baseline has loaded, so the hook starts from
 * the student's real total instead of zero — `/student/progress` sets the
 * value rather than incrementing it, so a zero baseline would erase history.
 * Keyed by module id so switching modules starts a clean count.
 */
function ModuleProgressTracker({
  moduleId,
  baseline,
  questionsAsked,
}: {
  moduleId: string;
  baseline: number;
  questionsAsked: number;
}) {
  const { recordQuestion } = useModuleProgress(moduleId, baseline);

  // Seeded with the count already on the clock, so questions asked in a
  // previous module don't get re-counted against this one.
  const lastAskedRef = useRef(questionsAsked);

  useEffect(() => {
    if (questionsAsked > lastAskedRef.current) {
      lastAskedRef.current = questionsAsked;
      recordQuestion();
    }
  }, [questionsAsked, recordQuestion]);

  return null;
}

function LearnContent() {
  const { user, ready } = useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const setModuleId = useTutorStore((s) => s.setModuleId);
  const highlight = useTutorStore((s) => s.highlight);
  const questionsAsked = useTutorStore((s) => s.questionsAsked);
  const openTutor = useTutorStore((s) => s.openTutor);

  const requestedId = searchParams.get('module');

  const [module, setModule] = useState<Module | null>(null);
  const [baseline, setBaseline] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The tutor is grounded in whichever module is open, including when it
  // changes without a remount.
  useEffect(() => {
    setModuleId(module?.id ?? null);
  }, [module, setModuleId]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const modules = await api.getModules();
        if (cancelled) return;

        // Landing on /learn with no module — from the marketing page's "View
        // 3D Demo", say — opens the first module rather than an empty shell,
        // and says so in the URL so the address stays shareable.
        const target = modules.find((m) => m.id === requestedId) ?? modules[0] ?? null;

        if (!target) {
          setModule(null);
          return;
        }

        const progress = await api.getProgress(target.id);
        if (cancelled) return;

        setModule(target);
        setBaseline(progress[0]?.time_spent_seconds ?? 0);

        if (target.id !== requestedId) {
          router.replace(`/learn?module=${encodeURIComponent(target.id)}`);
        }
      } catch (err) {
        if (!cancelled) setError(api.describeError(err, 'Could not load this module.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, requestedId, router]);

  if (!ready || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50/50">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 size={18} className="animate-spin" />
          <span>Loading module…</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 md:p-8 lg:p-12">
      <div className="mx-auto max-w-[1400px] space-y-8">

        {/* Header */}
        <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <Link
              href="/dashboard"
              className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              <ArrowLeft size={14} /> Back to dashboard
            </Link>

            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <Sparkles size={16} />
              <span>{module?.course ?? 'Course material'}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {module?.label ?? 'No module selected'}
            </h1>
            <p className="mt-1 text-gray-500">Watch the AI instructor lesson and inspect the model.</p>
          </div>

          <button
            onClick={openTutor}
            disabled={!module}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-medium text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50"
          >
            <BookOpen size={18} />
            Ask AI Tutor
          </button>
        </header>

        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            {error}
          </div>
        )}

        {/* Split-Screen Layout */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">

          {/* Left Column: AI Instructor Video */}
          <section className="flex flex-col space-y-4">
            <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <Video className="text-blue-600" size={22} />
              <h2>Lesson Video</h2>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-gray-200 bg-black shadow-sm">
              <video
                className="h-full w-full object-cover"
                controls
                poster="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop"
              >
                <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                AI Instructor Generated
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-2 font-bold text-gray-900">Lesson Overview</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                In this module, your virtual instructor breaks down the structural mechanics and
                spatial relationships of the provided asset. Watch the explanation, then interact
                with the model directly in the 3D sandbox. If you need clarity in Pidgin or English,
                open the AI Tutor — it answers from this module&apos;s material, and the part it is
                referring to is highlighted in the sandbox.
              </p>
            </div>
          </section>

          {/* Right Column: 3D Model Viewer */}
          <section className="flex h-full flex-col space-y-4">
            <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <Layers className="text-blue-600" size={22} />
              <h2>Interactive Sandbox</h2>
            </div>

            <div className="h-full min-h-[480px] w-full rounded-3xl border border-gray-100 bg-white p-2 shadow-sm">
              <ModelViewer
                modelPath="/models/DamagedHelmet.glb"
                title={module?.label ?? '3D Asset Viewer'}
                highlight={highlight}
              />
            </div>
          </section>

        </div>
      </div>

      {module && (
        <ModuleProgressTracker
          key={module.id}
          moduleId={module.id}
          baseline={baseline}
          questionsAsked={questionsAsked}
        />
      )}

      <PauseAndAskOverlay />
    </main>
  );
}

export default function LearnPage() {
  // useSearchParams needs a Suspense boundary above it, otherwise the whole
  // route opts out of prerendering.
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50/50">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 size={18} className="animate-spin" />
            <span>Loading module…</span>
          </div>
        </main>
      }
    >
      <LearnContent />
    </Suspense>
  );
}
