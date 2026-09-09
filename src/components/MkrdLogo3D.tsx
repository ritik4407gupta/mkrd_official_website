import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const LogoMesh = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  // React to scroll
  useEffect(() => {
    const handleScroll = () => {
      if (groupRef.current) {
        // Rotate based on scroll percentage
        const scrollY = window.scrollY;
        groupRef.current.rotation.y = scrollY * 0.005;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
      // Slight continuous rotation in addition to scroll
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} scale={[0.8, 0.8, 0.8]}>
      {/* "M" Shape Construction out of metallic blocks */}
      {/* Left leg */}
      <mesh position={[-0.8, 0, 0]}>
        <boxGeometry args={[0.3, 2, 0.3]} />
        <meshStandardMaterial color="#00f0ff" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Left diagonal */}
      <mesh position={[-0.4, 0.2, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.3, 1.5, 0.3]} />
        <meshStandardMaterial color="#0066ff" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Right diagonal */}
      <mesh position={[0.4, 0.2, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.3, 1.5, 0.3]} />
        <meshStandardMaterial color="#0066ff" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.8, 0, 0]}>
        <boxGeometry args={[0.3, 2, 0.3]} />
        <meshStandardMaterial color="#00f0ff" metalness={0.6} roughness={0.2} />
      </mesh>

      {/* Floating Sparkle/Dot */}
      <mesh position={[1.4, -0.6, 0.2]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#00f0ff" emissiveIntensity={2} />
      </mesh>
    </group>
  );
};

export const MkrdLogo3D = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`relative ${className}`} style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <pointLight position={[-5, -5, 5]} intensity={2} color="#00f0ff" />
        <LogoMesh />
      </Canvas>
    </div>
  );
};
