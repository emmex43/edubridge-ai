'use client';

import { useTutorStore } from '@/store/useTutorStore';
import PauseAndAskOverlay from '@/components/tutor/PauseAndAskOverlay';
import ModelViewer from '@/components/interactive/ModelViewer';
import { BookOpen, Video, Layers, Sparkles } from 'lucide-react';

export default function LearnPage() {
  const toggleTutor = useTutorStore((state) => state.toggleTutor);

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 md:p-8 lg:p-12">
      <div className="mx-auto max-w-[1400px] space-y-8">

        {/* Header */}
        <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <Sparkles size={16} />
              <span>Process Systems Engineering</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Module 4: Spatial Model Viewer</h1>
            <p className="mt-1 text-gray-500">Watch the AI instructor lesson and inspect the model.</p>
          </div>

          <button
            onClick={toggleTutor}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-medium text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
          >
            <BookOpen size={18} />
            Ask AI Tutor
          </button>
        </header>

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
                In this module, your virtual instructor breaks down the structural mechanics and spatial relationships of the provided asset. Watch the explanation, then interact with the model directly in the 3D sandbox. If you need clarity in Pidgin or English, open the AI Tutor.
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
              {/* Ensure you are still passing the correct modelPath from your local setup */}
              <ModelViewer modelPath="/models/DamagedHelmet.glb" title="3D Asset Viewer" />
            </div>
          </section>

        </div>
      </div>

      <PauseAndAskOverlay />
    </main>
  );
}