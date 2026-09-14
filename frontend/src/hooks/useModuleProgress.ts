'use client';

import { useCallback, useEffect, useRef } from 'react';
import * as api from '@/lib/api';

const FLUSH_INTERVAL_MS = 20_000;

/**
 * Which completion figure to store for a module.
 *
 * The backend stores whatever number the client sends, so this is the rule
 * that gives it meaning: time studied sets one floor and each question
 * actually put to the tutor sets another. Studying alone caps at 90%, so a
 * module can't read as finished without the student having engaged with it.
 *
 * Both inputs are real usage — the dashboard used to show hardcoded 75/40/15.
 */
export function completionFor(timeSpentSeconds: number, questionsAsked: number): number {
  const fromTime = Math.min(90, (timeSpentSeconds / 1800) * 45); // 30 min -> 45%
  const fromQuestions = Math.min(90, questionsAsked * 30);
  return Math.min(100, Math.round(Math.max(fromTime, fromQuestions)));
}

/**
 * Count time spent on a module and report it to the backend.
 *
 * `/student/progress` is an upsert that *sets* `time_spent_seconds` to the
 * value sent, not an increment, so the count has to start from what is already
 * stored — otherwise opening a module would overwrite the student's history
 * with just this session's minutes. Hence `baselineSeconds`.
 *
 * Flushes on an interval and once more on unmount, so closing the tab mid
 * module still records what was studied.
 */
export function useModuleProgress(moduleId: string | null, baselineSeconds = 0) {
  const baselineRef = useRef(baselineSeconds);
  const elapsedRef = useRef(0);
  const questionsRef = useRef(0);
  const lastSentRef = useRef(baselineSeconds);

  const flush = useCallback(() => {
    if (!moduleId) return;
    const total = baselineRef.current + elapsedRef.current;
    if (total === lastSentRef.current) return;

    const previous = lastSentRef.current;
    lastSentRef.current = total;

    void api
      .putProgress(moduleId, total, completionFor(total, questionsRef.current))
      .catch(() => {
        // Rewind so the next tick retries — otherwise a single failed flush
        // silently drops however long the student had been studying.
        lastSentRef.current = previous;
      });
  }, [moduleId]);

  // Declared before the counter so that, when the module changes, this resets
  // the refs after the counter's cleanup has flushed the outgoing module.
  useEffect(() => {
    baselineRef.current = baselineSeconds;
    elapsedRef.current = 0;
    questionsRef.current = 0;
    lastSentRef.current = baselineSeconds;
  }, [moduleId, baselineSeconds]);

  useEffect(() => {
    if (!moduleId) return;

    const tick = setInterval(() => {
      elapsedRef.current += FLUSH_INTERVAL_MS / 1000;
      flush();
    }, FLUSH_INTERVAL_MS);

    return () => {
      clearInterval(tick);
      flush();
    };
  }, [moduleId, flush]);

  /** Call when the student sends a real question on this module. */
  const recordQuestion = useCallback(() => {
    questionsRef.current += 1;
    flush();
  }, [flush]);

  return { recordQuestion };
}
