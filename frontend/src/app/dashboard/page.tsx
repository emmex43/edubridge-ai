import Link from 'next/link';
import { BookOpen, Clock, Activity, ArrowRight, PlayCircle, Sparkles } from 'lucide-react';

// Mock data to make the UI look populated and realistic for the pitch
const activeModules = [
  {
    id: '1',
    title: 'Process Systems Engineering',
    chapter: 'Module 4: Spatial Model Viewer',
    progress: 75,
    timeSpent: '4h 20m',
    imageGradient: 'from-blue-500 to-cyan-500',
    link: '/learn'
  },
  {
    id: '2',
    title: 'Applied Thermodynamics',
    chapter: 'Module 2: Batch Pyrolysis Reactors',
    progress: 40,
    timeSpent: '2h 15m',
    imageGradient: 'from-indigo-500 to-purple-500',
    link: '#'
  },
  {
    id: '3',
    title: 'Numerical Methods & Algorithms',
    chapter: 'Module 6: Fourier Series Expansions',
    progress: 15,
    timeSpent: '45m',
    imageGradient: 'from-emerald-500 to-teal-500',
    link: '#'
  }
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="mx-auto max-w-6xl space-y-10">

        {/* Dashboard Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                <Sparkles size={14} /> Beta Student
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, Engineer</h1>
            <p className="text-gray-500 mt-1">Pick up right where you left off.</p>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-500">Overall Progress</span>
              <span className="text-xl font-bold text-gray-900">42%</span>
            </div>
            <div className="h-10 w-px bg-gray-200"></div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-500">Study Time</span>
              <span className="text-xl font-bold text-gray-900">12h</span>
            </div>
          </div>
        </header>

        {/* Active Modules Grid */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
            <Link href="#" className="text-sm font-semibold text-blue-600 hover:underline">
              View All Courses
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeModules.map((mod) => (
              <div key={mod.id} className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-gray-200">

                {/* Card Graphic */}
                <div className={`h-32 w-full bg-gradient-to-br ${mod.imageGradient} p-5 flex items-start justify-between`}>
                  <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                    {mod.chapter}
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="mb-4 text-lg font-bold text-gray-900">{mod.title}</h3>

                  {/* Progress Bar */}
                  <div className="mt-auto space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{mod.progress}% Complete</span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock size={14} /> {mod.timeSpent}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
                        style={{ width: `${mod.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={mod.link}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-blue-600 hover:text-white group-hover:bg-blue-600 group-hover:text-white"
                  >
                    <PlayCircle size={18} />
                    {mod.progress === 100 ? 'Review Module' : 'Resume Module'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}