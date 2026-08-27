import { create } from 'zustand';

export interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    audioUrl?: string;
}

interface TutorState {
    isTutorOpen: boolean;
    isTyping: boolean;
    messages: Message[];
    toggleTutor: () => void;
    addMessage: (msg: Omit<Message, 'id'>) => void;
}

export const useTutorStore = create<TutorState>((set) => ({
    isTutorOpen: false,
    isTyping: false,
    messages: [
        {
            id: '1',
            sender: 'ai',
            text: 'Hello! I can help you model this system. For example, the Fourier series representation of a periodic signal is given by:\n\n$$ f(t) = a_0 + \\sum_{n=1}^{\\infty} \\left( a_n \\cos\\left(\\frac{n \\pi t}{L}\\right) + b_n \\sin\\left(\\frac{n \\pi t}{L}\\right) \\right) $$',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        }
    ],
    toggleTutor: () => set((state) => ({ isTutorOpen: !state.isTutorOpen })),
    setIsTyping: (isTyping) => set({ isTyping }),
    addMessage: (msg) => set((state) => ({
        messages: [...state.messages, { ...msg, id: Date.now().toString() }]
    })),
}));