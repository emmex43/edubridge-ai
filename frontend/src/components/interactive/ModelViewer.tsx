'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center, Html } from '@react-three/drei';
import * as THREE from 'three';
import CanvasLoader from './CanvasLoader';
import { Maximize, Minimize } from 'lucide-react';

/**
 * Where each animation hook from the backend points on the model.
 *
 * These are the eight names the API can return (see the README's
 * `trigger_3d_animation` vocabulary). The positions are spread around the
 * asset so two different hooks never land on the same spot — the exact
 * coordinates are arbitrary, but the labels are the course's own terms.
 *
 * Anything not in this map is ignored: the backend already drops unknown
 * names, and a name added there before it is added here should degrade to
 * "nothing highlighted" rather than crash the canvas.
 */
const HIGHLIGHTS: Record<string, { position: [number, number, number]; label: string }> = {
    highlight_reactor_core: { position: [0, 0, 0], label: 'Reactor Core' },
    highlight_pressure_gauge: { position: [0, 1.25, 0], label: 'Pressure Gauge' },
    highlight_temperature_probe: { position: [0, -1.25, 0], label: 'Temperature Probe' },
    highlight_vessel_wall: { position: [1.25, 0, 0], label: 'Vessel Wall' },
    highlight_inlet_stream: { position: [-1.25, 0.75, 0], label: 'Inlet Stream' },
    highlight_outlet_stream: { position: [1.25, -0.75, 0], label: 'Outlet Stream' },
    highlight_waveform: { position: [-1.25, -0.75, 0], label: 'Waveform' },
    highlight_frequency_spectrum: { position: [0.95, 0.95, 0.6], label: 'Frequency Spectrum' },
};

function Model({ modelPath }: { modelPath: string }) {
    const { scene } = useGLTF(modelPath);
    return <primitive object={scene} />;
}

/** A pulsing ring plus a label, marking the part the answer is about. */
function HighlightMarker({ name }: { name: string }) {
    const spec = HIGHLIGHTS[name];
    const ringRef = useRef<THREE.Mesh>(null);
    const elapsed = useRef(0);

    useFrame((_, delta) => {
        const ring = ringRef.current;
        if (!ring) return;

        elapsed.current += delta;
        // One sine drives both scale and fade so the pulse stays coherent.
        const wave = (Math.sin(elapsed.current * 2.5) + 1) / 2; // 0..1
        ring.scale.setScalar(1 + wave * 0.5);
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.9 - wave * 0.55;
    });

    if (!spec) return null;

    return (
        <group position={spec.position}>
            <mesh ref={ringRef}>
                <ringGeometry args={[0.22, 0.28, 40]} />
                <meshBasicMaterial
                    color="#38bdf8"
                    side={THREE.DoubleSide}
                    transparent
                    opacity={0.9}
                    depthTest={false}
                />
            </mesh>

            <mesh>
                <sphereGeometry args={[0.07, 16, 16]} />
                <meshBasicMaterial color="#7dd3fc" depthTest={false} />
            </mesh>

            <Html position={[0, 0.34, 0]} center distanceFactor={7} zIndexRange={[20, 0]}>
                <div className="whitespace-nowrap rounded-full border border-sky-400/40 bg-slate-950/85 px-3 py-1 text-[11px] font-semibold text-sky-200 shadow-lg backdrop-blur-sm">
                    {spec.label}
                </div>
            </Html>
        </group>
    );
}

export default function ModelViewer({
    modelPath,
    title = 'Interactive 3D Model',
    highlight = null,
}: {
    modelPath: string;
    title?: string;
    /** A `trigger_3d_animation` value from the API, or null. */
    highlight?: string | null;
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
                        <Model modelPath={modelPath} />
                    </Center>
                    {highlight && <HighlightMarker name={highlight} />}
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
