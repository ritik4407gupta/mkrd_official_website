import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number; // negative for up, positive for down, higher absolute value = faster
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({ children, className = '', speed = -50 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  // As it scrolls from bottom to top, move from -speed to +speed
  const y = useTransform(scrollYProgress, [0, 1], [-speed, speed]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y, willChange: "transform" }} className="w-full h-full">
        {children}
      </motion.div>
    </div>
  );
};
