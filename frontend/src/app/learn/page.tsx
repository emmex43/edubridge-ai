'use client';

import { useTutorStore } from '@/store/useTutorStore';
import PauseAndAskOverlay from '@/components/tutor/PauseAndAskOverlay';
import ModelViewer from '@/components/interactive/ModelViewer';
import { BookOpen, Video, Layers, Globe2 } from 'lucide-react';

export default function LearnPage() {
  const toggleTutor = useTutorStore((state) => state.toggleTutor);
  const isTutorOpen = useTutorStore((state) => state.isTutorOpen);

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-[1400px] space-y-8">

        {/* Header */}
        <header className="flex flex-col items-start justify-between gap-6 border-b border-border pb-6 md:flex-row md:items-center">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-sky-950">
                <Globe2 aria-hidden="true" size={14} />
                <span>Earth Sciences</span>
              </span>
              <span className="inline-flex min-h-8 items-center rounded-full border border-border bg-white px-3 py-1 text-muted">
                Grades 7–10
              </span>
            </div>
            <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              Plate tectonics &amp; Earth&apos;s core
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              Watch the lesson, explore the model, and ask your tutor whenever you
              want a clearer explanation.
            </p>
          </div>

          <button
            onClick={toggleTutor}
            aria-expanded={isTutorOpen}
            aria-controls={isTutorOpen ? 'tutor-panel' : undefined}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 font-bold text-white shadow-sm transition-colors hover:bg-brand-hover"
          >
            <BookOpen aria-hidden="true" size={19} />
            Ask AI Tutor
          </button>
        </header>

        {/* Split-Screen Layout */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:gap-8">

          {/* Left Column: AI Instructor Video */}
          <section aria-labelledby="lesson-video-heading" className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-lg font-bold">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-950">
                <Video aria-hidden="true" size={19} />
              </div>
              <h2 id="lesson-video-heading">Lesson video</h2>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-border bg-slate-950 shadow-sm">
              <video
                className="h-full w-full object-cover"
                controls
                preload="metadata"
                aria-label="Lesson video about Earth's layers and tectonic plates"
                poster="https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?q=80&w=1200&auto=format&fit=crop"
              >
                <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <div className="absolute left-4 top-4 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-950 shadow-sm">
                AI Instructor Video
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-white p-5 sm:p-6">
              <h3 className="mb-2 text-lg font-bold">Lesson overview</h3>
              <p className="text-sm leading-7 text-muted">
                In this module, your virtual instructor explains the layers of the Earth and how tectonic plates shift over time. Watch the video, then interact with the Earth model in the 3D sandbox. If you don't understand a concept, click "Ask AI Tutor" to get an explanation in simple English or Pidgin!
              </p>
            </div>
          </section>

          {/* Right Column: 3D Model Viewer */}
          <section aria-labelledby="sandbox-heading" className="flex h-full flex-col gap-4">
            <div className="flex items-center gap-3 text-lg font-bold">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-950">
                <Layers aria-hidden="true" size={19} />
              </div>
              <h2 id="sandbox-heading">Interactive sandbox</h2>
            </div>

            <div className="relative h-full min-h-[360px] w-full overflow-hidden rounded-3xl border border-border bg-slate-950 shadow-sm sm:min-h-[480px]">
              {/* Ensure you are still passing the correct modelPath from your local setup */}
              <ModelViewer modelPath="/models/DamagedHelmet.glb" title="3D Asset Viewer" />
              
              {/* Helper tag for the 3D view */}
              <div className="pointer-events-none absolute bottom-4 left-4 max-w-[calc(100%_-_2rem)] rounded-full border border-white/15 bg-slate-950/85 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
                Drag to rotate · Scroll or pinch to zoom
              </div>
            </div>
          </section>

        </div>
      </div>

      <PauseAndAskOverlay />
    </main>
  );
}