import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Box, ExternalLink, X } from 'lucide-react';

interface VirtualTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * The backdrop behind the tour prompt.
 *
 * This was a 3.77 MB looping MP4 whose provenance nobody could confirm, played
 * at half opacity behind a scrim — three and a half megabytes and an open
 * licence question for something the visitor barely sees. It is now a wireframe
 * globe drawn in SVG and turned with CSS: no download, no licence, no JS frame
 * loop, and it stops dead under prefers-reduced-motion.
 *
 * The longitude lines are ellipses whose horizontal radius is animated from
 * full width to zero and back, phase-offset from one another — which is what a
 * rotating sphere's meridians actually do in projection.
 */
const AnimatedWorldPreview = () => (
  <div className="absolute inset-0 overflow-hidden bg-ink-900" aria-hidden="true">
    <style>{`
      @keyframes mkrdMeridian {
        0%, 100% { transform: scaleX(1); opacity: 0.85; }
        50%      { transform: scaleX(0.04); opacity: 0.3; }
      }
      @keyframes mkrdNode {
        0%, 100% { opacity: 0.25; r: 1.6; }
        50%      { opacity: 1;    r: 2.6; }
      }
      .mkrd-meridian { transform-origin: 50% 50%; animation: mkrdMeridian 14s ease-in-out infinite; }
      .mkrd-node { animation: mkrdNode 4s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) {
        .mkrd-meridian, .mkrd-node { animation: none; }
      }
    `}</style>
    <svg
      viewBox="0 0 200 200"
      className="absolute left-1/2 top-1/2 h-[128%] w-[128%] -translate-x-1/2 -translate-y-1/2 opacity-[0.42]"
      fill="none"
    >
      <defs>
        <radialGradient id="mkrdGlobeGlow" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity="0.45" />
          <stop offset="70%" stopColor="var(--color-brand-900)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="74" fill="url(#mkrdGlobeGlow)" />
      <circle cx="100" cy="100" r="62" stroke="var(--color-brand-400)" strokeWidth="0.6" opacity="0.75" />
      {/* latitudes */}
      {[16, 30, 41, 48].map((ry, i) => (
        <ellipse key={`lat-${ry}`} cx="100" cy={100 + (i % 2 === 0 ? -1 : 1) * (i < 2 ? 34 : 12)}
          rx={Math.sqrt(Math.max(62 * 62 - (i < 2 ? 34 : 12) ** 2, 1))} ry={ry * 0.22}
          stroke="var(--color-brand-500)" strokeWidth="0.45" opacity="0.5" />
      ))}
      <ellipse cx="100" cy="100" rx="62" ry="13" stroke="var(--color-accent)" strokeWidth="0.5" opacity="0.55" />
      {/* meridians */}
      {[0, 1, 2, 3, 4].map((i) => (
        <ellipse
          key={`mer-${i}`}
          className="mkrd-meridian"
          style={{ animationDelay: `${(i * 14) / 5}s` }}
          cx="100" cy="100" rx="62" ry="62"
          stroke="var(--color-brand-300)" strokeWidth="0.45" opacity="0.6"
        />
      ))}
      {/* tour nodes */}
      {[[72, 74], [128, 88], [96, 118], [142, 128], [64, 122]].map(([cx, cy], i) => (
        <circle
          key={`node-${i}`}
          className="mkrd-node"
          style={{ animationDelay: `${i * 0.7}s` }}
          cx={cx} cy={cy} r="2"
          fill={i === 1 ? 'var(--color-accent)' : 'var(--color-brand-200)'}
        />
      ))}
    </svg>
    <div className="absolute inset-0 bg-ink-950/35" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,7,26,0.05)_0%,rgba(6,7,26,0.22)_48%,rgba(6,7,26,0.7)_100%)]" />
  </div>
);

export const VirtualTourModal: React.FC<VirtualTourModalProps> = ({ isOpen, onClose }) => {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (isOpen) setShowTour(false);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="virtual-tour-modal-portal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto p-4 sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-slate-950/90"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="relative z-10 flex h-[min(82vh,54rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-brand-300/20 bg-slate-950 shadow-[0_0_80px_rgba(139,125,255,0.18)]"
          >
            <div className="relative z-40 flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 backdrop-blur-xl sm:px-5">
              <div className="flex items-center gap-2" aria-hidden="true">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-[0_0_10px_rgba(255,95,87,0.45)]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e] shadow-[0_0_10px_rgba(254,188,46,0.35)]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840] shadow-[0_0_10px_rgba(40,200,64,0.35)]" />
              </div>

              <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                MKRD / VIRTUAL TOUR
              </span>

              <div className="flex items-center gap-1.5">
                <a
                  href="https://virtual-tour.sdms.edu.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open tour in a new window"
                  aria-label="Open tour in a new window"
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-brand-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  title="Close virtual tour"
                  aria-label="Close virtual tour"
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden bg-[#06071A]">
              {showTour ? (
                <motion.iframe
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7 }}
                  src="https://virtual-tour.sdms.edu.in/"
                  title="SDMS Virtual Tour"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0 bg-white"
                />
              ) : (
                <>
                  <AnimatedWorldPreview />
                  <motion.div
                    aria-hidden="true"
                    animate={{ x: ['-40%', '130%'], opacity: [0, 0.3, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
                    className="pointer-events-none absolute inset-y-0 z-20 w-1/3 bg-gradient-to-r from-transparent via-brand-200/10 to-transparent blur-2xl"
                  />

                  <div className="absolute inset-0 z-30 flex items-center justify-center p-6">
                    <motion.a
                      href="#virtual-tour"
                      onClick={(event) => {
                        event.preventDefault();
                        setShowTour(true);
                      }}
                      initial={{ opacity: 0, scale: 0.86 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35, type: 'spring', stiffness: 220, damping: 16 }}
                      whileHover={{ scale: 1.07, y: -4 }}
                      whileTap={{ scale: 0.96 }}
                      className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl border border-brand-200/80 bg-slate-950/90 px-9 py-4 text-brand-50 shadow-[0_0_30px_rgba(139,125,255,0.35)] backdrop-blur-md transition-shadow duration-500 hover:shadow-[0_0_60px_rgba(139,125,255,0.65)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950"
                      aria-label="Begin the SDMS virtual tour inside this window"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      <Box className="relative z-10 h-5 w-5 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                      <span className="relative z-10 text-xs font-bold uppercase tracking-[0.3em]">3D Begin</span>
                    </motion.a>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
