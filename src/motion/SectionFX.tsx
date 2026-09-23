import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { DUR, EASE, VIEWPORT, prefersReducedMotion } from './tokens';

/**
 * Section furniture.
 *
 * The About section set the house style for how a block of this site arrives:
 * a giant wordmark sliding behind the content at its own rate, the copy and the
 * cards travelling at two more, type rising out of a mask, and figures counting
 * up rather than simply being there. Every page now gets the same treatment, so
 * this file is where those devices live once instead of being re-typed per page.
 *
 * Three rules hold throughout:
 *   - only transform and opacity animate, so a page with a dozen of these still
 *     composites on the GPU;
 *   - everything is visible at rest under `prefers-reduced-motion`, never parked
 *     at opacity 0 waiting for an observer that will not fire;
 *   - parallax is bounded in percentages of the element, so nothing can travel
 *     far enough to leave a hole in the layout.
 */

/* ────────────────────────────────────────────────────────────── scroll ──── */

/** Progress 0→1 as a section crosses the viewport, bottom to top. */
export const useSectionScroll = (ref: React.RefObject<HTMLElement | null>) =>
  useScroll({ target: ref, offset: ['start end', 'end start'] });

/**
 * A parallax offset derived from that progress.
 *
 * `strength` is in percent of the element's own height, so 12 means the layer
 * drifts six percent above centre at the top of its travel and six below at the
 * bottom. Small numbers read as depth; large ones read as a bug.
 */
export const useParallaxY = (progress: MotionValue<number>, strength = 12) =>
  useTransform(progress, [0, 1], [`${strength / 2}%`, `${-strength / 2}%`]);

export const useParallaxX = (progress: MotionValue<number>, strength = 12) =>
  useTransform(progress, [0, 1], [`${-strength / 2}%`, `${strength / 2}%`]);

/** A layer that drifts vertically as the section passes. */
export function ParallaxLayer({
  progress,
  strength = 12,
  className = '',
  children,
}: {
  progress: MotionValue<number>;
  strength?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const y = useParallaxY(progress, strength);
  if (prefersReducedMotion()) return <div className={className}>{children}</div>;
  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────── ghost word ──── */

/**
 * The oversized wordmark that sits behind a section and slides as you pass it.
 *
 * It is set in the display face at a weight and opacity that keep it firmly
 * behind the content — it should register as texture, not as a second heading.
 */
export function GhostWord({
  text,
  progress,
  strength = 14,
  className = '',
  align = 'center',
}: {
  text: string;
  progress: MotionValue<number>;
  strength?: number;
  className?: string;
  align?: 'left' | 'center' | 'right';
}) {
  const x = useParallaxX(progress, strength);
  const justify = align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center';
  const reduced = prefersReducedMotion();

  const word = (
    <div
      aria-hidden
      className={`font-display font-black text-white/[0.045] whitespace-nowrap tracking-tighter select-none leading-none text-[7rem] sm:text-[12rem] lg:text-[16rem] ${className}`}
    >
      {text}
    </div>
  );

  return (
    <div
      className={`absolute inset-x-0 top-1/2 -translate-y-1/2 z-0 pointer-events-none flex items-center overflow-hidden ${justify}`}
    >
      {reduced ? word : <motion.div style={{ x }}>{word}</motion.div>}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────── headings ──── */

const wordRise = {
  hidden: { y: '115%' },
  visible: (i: number) => ({
    y: '0%',
    transition: { duration: DUR.slow, ease: EASE.out, delay: 0.04 * i },
  }),
};

/**
 * A headline whose words rise out of a hard edge, one after the next.
 *
 * `highlight` words take the brand gradient. Line breaks are written as `\n`.
 */
export function MaskedHeading({
  text,
  as: Tag = 'h2',
  className = '',
  highlight = [],
  delay = 0,
  align = 'left',
}: {
  text: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  highlight?: string[];
  delay?: number;
  align?: 'left' | 'center';
}) {
  const hi = useMemo(
    () => new Set(highlight.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''))),
    [highlight],
  );
  const lines = useMemo(() => text.split('\n').map((l) => l.split(' ')), [text]);
  const reduced = prefersReducedMotion();
  let n = 0;

  const gradient = 'text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent';
  const isHi = (w: string) => hi.has(w.toLowerCase().replace(/[^a-z0-9]/g, ''));

  if (reduced) {
    return (
      <Tag className={className}>
        {lines.map((words, li) => (
          <span key={li} className="block">
            {words.map((w, wi) => (
              <span key={wi} className={isHi(w) ? gradient : undefined}>
                {w}
                {wi < words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag className={className}>
      <motion.span
        className="block"
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        transition={{ delayChildren: delay }}
      >
        {lines.map((words, li) => (
          <span
            key={li}
            className={`block overflow-hidden pb-[0.08em] ${align === 'center' ? 'text-center' : ''}`}
          >
            {words.map((w, wi) => {
              const i = n++;
              return (
                <motion.span
                  key={wi}
                  custom={i}
                  variants={wordRise}
                  className={`inline-block ${isHi(w) ? gradient : ''}`}
                >
                  {w}
                  {wi < words.length - 1 ? ' ' : ''}
                </motion.span>
              );
            })}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

/** The small mono label that sits above a heading, with a live status dot. */
export function Eyebrow({
  children,
  tone = 'brand',
  className = '',
}: {
  children: React.ReactNode;
  tone?: 'brand' | 'blue' | 'ok';
  className?: string;
}) {
  const ring =
    tone === 'ok'
      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
      : tone === 'blue'
        ? 'bg-blue-950/40 border-blue-800/60 text-blue-300'
        : 'bg-brand-950/40 border-brand-800/60 text-brand-300';
  const dot = tone === 'ok' ? 'bg-emerald-400' : tone === 'blue' ? 'bg-blue-400' : 'bg-brand-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: DUR.base, ease: EASE.out }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm font-mono text-[10px] font-bold uppercase tracking-[0.24em] ${ring} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────── figures ──── */

/**
 * A figure that counts up the first time it is seen.
 *
 * It renders its final value immediately for reduced motion and for anything
 * that cannot run the observer, so the number is never missing from the page.
 */
export function CountUp({
  to,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1.1,
  className = '',
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  const reduced = prefersReducedMotion();
  const [value, setValue] = useState(reduced ? to : 0);

  useEffect(() => {
    if (reduced || !inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      // the same "leaves fast, lands soft" shape the rest of the site uses
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(to * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduced]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export interface Stat {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  /**
   * Count up to the value. Off for things that are not quantities — a year
   * racing from 0 to 2018 reads as a broken odometer, not as a figure.
   */
  count?: boolean;
}

/** The divided row of figures under a block of copy. */
export function StatStrip({ items, className = '' }: { items: Stat[]; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-6 ${className}`}>
      {items.map((s, i) => (
        <React.Fragment key={s.label}>
          {i > 0 && <div className="w-px h-12 bg-ink-700/80 hidden sm:block" />}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: DUR.base, ease: EASE.out, delay: 0.08 * i }}
            className="space-y-1"
          >
            <div className="text-3xl sm:text-4xl font-display font-black text-white">
              {s.count === false ? (
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {s.prefix ?? ''}
                  {s.value.toFixed(s.decimals ?? 0)}
                </span>
              ) : (
                <CountUp to={s.value} decimals={s.decimals} prefix={s.prefix} />
              )}
              {s.suffix ? <span className="text-brand-500">{s.suffix}</span> : null}
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
              {s.label}
            </div>
          </motion.div>
        </React.Fragment>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── cards ──── */

/**
 * A grid whose children arrive one after another, with every other card sitting
 * lower than its neighbour so the row reads as composed rather than stamped.
 */
export function OffsetGrid({
  children,
  className = '',
  offset = true,
  stagger = 0.09,
}: {
  children: React.ReactNode;
  className?: string;
  offset?: boolean;
  stagger?: number;
}) {
  const reduced = prefersReducedMotion();
  const items = React.Children.toArray(children);

  return (
    <div className={className}>
      {items.map((child, i) => {
        const drop = offset && i % 2 === 1 ? 'lg:translate-y-10' : '';
        if (reduced) {
          return (
            <div key={i} className={drop}>
              {child}
            </div>
          );
        }
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 44 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: DUR.slow, ease: EASE.out, delay: i * stagger }}
            className={drop}
          >
            {child}
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── beams ──── */

/**
 * A light sweep that crosses a section once, the first time it is reached.
 *
 * This is the piece that makes a section feel switched-on rather than merely
 * present: the same gesture as a machine bed being traversed once at power-up.
 */
export function ScanBeam({
  className = '',
  tone = 'brand',
  delay = 0.2,
}: {
  className?: string;
  tone?: 'brand' | 'blue' | 'accent';
  delay?: number;
}) {
  if (prefersReducedMotion()) return null;
  const via =
    tone === 'accent' ? 'via-accent/20' : tone === 'blue' ? 'via-blue-400/15' : 'via-brand-400/15';

  return (
    <motion.div
      aria-hidden
      initial={{ x: '-120%' }}
      whileInView={{ x: '120%' }}
      viewport={{ once: true, margin: '0px 0px -20% 0px' }}
      transition={{ duration: 1.7, ease: EASE.inOut, delay }}
      className={`absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent ${via} to-transparent pointer-events-none mix-blend-screen ${className}`}
    />
  );
}

/**
 * A hairline that draws itself across the full width as the section arrives —
 * used to separate bands without a static border doing the work.
 */
export function DrawRule({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  const reduced = prefersReducedMotion();
  return (
    <motion.div
      aria-hidden
      initial={reduced ? undefined : { scaleX: 0 }}
      whileInView={reduced ? undefined : { scaleX: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: DUR.cinematic, ease: EASE.out, delay }}
      className={`h-px origin-left bg-gradient-to-r from-brand-500/60 via-ink-700 to-transparent ${className}`}
    />
  );
}

/* ──────────────────────────────────────────────────────────────── misc ──── */

/**
 * Pointer-following highlight for a card. Cheap: two motion values written on
 * pointermove, read by a radial gradient, nothing in React state.
 */
export function useSpotlight() {
  const mx = useMotionValue(-999);
  const my = useMotionValue(-999);
  const sx = useSpring(mx, { stiffness: 220, damping: 30, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 220, damping: 30, mass: 0.4 });

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };
  const onPointerLeave = () => {
    mx.set(-999);
    my.set(-999);
  };

  const background = useTransform(
    [sx, sy] as const,
    ([x, y]: number[]) =>
      `radial-gradient(300px circle at ${x}px ${y}px, rgba(124,113,255,0.14), transparent 70%)`,
  );

  return { onPointerMove, onPointerLeave, background };
}
