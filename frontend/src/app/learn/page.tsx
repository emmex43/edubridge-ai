'use client';

import { useTutorStore } from '@/store/useTutorStore';
import PauseAndAskOverlay from '@/components/tutor/PauseAndAskOverlay';
import ModelViewer from '@/components/interactive/ModelViewer';
import { BookOpen, Video, Layers, Sparkles, Globe2 } from 'lucide-react';

export default function LearnPage() {
  const toggleTutor = useTutorStore((state) => state.toggleTutor);

  return (
    <main className="min-h-screen bg-[#FFFDF8] text-[#1E293B] p-6 md:p-8 lg:p-12 selection:bg-[#FBBF24] selection:text-[#1E293B]">
      <div className="mx-auto max-w-[1400px] space-y-8">

        {/* Header */}
        <header className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center border-b-2 border-[#1E293B]/10 pb-6">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#1E293B]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#38BDF8] border-2 border-[#1E293B] px-3 py-1 shadow-[2px_2px_0px_#1E293B]">
                <Globe2 size={14} />
                <span>Earth Sciences</span>
              </span>
              <span className="bg-white border-2 border-[#1E293B] rounded-full px-3 py-1">
                Grades 7–10
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#1E293B] tracking-tight">
              Module 2: Plate Tectonics & Core Structure
            </h1>
            <p className="mt-2 text-slate-600 font-medium text-lg">
              Watch the lesson, explore the 3D model, and chat with your AI tutor.
            </p>
          </div>

          <button
            onClick={toggleTutor}
            className="flex items-center gap-2 rounded-full bg-[#14B8A6] px-8 py-4 font-black text-white text-lg border-2 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] transition-all hover:bg-[#0D9488] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1E293B] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
          >
            <BookOpen size={20} />
            Ask AI Tutor
          </button>
        </header>

        {/* Split-Screen Layout */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">

          {/* Left Column: AI Instructor Video */}
          <section className="flex flex-col space-y-4">
            <div className="flex items-center gap-2 text-xl font-black text-[#1E293B]">
              <div className="p-1.5 bg-[#FB7185] rounded-lg border-2 border-[#1E293B] text-white">
                <Video size={20} />
              </div>
              <h2>Lesson Video</h2>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-3xl border-4 border-[#1E293B] bg-black shadow-[6px_6px_0px_#1E293B]">
              <video
                className="h-full w-full object-cover"
                controls
                poster="https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?q=80&w=1200&auto=format&fit=crop"
              >
                <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <div className="absolute left-4 top-4 rounded-full border-2 border-[#1E293B] bg-[#FBBF24] px-4 py-1.5 text-xs font-black text-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
                AI Instructor Video
              </div>
            </div>

            <div className="rounded-3xl border-2 border-[#1E293B] bg-white p-6 shadow-[4px_4px_0px_#1E293B]">
              <h3 className="mb-2 text-lg font-black text-[#1E293B]">Lesson Overview</h3>
              <p className="text-sm font-medium leading-relaxed text-slate-600">
                In this module, your virtual instructor explains the layers of the Earth and how tectonic plates shift over time. Watch the video, then interact with the Earth model in the 3D sandbox. If you don't understand a concept, click "Ask AI Tutor" to get an explanation in simple English or Pidgin!
              </p>
            </div>
          </section>

          {/* Right Column: 3D Model Viewer */}
          <section className="flex h-full flex-col space-y-4">
            <div className="flex items-center gap-2 text-xl font-black text-[#1E293B]">
              <div className="p-1.5 bg-[#38BDF8] rounded-lg border-2 border-[#1E293B] text-[#1E293B]">
                <Layers size={20} />
              </div>
              <h2>Interactive Sandbox</h2>
            </div>

            <div className="h-full min-h-[480px] w-full overflow-hidden rounded-3xl border-4 border-[#1E293B] bg-white shadow-[6px_6px_0px_#1E293B] relative">
              {/* Ensure you are still passing the correct modelPath from your local setup */}
              <ModelViewer modelPath="/models/DamagedHelmet.glb" title="3D Asset Viewer" />
              
              {/* Helper tag for the 3D view */}
              <div className="absolute bottom-4 right-4 pointer-events-none rounded-full border-2 border-[#1E293B] bg-white/90 backdrop-blur px-3 py-1.5 text-xs font-bold text-[#1E293B]">
                Drag to rotate • Scroll to zoom
              </div>
            </div>
          </section>

        </div>
      </div>

      <PauseAndAskOverlay />
    </main>
  );
}