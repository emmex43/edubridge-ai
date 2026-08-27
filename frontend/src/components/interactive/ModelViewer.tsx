'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';
import CanvasLoader from './CanvasLoader';
import { Maximize, Minimize } from 'lucide-react';

interface ModelProps {
    modelPath: string;
    autoRotate?: boolean;
}

function Model({ modelPath, autoRotate = false }: ModelProps) {
    const { scene } = useGLTF(modelPath);
    return <primitive object={scene} />;
}

export default function ModelViewer({
    modelPath,
    title = 'Interactive 3D Model',
}: {
    modelPath: string;
    title?: string;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Listen for the 'Escape' key being pressed to exit fullscreen natively
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await containerRef.current?.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.error('Error attempting to toggle fullscreen:', err);
        }
    };

    return (
        <div
            ref={containerRef}
            className={`relative w-full overflow-hidden bg-slate-950 shadow-2xl transition-all duration-300
        ${isFullscreen ? 'h-screen rounded-none border-none' : 'h-[480px] rounded-2xl border border-slate-800'}`}
        >
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={2} />
                <directionalLight position={[10, 10, 10]} intensity={3} />
                <directionalLight position={[-10, -10, -10]} intensity={1} />
                <Environment preset="city" />

                <Suspense fallback={<CanvasLoader />}>
                    <Center scale={1.5}>
                        <Model modelPath={modelPath} autoRotate={true} />
                    </Center>
                </Suspense>

                <OrbitControls makeDefault enableZoom={true} />
            </Canvas>

            {/* Floating Canvas Title Tag */}
            <div className="absolute top-4 left-4 rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-200 backdrop-blur-md shadow-sm">
                {title}
            </div>

            {/* Fullscreen Toggle Button */}
            <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-slate-200 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white shadow-sm"
                title="Toggle Fullscreen"
            >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
        </div>
    );
}