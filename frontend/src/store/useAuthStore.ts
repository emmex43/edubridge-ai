import { create } from 'zustand';
import * as api from '@/lib/api';
import type { User } from '@/lib/api';

interface AuthState {
  user: User | null;
  /** False until we've checked storage, so guards don't bounce a signed-in
   *  student to /sign-in during the first paint after a refresh. */
  ready: boolean;
  hydrate: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => void;
}

/**
 * Guards mount on several pages at once, so `hydrate` must be safe to call
 * repeatedly and concurrently — it validates the stored token against
 * /auth/me, and without this every mount would fire its own request.
 */
let hydration: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  ready: false,

  hydrate: () => {
    if (get().ready) return Promise.resolve();
    if (hydration) return hydration;

    hydration = (async () => {
      const token = api.getToken();
      if (!token) {
        set({ user: null, ready: true });
        return;
      }

      // Show the stored student immediately so a refresh doesn't flash the
      // signed-out state, then confirm the token is still good.
      set({ user: api.getStoredUser() });

      try {
        const user = await api.getMe();
        api.setStoredUser(user);
        set({ user, ready: true });
      } catch (err) {
        if (err instanceof api.ApiError && err.status === 401) {
          // Token expired or revoked — genuinely signed out.
          api.setToken(null);
          api.setStoredUser(null);
          set({ user: null, ready: true });
        } else {
          // Backend unreachable. The token may still be valid, so keep the
          // student signed in rather than ejecting them over a network blip.
          set({ user: api.getStoredUser(), ready: true });
        }
      }
    })().finally(() => {
      hydration = null;
    });

    return hydration;
  },

  signIn: async (email, password) => {
    const res = await api.login(email, password);
    api.setToken(res.access_token);
    api.setStoredUser(res.user);
    set({ user: res.user, ready: true });
  },

  signUp: async (email, password, name) => {
    const res = await api.register(email, password, name);
    api.setToken(res.access_token);
    api.setStoredUser(res.user);
    set({ user: res.user, ready: true });
  },

  signOut: () => {
    api.setToken(null);
    api.setStoredUser(null);
    set({ user: null, ready: true });
  },
}));
