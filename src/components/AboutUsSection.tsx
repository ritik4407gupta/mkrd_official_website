import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Target, Shield, Zap } from 'lucide-react';

export const AboutUsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax values for different layers to create depth
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const giantTextX = useTransform(scrollYProgress, [0, 1], ["-10%", "5%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["20%", "-10%"]);
  const statsY = useTransform(scrollYProgress, [0, 1], ["30%", "-20%"]);

  return (
    <section ref={containerRef} className="relative py-32 lg:py-48 overflow-hidden bg-[#020617] border-y border-slate-800/50">

      {/* 1. Deepest Background Layer: Parallax Grid & Glows */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e9_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-900/20 blur-[120px] rounded-full" />
      </motion.div>

      {/* 2. Giant Typography Parallax Layer */}
      <motion.div
        style={{ x: giantTextX }}
        className="absolute top-1/2 -translate-y-1/2 left-0 right-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden"
      >
        <h2 className="text-[12rem] lg:text-[16rem] font-display font-black text-white/[0.05] whitespace-nowrap tracking-tighter select-none">
          MKRD INDUSTRIES
        </h2>
      </motion.div>

      {/* 3. Main Content Layer */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered ABOUT US Header */}
        <motion.div
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl lg:text-[7rem] font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-orange-100 to-orange-500 uppercase tracking-[0.1em] drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]">
            ABOUT US
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left: Animated Text Content */}
          <motion.div style={{ y: textY }} className="space-y-8">


            <h3 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white leading-[1.1] tracking-tight">
              ENGINEERING THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                IMPOSSIBLE.
              </span>
            </h3>

            <p className="text-lg text-slate-400 leading-relaxed font-light max-w-xl">
              We don't just manufacture parts; we engineer solutions that push the boundaries of modern physics. Combining Industry 4.0 robotics with generational human expertise, MKRD delivers sub-micron precision for the world's most demanding aerospace, medical, and defense applications.
            </p>

            <div className="flex items-center gap-6 pt-6">
              <div className="space-y-1">
                <div className="text-4xl font-display font-black text-white">25<span className="text-cyan-500">+</span></div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Years Exp.</div>
              </div>
              <div className="w-px h-12 bg-slate-800" />
              <div className="space-y-1">
                <div className="text-4xl font-display font-black text-white">1<span className="text-cyan-500">µm</span></div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Tolerance</div>
              </div>
              <div className="w-px h-12 bg-slate-800" />
              <div className="space-y-1">
                <div className="text-4xl font-display font-black text-white">100<span className="text-cyan-500">%</span></div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Inspection</div>
              </div>
            </div>
          </motion.div>

          {/* Right: Floating Parallax Feature Cards */}
          <motion.div style={{ y: statsY }} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl shadow-2xl hover:border-cyan-500/50 transition-colors group">
              <Shield className="w-10 h-10 text-cyan-400 mb-6 group-hover:scale-110 transition-transform duration-500" />
              <h4 className="text-xl font-bold text-white mb-3">Defense Grade</h4>
              <p className="text-sm text-slate-400 leading-relaxed">Certified for critical national security and defense infrastructure manufacturing.</p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl shadow-2xl hover:border-blue-500/50 transition-colors group sm:translate-y-16">
              <Zap className="w-10 h-10 text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-500" />
              <h4 className="text-xl font-bold text-white mb-3">Rapid Scale</h4>
              <p className="text-sm text-slate-400 leading-relaxed">From digital prototype to high-volume production in unmatched turnaround times.</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
