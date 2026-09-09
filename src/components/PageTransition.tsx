import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import flatLogo from '../assets/images/mkrd_logo_flat.png';

export const PageTransition = ({
  children,
  pageKey,
  isInitialBoot = false
}: {
  children: React.ReactNode,
  pageKey: string,
  isInitialBoot?: boolean
}) => {
  const [hasBooted, setHasBooted] = useState(!isInitialBoot);

  // Trigger boot sequence completion
  useEffect(() => {
    if (isInitialBoot && !hasBooted) {
      const timer = setTimeout(() => {
        setHasBooted(true);
      }, 1000); // the wipe duration
      return () => clearTimeout(timer);
    }
  }, [isInitialBoot, hasBooted]);

  const pageNames: Record<string, string> = {
    home: 'HOME',
    services: 'SERVICES',
    projects: 'PROJECTS',
    simulations: '3D SIMULATION',
    infrastructure: 'INFRASTRUCTURE',
    contact: 'CONTACT',
  };

  const displayText = pageNames[pageKey] || pageKey.toUpperCase();

  // We want the wipe to act as a solid black overlay that scales down to reveal the page.
  // Actually, standard page transitions usually slide an overlay over the screen, change the content behind it, and slide it off.
  // With AnimatePresence mode="wait", the old children exit, then the new children enter.

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: isInitialBoot && !hasBooted ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="w-full h-full"
      >
        {children}
      </motion.div>

      {/* Wipe Overlay */}
      <motion.div
        key={`wipe-${pageKey}`}
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 1 }}
        transition={{
          duration: 1.0,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.5
        }}
        onAnimationComplete={() => {
          if (isInitialBoot) setHasBooted(true);
        }}
        className="fixed inset-0 z-[100] bg-black pointer-events-none origin-bottom flex items-center justify-center"
      >
        {isInitialBoot ? (
          <motion.img
            src={flatLogo}
            alt="MKRD Logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-64 md:w-80 h-auto object-contain"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, letterSpacing: '0px', filter: 'blur(10px)' }}
            animate={{ opacity: 1, letterSpacing: '8px', filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-white font-display font-black text-3xl md:text-5xl tracking-[8px] uppercase"
          >
            {displayText}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

