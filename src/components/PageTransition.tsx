import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const PAGE_NAMES: Record<string, string> = {
  home: 'HOME',
  services: 'SERVICES',
  projects: 'PROJECTS',
  simulations: '3D SIMULATION',
  infrastructure: 'INFRASTRUCTURE',
  contact: 'CONTACT',
};

const PAGE_SUBTITLES: Record<string, string> = {
  home: 'PRIMARY ENGINEERING INTERFACE',
  services: 'CAPABILITIES & ADVANCED MANUFACTURING',
  projects: 'PORTFOLIO & CASE STUDIES',
  simulations: '3D CAD & KINEMATIC SIMULATION LAB',
  infrastructure: 'FACILITY & MACHINERY SPECIFICATIONS',
  contact: 'RFQ & DIRECT ENGINEERING INQUIRY',
};

type TransitionPhase = 'idle' | 'closing' | 'shut' | 'opening';

export const PageTransition = ({
  children,
  pageKey,
  isInitialBoot = false,
}: {
  children: React.ReactNode;
  pageKey: string;
  isInitialBoot?: boolean;
}) => {
  const [displayedChildren, setDisplayedChildren] = useState<React.ReactNode>(children);
  const [targetKey, setTargetKey] = useState<string>(pageKey);
  const [phase, setPhase] = useState<TransitionPhase>('idle');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const prevKeyRef = useRef<string>(pageKey);
  const isFirstMount = useRef<boolean>(true);
  const pendingChildrenRef = useRef<React.ReactNode>(children);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep latest incoming children in ref
  pendingChildrenRef.current = children;

  useEffect(() => {
    // Skip transition on very first page mount
    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevKeyRef.current = pageKey;
      setDisplayedChildren(children);
      setTargetKey(pageKey);
      return;
    }

    // If same page key, just update content without running parting plates
    if (pageKey === prevKeyRef.current) {
      setDisplayedChildren(children);
      return;
    }

    // Trigger die-block parting plates closing transition
    prevKeyRef.current = pageKey;
    setTargetKey(pageKey);
    setIsTransitioning(true);
    setPhase('closing');

    if (timerRef.current) clearTimeout(timerRef.current);
  }, [pageKey]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClosingComplete = () => {
    if (phase !== 'closing') return;

    // Plates are now completely closed and shut
    setPhase('shut');

    // Swap page content underneath while fully covered
    setDisplayedChildren(pendingChildrenRef.current);

    // Brief mechanical clamp pause, then smoothly reopen plates without snapping
    timerRef.current = setTimeout(() => {
      setPhase('opening');
    }, 180);
  };

  const handleOpeningComplete = () => {
    if (phase !== 'opening') return;

    // Plates are fully reopened; return to idle state
    setPhase('idle');
    setIsTransitioning(false);
  };

  const isClosedOrShut = phase === 'closing' || phase === 'shut';
  const displayText = PAGE_NAMES[targetKey] || targetKey.toUpperCase();
  const displaySubtitle = PAGE_SUBTITLES[targetKey] || 'ENGINEERING MODULE READY';

  return (
    <div className="relative w-full min-h-screen">
      {/* Active Page Stage */}
      <div className="w-full h-full">
        {displayedChildren}
      </div>

      {/* Die-Block Parting Plates Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
            {/* LEFT DIE-BLOCK PLATE (Plate A) */}
            <motion.div
              key="die-plate-left"
              initial={{ x: '-100%' }}
              animate={{
                x: isClosedOrShut ? '0%' : '-100%',
              }}
              transition={{
                duration: isClosedOrShut ? 0.44 : 0.54,
                ease: isClosedOrShut ? [0.16, 1, 0.3, 1] : [0.22, 1, 0.36, 1],
              }}
              onAnimationComplete={() => {
                if (phase === 'closing') handleClosingComplete();
                else if (phase === 'opening') handleOpeningComplete();
              }}
              className="absolute top-0 bottom-0 left-0 w-1/2 bg-[#06071A] border-r border-[#2E22E6]/50 shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden pointer-events-auto"
            >
              {/* Technical Radial Ambience */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_50%,rgba(46,34,230,0.18)_0%,transparent_70%)]" />

              {/* Technical Precision Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(124,113,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(124,113,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />

              {/* Machined Inner Mating Bevel */}
              <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-brand-300/40 via-brand-200/90 to-brand-300/40" />

              {/* Red Parting Line Edge (Left Half) */}
              <div className="absolute right-0 top-0 bottom-0 w-[1.5px] bg-[#E20207] shadow-[0_0_12px_#E20207]" />

              {/* Top-Left Die Guide Pillar Bushing */}
              <div className="absolute top-8 left-8 sm:top-12 sm:left-12 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-brand-500/30 bg-[#0B0D24] shadow-[inset_0_0_12px_rgba(0,0,0,0.8),0_0_15px_rgba(46,34,230,0.3)] flex items-center justify-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-brand-400/40 bg-slate-900" />
              </div>

              {/* Bottom-Left Die Guide Pillar Bushing */}
              <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-12 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-brand-500/30 bg-[#0B0D24] shadow-[inset_0_0_12px_rgba(0,0,0,0.8),0_0_15px_rgba(46,34,230,0.3)] flex items-center justify-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-brand-400/40 bg-slate-900" />
              </div>

              {/* Left Plate Technical Engraving */}
              <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 text-right font-mono text-[9px] sm:text-[10px] text-slate-500/60 uppercase tracking-[0.25em]">
                PLATE A // CAVITY SIDE
              </div>
            </motion.div>

            {/* RIGHT DIE-BLOCK PLATE (Plate B) */}
            <motion.div
              key="die-plate-right"
              initial={{ x: '100%' }}
              animate={{
                x: isClosedOrShut ? '0%' : '100%',
              }}
              transition={{
                duration: isClosedOrShut ? 0.44 : 0.54,
                ease: isClosedOrShut ? [0.16, 1, 0.3, 1] : [0.22, 1, 0.36, 1],
              }}
              className="absolute top-0 bottom-0 right-0 w-1/2 bg-[#06071A] border-l border-[#2E22E6]/50 shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden pointer-events-auto"
            >
              {/* Technical Radial Ambience */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_50%,rgba(46,34,230,0.18)_0%,transparent_70%)]" />

              {/* Technical Precision Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(124,113,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(124,113,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />

              {/* Machined Inner Mating Bevel */}
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-brand-300/40 via-brand-200/90 to-brand-300/40" />

              {/* Red Parting Line Edge (Right Half) */}
              <div className="absolute left-0 top-0 bottom-0 w-[1.5px] bg-[#E20207] shadow-[0_0_12px_#E20207]" />

              {/* Top-Right Die Guide Pillar Bushing */}
              <div className="absolute top-8 right-8 sm:top-12 sm:right-12 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-brand-500/30 bg-[#0B0D24] shadow-[inset_0_0_12px_rgba(0,0,0,0.8),0_0_15px_rgba(46,34,230,0.3)] flex items-center justify-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-brand-400/40 bg-slate-900" />
              </div>

              {/* Bottom-Right Die Guide Pillar Bushing */}
              <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-brand-500/30 bg-[#0B0D24] shadow-[inset_0_0_12px_rgba(0,0,0,0.8),0_0_15px_rgba(46,34,230,0.3)] flex items-center justify-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-brand-400/40 bg-slate-900" />
              </div>

              {/* Right Plate Technical Engraving */}
              <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-12 text-left font-mono text-[9px] sm:text-[10px] text-slate-500/60 uppercase tracking-[0.25em]">
                PLATE B // CORE EJECTOR
              </div>
            </motion.div>

            {/* CENTER PARTING LINE SEAM & DESTINATION PAGE NAME */}
            <motion.div
              key={`badge-${targetKey}`}
              initial={{ opacity: 0, scale: 0.94, filter: 'blur(8px)' }}
              animate={{
                opacity: isClosedOrShut ? 1 : 0,
                scale: isClosedOrShut ? 1 : 1.05,
                filter: isClosedOrShut ? 'blur(0px)' : 'blur(6px)',
              }}
              transition={{
                duration: isClosedOrShut ? 0.36 : 0.3,
                ease: isClosedOrShut ? 'easeOut' : 'easeIn',
                delay: isClosedOrShut ? 0.08 : 0,
              }}
              className="fixed inset-0 z-[102] flex flex-col items-center justify-center pointer-events-none select-none px-4"
            >
              {/* Vertical Luminous Red Parting Line */}
              <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[2px] bg-[#E20207] shadow-[0_0_20px_#E20207,0_0_40px_rgba(226,2,7,0.7)]" />

              {/* Center Tech Card with Destination Name */}
              <div className="relative px-4 py-5 sm:px-12 sm:py-7 rounded-2xl bg-[#06071A]/95 border border-brand-400/40 backdrop-blur-xl shadow-[0_0_60px_rgba(46,34,230,0.35),0_0_35px_rgba(226,2,7,0.3)] flex flex-col items-center text-center w-[calc(100%-2rem)] max-w-2xl min-w-0 overflow-hidden">
                {/* Top Parting Line Badge */}
                <div className="flex items-center gap-2 mb-2 max-w-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E20207] animate-ping shrink-0" />
                  <span className="font-mono text-[8.5px] sm:text-[10px] tracking-wider sm:tracking-[0.35em] text-brand-300 font-bold uppercase whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
                    MKRD &middot; PARTING LINE ENGAGED
                  </span>
                </div>

                {/* Destination Page Name */}
                <div className={`leading-tight font-display font-black text-white uppercase drop-shadow-[0_0_30px_rgba(139,125,255,0.45)] whitespace-nowrap max-w-full min-w-0 ${displayText === 'INFRASTRUCTURE'
                    ? 'text-lg tracking-[0.02em] sm:text-4xl sm:tracking-[0.12em] md:text-5xl md:tracking-[0.16em]'
                    : 'text-xl tracking-[0.04em] sm:text-5xl sm:tracking-[0.18em] md:text-6xl md:tracking-[0.22em]'
                  }`}>
                  {displayText}
                </div>

                {/* Subtitle Description */}
                <div className="mt-2 font-mono text-[8px] leading-relaxed sm:text-[10px] tracking-[0.12em] sm:tracking-[0.2em] text-slate-400 uppercase break-words max-w-full min-w-0">
                  {displaySubtitle}
                </div>

                {/* Precision Alignment Pips */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#E20207] shadow-[0_0_10px_#E20207]" />
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#E20207] shadow-[0_0_10px_#E20207]" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

