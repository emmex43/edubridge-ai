'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import type { User } from '@/lib/api';

/**
 * Gate a page behind a valid token.
 *
 * Returns `ready: false` while the stored token is still being checked, so the
 * caller can hold its loading state instead of rendering an empty page or
 * bouncing a signed-in student to /sign-in on refresh.
 */
export function useRequireAuth(): { user: User | null; ready: boolean } {
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.ready);
  const hydrate = useAuthStore((s) => s.hydrate);
  const router = useRouter();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (ready && !user) router.replace('/sign-in');
  }, [ready, user, router]);

  return { user, ready };
}
