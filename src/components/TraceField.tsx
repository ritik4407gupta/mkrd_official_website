import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { prefersReducedMotion } from '../motion/tokens';

/**
 * Routed traces with signal running down them.
 *
 * The contact page is where a visitor's enquiry actually leaves the building,
 * so the backdrop is a board: orthogonal traces routed with 45° corners the way
 * a real layout tool would, fanning in from the edges of the frame and
 * converging on the centre where the form sits. A pulse travels each one and
 * arrives; the traces themselves stay dim so the form is never fighting it.
 *
 * Pure SVG. The travel is one `stroke-dashoffset` animation per path, which the
 * compositor handles, and the geometry is generated once from a seeded
 * sequence, so the layout is stable across renders but is not a hand-drawn
 * decoration that reads as clip art.
 */

const RNG = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

interface Trace {
  d: string;
  length: number;
  delay: number;
  duration: number;
  pad: [number, number];
}

/** An L-shaped route with a chamfered corner, from an edge to a target. */
const route = (x1: number, y1: number, x2: number, y2: number, chamfer = 18) => {
  const dx = Math.sign(x2 - x1);
  const dy = Math.sign(y2 - y1);
  const cx = x2 - chamfer * dx;
  const cy = y1 + chamfer * dy;
  return `M ${x1} ${y1} L ${cx} ${y1} L ${x2} ${cy} L ${x2} ${y2}`;
};

const approxLength = (x1: number, y1: number, x2: number, y2: number) =>
  Math.abs(x2 - x1) + Math.abs(y2 - y1);

export const TraceField: React.FC<{ className?: string; count?: number }> = ({
  className = '',
  count = 18,
}) => {
  const reduced = prefersReducedMotion();

  const traces = useMemo<Trace[]>(() => {
    const rnd = RNG(20180915);
    const out: Trace[] = [];
    for (let i = 0; i < count; i++) {
      const fromLeft = i % 2 === 0;
      const x1 = fromLeft ? -40 : 1040;
      const y1 = 40 + rnd() * 920;
      // targets cluster on the centre column, where the form panel sits
      const x2 = fromLeft ? 330 + rnd() * 120 : 570 - rnd() * 120;
      const y2 = 120 + rnd() * 760;
      const d = route(x1, y1, x2, y2, 14 + rnd() * 22);
      const length = approxLength(x1, y1, x2, y2) + 60;
      out.push({
        d,
        length,
        delay: rnd() * 6,
        duration: 4.5 + rnd() * 5,
        pad: [Math.round(x2), Math.round(y2)],
      });
    }
    return out;
  }, [count]);

  return (
    <div
      aria-hidden
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="trace-pulse" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7C71FF" stopOpacity="0" />
            <stop offset="50%" stopColor="#A9A2FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#E20207" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="trace-fade" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="trace-mask">
            <rect width="1000" height="1000" fill="url(#trace-fade)" />
          </mask>
        </defs>

        <g mask="url(#trace-mask)">
          {/* the routed copper, always there and always quiet */}
          {traces.map((t, i) => (
            <path
              key={`t-${i}`}
              d={t.d}
              fill="none"
              stroke="#3B3F7A"
              strokeOpacity={0.34}
              strokeWidth={1}
            />
          ))}

          {/* the pad each route lands on */}
          {traces.map((t, i) => (
            <circle
              key={`p-${i}`}
              cx={t.pad[0]}
              cy={t.pad[1]}
              r={2.6}
              fill="#0A0C24"
              stroke="#5A5FA8"
              strokeOpacity={0.6}
              strokeWidth={1}
            />
          ))}

          {/* and the signal arriving on it */}
          {!reduced &&
            traces.map((t, i) => (
              <motion.path
                key={`s-${i}`}
                d={t.d}
                fill="none"
                stroke="url(#trace-pulse)"
                strokeWidth={1.6}
                strokeLinecap="round"
                style={{ strokeDasharray: `70 ${t.length}` }}
                initial={{ strokeDashoffset: t.length + 70 }}
                animate={{ strokeDashoffset: -70 }}
                transition={{
                  duration: t.duration,
                  delay: t.delay,
                  repeat: Infinity,
                  repeatDelay: 2.4,
                  ease: 'linear',
                }}
              />
            ))}
        </g>
      </svg>
    </div>
  );
};
