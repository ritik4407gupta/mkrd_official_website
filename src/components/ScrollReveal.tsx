import React from 'react';
import { motion } from 'motion/react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  blur?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({ 
  children, 
  className = "", 
  delay = 0,
  direction = 'up',
  blur = true
}) => {
  const yOffset = direction === 'up' ? 50 : direction === 'down' ? -50 : 0;
  const xOffset = direction === 'left' ? 50 : direction === 'right' ? -50 : 0;

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: yOffset, 
        x: xOffset,
        filter: blur ? 'blur(10px)' : 'none'
      }}
      whileInView={{ 
        opacity: 1, 
        y: 0, 
        x: 0,
        filter: 'blur(0px)'
      }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{
        duration: 1.0,
        delay: delay,
        ease: [0.16, 1, 0.3, 1], // Custom cinematic spring-like ease
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
