import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import {
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Crosshair,
  Wifi,
  Terminal,
  ShieldCheck,
  ChevronRight,
  Package,
  Receipt,
  Boxes
} from 'lucide-react';
const AdditiveLab = React.lazy(() => import('../sim/AdditiveLab'));
const PartsGallery = React.lazy(() => import('../sim/PartsGallery'));
const Workstation3D = React.lazy(() => import('../workstation/Workstation3D'));
import { VirtualTourModal } from '../VirtualTourModal';
import { ENGINEERING_SIDE } from '../../data/mkrdData';
import { TextReveal } from '../../motion/TextReveal';

interface SimulationsViewProps {
  onOpenQuoteModal: () => void;
}

export const SimulationsView: React.FC<SimulationsViewProps> = ({ onOpenQuoteModal }) => {
  const [activeSimulationTab, setActiveSimulationTab] = useState<'printer' | 'parts' | 'software'>('printer');
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [canMountSimulation, setCanMountSimulation] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setCanMountSimulation(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Advanced Flexible Parallax: scale up, hold, then scale down before exit
  const width = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], ["85vw", "96vw", "96vw", "85vw"]);
  const maxWidth = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], ["75rem", "120rem", "120rem", "75rem"]);
  const height = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], ["62vh", "84vh", "84vh", "62vh"]);

  // Keep the edges beautifully curved at all times to give it a floating premium window feel
  const borderRadius = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], ["2rem", "1rem", "1rem", "2rem"]);

  // Frame decorations fade out when fully expanded
  const decorationOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 0, 0, 1]);
  const shadowIntensity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1],
    ["0 20px 50px -15px rgba(124,113,255,0.15)", "0 30px 80px -15px rgba(124,113,255,0.4)", "0 30px 80px -15px rgba(124,113,255,0.4)", "0 20px 50px -15px rgba(124,113,255,0.15)"]
  );

  return (
    <div className="relative pb-24 bg-[#04050F] min-h-[100vh] text-slate-300 font-sans">
      {/* High-tech Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#04050F] via-transparent to-[#04050F] pointer-events-none" />


      {/* Header Section */}
      <section className="relative pt-20 pb-16 z-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-brand-600/20 blur-[150px] rounded-[100%] pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-950/40 border border-brand-500/30 text-brand-400 font-mono text-[10px] font-bold tracking-[0.2em] uppercase mb-8 shadow-[0_0_15px_rgba(139,125,255,0.2)]"
          >
            <Terminal className="w-3 h-3" />
            <span>Run it in your browser</span>
          </motion.div>

          <TextReveal
            as="h1"
            text={'3D SIMULATION\nLABORATORY'}
            highlight={['LABORATORY']}
            delay={0.1}
            className="text-5xl md:text-7xl font-display font-black tracking-tight mb-6 text-white"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-fg-muted max-w-2xl text-sm md:text-base leading-relaxed mb-12"
          >
            Three working models of what this unit actually does, running live. Print a 4:1 planetary
            gearbox on our own FDM cell, turn over the parts that come off it, or sit down at the
            billing and warehouse software and use it — no download, no video, no sales deck.
          </motion.p>

          {/* Command Deck Control Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center p-2 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl relative"
          >
            {/* Control Panel Accents */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-brand-500 rounded-tl-sm pointer-events-none" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-brand-500 rounded-br-sm pointer-events-none" />

            <button
              onClick={() => setActiveSimulationTab('printer')}
              className={`relative px-6 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-w-[220px] ${activeSimulationTab === 'printer' ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
            >
              {activeSimulationTab === 'printer' && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-brand-600 rounded-2xl shadow-[0_0_15px_rgba(91,77,245,0.6)]" />
              )}
              <Layers className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Additive Toolpath</span>
            </button>

            <button
              onClick={() => setActiveSimulationTab('parts')}
              className={`relative px-6 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-w-[220px] ${activeSimulationTab === 'parts' ? 'text-white' : 'text-fg-muted hover:text-fg hover:bg-ink-850/60'
                }`}
            >
              {activeSimulationTab === 'parts' && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-brand-600 rounded-2xl shadow-[0_0_15px_rgba(91,77,245,0.6)]" />
              )}
              <Boxes className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Printed Parts</span>
            </button>

            <button
              onClick={() => setActiveSimulationTab('software')}
              className={`relative px-6 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-w-[220px] ${activeSimulationTab === 'software' ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
            >
              {activeSimulationTab === 'software' && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-brand-600 rounded-2xl shadow-[0_0_15px_rgba(46,34,230,0.6)]" />
              )}
              <Receipt className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Software Workstation</span>
            </button>

            <div className="w-px h-8 bg-slate-700 mx-2 hidden sm:block" />

            <button
              onClick={() => setIsTourModalOpen(true)}
              className="relative group px-6 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-w-[220px] bg-slate-950 border border-brand-500/30 overflow-hidden sm:mt-0 mt-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600/20 to-blue-600/20 group-hover:from-brand-600/40 group-hover:to-blue-600/40 transition-colors" />
              <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
              <Sparkles className="w-4 h-4 text-brand-300 relative z-10" />
              <span className="text-brand-100 relative z-10">360° Visual Tour</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Parallax Containment Bay */}
      <section className="w-full relative">
        <div ref={containerRef} className="h-[350vh] relative">
          <div className="sticky top-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden pt-16">

            <motion.div
              className="relative bg-[#0B0D24] overflow-hidden flex flex-col mx-auto ring-1 ring-brand-900/30 backdrop-blur-xl"
              style={{ width, maxWidth, height, borderRadius, boxShadow: shadowIntensity }}
            >
              {/* Containment Bay Holographic Border */}
              <div className="absolute inset-0 rounded-[inherit] border-2 border-transparent bg-gradient-to-b from-brand-500/20 to-transparent" style={{ maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', WebkitMaskComposite: 'xor', padding: '1px' }} />

              {/* Parallax HUD Decorations */}
              <motion.div style={{ opacity: decorationOpacity }} className="absolute inset-4 pointer-events-none z-20">
                <Crosshair className="absolute top-0 left-0 w-6 h-6 text-brand-500/50" />
                <Crosshair className="absolute top-0 right-0 w-6 h-6 text-brand-500/50" />
                <Crosshair className="absolute bottom-0 left-0 w-6 h-6 text-brand-500/50" />
                <Crosshair className="absolute bottom-0 right-0 w-6 h-6 text-brand-500/50" />

                <div className="absolute top-2 left-10 text-[9px] font-mono text-brand-500/60 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  Live Simulation
                </div>

                {/* Tech scanline overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20 pointer-events-none mix-blend-overlay" />
              </motion.div>

              {/* Background texture inside the 3D frame */}
              <div className="absolute inset-0 z-0">
                <div
                  aria-hidden="true"
                  className="w-full h-full opacity-[0.07] pointer-events-none bg-[radial-gradient(circle_at_30%_20%,var(--color-brand-600),transparent_55%),radial-gradient(circle_at_75%_80%,var(--color-brand-800),transparent_50%)]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#04050F] via-transparent to-transparent pointer-events-none" />
              </div>

              {/* The Actual 3D Canvas rendering */}
              <div className="w-full h-full flex-grow relative z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSimulationTab}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full"
                  >
                    <React.Suspense
                      fallback={
                        <div className="w-full h-full grid place-items-center text-fg-dim font-mono text-[11px] tracking-[0.2em] uppercase">
                          Loading cell…
                        </div>
                      }
                    >
                      {canMountSimulation && activeSimulationTab === 'printer' && <AdditiveLab />}
                      {canMountSimulation && activeSimulationTab === 'parts' && <PartsGallery />}
                      {canMountSimulation && activeSimulationTab === 'software' && <Workstation3D />}
                    </React.Suspense>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cybernetic Engineering Assistance Callout */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="group relative p-[1px] rounded-3xl overflow-hidden bg-gradient-to-br from-brand-500/30 via-slate-800 to-brand-500/30 shadow-[0_0_40px_rgba(139,125,255,0.1)] transition-all hover:shadow-[0_0_60px_rgba(139,125,255,0.2)]">

          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-400/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 ease-in-out transition-transform" />

          <div className="bg-[#0B0D24]/90 backdrop-blur-xl rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            {/* Background geometric pattern */}
            <div className="absolute -right-20 -bottom-20 opacity-10 pointer-events-none">
              <Cpu className="w-64 h-64 text-brand-400" />
            </div>

            <div className="space-y-4 max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-brand-900/40 text-brand-400 font-mono text-[10px] font-bold uppercase tracking-widest border border-brand-500/20">
                <Zap className="w-3 h-3" />
                Send us a part
              </div>
              <h4 className="text-2xl md:text-3xl font-display font-extrabold text-white">
                Got a part you need printed this week?
              </h4>
              <p className="text-sm text-fg-muted leading-relaxed max-w-xl">
                Send an STL or a STEP file and we will tell you what it will cost, how long it takes
                and whether the geometry will print badly as drawn. One part is a normal job here.
                If what you actually need is a mould or a die, that is our engineering side — see{' '}
                <a
                  href={ENGINEERING_SIDE.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-300 underline underline-offset-2 hover:text-brand-200"
                >
                  mkrdengineers.com
                </a>.
              </p>
            </div>

            <button
              onClick={onOpenQuoteModal}
              className="relative z-10 shrink-0 group/btn"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-400 to-accent rounded-full blur opacity-40 group-hover/btn:opacity-75 transition duration-200" />
              <div className="relative px-8 py-4 bg-ink-950 border border-ink-700 rounded-full flex items-center gap-3 transition-transform group-hover/btn:-translate-y-0.5">
                <span className="font-bold text-xs uppercase tracking-widest text-brand-400">
                  Send a part
                </span>
                <ChevronRight className="w-4 h-4 text-brand-400 group-hover/btn:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Virtual Tour Blur Modal */}
      <VirtualTourModal
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
      />
    </div>
  );
};
