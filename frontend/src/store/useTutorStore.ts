import { create } from 'zustand';
import type { Language } from '@/lib/api';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  audioUrl?: string;
  /** Set when a send failed; rendered as an error rather than an answer. */
  error?: boolean;
}

interface TutorState {
  isTutorOpen: boolean;
  isTyping: boolean;
  language: Language;
  messages: Message[];
  /** The module the tutor is currently grounded in, from the learn page. */
  moduleId: string | null;
  /** Latest `trigger_3d_animation` from the backend; the canvas watches this. */
  highlight: string | null;
  /** Counts real questions asked, so progress can reflect engagement. */
  questionsAsked: number;

  toggleTutor: () => void;
  openTutor: () => void;
  setIsTyping: (typing: boolean) => void;
  setLanguage: (lang: Language) => void;
  setModuleId: (moduleId: string | null) => void;
  setHighlight: (highlight: string | null) => void;
  addMessage: (msg: Omit<Message, 'id'>) => void;
  clearMessages: () => void;
  noteQuestion: () => void;
}

let messageSeq = 0;

export const useTutorStore = create<TutorState>((set) => ({
  isTutorOpen: false,
  isTyping: false,
  language: 'English',
  // Starts empty. It used to ship a hardcoded Fourier-series answer with a
  // placeholder remote MP3 as its audio, which made the chat look like it
  // worked before any of it was connected.
  messages: [],
  moduleId: null,
  highlight: null,
  questionsAsked: 0,

  toggleTutor: () => set((state) => ({ isTutorOpen: !state.isTutorOpen })),
  openTutor: () => set({ isTutorOpen: true }),
  setIsTyping: (isTyping) => set({ isTyping }),
  setLanguage: (language) => set({ language }),
  setModuleId: (moduleId) => set({ moduleId }),
  setHighlight: (highlight) => set({ highlight }),
  addMessage: (msg) =>
    set((state) => ({
      // A counter, not Date.now(): a user message and the error that follows
      // it can land in the same millisecond and would collide as React keys.
      messages: [...state.messages, { ...msg, id: `m${++messageSeq}` }],
    })),
  clearMessages: () => set({ messages: [] }),
  noteQuestion: () => set((state) => ({ questionsAsked: state.questionsAsked + 1 })),
}));
