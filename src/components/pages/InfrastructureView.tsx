import React from 'react';
import { motion } from 'motion/react';
import {
  Factory,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Zap,
  Activity,
  ArrowRight
} from 'lucide-react';
import { MACHINERY_SPECS, COMPANY_DETAILS } from '../../data/mkrdData';
import { ParallaxTiltCard } from '../ParallaxTiltCard';

interface InfrastructureViewProps {
  onOpenQuoteModal: () => void;
}

export const InfrastructureView: React.FC<InfrastructureViewProps> = ({ onOpenQuoteModal }) => {
  return (
    <div className="space-y-16 pb-16 bg-[#020617] min-h-[100vh] text-slate-300 pt-0">


      {/* Header Banner */}
      <section className="relative -mt-24 overflow-hidden bg-[#020617] pt-48 pb-16 border-b border-slate-700/50 flex flex-col items-center justify-center min-h-[45vh] sm:-mt-28 sm:pt-56">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src="/particles/machinery_cnc_1788702694039.jpg" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/70 to-transparent" />
        </div>

        {/* Animated Glow Behind Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-900/40 blur-[100px] rounded-full pointer-events-none z-0"
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10 flex flex-col items-center text-center mt-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 px-4 py-2 rounded-full bg-cyan-950/40 border border-cyan-800/50 backdrop-blur-sm">
            <Factory className="w-4 h-4 text-cyan-400" />
            <span>MANUFACTURING INFRASTRUCTURE • IMT MANESAR</span>
          </div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.7, delay: 0.2 }} className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white tracking-tight leading-tight">
            PLANT & MACHINERY<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-400 drop-shadow-lg">INFRASTRUCTURE</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.7, delay: 0.4 }} className="text-lg text-slate-300 max-w-3xl leading-relaxed font-medium">
            State-of-the-art 5-axis high-speed CNC milling, wire electrical discharge machining (EDM), industrial 3D additive cells, and Zeiss 3D CMM metrology inspection.
          </motion.p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2 bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-800/30">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              <span>STATUS: <strong>OPERATIONAL (2 SHIFTS)</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-blue-950/30 px-3 py-1.5 rounded-full border border-blue-800/30">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>QUALITY: <strong>ISO 9001:2015</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Machinery Catalog Grid with Parallax 3D Tilt */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {MACHINERY_SPECS.map((machine) => (
            <ParallaxTiltCard
              key={machine.id}
              maxTilt={8}
              glowColor="rgba(34, 211, 238, 0.4)"
              className="relative group rounded-3xl flex flex-col justify-between overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(34,211,238,0.25)] hover:-translate-y-2 infra-card"
            >
              {/* --- CONTINUOUS LIGHTNING / GLOWING BORDER --- */}
              <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl pointer-events-none">
                <div className="absolute -inset-[150%] bg-[conic-gradient(from_0deg,transparent_0_320deg,#22d3ee_360deg)] animate-[spin_3s_linear_infinite]" />
                <div className="absolute -inset-[150%] bg-[conic-gradient(from_180deg,transparent_0_320deg,#0ea5e9_360deg)] animate-[spin_3s_linear_infinite]" />
                {/* Inner background blocking the core of the conic gradient */}
                <div className="absolute inset-[1.5px] rounded-[calc(1.5rem-1.5px)] bg-slate-950/95 backdrop-blur-xl group-hover:bg-slate-900/95 transition-colors duration-500" />
              </div>

              {/* --- CONTINUOUS SCANLINE EFFECT --- */}
              <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl pointer-events-none opacity-40 mix-blend-screen group-hover:opacity-70 transition-opacity duration-500">
                <div className="w-full h-[25%] bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-scanline" />
              </div>

              {/* Tech Grid Background (Fades in on hover) */}
              <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-grid-tech pointer-events-none" />

              {/* Dynamic Glow Overlay on Hover */}
              <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-600/10 pointer-events-none" />

              <div className="space-y-6 relative z-10 p-6 sm:p-8 h-full flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 text-xs font-mono font-bold uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                      {machine.type}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-4 group-hover:text-cyan-300 transition-colors duration-300 drop-shadow-md">
                      {machine.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/80 text-[11px] font-mono font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />
                    <span>{machine.status}</span>
                  </div>
                </div>

                {/* Technical Specifications Grid */}
                <div className="grid grid-cols-2 gap-4 font-mono text-xs mt-auto">
                  <div className="p-4 rounded-2xl bg-[#020617]/60 border border-slate-700/60 group-hover:border-cyan-500/50 group-hover:bg-cyan-950/30 transition-all duration-300 relative overflow-hidden group/spec shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent opacity-0 group-hover/spec:opacity-100 transition-opacity" />
                    <div className="text-slate-400 text-[10px] uppercase font-semibold relative z-10">WORK ENVELOPE</div>
                    <div className="text-cyan-300 font-bold mt-1 text-sm relative z-10">{machine.workEnvelope}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#020617]/60 border border-slate-700/60 group-hover:border-cyan-500/50 group-hover:bg-cyan-950/30 transition-all duration-300 relative overflow-hidden group/spec shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent opacity-0 group-hover/spec:opacity-100 transition-opacity" />
                    <div className="text-slate-400 text-[10px] uppercase font-semibold relative z-10">MACHINING TOLERANCE</div>
                    <div className="text-cyan-300 font-bold mt-1 text-sm relative z-10">{machine.tolerance}</div>
                  </div>
                </div>

                {/* Highlight Capabilities */}
                <div className="space-y-3 pt-5 border-t border-slate-700/60 relative">
                  <div className="absolute top-0 left-0 w-1/4 h-[1px] bg-gradient-to-r from-cyan-500 to-transparent group-hover:w-full transition-all duration-700" />
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider group-hover:text-cyan-400/70 transition-colors">
                    PRIMARY OPERATIONAL CAPABILITY
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-200 font-medium bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/30 group-hover:border-cyan-500/30 group-hover:bg-slate-800/60 transition-all duration-300">
                    <div className="p-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/50 shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="group-hover:text-white transition-colors">{machine.keyCapability}</span>
                  </div>
                </div>
              </div>
            </ParallaxTiltCard>
          ))}
        </div>
      </section>

      {/* Quality Assurance & Metrology Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative p-8 sm:p-12 rounded-[2.5rem] bg-[#020617]/80 backdrop-blur-xl border border-slate-700/50 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden group/banner card-glass-interactive"
        >
          {/* Animated Tech Grid Background */}
          <div className="absolute inset-0 z-0 bg-grid-tech opacity-10 pointer-events-none group-hover/banner:opacity-20 transition-opacity duration-700" />

          {/* Ambient Corner Glows */}
          <div className="absolute -right-32 -top-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] group-hover/banner:bg-cyan-500/20 transition-all duration-1000 pointer-events-none" />
          <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] group-hover/banner:bg-blue-500/20 transition-all duration-1000 pointer-events-none" />

          {/* Continuous Scanline in Banner */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20 group-hover/banner:opacity-40 transition-opacity duration-700 mix-blend-screen">
            <div className="w-full h-[30%] bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-scanline" />
          </div>

          <div className="space-y-5 max-w-3xl relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-800/50 text-cyan-300 text-xs font-mono font-bold shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="tracking-widest">METROLOGY & CALIBRATION</span>
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight"
            >
              Zeiss 3D CMM & First-Article <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Metrology Reports</span>
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-base sm:text-lg text-slate-300 leading-relaxed font-medium"
            >
              Every prototype, mould insert, and machined component is inspected in a temperature-controlled metrology lab with micron-level traceable reports provided with every shipment.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="shrink-0 relative z-10"
          >
            <button
              onClick={onOpenQuoteModal}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm tracking-wide shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_50px_rgba(34,211,238,0.5)] hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center gap-3 overflow-hidden group/btn"
            >
              {/* Button Inner Shine Animation */}
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] translate-x-[-150%] group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none" />
              <span className="relative z-10">Request Quality Specifications</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

