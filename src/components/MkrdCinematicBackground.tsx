import React from 'react';
import { motion } from 'motion/react';

const MkrdStencil: React.FC = () => (
  // Removed expensive drop-shadow filter. 
  // Adjusted opacity for a cleaner look without performance penalty.
  <svg viewBox="0 0 160 50" className="h-10 sm:h-16 w-auto fill-blue-700 shrink-0 opacity-75">
    <path d="M0 0 H160 V10 H150 V40 H160 V50 H0 V40 H10 V10 H0 Z" />
    <text 
      x="80" 
      y="35" 
      fontFamily="system-ui, -apple-system, sans-serif" 
      fontWeight="900" 
      fontSize="26" 
      fill="#020617" 
      textAnchor="middle" 
      letterSpacing="2"
    >
      MKRD
    </text>
  </svg>
);

const MarqueeRow: React.FC<{ reverse?: boolean; speed?: number }> = ({ reverse = false, speed = 40 }) => {
  // Reduced item count to 10. We use 10 elements twice = 20 elements total.
  // With large gaps, 20 elements is more than enough to cover the screen width smoothly.
  const items = Array.from({ length: 10 });

  return (
    // Increased vertical padding dramatically (py-12 sm:py-20) to increase distance between rows
    <div className="flex overflow-hidden whitespace-nowrap w-full py-12 sm:py-20">
      <motion.div
        initial={{ x: reverse ? "-50%" : "0%" }}
        animate={{ x: reverse ? "0%" : "-50%" }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: speed,
        }}
        // Increased horizontal gap dramatically (gap-24 sm:gap-40) to increase distance between logos
        className="flex gap-24 sm:gap-40 items-center min-w-max pr-24 sm:pr-40"
      >
        {items.map((_, i) => (
          <MkrdStencil key={`a-${i}`} />
        ))}
        {items.map((_, i) => (
          <MkrdStencil key={`b-${i}`} />
        ))}
      </motion.div>
    </div>
  );
};

export const MkrdCinematicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#020617] z-0 pointer-events-none flex items-center justify-center">
      {/* 
        Container size brought back to a reasonable 200vw/200vh.
        Because rows are much taller now, 15 rows is plenty to cover 200vh.
      */}
      <div className="absolute w-[250vw] h-[250vh] flex flex-col items-center justify-center rotate-[-25deg] scale-110 opacity-70">
        {Array.from({ length: 15 }).map((_, i) => (
          <MarqueeRow 
            key={i} 
            speed={40 + (i % 3) * 10} // Speeds: 40, 50, 60
            reverse={i % 2 !== 0} 
          />
        ))}
      </div>

      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#020617]/40 to-[#020617] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/90 pointer-events-none" />
    </div>
  );
};
