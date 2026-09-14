/**
 * Client for the FastAPI backend.
 *
 * Everything the browser needs to reach the API lives here: the base URL, the
 * token, and one request helper that attaches the Bearer header and turns the
 * backend's `{"detail": "..."}` error shape into a real Error the UI can show.
 *
 * The token is kept in localStorage rather than a cookie because the backend
 * authenticates with an `Authorization` header, not a session cookie.
 */

export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000'
).replace(/\/+$/, '');

const TOKEN_KEY = 'edubridge.access_token';
const USER_KEY = 'edubridge.user';

/** Storage throws in private mode and when cookies are blocked, and the app
 *  must still work — it just loses persistence, not function. */
function readStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* not fatal */
  }
}

export function getToken(): string | null {
  return readStorage(TOKEN_KEY);
}

export function setToken(token: string | null) {
  writeStorage(TOKEN_KEY, token);
}

export function getStoredUser(): User | null {
  const raw = readStorage(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null) {
  writeStorage(USER_KEY, user ? JSON.stringify(user) : null);
}

export class ApiError extends Error {
  /** HTTP status, or 0 when the request never reached the server. */
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }

  /** The server was unreachable — as opposed to reachable and unhappy. */
  get isOffline() {
    return this.status === 0;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  // FormData sets its own multipart boundary; setting the header by hand
  // strips it and the server fails to parse the body.
  const isForm = typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (init.body && !isForm) headers.set('Content-Type', 'application/json');

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, `Can't reach the API at ${API_BASE}. Is the backend running?`);
  }

  // An expired or revoked token is worth discarding immediately, so the next
  // guarded page sends the student to sign in instead of looping on 401s.
  if (res.status === 401) {
    setToken(null);
    setStoredUser(null);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      // FastAPI sends a string for HTTPException, and an array of field errors
      // for a 422 — surface the first one rather than "[object Object]".
      if (typeof body?.detail === 'string') message = body.detail;
      else if (Array.isArray(body?.detail) && body.detail[0]?.msg) {
        message = body.detail[0].msg;
      }
    } catch {
      /* non-JSON error body; keep the status line */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/**
 * Turn a path the API returned into something an <img>/<audio> can load.
 * `tts_audio_url` comes back as a host-relative `/static/audio/x.wav`; blob:
 * URLs the recorder creates locally must be passed through untouched.
 */
export function assetUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (/^(https?:|blob:|data:)/i.test(path)) return path;
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Turn whatever was thrown into something worth showing a student.
 *
 * A 502 means the AI provider was unreachable, which is worth retrying, so it
 * gets its own wording rather than a bare status code.
 */
export function describeError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof ApiError) {
    if (err.isOffline) return err.message;
    if (err.status === 502) return 'The AI provider is unavailable right now. Try again in a moment.';
    if (err.status === 401) return 'Your session expired. Please sign in again.';
    return err.message;
  }
  return fallback;
}

// ---- Types mirroring backend/app/models/schemas.py ----

export interface User {
  id: number;
  email: string;
  name: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Module {
  id: string;
  number: number;
  title: string;
  course: string;
  label: string;
}

export interface ProgressItem {
  module_id: string;
  time_spent_seconds: number;
  completion_percentage: number;
  updated_at: string;
}

export type Language = 'English' | 'Pidgin';

export interface ChatTextResponse {
  status: string;
  response_text: string;
  latex_content: boolean;
  trigger_3d_animation: string | null;
}

export interface ChatVoiceResponse {
  status: string;
  transcription: string;
  response_text: string;
  tts_audio_url: string | null;
  trigger_3d_animation: string | null;
}

// ---- Endpoints ----

export function register(email: string, password: string, name: string) {
  return request<AuthResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name: name || undefined }),
  });
}

export function login(email: string, password: string) {
  return request<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getMe() {
  return request<User>('/api/v1/auth/me');
}

export async function getModules(): Promise<Module[]> {
  const body = await request<{ status: string; modules: Module[] }>('/api/v1/modules');
  return body.modules;
}

export async function getProgress(moduleId?: string): Promise<ProgressItem[]> {
  const query = moduleId ? `?module_id=${encodeURIComponent(moduleId)}` : '';
  const body = await request<{ status: string; progress: ProgressItem[] }>(
    `/api/v1/student/progress${query}`,
  );
  return body.progress;
}

export function putProgress(
  moduleId: string,
  timeSpentSeconds: number,
  completionPercentage: number,
) {
  return request<{ status: string }>('/api/v1/student/progress', {
    method: 'PUT',
    body: JSON.stringify({
      module_id: moduleId,
      time_spent_seconds: Math.max(0, Math.round(timeSpentSeconds)),
      completion_percentage: Math.min(100, Math.max(0, completionPercentage)),
    }),
  });
}

export function sendText(
  moduleId: string | null,
  language: Language,
  message: string,
  chatHistory: { role: 'ai' | 'user'; content: string }[],
) {
  return request<ChatTextResponse>('/api/v1/chat/text', {
    method: 'POST',
    body: JSON.stringify({
      // `student_id` is accepted for wire compatibility and ignored by the
      // server, which identifies the student from the token. Sending it would
      // only be noise, so it is omitted.
      module_id: moduleId ?? undefined,
      language,
      message,
      chat_history: chatHistory,
    }),
  });
}

export function sendVoice(
  moduleId: string | null,
  language: Language,
  audio: Blob,
) {
  const form = new FormData();
  // The backend names this field `audio_file`; the recorder produces webm.
  form.append('audio_file', audio, 'recording.webm');
  form.append('language', language);
  if (moduleId) form.append('module_id', moduleId);
  // No Content-Type here on purpose — the browser adds the multipart boundary.
  return request<ChatVoiceResponse>('/api/v1/chat/voice', {
    method: 'POST',
    body: form,
  });
}
