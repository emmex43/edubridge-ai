'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useTutorStore } from '@/store/useTutorStore';

function DynamicSphere() {
    const meshRef = useRef<THREE.Mesh>(null);

    const color = useTutorStore((state) => state.sphereColor);
    const speed = useTutorStore((state) => state.sphereSpeed);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        }
    });

    return (
        <Sphere ref={meshRef} args={[1.5, 64, 64]} scale={1.2}>
            <MeshDistortMaterial
                color={color}
                attach="material"
                distort={0.4}
                speed={speed}
                roughness={0.2}
                metalness={0.8}
            />
        </Sphere>
    );
}

export default function InteractiveCanvas() {
    return (
        <div className="h-[450px] w-full rounded-2xl bg-slate-900 shadow-inner overflow-hidden border border-slate-800 relative cursor-move">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <Environment preset="city" />
                <DynamicSphere />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
            <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full border border-white/20">
                Interactive WebGL Module
            </div>
        </div>
    );
}
