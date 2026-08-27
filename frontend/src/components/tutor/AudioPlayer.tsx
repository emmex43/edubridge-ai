'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
    audioUrl: string;
}

export default function AudioPlayer({ audioUrl }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Auto-pause when audio finishes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => setIsPlaying(false);
        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }, []);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="flex items-center gap-3 rounded-xl bg-blue-50/50 p-2.5 border border-blue-100 mt-3 w-full max-w-[240px]">
            <audio ref={audioRef} src={audioUrl} className="hidden" />

            <button
                onClick={togglePlay}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
            </button>

            {/* CSS Simulated Waveform */}
            <div className="flex flex-1 items-center gap-[3px] overflow-hidden px-1 h-6">
                {[...Array(16)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-1 rounded-full bg-blue-400 transition-all duration-75`}
                        style={{
                            height: isPlaying ? `${Math.max(20, Math.random() * 100)}%` : '4px',
                            opacity: isPlaying ? (Math.random() * 0.5 + 0.5) : 0.5,
                            animationDelay: `${i * 0.05}s`
                        }}
                    />
                ))}
            </div>
        </div>
    );
}