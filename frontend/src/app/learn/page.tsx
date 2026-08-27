'use client';

import { useTutorStore } from '@/store/useTutorStore';
import PauseAndAskOverlay from '@/components/tutor/PauseAndAskOverlay';
import ModelViewer from '@/components/interactive/ModelViewer';
import { BookOpen } from 'lucide-react';

export default function LearnPage() {
  const toggleTutor = useTutorStore((state) => state.toggleTutor);

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interactive 3D Inspection</h1>
            <p className="text-gray-500 mt-1">Module 4 • Spatial Model Viewer</p>
          </div>
          <button
            onClick={toggleTutor}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 shadow-md transition-all"
          >
            <BookOpen size={18} />
            Ask Tutor
          </button>
        </header>

        {/* 3D Model Viewer Section */}
        <section className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100">
          <ModelViewer modelPath="/models/DamagedHelmet.glb" title="3D Asset Viewer" />
        </section>

      </div>

      <PauseAndAskOverlay />
    </main>
  );
}