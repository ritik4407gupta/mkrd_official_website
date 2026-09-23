import React from 'react';
import { motion } from 'motion/react';
import { prefersReducedMotion } from '../motion/tokens';

/**
 * What is behind the first thing anyone sees.
 *
 * This was a stock photograph of a robot arm. There is no robot arm in the
 * unit — the infrastructure page lists two printers and the benches around them
 * — so the first frame of the site was showing equipment we do not have, shot
 * by someone we do not know, and it was the one part of the home page that
 * never moved.
 *
 * What replaces it is the thing we do own, drawn rather than photographed: a
 * build plate receding into the dark, the deposited layers stacking up over it,
 * and the print head's own light tracking across. It is all transform and
 * opacity on four elements, so it costs nothing next to an image decode, it is
 * sharp at any size, and there is no licence attached to it.
 */

export const HeroBackdrop: React.FC = () => {
  const reduced = prefersReducedMotion();

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* the plate: a grid in perspective, running away from the viewer */}
      <div
        className="absolute inset-x-[-60%] bottom-[-30%] h-[92%] origin-bottom opacity-[0.55]"
        style={{
          transform: 'perspective(760px) rotateX(66deg)',
          backgroundImage:
            'linear-gradient(to right, rgba(93,102,190,0.30) 1px, transparent 1px),' +
            'linear-gradient(to bottom, rgba(93,102,190,0.30) 1px, transparent 1px)',
          backgroundSize: '68px 68px',
          maskImage: 'linear-gradient(to top, #000 6%, transparent 74%)',
          WebkitMaskImage: 'linear-gradient(to top, #000 6%, transparent 74%)',
        }}
      />

      {/* the part building up on it, one layer at a time */}
      {!reduced && (
        <motion.div
          className="absolute inset-x-0 bottom-0 h-[62%] mix-blend-screen"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, rgba(139,125,255,0.16) 0px, rgba(139,125,255,0.16) 1px, transparent 1px, transparent 7px)',
            maskImage:
              'radial-gradient(120% 100% at 50% 100%, #000 18%, transparent 72%)',
            WebkitMaskImage:
              'radial-gradient(120% 100% at 50% 100%, #000 18%, transparent 72%)',
          }}
          animate={{ backgroundPositionY: ['0px', '-7px'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* the head's light, crossing the plate on a long period */}
      {!reduced && (
        <motion.div
          className="absolute inset-y-0 w-[34%] pointer-events-none mix-blend-screen"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(124,113,255,0.16) 38%, rgba(226,2,7,0.10) 62%, transparent)',
          }}
          animate={{ x: ['-40%', '210%'] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3.5 }}
        />
      )}

      {/* chamber light, and one red note off to the side */}
      <div className="absolute top-[8%] left-[-12%] w-[680px] h-[680px] rounded-full bg-brand-800/25 blur-[150px]" />
      <div className="absolute bottom-[-10%] right-[-6%] w-[520px] h-[520px] rounded-full bg-blue-900/25 blur-[140px]" />
      <div className="absolute top-[32%] right-[16%] w-[240px] h-[240px] rounded-full bg-accent/[0.07] blur-[110px]" />

      {/* the plate's own edge, catching the light */}
      <motion.div
        className="absolute left-0 right-0 bottom-[30%] h-px bg-gradient-to-r from-transparent via-brand-400/45 to-transparent"
        initial={reduced ? undefined : { scaleX: 0.2, opacity: 0 }}
        animate={reduced ? undefined : { scaleX: 1, opacity: 1 }}
        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
      />
    </div>
  );
};
