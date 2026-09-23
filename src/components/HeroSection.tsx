import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TextReveal } from '../motion/TextReveal';
import { ArrowRight, Compass, Cpu, Layers } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/mkrdData';
import heroImg from '../assets/images/hero_robotic_precision_1787995484245.webp';

interface HeroSectionProps {
  onOpenQuoteModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenQuoteModal }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates from -1 to 1 for subtle parallax
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section id="home" className="relative min-h-[92vh] pt-28 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-between overflow-hidden bg-transparent">
      
      {/* Full Background Machine Image blending into the bottom - WITH PARALLAX */}
      <motion.div 
        className="absolute inset-[-5%] z-0 [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)] opacity-70"
        initial={{ x: 0, y: 0 }}
        animate={{
          x: mousePosition.x * -30, // Opposite movement to mouse
          y: mousePosition.y * -30,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 30 }}
      >
        <img
          src={heroImg}
          alt="MKRD Precision Robotic Engineering"
          className="w-full h-full object-cover filter contrast-125 saturate-110 translate-y-5"
          referrerPolicy="no-referrer"
        />
        {/* Adjusted overlays for higher intensity and clean text alignment */}
        <div className="absolute inset-0 bg-[#06071A]/10 mix-blend-multiply pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06071A] via-[#06071A]/20 to-transparent pointer-events-none" />
      </motion.div>

      {/* Background Blueprint Gradients & Grid (Layered over the image) */}
      <div className="absolute inset-0 bg-grid-tech opacity-20 pointer-events-none z-0" />
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-brand-900/30 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-900/30 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-900/20 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Floating Abstract Shapes for Depth */}
      <motion.div 
        animate={{ y: [-15, 15, -15], rotate: [0, 5, 0] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 right-[20%] w-24 h-24 border border-brand-500/20 rounded-2xl rotate-12 backdrop-blur-sm pointer-events-none z-0"
      />
      <motion.div 
        animate={{ y: [20, -20, 20], x: [-10, 10, -10], rotate: [0, -15, 0] }} 
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-40 left-[15%] w-32 h-32 border border-blue-500/20 rounded-full backdrop-blur-sm pointer-events-none z-0 flex items-center justify-center"
      >
        <div className="w-16 h-16 border border-brand-400/10 rounded-full" />
      </motion.div>

      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mt-6">
        
        {/* Left Column: Typographic & Editorial Messaging */}
        <div className="lg:col-span-7 space-y-7">
          {/* Metadata Marker */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-950/50 border border-blue-800/50 backdrop-blur-md text-xs font-mono font-bold text-brand-400 shadow-md"
          >
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            <span>MKRD INDUSTRIAL CELL</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">{COMPANY_DETAILS.coordinates.lat}, {COMPANY_DETAILS.coordinates.long}</span>
          </motion.div>

          {/* Large Editorial Headline */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-2"
          >
            <div className="text-xs font-mono font-bold text-brand-500 uppercase tracking-widest">
              3D PRINTING &middot; SOFTWARE &middot; WEB &amp; 360&deg;
            </div>
            <TextReveal
              as="h1"
              text={'WHERE PHYSICAL\nPRECISION MEETS\nDIGITAL ARCHITECTURE'}
              split="words"
              highlight={['PRECISION']}
              delay={0.12}
              stagger={0.045}
              className="text-4xl sm:text-5xl lg:text-7xl font-display font-extrabold text-white tracking-tight leading-[1.05]"
            />
          </motion.div>

          {/* Crisp Supporting Narrative */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed font-medium"
          >
            This is MKRD's{' '}
            <strong className="text-white font-bold">3D printing, software and web</strong> side, in
            Gurugram — parts off our own{' '}
            <strong className="text-white font-bold">resin and FDM</strong> machines, desktop and web
            software we ship and licence, and{' '}
            <strong className="text-white font-bold">360° tours</strong> you can walk through. Mould
            and die tooling is our engineering side, and we say so.
          </motion.p>

          {/* CTA Cluster */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-3.5 pt-4"
          >
            <button
              id="hero-btn-quote"
              onClick={onOpenQuoteModal}
              className="px-8 py-4 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(91,77,245,0.4)] hover:shadow-[0_0_30px_rgba(91,77,245,0.6)] active:scale-95 border border-brand-500/50 uppercase tracking-wide"
            >
              <span>Get Engineering Quote</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#interactive-3d-lab"
              className="px-6 py-4 rounded-full bg-slate-900/60 hover:bg-slate-800 backdrop-blur-md border border-slate-700 hover:border-brand-500/50 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-md uppercase tracking-wide"
            >
              <Cpu className="w-4 h-4 text-brand-400" />
              <span>Launch 3D Lab</span>
            </a>
          </motion.div>
        </div>

        {/* Right Column: New CAD & Digital Engineering Spec Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ y: -6, scale: 1.01 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          style={{ willChange: "transform" }}
          className="lg:col-span-4 lg:col-start-9 relative max-w-sm ml-auto w-full"
        >
          <div className="p-8 rounded-[2rem] bg-slate-900/50 backdrop-blur-xl border border-slate-700/60 shadow-[0_0_50px_rgba(91,77,245,0.1)] relative overflow-hidden group">
            
            {/* Animated Scanning Line Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-500/10 to-transparent w-full h-1/2 animate-pulse" style={{ animationDuration: '3s' }} />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-950/50 border border-brand-900 text-brand-400 shadow-inner">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-lg tracking-wide uppercase">The Print Cell</h3>
                    <div className="text-[10px] font-mono text-brand-500 uppercase tracking-widest">What we take, what comes out</div>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              </div>

              <div className="space-y-4 font-mono text-xs text-slate-300">
                <div className="flex justify-between items-center bg-slate-950/50 px-4 py-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500">FORMATS</span>
                  <span className="text-white font-bold">STEP / IGES / STL / SLDPRT</span>
                </div>
                {/* These rows described the engineering side's capabilities on
                    the hero of the printing and software side. They now describe
                    this cell, from the same figures the infrastructure and
                    materials pages are built from. */}
                <div className="flex justify-between items-center bg-slate-950/50 px-4 py-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500">PROCESSES</span>
                  <span className="text-brand-400 font-bold">FDM / RESIN</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/50 px-4 py-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500">MATERIALS</span>
                  <span className="text-white font-bold">PLA+ / ABS / PETG / TPU</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/50 px-4 py-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500">LAYER</span>
                  <span className="text-white font-bold">0.1 MM</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-600 to-blue-500 w-full animate-pulse" />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-2 tracking-widest uppercase">
                  <span>Additive Cell</span>
                  <span className="text-brand-400">245 &times; 245 &times; 270 mm</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Editorial Scroll Cue */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between pt-6 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 relative z-10">
        <div>REG. ADDRESS: <span className="text-slate-400">{COMPANY_DETAILS.address}</span></div>
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-widest">SCROLL TO EXPLORE CINEMATIC SYSTEMS</span>
          <span className="animate-bounce text-brand-400 font-bold text-sm">↓</span>
        </div>
      </div>
    </section>
  );
};
