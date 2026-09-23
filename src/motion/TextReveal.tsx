import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { riseFromMask, stagger, VIEWPORT, prefersReducedMotion } from './tokens';

/**
 * Type that rises out of a mask, line by line or word by word.
 *
 * The mask is the whole trick: each unit sits inside a `overflow-hidden` box
 * and starts translated fully below it, so nothing is visible until it travels.
 * That reads as a machined part rising out of a mould rather than a generic
 * fade, and it is why the site's headings feel physical.
 *
 * Only `transform` moves — no width, height, or filter animation — so a page
 * with several of these still composites on the GPU.
 */

type Split = 'lines' | 'words' | 'chars';

interface TextRevealProps {
  text: string;
  /** How finely to break the string. `chars` only for short display strings. */
  split?: Split;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  className?: string;
  /** Words that take the brand gradient. Matched case-insensitively. */
  highlight?: string[];
  delay?: number;
  stagger?: number;
}

const splitText = (text: string, mode: Split): string[][] => {
  if (mode === 'lines') return text.split('\n').map((l) => [l]);
  if (mode === 'words') return text.split('\n').map((l) => l.split(' '));
  return text.split('\n').map((l) => Array.from(l));
};

export const TextReveal = ({
  text,
  split: splitMode = 'words',
  as: Tag = 'h2',
  className = '',
  highlight = [],
  delay = 0,
  stagger: each = 0.055,
}: TextRevealProps) => {
  const lines = useMemo(() => splitText(text, splitMode), [text, splitMode]);
  const hi = useMemo(() => new Set(highlight.map((h) => h.toLowerCase())), [highlight]);
  const reduced = prefersReducedMotion();

  // Reduced motion still gets the type, just without the travel.
  if (reduced) return <Tag className={className}>{text}</Tag>;

  let index = 0;

  return (
    <Tag className={className}>
      <motion.span
        className="block"
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        variants={stagger(each, delay)}
      >
        {lines.map((units, li) => (
          <span key={li} className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
            {units.map((unit, ui) => {
              const i = index++;
              const isHighlighted = hi.has(unit.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase());
              return (
                <motion.span
                  key={`${li}-${ui}`}
                  custom={i}
                  variants={riseFromMask}
                  className={`inline-block will-change-transform ${
                    isHighlighted
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-500 to-accent'
                      : ''
                  }`}
                >
                  {unit}
                  {splitMode === 'words' && ui < units.length - 1 ? ' ' : ''}
                </motion.span>
              );
            })}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
};

export default TextReveal;
