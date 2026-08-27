'use client';

import { Html, useProgress } from '@react-three/drei';

export default function CanvasLoader() {
    const { progress } = useProgress();

    return (
        <Html center>
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-900/80 px-4 py-3 text-white backdrop-blur-md border border-slate-700 shadow-xl">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                <p className="text-xs font-medium text-slate-300">
                    Loading 3D Asset: {progress.toFixed(0)}%
                </p>
            </div>
        </Html>
    );
}