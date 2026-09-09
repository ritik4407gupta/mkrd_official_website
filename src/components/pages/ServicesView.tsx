import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from 'motion/react';
import {
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Zap,
  Box,
  Compass,
  FileCheck,
  Hammer,
  RotateCw,
  Crosshair,
  ScanLine
} from 'lucide-react';
import { SERVICES, MATERIALS_DB } from '../../data/mkrdData';
import { ServiceItem } from '../../types';
import { ParallaxTiltCard } from '../ParallaxTiltCard';

interface ServicesViewProps {
  onOpenQuoteModal: (serviceId?: string) => void;
}

// Custom True-3D Holographic Card Component for the Active Service
const HologramCard = ({ service, onOpenQuoteModal }: { service: ServiceItem, onOpenQuoteModal: (id: string) => void }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 200, damping: 40 });
  const mouseYSpring = useSpring(y, { stiffness: 200, damping: 40 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);
  
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["100%", "0%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["100%", "0%"]);
  const backgroundPosition = useMotionTemplate`${glareX} ${glareY}`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };
  
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <div className="relative w-full min-h-[600px] flex items-center justify-center p-4 sm:p-12 perspective-[2000px] z-10">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full max-w-6xl rounded-3xl border border-cyan-900/50 bg-[#060e22]/90 shadow-[0_30px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(34,211,238,0.1)] group flex flex-col lg:flex-row overflow-hidden"
      >
        {/* Holographic Glare Effect */}
        <motion.div 
          className="absolute inset-0 pointer-events-none z-50 mix-blend-soft-light opacity-50"
          style={{
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 60%)',
            backgroundPosition,
            backgroundSize: '250% 250%',
          }}
        />

        {/* Dynamic Scan Line */}
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,1)] z-40 animate-[scan_3s_ease-in-out_infinite_alternate]" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(1px)' }} />

        {/* LEFT SIDE: Command Center Text Layer */}
        <div 
          className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center space-y-8 z-30"
          style={{ transformStyle: "preserve-3d", transform: "translateZ(80px)" }}
        >
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2"
            >
              <Crosshair className="w-4 h-4 text-cyan-400 animate-spin-slow" />
              <span className="text-cyan-400 text-xs font-mono font-bold uppercase tracking-[0.3em] drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                {service.category} DIVISION
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight uppercase"
            >
              {service.title}
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="text-slate-400 text-base leading-relaxed"
            >
              {service.fullDesc}
            </motion.p>
          </div>

          {/* Tech Stack Matrix */}
          <div className="grid grid-cols-2 gap-2" style={{ transformStyle: "preserve-3d", transform: "translateZ(30px)" }}>
            {service.techStack.map((tech, tIdx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + (tIdx * 0.05) }}
                key={tIdx}
                className="flex items-center gap-2 p-2 rounded bg-cyan-950/20 border border-cyan-900/40 text-cyan-200 font-mono text-xs shadow-[inset_0_0_10px_rgba(34,211,238,0.05)]"
              >
                <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                {tech}
              </motion.div>
            ))}
          </div>

          {/* Holographic Stats Strip */}
          <div className="flex gap-6 border-t border-cyan-900/40 pt-6" style={{ transformStyle: "preserve-3d", transform: "translateZ(50px)" }}>
            {service.stats.map((st, sIdx) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + (sIdx * 0.1) }} key={sIdx} className="space-y-1">
                <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">{st.label}</div>
                <div className="text-xl font-display font-bold text-cyan-400">{st.value}</div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} style={{ transformStyle: "preserve-3d", transform: "translateZ(60px)" }}>
            <button
              onClick={() => onOpenQuoteModal(service.id)}
              className="group relative px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold text-sm tracking-wider uppercase border border-cyan-500/50 hover:border-cyan-400 transition-all overflow-hidden rounded-md flex items-center gap-2"
            >
              <ScanLine className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Initialize Quotation</span>
              <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -translate-x-[100%] group-hover:translate-x-[50%] transition-transform duration-1000 ease-in-out" />
            </button>
          </motion.div>
        </div>

        {/* RIGHT SIDE: 3D Image Projection */}
        <div 
          className="w-full lg:w-1/2 relative min-h-[300px] lg:min-h-full overflow-hidden"
        >
          {/* Edge Blending Mask */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#060e22]/90 via-[#060e22]/50 to-transparent z-10 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060e22]/90 via-[#060e22]/50 to-transparent z-10 lg:hidden" />
          
          <motion.div 
            className="absolute inset-0 w-full h-full"
            style={{ transformStyle: "preserve-3d", transform: "translateZ(-40px) scale(1.1)" }}
          >
            <img 
              src={service.image} 
              alt={service.title} 
              className="w-full h-full object-cover opacity-60 mix-blend-luminosity filter contrast-125 group-hover:mix-blend-normal group-hover:opacity-90 transition-all duration-700"
            />
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 pointer-events-none" />
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
};

export const ServicesView: React.FC<ServicesViewProps> = ({ onOpenQuoteModal }) => {
  const [activeTab, setActiveTab] = useState<string>(SERVICES[0].id);
  const activeService = SERVICES.find(s => s.id === activeTab) || SERVICES[0];

  const pipelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: pipelineRef, offset: ["start center", "end center"] });
  const pathLength = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div className="pb-16 bg-[#020617] min-h-[100vh] text-slate-300 pt-8 overflow-hidden relative">
      
      {/* Cinematic Grid Background */}
      <div className="absolute top-0 left-0 right-0 h-[100vh] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_100%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40 z-0" style={{ transform: "translateZ(0)", willChange: "transform" }} />

      {/* Header Panel */}
      <section className="relative z-10 pt-16 pb-8 text-center px-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/40 border border-cyan-800/50 rounded-full mb-6">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-cyan-400 tracking-widest">INDUSTRIAL & DIGITAL SYNERGY</span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-display font-black text-white tracking-tight uppercase drop-shadow-lg">
          Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-400">Modules</span>
        </motion.h1>

        {/* Sci-Fi Tab Navigation */}
        <div className="flex flex-wrap justify-center items-center gap-3 pt-12 max-w-5xl mx-auto">
          {SERVICES.map((s, i) => {
            const isActive = activeTab === s.id;
            return (
              <motion.button
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (i * 0.05) }}
                key={s.id}
                onClick={() => setActiveTab(s.id)}
                className={`relative px-6 py-3 rounded-lg text-xs md:text-sm font-mono font-bold uppercase tracking-wider transition-all duration-300 overflow-hidden group ${
                  isActive ? 'text-white' : 'text-slate-500 hover:text-cyan-200'
                }`}
              >
                <div className={`absolute inset-0 transition-opacity duration-300 ${isActive ? 'bg-cyan-900/30 opacity-100' : 'bg-transparent opacity-0 group-hover:bg-slate-800/50 group-hover:opacity-100'}`} />
                {isActive && (
                  <motion.div layoutId="activeTabBorder" className="absolute inset-0 border border-cyan-400 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.5)]" initial={false} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {isActive && <div className="w-1.5 h-1.5 rounded-sm bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]" />}
                  {s.title}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ACTIVE SERVICE HOLOGRAM PANEL */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeService.id}
          initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
          exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <HologramCard service={activeService} onOpenQuoteModal={onOpenQuoteModal} />
        </motion.div>
      </AnimatePresence>

      {/* CYBER PIPELINE (Execution Steps) */}
      <section ref={pipelineRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-display font-black text-white uppercase tracking-widest">Standardized Execution Pipeline</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto mt-4" />
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Glowing Connecting Line SVG (Visible on MD+) */}
          <div className="absolute top-[32px] left-[10%] right-[10%] h-1 -translate-y-1/2 hidden md:block z-0">
            <svg width="100%" height="4" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="2" x2="100%" y2="2" stroke="rgba(34,211,238,0.2)" strokeWidth="4" strokeDasharray="8 8" />
              <motion.line 
                x1="0" y1="2" x2="100%" y2="2" 
                stroke="#22d3ee" strokeWidth="4" 
                style={{ pathLength }}
                className="drop-shadow-[0_0_10px_rgba(34,211,238,1)]"
              />
            </svg>
          </div>

          {activeService.process.map((step, idx) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-2xl font-black text-slate-500 group-hover:border-cyan-400 group-hover:text-cyan-400 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all duration-500 mb-6 relative">
                {step.step}
                <div className="absolute inset-0 rounded-full border border-cyan-400 scale-150 opacity-0 group-hover:scale-110 group-hover:opacity-50 transition-all duration-700" />
              </div>
              <h4 className="font-display font-bold text-lg text-white mb-2">{step.label}</h4>
              <p className="text-sm text-slate-400 leading-relaxed px-4">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MATERIALS DATABASE (Sci-Fi Cards) */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-6">
          <div>
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2 mb-2">
              <Box className="w-4 h-4" /> ENGINEERING SUBSTRATES
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white uppercase tracking-tight">
              Materials Library
            </h2>
          </div>
          <p className="text-sm text-slate-400 max-w-sm text-left md:text-right">
            Certified polymers, tool steels, and aerospace composites actively stocked in the Manesar facility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MATERIALS_DB.map((mat) => (
            <ParallaxTiltCard
              key={mat.id}
              maxTilt={10}
              glowColor="rgba(34, 211, 238, 0.2)"
              className="p-6 rounded-2xl bg-[#060e22] border border-cyan-900/30 shadow-lg flex flex-col justify-between group overflow-hidden"
            >
              {/* Laser Sweep Effect */}
              <div className="absolute top-0 bottom-0 left-0 w-[200%] bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent -translate-x-[100%] group-hover:translate-x-[50%] transition-transform duration-[1.5s] ease-in-out pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                    {mat.category}
                  </span>
                  <span className="text-[10px] px-2 py-1 bg-cyan-950/30 text-cyan-300 font-mono font-bold rounded">
                    {mat.costTier}
                  </span>
                </div>

                <div className="mt-6 mb-6">
                  <h3 className="font-display font-bold text-xl text-white">{mat.name}</h3>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">{mat.description}</p>
                </div>
              </div>

              {/* Animated Progress Bars for Stats */}
              <div className="relative z-10 space-y-4 pt-6 border-t border-slate-800">
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider">
                    <span className="text-slate-500">TENSILE STRENGTH</span>
                    <span className="font-bold text-white">{mat.tensileStrength}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} whileInView={{ width: '85%' }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-cyan-500/80 shadow-[0_0_10px_rgba(34,211,238,0.5)] rounded-full" 
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider">
                    <span className="text-slate-500">HEAT DEFLECTION</span>
                    <span className="font-bold text-blue-400">{mat.heatDeflection}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} whileInView={{ width: '65%' }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.4 }}
                      className="h-full bg-blue-500/80 shadow-[0_0_10px_rgba(59,130,246,0.5)] rounded-full" 
                    />
                  </div>
                </div>
              </div>
            </ParallaxTiltCard>
          ))}
        </div>
      </section>
    </div>
  );
};
