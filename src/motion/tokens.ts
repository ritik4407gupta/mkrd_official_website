import type { Transition, Variants } from 'motion/react';

/**
 * The motion vocabulary.
 *
 * Every animation on the site resolves to something in this file. The point is
 * not to restrict what we can do — it is that a site where each page invented
 * its own easing is what "AI-generated" motion looks like. One curve family,
 * one set of durations, applied with intent, reads as a designed system.
 *
 * The curves are named for what they do to a moving object, not for a maths
 * label, because that is how you pick one at 2am.
 */

export const EASE = {
  /** Leaves fast, lands soft. The default for anything entering the frame. */
  out: [0.16, 1, 0.3, 1] as const,
  /** Symmetrical and mechanical — for things that open and shut, like the door. */
  inOut: [0.76, 0, 0.24, 1] as const,
  /** A little overshoot. Buttons, chips, small confirmations only. */
  spring: [0.34, 1.4, 0.64, 1] as const,
  /** Slow to leave, fast to arrive. Use for exits so they clear out of the way. */
  in: [0.7, 0, 0.84, 0] as const,
} as const;

export const DUR = {
  tap: 0.16,
  fast: 0.28,
  base: 0.44,
  slow: 0.9,
  cinematic: 1.6,
} as const;

export const T = {
  fast: { duration: DUR.fast, ease: EASE.out } satisfies Transition,
  base: { duration: DUR.base, ease: EASE.out } satisfies Transition,
  slow: { duration: DUR.slow, ease: EASE.out } satisfies Transition,
  mech: { duration: DUR.base, ease: EASE.inOut } satisfies Transition,
  pop: { duration: DUR.fast, ease: EASE.spring } satisfies Transition,
} as const;

/** The default viewport trigger — fire once, slightly before the element lands. */
export const VIEWPORT = { once: true, margin: '0px 0px -12% 0px' } as const;

/**
 * A line of type rising out of a mask. This is the reveal the site leans on:
 * the text does not fade in, it travels up from behind a hard edge, the way a
 * part rises out of a mould. Clip and transform only — both GPU properties, so
 * it stays smooth with a dozen of them on screen.
 */
export const riseFromMask: Variants = {
  hidden: { y: '110%', opacity: 0 },
  visible: (i: number = 0) => ({
    y: '0%',
    opacity: 1,
    transition: { duration: DUR.slow, ease: EASE.out, delay: i * 0.055 },
  }),
};

/** Blocks of content arriving: a short lift with a soft settle. */
export const liftIn: Variants = {
  hidden: { y: 28, opacity: 0 },
  visible: (i: number = 0) => ({
    y: 0,
    opacity: 1,
    transition: { duration: DUR.base, ease: EASE.out, delay: i * 0.07 },
  }),
};

/** A panel unmasking horizontally — used for images and cards. */
export const wipeIn: Variants = {
  hidden: { clipPath: 'inset(0 100% 0 0)' },
  visible: (i: number = 0) => ({
    clipPath: 'inset(0 0% 0 0)',
    transition: { duration: DUR.slow, ease: EASE.inOut, delay: i * 0.08 },
  }),
};

/** Container that staggers its children without animating itself. */
export const stagger = (each = 0.06, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: each, delayChildren: delay } },
});

/** True when the visitor has asked the OS for less movement. */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
