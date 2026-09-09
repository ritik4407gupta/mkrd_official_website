import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ParticleSystem = () => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Track global mouse position since canvas will have pointer-events-none
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const [sphere] = useState(() => {
    const positions = new Float32Array(4000 * 3);
    for (let i = 0; i < 4000; i++) {
      const radius = 12 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  });

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Base slow rotation
      pointsRef.current.rotation.x -= delta * 0.05;
      pointsRef.current.rotation.y -= delta * 0.08;

      // Mouse parallax overlay
      const targetX = mouse.current.x * 0.5;
      const targetY = mouse.current.y * 0.5;
      
      pointsRef.current.rotation.y += (targetX - pointsRef.current.rotation.y) * 0.02;
      pointsRef.current.rotation.x += (targetY - pointsRef.current.rotation.x) * 0.02;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={pointsRef} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial 
          transparent 
          color="#ff0044" 
          size={0.06} 
          sizeAttenuation={true} 
          depthWrite={false} 
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
};

export const RedDotsBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 15], fov: 60 }}>
        <ParticleSystem />
      </Canvas>
    </div>
  );
};
