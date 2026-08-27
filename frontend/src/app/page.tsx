import Link from 'next/link';
import { Sparkles, BrainCircuit, Box, Mic, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <Sparkles className="h-6 w-6" />
          <span>EduBridge AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-gray-600 font-medium hover:text-gray-900 transition-colors">
            Sign In
          </Link>
          <Link href="/sign-up" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-medium text-sm mb-8 border border-blue-100">
          <BrainCircuit size={16} />
          <span>Next-Generation STEM Education</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
          Master Complex Concepts with <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Interactive Intelligence.
          </span>
        </h1>
        
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Transform static textbooks into immersive 3D simulations. Pause any lesson, speak directly to your AI tutor, and watch the environment react in real-time.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/sign-up" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
            Start Learning for Free <ArrowRight size={20} />
          </Link>
          <Link href="/learn" className="w-full sm:w-auto px-8 py-4 bg-gray-50 text-gray-900 font-bold rounded-full hover:bg-gray-100 border border-gray-200 transition-all flex items-center justify-center gap-2">
            View 3D Demo
          </Link>
        </div>
      </main>

      {/* Feature Section */}
      <section className="bg-gray-50 border-t border-gray-100 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Box size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Interactive WebGL</h3>
              <p className="text-gray-500 leading-relaxed">
                Interact with high-fidelity 3D models. Drag, zoom, and manipulate parameters to understand complex systems visually.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Mic size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Conversational AI</h3>
              <p className="text-gray-500 leading-relaxed">
                Stuck on a concept? Just hit the microphone and ask a question. The AI tutor contextualizes its answers based on what you are looking at.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="h-12 w-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Dynamic Environment</h3>
              <p className="text-gray-500 leading-relaxed">
                The AI doesn't just talk—it controls the simulation. Ask it to "increase the pressure" and watch the 3D model react instantly.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}