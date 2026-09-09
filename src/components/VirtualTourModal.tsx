import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Box, ExternalLink, X } from 'lucide-react';

interface VirtualTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AnimatedWorldPreview = () => (
  <div className="absolute inset-0 overflow-hidden bg-[#071d29]" aria-hidden="true">
    <motion.video
      src="/videos/world_back.mp4"
      autoPlay
      loop
      muted
      playsInline
      animate={{ scale: [1, 1.04, 1], opacity: [0.48, 0.58, 0.48] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute inset-0 h-full w-full object-cover"
    />
    <div className="absolute inset-0 bg-[#020617]/35" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,6,23,0.05)_0%,rgba(2,6,23,0.2)_48%,rgba(2,6,23,0.68)_100%)]" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-slate-950/90"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 flex h-[min(82vh,54rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-slate-950 shadow-[0_0_80px_rgba(34,211,238,0.18)]"
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
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  title="Close virtual tour"
                  aria-label="Close virtual tour"
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden bg-[#020617]">
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
                    className="pointer-events-none absolute inset-y-0 z-20 w-1/3 bg-gradient-to-r from-transparent via-cyan-200/10 to-transparent blur-2xl"
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
                      className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl border border-cyan-200/80 bg-slate-950/90 px-9 py-4 text-cyan-50 shadow-[0_0_30px_rgba(34,211,238,0.35)] backdrop-blur-md transition-shadow duration-500 hover:shadow-[0_0_60px_rgba(34,211,238,0.65)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950"
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
        </div>
      )}
    </AnimatePresence>
  );
};
