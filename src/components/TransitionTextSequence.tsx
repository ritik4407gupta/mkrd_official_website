import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface TransitionTextSequenceProps {
  onComplete: () => void;
}

export const TransitionTextSequence: React.FC<TransitionTextSequenceProps> = ({ onComplete }) => {
  useEffect(() => {
    // Total duration of the animation sequence before closing
    const timer = setTimeout(() => {
      onComplete();
    }, 4500); // 4.5 seconds for the full sequence
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center overflow-hidden">
      <div className="relative w-full max-w-5xl px-4 flex flex-col items-center justify-center gap-2 sm:gap-4 md:gap-6">
        
        {/* Trusted - Injected from left */}
        <motion.div
          initial={{ x: '-100vw', opacity: 0, skewX: -30, filter: 'blur(10px)' }}
          animate={{ x: 0, opacity: 1, skewX: 0, filter: 'blur(0px)' }}
          transition={{ 
            type: 'spring', 
            damping: 14, 
            stiffness: 90, 
            delay: 0.3,
          }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black text-white tracking-tighter uppercase text-center"
          style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}
        >
          TRUSTED.
        </motion.div>

        {/* Skilled - Injected from right */}
        <motion.div
          initial={{ x: '100vw', opacity: 0, skewX: 30, filter: 'blur(10px)' }}
          animate={{ x: 0, opacity: 1, skewX: 0, filter: 'blur(0px)' }}
          transition={{ 
            type: 'spring', 
            damping: 14, 
            stiffness: 90, 
            delay: 1.1,
          }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black text-cyan-400 tracking-tighter uppercase text-center"
          style={{ textShadow: '0 0 40px rgba(34, 211, 238, 0.4)' }}
        >
          SKILLED.
        </motion.div>

        {/* Innovative - Injected from bottom */}
        <motion.div
          initial={{ y: '50vh', opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
          animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ 
            type: 'spring', 
            damping: 16, 
            stiffness: 100, 
            delay: 1.9,
          }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black text-white tracking-tighter uppercase text-center"
          style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}
        >
          INNOVATIVE.
        </motion.div>

        {/* Overlay scanner line effect that sweeps across the text block */}
        <motion.div
          initial={{ top: '-10%', opacity: 0 }}
          animate={{ top: '110%', opacity: [0, 0.8, 0.8, 0] }}
          transition={{ 
            delay: 2.8,
            duration: 1.2,
            ease: 'easeInOut'
          }}
          className="absolute left-[10%] right-[10%] h-1.5 bg-cyan-300 z-10 shadow-[0_0_30px_10px_rgba(34,211,238,0.6)] pointer-events-none rounded-full"
        />

      </div>
    </div>
  );
};
