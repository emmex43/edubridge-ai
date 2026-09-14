'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Clock,
  ArrowRight,
  PlayCircle,
  Sparkles,
  Loader2,
  AlertCircle,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import * as api from '@/lib/api';
import type { Module, ProgressItem } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuthStore } from '@/store/useAuthStore';
import { formatDuration, displayName } from '@/lib/format';

/** Card artwork, cycled by position so a module keeps the same gradient
 *  between visits instead of being keyed to data that may change. */
const GRADIENTS = [
  'from-blue-500 to-cyan-500',
  'from-indigo-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-sky-500 to-blue-600',
];

export default function DashboardPage() {
  const { user, ready } = useRequireAuth();
  const signOut = useAuthStore((s) => s.signOut);
  const router = useRouter();

  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Both are needed to render a card, and the catalogue is what decides
      // which cards exist, so they are fetched together.
      const [mods, prog] = await Promise.all([api.getModules(), api.getProgress()]);
      setModules(mods);
      setProgress(prog);
    } catch (err) {
      setError(api.describeError(err, 'Could not load your dashboard.'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Deliberately not `void load()`: that sets `loading` synchronously inside
  // the effect, which cascades a render before the request has even started.
  // Everything here lands after an await, and `loading` already starts true.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        const [mods, prog] = await Promise.all([api.getModules(), api.getProgress()]);
        if (cancelled) return;
        setModules(mods);
        setProgress(prog);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(api.describeError(err, 'Could not load your dashboard.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSignOut = () => {
    signOut();
    router.replace('/sign-in');
  };

  /** Progress is keyed by module id and a student may have none for a module
   *  they have not opened, so every lookup needs a default. */
  const progressFor = (moduleId: string) =>
    progress.find((p) => p.module_id === moduleId);

  const totalSeconds = progress.reduce((sum, p) => sum + p.time_spent_seconds, 0);

  // Averaged over every module in the catalogue, not just the started ones:
  // a student who has finished one of six modules is 17% through the course,
  // and averaging only the started ones would report 100%.
  const overallProgress = modules.length
    ? Math.round(
        modules.reduce((sum, m) => sum + (progressFor(m.id)?.completion_percentage ?? 0), 0) /
          modules.length,
      )
    : 0;

  if (!ready || (loading && !modules.length)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50/50">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 size={18} className="animate-spin" />
          <span>Loading your dashboard…</span>
        </div>
      </main>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user ? displayName(user.name, user.email) : 'Engineer'}
            </h1>
            <p className="text-gray-500 mt-1">Pick up right where you left off.</p>
          </div>

          <div className="flex items-end gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-500">Overall Progress</span>
              <span className="text-xl font-bold text-gray-900 tabular-nums">{overallProgress}%</span>
            </div>
            <div className="h-10 w-px bg-gray-200"></div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-500">Study Time</span>
              <span className="text-xl font-bold text-gray-900 tabular-nums">
                {formatDuration(totalSeconds)}
              </span>
            </div>
            <div className="h-10 w-px bg-gray-200"></div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </header>

        {error && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            <span className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </span>
            <button
              onClick={() => void load()}
              className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 font-medium text-white transition-colors hover:bg-amber-700"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Active Modules Grid */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
            <button
              onClick={() => void load()}
              disabled={loading}
              className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {modules.length === 0 && !error ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
              <BookOpen className="mx-auto mb-3 text-gray-300" size={28} />
              <p className="font-medium text-gray-700">No modules yet</p>
              <p className="mt-1 text-sm text-gray-500">
                Course material added on the backend appears here automatically.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {modules.map((mod, index) => {
                const item = progressFor(mod.id);
                const percent = Math.round(item?.completion_percentage ?? 0);
                const seconds = item?.time_spent_seconds ?? 0;

                return (
                  <div
                    key={mod.id}
                    className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-gray-200"
                  >
                    {/* Card Graphic */}
                    <div
                      className={`h-32 w-full bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} p-5 flex items-start justify-between`}
                    >
                      <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                        {mod.label}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="mb-4 text-lg font-bold text-gray-900">{mod.course}</h3>

                      {/* Progress Bar */}
                      <div className="mt-auto space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700 tabular-nums">
                            {percent}% Complete
                          </span>
                          <span className="flex items-center gap-1 text-gray-500 tabular-nums">
                            <Clock size={14} /> {formatDuration(seconds)}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Link
                        href={`/learn?module=${encodeURIComponent(mod.id)}`}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-blue-600 hover:text-white group-hover:bg-blue-600 group-hover:text-white"
                      >
                        <PlayCircle size={18} />
                        {percent >= 100 ? 'Review Module' : percent > 0 ? 'Resume Module' : 'Start Module'}
                        <ArrowRight size={16} className="opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
