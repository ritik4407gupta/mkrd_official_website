import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Zap, Cpu, Factory, ChevronRight } from 'lucide-react';
import cncBg from '../assets/images/machinery_cnc_1788702694039.jpg';

interface Props {
  onNavigate: (page: string) => void;
  onOpenQuoteModal: () => void;
}

export const EngineeredForScaleSection: React.FC<Props> = ({ onNavigate, onOpenQuoteModal }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-25%", "25%"]);

  return (
    <section ref={containerRef} className="py-24 relative bg-[#020617] overflow-hidden border-y border-slate-800/50">
      
      {/* Parallax Background Image */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0 pointer-events-none origin-center scale-125">
        <div className="absolute inset-0 bg-[#020617]/85 backdrop-blur-[2px] z-10" />
        <img 
          src={cncBg} 
          alt="Machinery Infrastructure" 
          className="w-full h-full object-cover opacity-50 mix-blend-luminosity" 
        />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          className="text-center max-w-3xl mx-auto mb-20 space-y-6"
        >
          <h2 className="text-4xl md:text-6xl font-display font-black text-white leading-tight">
            ENGINEERED FOR SCALE,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-400">
              BUILT WITH SPEED.
            </span>
          </h2>
          <p className="text-lg text-slate-300 font-light max-w-2xl mx-auto">
            Why leading OEMs and institutions trust our Manesar plant for high-consequence engineering.
          </p>
        </motion.div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          
          {/* Card 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            whileHover={{ y: -8 }}
            className="p-8 rounded-3xl bg-[#090e1a]/80 backdrop-blur-md border border-slate-700/50 hover:border-cyan-500/50 transition-all flex flex-col h-full group shadow-2xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/50 border border-cyan-900 flex items-center justify-center mb-6 shadow-inner">
              <Zap className="w-7 h-7 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 font-display">Sub-Micron GD&T</h3>
            <p className="text-sm text-slate-400 leading-relaxed flex-grow mb-8">
              Every mould, die, and custom machined fixture undergoes Zeiss 3D CMM metrology inspection with certified reports.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[10px] sm:text-xs font-mono text-cyan-400 font-bold w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              ±0.005 mm VERIFIED
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -8 }}
            className="p-8 rounded-3xl bg-[#090e1a]/80 backdrop-blur-md border border-slate-700/50 hover:border-blue-500/50 transition-all flex flex-col h-full group shadow-2xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-950/50 border border-blue-900 flex items-center justify-center mb-6 shadow-inner">
              <Cpu className="w-7 h-7 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 font-display">Interactive 3D Simulation</h3>
            <p className="text-sm text-slate-400 leading-relaxed flex-grow mb-8">
              We provide digital preview twins and robotic kinematics simulations before tool cutting, minimizing design risks.
            </p>
            <button 
              onClick={() => onNavigate('simulations')}
              className="mt-auto flex items-center justify-between w-full px-5 py-4 rounded-xl bg-slate-800/50 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors"
            >
              <span>Launch 3D Lab</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -8 }}
            className="p-8 rounded-3xl bg-[#090e1a]/80 backdrop-blur-md border border-slate-700/50 hover:border-emerald-500/50 transition-all flex flex-col h-full group shadow-2xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/50 border border-emerald-900 flex items-center justify-center mb-6 shadow-inner">
              <Factory className="w-7 h-7 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 font-display">Integrated Manesar Plant</h3>
            <p className="text-sm text-slate-400 leading-relaxed flex-grow mb-8">
              Located in Sector-7, IMT Manesar. Direct access to North India's premier industrial automotive corridor.
            </p>
            <button 
              onClick={() => onNavigate('infrastructure')}
              className="mt-auto flex items-center justify-between w-full px-5 py-4 rounded-xl bg-slate-800/50 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors"
            >
              <span>Inspect Machinery</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

        </div>

        {/* Bottom CTA Block matching the image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5, type: "spring" }}
          className="relative rounded-[2rem] p-8 md:p-12 bg-gradient-to-br from-[#0a1128]/90 to-[#020617]/90 backdrop-blur-lg border border-cyan-900/40 shadow-[0_0_50px_rgba(34,211,238,0.05)] overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="space-y-5 z-10 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-800 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest shadow-inner"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
              Fast-Track Engineering Estimation
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight"
            >
              Have CAD Files or Specs Ready?
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm md:text-base text-slate-300 leading-relaxed max-w-xl"
            >
              Upload STEP, IGES, STL, or project briefs. Our senior engineering team at IMT Manesar provides comprehensive feasibility and pricing feedback within 4 hours.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto z-10 shrink-0"
          >
            <button 
              onClick={onOpenQuoteModal}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] whitespace-nowrap hover:scale-105 active:scale-95"
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
