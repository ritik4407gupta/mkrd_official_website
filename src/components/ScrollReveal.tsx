import React from 'react';
import { motion, type Variants } from 'motion/react';
import { DUR, EASE, VIEWPORT, prefersReducedMotion } from '../motion/tokens';

/**
 * Content arriving on scroll.
 *
 * The previous version animated `filter: blur(10px) → blur(0)` on every reveal.
 * Blur is not a compositor property: each frame forces the browser to re-rasterise
 * the whole subtree, so a page with half a dozen of these dropped frames on the
 * exact scroll where the visitor is forming an impression. It also had no
 * reduced-motion path, so a visitor who had asked the OS for less movement got
 * all of it.
 *
 * This does the same job on transform and opacity only, off the shared curve in
 * motion/tokens, and renders content plainly when reduced motion is set. The API
 * is unchanged so existing call sites keep working; `blur` is accepted and
 * ignored.
 */

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  viewportMargin?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  /** @deprecated kept for call-site compatibility; blur is no longer animated */
  blur?: boolean;
  /** how far it travels, px */
  distance?: number;
}

type Direction = NonNullable<ScrollRevealProps['direction']>;

const build = (direction: Direction, distance: number): Variants => {
  const y = direction === 'up' ? distance : direction === 'down' ? -distance : 0;
  const x = direction === 'left' ? distance : direction === 'right' ? -distance : 0;
  return {
    hidden: { opacity: 0, y, x },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: DUR.slow, ease: EASE.out },
    },
  };
};

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  viewportMargin = VIEWPORT.margin,
  direction = 'up' as Direction,
  distance = 34,
}) => {
  const reduced = prefersReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      variants={build(direction, distance)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: viewportMargin }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * A group whose children arrive one after another rather than all at once.
 *
 * Wrap a grid or a list in this and give each child <RevealItem>. The container
 * itself does not move, so the layout never shifts.
 */
export const RevealGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
  each?: number;
  delay?: number;
}> = ({ children, className = '', each = 0.07, delay = 0 }) => {
  const reduced = prefersReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: each, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE.out } },
};

export const RevealItem: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  const reduced = prefersReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
};
