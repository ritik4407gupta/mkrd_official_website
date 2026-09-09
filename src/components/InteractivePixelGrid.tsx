import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PixelCursorGrid = ({ color = "#06b6d4" }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { viewport } = useThree();
  
  // Track mouse globally so pointer-events-none on Canvas doesn't break interaction
  const mouse = useRef({ x: -999, y: -999 });
  const mouseActive = useRef(false);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseActive.current = true;
    };
    const handleMouseLeave = () => {
      mouseActive.current = false;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  
  const baseColor = useMemo(() => new THREE.Color(color), [color]);
  const highlightColor = useMemo(() => new THREE.Color("#ffffff"), []);
  
  // Huge grid to cover any viewport
  const gridX = 140;
  const gridY = 80;
  const spacing = 0.5; 
  
  const particles = useMemo(() => {
    const temp = [];
    for (let x = 0; x < gridX; x++) {
      for (let y = 0; y < gridY; y++) {
        temp.push({
          x: (x - gridX / 2) * spacing,
          y: (y - gridY / 2) * spacing,
          z: 0,
          originalX: (x - gridX / 2) * spacing,
          originalY: (y - gridY / 2) * spacing,
          scale: 0, // start invisible
          isAnimating: false // tracking sleep state
        });
      }
    }
    return temp;
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    
    // Map NDC mouse to world space
    const mouseWorldX = (mouse.current.x * viewport.width) / 2;
    const mouseWorldY = (mouse.current.y * viewport.height) / 2;
    
    const maxDist = 4.0; // The radius of the "flashlight" circle
    let needsUpdate = false;

    particles.forEach((p, i) => {
      const dx = mouseWorldX - p.originalX;
      const dy = mouseWorldY - p.originalY;
      
      // Fast bounding box check to skip Math.sqrt and matrix math for 90% of particles
      if (!mouseActive.current || Math.abs(dx) > maxDist || Math.abs(dy) > maxDist) {
         if (p.scale > 0.001 || p.z > 0.001) {
            p.scale = THREE.MathUtils.lerp(p.scale, 0, 0.1);
            p.z = THREE.MathUtils.lerp(p.z, 0, 0.1);
            p.isAnimating = true;
         } else if (p.isAnimating) {
            p.scale = 0;
            p.z = 0;
            p.isAnimating = false;
         } else {
            return; // skip completely, it is already asleep and at scale 0
         }
      } else {
         const dist = Math.sqrt(dx * dx + dy * dy);
         if (dist < maxDist) {
            const force = Math.pow((maxDist - dist) / maxDist, 1.5);
            const targetScale = force * 1.5; // Scale up to 1.5x at center
            
            p.z = THREE.MathUtils.lerp(p.z, force * 2.0, 0.2);
            p.scale = THREE.MathUtils.lerp(p.scale, targetScale, 0.15);
            p.isAnimating = true;
            
            // Shines brightest in the center of the cursor
            tempColor.copy(baseColor).lerp(highlightColor, force);
            meshRef.current.setColorAt(i, tempColor);
         } else {
            if (p.scale > 0.001 || p.z > 0.001) {
               p.scale = THREE.MathUtils.lerp(p.scale, 0, 0.1);
               p.z = THREE.MathUtils.lerp(p.z, 0, 0.1);
               p.isAnimating = true;
            } else if (p.isAnimating) {
               p.scale = 0;
               p.z = 0;
               p.isAnimating = false;
            } else {
               return; // skip completely
            }
         }
      }
      
      dummy.position.set(p.originalX, p.originalY, p.z);
      dummy.rotation.x = p.scale * 0.8;
      dummy.rotation.y = p.scale * 0.8;
      dummy.scale.set(p.scale, p.scale, p.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      needsUpdate = true;
    });
    
    if (needsUpdate) {
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true;
      }
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, gridX * gridY]}>
      <boxGeometry args={[0.25, 0.25, 0.25]} />
      <meshStandardMaterial roughness={0.2} metalness={0.8} color="#ffffff" />
    </instancedMesh>
  );
};

export const InteractivePixelGrid = ({ color = "#0ea5e9" }) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 22], fov: 40 }} gl={{ powerPreference: "high-performance", antialias: false }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={2.0} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color={color} />
        <PixelCursorGrid color={color} />
      </Canvas>
    </div>
  );
};
