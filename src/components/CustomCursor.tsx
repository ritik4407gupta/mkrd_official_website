import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

export const CustomCursor: React.FC = () => {
  const [isPointer, setIsPointer] = useState(false);
  
  // Base coordinates offset by 16px to center the 32x32 primary cursor ring
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a')
      ) {
        setIsPointer(true);
      } else {
        setIsPointer(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      <style>
        {`
          body {
            cursor: none;
          }
          a, button, [role="button"], input, select, textarea {
            cursor: none !important;
          }
        `}
      </style>

      {/* The Glowish Effect on the back (Orange, centered exactly on the cursor) */}
      <motion.div
        className="fixed top-0 left-0 w-[200px] h-[200px] rounded-full pointer-events-none z-[9998]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          // Since x/y are offset by -16px for the 32px cursor, 
          // we need to shift this 200px box by another -84px to perfectly center it (100 - 16 = 84)
          marginLeft: '-84px',
          marginTop: '-84px',
          background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.05) 40%, transparent 70%)',
          willChange: 'transform'
        }}
        animate={{
          scale: isPointer ? 1.5 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* The Original Good Cursor (32x32 Ring + Dot) perfectly aligned */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-orange-400/50 pointer-events-none z-[9999] flex items-center justify-center transition-opacity"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          willChange: 'transform'
        }}
      >
        <motion.div 
          className="rounded-full"
          animate={{
            width: isPointer ? 12 : 5,
            height: isPointer ? 12 : 5,
            backgroundColor: isPointer ? '#f97316' : '#ffffff',
            boxShadow: isPointer 
              ? '0 0 10px 2px rgba(249, 115, 22, 0.5)' 
              : '0 0 6px 1px rgba(249, 115, 22, 0.4)'
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </>
  );
};
