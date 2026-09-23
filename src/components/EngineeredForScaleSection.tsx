import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Zap, Cpu, Factory, ChevronRight } from 'lucide-react';
import {
  GhostWord,
  MaskedHeading,
  Eyebrow,
  OffsetGrid,
  ScanBeam,
  useSectionScroll,
} from '../motion/SectionFX';
import { VIEWPORT, DUR, EASE } from '../motion/tokens';

interface Props {
  onNavigate: (page: string) => void;
  onOpenQuoteModal: () => void;
}

export const EngineeredForScaleSection: React.FC<Props> = ({ onNavigate, onOpenQuoteModal }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useSectionScroll(containerRef);
  const bgY = useTransform(scrollYProgress, [0, 1], ["-14%", "14%"]);
  const gridScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.24]);

  return (
    <section ref={containerRef} className="py-24 relative bg-[#06071A] overflow-hidden border-y border-slate-800/50">
      
{/* This was a stock photograph of a CNC machine — equipment that belongs
          to the engineering side, shot by someone else, standing in for work
          this page is about. The backdrop is drawn instead: a machined grid
          that drifts and scales as the section passes, with the wordmark behind
          it. Nothing to licence and nothing to misrepresent. */}
      <motion.div style={{ y: bgY, scale: gridScale }} className="absolute inset-0 z-0 pointer-events-none origin-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141A44_1px,transparent_1px),linear-gradient(to_bottom,#141A44_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_50%,#000_55%,transparent_100%)] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E2670_1px,transparent_1px),linear-gradient(to_bottom,#1E2670_1px,transparent_1px)] bg-[size:12rem_12rem] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_50%,#000_45%,transparent_100%)] opacity-60" />
        <div className="absolute top-1/3 left-1/5 w-[560px] h-[560px] bg-brand-900/20 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[460px] h-[460px] bg-blue-900/15 blur-[120px] rounded-full" />
      </motion.div>

      <GhostWord text="IN-HOUSE" progress={scrollYProgress} strength={12} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <Eyebrow tone="brand">Everything on this page runs here</Eyebrow>
          <MaskedHeading
            as="h2"
            align="center"
            text={'ENGINEERED FOR SCALE,\nBUILT WITH SPEED.'}
            highlight={['BUILT', 'WITH', 'SPEED.']}
            className="text-4xl md:text-6xl font-display font-black text-white leading-tight"
          />
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: DUR.slow, ease: EASE.out, delay: 0.25 }}
            className="text-lg text-fg-muted font-light max-w-2xl mx-auto"
          >
            Software you can open, prints you can turn over, and sites that are live and linkable.
          </motion.p>
        </div>

        {/* 3 Cards Grid */}
        <OffsetGrid className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24 items-stretch" offset={false} stagger={0.12}>

          {/* Card 1 */}
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: DUR.base, ease: EASE.out }}
            className="relative overflow-hidden p-8 rounded-3xl bg-[#0B0D24]/80 backdrop-blur-md border border-slate-700/50 hover:border-brand-500/50 transition-colors flex flex-col h-full group shadow-2xl"
          >
            <ScanBeam delay={0.35} />
            <div className="w-14 h-14 rounded-2xl bg-brand-950/50 border border-brand-900 flex items-center justify-center mb-6 shadow-inner">
              <Zap className="w-7 h-7 text-brand-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 font-display">Two processes, one enquiry</h3>
            <p className="text-sm text-fg-muted leading-relaxed flex-grow mb-8">
              Wire for parts that have to work, liquid for parts that have to look right. We pick the
              process and the material grade against your part, and say so if the geometry will print
              badly as drawn.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ink-900/80 border border-ink-700 text-[10px] sm:text-xs font-mono text-brand-300 font-bold w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse"></span>
              FDM + RESIN, IN-HOUSE
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: DUR.base, ease: EASE.out }}
            className="relative overflow-hidden p-8 rounded-3xl bg-[#0B0D24]/80 backdrop-blur-md border border-slate-700/50 hover:border-blue-500/50 transition-colors flex flex-col h-full group shadow-2xl"
          >
            <ScanBeam tone="blue" delay={0.5} />
            <div className="w-14 h-14 rounded-2xl bg-blue-950/50 border border-blue-900 flex items-center justify-center mb-6 shadow-inner">
              <Cpu className="w-7 h-7 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 font-display">Interactive 3D Simulation</h3>
            <p className="text-sm text-fg-muted leading-relaxed flex-grow mb-8">
              Print a gearbox on our own cell, turn the finished parts over, or sit down at the billing
              and stores software and issue a real document in it. No video, no download.
            </p>
            <button 
              onClick={() => onNavigate('simulations')}
              className="mt-auto flex items-center justify-between w-full px-5 py-4 rounded-xl bg-slate-800/50 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors"
            >
              <span>Open the simulation lab</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: DUR.base, ease: EASE.out }}
            className="relative overflow-hidden p-8 rounded-3xl bg-[#0B0D24]/80 backdrop-blur-md border border-slate-700/50 hover:border-emerald-500/50 transition-colors flex flex-col h-full group shadow-2xl"
          >
            <ScanBeam tone="accent" delay={0.65} />
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/50 border border-emerald-900 flex items-center justify-center mb-6 shadow-inner">
              <Factory className="w-7 h-7 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 font-display">One group, two halves</h3>
            <p className="text-sm text-fg-muted leading-relaxed flex-grow mb-8">
              This is MKRD's software, web and 3D printing side, in Gurugram. Mould, die and fixture
              design is our engineering side, at mkrdengineers.com — we route it there rather than
              claiming it.
            </p>
            <button 
              onClick={() => onNavigate('infrastructure')}
              className="mt-auto flex items-center justify-between w-full px-5 py-4 rounded-xl bg-slate-800/50 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors"
            >
              <span>See what is in the unit</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

        </OffsetGrid>

        {/* Bottom CTA Block matching the image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5, type: "spring" }}
          className="relative rounded-[2rem] p-8 md:p-12 bg-gradient-to-br from-[#0a1128]/90 to-[#06071A]/90 backdrop-blur-lg border border-brand-900/40 shadow-[0_0_50px_rgba(139,125,255,0.05)] overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="space-y-5 z-10 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              viewport={VIEWPORT}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-950/50 border border-brand-800 text-[10px] font-mono text-brand-400 font-bold uppercase tracking-widest shadow-inner"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(139,125,255,0.8)]"></span>
              Fast-Track Engineering Estimation
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              viewport={VIEWPORT}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight"
            >
              Have CAD Files or Specs Ready?
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              viewport={VIEWPORT}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm md:text-base text-slate-300 leading-relaxed max-w-xl"
            >
              Send a STEP, IGES or STL file, or just describe the job. We come back with what it will
              cost, how long it takes, and whether the part will print well as drawn.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            viewport={VIEWPORT}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto z-10 shrink-0"
          >
            <button 
              onClick={onOpenQuoteModal}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(139,125,255,0.4)] whitespace-nowrap hover:scale-105 active:scale-95"
            >
              REQUEST PROPOSAL
            </button>
            <button 
              onClick={() => onNavigate('contact')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-600 text-sm font-bold tracking-wide transition-all whitespace-nowrap hover:scale-105 active:scale-95"
            >
              CONTACT LEAD
            </button>
          </motion.div>
        </motion.div>
        
      </div>
    </section>
  );
};
