import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CASE_STUDIES, SERVICES } from '../data/mkrdData';

export const RadialImageEmitter: React.FC = () => {
  const images = useMemo(() => {
    const rawImages = [...CASE_STUDIES.map(c => c.image), ...SERVICES.map(s => s.image)];
    // Ensure we have at least 16 images by repeating
    const duplicated = [...rawImages, ...rawImages, ...rawImages].slice(0, 16);
    
    return duplicated.map((img, i) => {
      // Golden ratio distribution for better spread
      const angle = i * 2.39996322972865332;
      
      // Randomize distance they travel (between 500px and 1200px)
      const distance = 500 + Math.random() * 700; 
      
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      
      return {
        id: i,
        src: img,
        tx,
        ty,
        delay: i * (8 / 16), // stagger evenly over the duration
        scale: 0.6 + Math.random() * 0.8, // Random sizes
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
      {images.map((img) => (
        <motion.div
          key={img.id}
          className="absolute rounded-xl overflow-hidden shadow-2xl border border-cyan-500/20"
          style={{ width: 160, height: 100 }}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 0.8, 0.8, 0],
            scale: [0.1, img.scale, img.scale, 0.1],
            x: [0, img.tx],
            y: [0, img.ty],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: img.delay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <img src={img.src} alt="particle" className="w-full h-full object-cover opacity-50" />
        </motion.div>
      ))}
    </div>
  );
};
