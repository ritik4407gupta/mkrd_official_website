import React from 'react';
import { COMPANY_DETAILS } from '../data/mkrdData';

/**
 * The MKRD mark — a two-plate die block split by the parting line, with the
 * M sitting in the cavity and guide pillars at the corners.
 *
 * This used to be a lazily-loaded WebGL canvas (MkrdLogo3D) for a 40px navbar
 * icon: a whole three.js scene, a render loop and a texture upload to draw a
 * logo. It is now a single inline path — crisp at any size, zero runtime cost,
 * and every colour comes from the brand tokens so a rebrand is one file.
 */
export const MkrdMark: React.FC<{ className?: string; title?: string }> = ({
  className = '',
  title = 'MKRD',
}) => (
  <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
    <path
      fillRule="evenodd"
      fill="currentColor"
      d="M7 4h22v56H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3zM35 4h22a3 3 0 0 1 3 3v50a3 3 0 0 1-3 3H35zM11 42V17h9l12 16 12-16h9v25h-7.5V28L34 43h-4L18.5 28v14zM9.2 11a1.9 1.9 0 1 0 3.8 0 1.9 1.9 0 1 0-3.8 0zM51.1 11a1.9 1.9 0 1 0 3.8 0 1.9 1.9 0 1 0-3.8 0zM9.2 53a1.9 1.9 0 1 0 3.8 0 1.9 1.9 0 1 0-3.8 0zM51.1 53a1.9 1.9 0 1 0 3.8 0 1.9 1.9 0 1 0-3.8 0z"
    />
    <rect x="30.6" y="4" width="2.8" height="56" fill="var(--color-accent, #E20207)" />
  </svg>
);

interface MkrdLogoProps {
  variant?: 'full' | 'icon' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

const SIZES = {
  sm: { icon: 'w-6 h-6', text: 'text-sm', sub: 'text-[8px]' },
  md: { icon: 'w-9 h-9', text: 'text-base', sub: 'text-[9px]' },
  lg: { icon: 'w-12 h-12', text: 'text-xl', sub: 'text-[10px]' },
  xl: { icon: 'w-16 h-16', text: 'text-2xl', sub: 'text-xs' },
} as const;

export const MkrdLogo: React.FC<MkrdLogoProps> = ({
  variant = 'full',
  size = 'md',
  theme = 'auto',
  className = '',
}) => {
  const s = SIZES[size];
  const isDark = theme !== 'light';
  const markColor = isDark ? 'text-brand-500' : 'text-brand-700';

  if (variant === 'icon') {
    return <MkrdMark className={`${s.icon} ${markColor} ${className}`} />;
  }

  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-brand-700 text-white font-display font-black tracking-widest text-sm shadow-sm ${className}`}
      >
        <MkrdMark className="w-4 h-4 text-white" />
        MKRD
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      <MkrdMark
        className={`${s.icon} ${markColor} shrink-0 transition-transform duration-300 group-hover:scale-105`}
      />
      {/*
        MKRD over what this site is for. The old lockup read "MKRD ENGINEERS /
        PVT. LTD. • GURUGRAM", which is the registered name used on the
        engineering site — here it collided with the Request Quote button at
        phone width and said nothing about what this half of the company does.
      */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-display font-extrabold ${s.text} ${isDark ? 'text-white' : 'text-brand-950'} tracking-tight`}
          >
            {COMPANY_DETAILS.shortName}
          </span>
        </div>
        <span
          className={`font-mono ${s.sub} ${isDark ? 'text-brand-300' : 'text-brand-600'} tracking-[0.16em] leading-tight mt-1 uppercase font-bold truncate`}
        >
          {COMPANY_DETAILS.descriptor}
        </span>
      </div>
    </div>
  );
};
