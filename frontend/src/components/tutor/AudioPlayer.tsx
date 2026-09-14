'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';
import { assetUrl } from '@/lib/api';

interface AudioPlayerProps {
    audioUrl: string;
}

/** Deterministic bar heights — Math.random() in render reshuffled the
 *  waveform on every re-render, so it flickered instead of animating. */
const BARS = [38, 62, 45, 80, 55, 92, 48, 70, 40, 85, 58, 74, 44, 66, 50, 78];

export default function AudioPlayer({ audioUrl }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // `tts_audio_url` arrives as a host-relative "/static/audio/x.wav";
    // blob: URLs from the local recorder pass through unchanged.
    const src = assetUrl(audioUrl);

    // Drive the button from the element's own events rather than optimistically
    // flipping state: play() rejects under the browser's autoplay policy, and
    // the button would then claim to be playing silent audio.
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onPlay = () => setIsPlaying(true);
        const onStop = () => setIsPlaying(false);

        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onStop);
        audio.addEventListener('ended', onStop);
        return () => {
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onStop);
            audio.removeEventListener('ended', onStop);
        };
    }, []);

    const togglePlay = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) void audio.play().catch(() => setIsPlaying(false));
        else audio.pause();
    }, []);

    return (
        <div className="flex items-center gap-3 rounded-xl bg-blue-50/50 p-2.5 border border-blue-100 mt-3 w-full max-w-[240px]">
            <audio ref={audioRef} src={src} preload="metadata" className="hidden" />

            <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause answer' : 'Play answer'}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
            </button>

            {/* CSS Simulated Waveform */}
            <div className="flex flex-1 items-center gap-[3px] overflow-hidden px-1 h-6">
                {BARS.map((height, i) => (
                    <div
                        key={i}
                        className={`w-1 rounded-full bg-blue-400 transition-all duration-150 ${isPlaying ? 'animate-pulse' : ''}`}
                        style={{
                            height: isPlaying ? `${height}%` : '4px',
                            animationDelay: `${i * 60}ms`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
