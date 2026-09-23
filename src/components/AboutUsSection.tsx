import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Layers, Zap } from 'lucide-react';
import { MaskedHeading, StatStrip, ScanBeam, DrawRule } from '../motion/SectionFX';
import { VIEWPORT, DUR, EASE } from '../motion/tokens';
import { SERVICES } from '../data/mkrdData';

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
    <section ref={containerRef} className="relative py-32 lg:py-48 overflow-hidden bg-[#06071A] border-y border-slate-800/50">

      {/* 1. Deepest Background Layer: Parallax Grid & Glows */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e9_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-brand-900/20 blur-[120px] rounded-full" />
      </motion.div>

      {/* 2. Giant Typography Parallax Layer */}
      <motion.div
        style={{ x: giantTextX }}
        className="absolute top-1/2 -translate-y-1/2 left-0 right-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden"
      >
        <div aria-hidden className="text-[12rem] lg:text-[16rem] font-display font-black text-white/[0.05] whitespace-nowrap tracking-tighter select-none">
          MKRD INDUSTRIES
        </div>
      </motion.div>

      {/* 3. Main Content Layer */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered ABOUT US Header */}
        {/* The heading used to animate `filter: blur()`, which re-rasterises the
            whole subtree every frame — expensive, and on the one scroll where a
            visitor is forming an impression. It rises out of a mask instead. */}
        <div className="text-center mb-20">
          <h2
            className="text-5xl md:text-7xl lg:text-[7rem] font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-brand-100 to-brand-500 uppercase tracking-[0.1em]"
          >
            ABOUT US
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={VIEWPORT}
            transition={{ duration: DUR.cinematic, ease: EASE.out, delay: 0.3 }}
            className="w-40 h-px mx-auto mt-6 bg-gradient-to-r from-transparent via-brand-500 to-transparent"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left: Animated Text Content */}
          <div className="space-y-8">


            <MaskedHeading
              as="h3"
              text={'WE SHIP THE\nWORKING THING.'}
              highlight={['WORKING', 'THING.']}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white leading-[1.1] tracking-tight"
            />

            <p className="text-lg text-slate-400 leading-relaxed font-light max-w-xl">
              Everything on this site is a thing that exists. The billing software is licensed and
              running on customers' machines. The sites and 360° tours are live at addresses you can
              open. The parts come off our own printers, in resin or FDM, in whatever grade the job
              needs. Mould, die and fixture design is the other half of MKRD, at mkrdengineers.com —
              we name it rather than borrow it.
            </p>

            <DrawRule className="mt-8" delay={0.2} />

            {/* The service count is read from the data rather than typed here —
                it said eight while the site listed seven. */}
            <StatStrip
              className="pt-6"
              items={[
                { value: 2018, label: 'Established', count: false },
                { value: SERVICES.length, label: 'Services offered' },
                { value: 0.1, decimals: 1, suffix: 'mm', label: 'Layer resolution' },
              ]}
            />
          </div>

          {/* Right: Floating Parallax Feature Cards */}
          <motion.div style={{ y: statsY }} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="relative overflow-hidden p-8 rounded-3xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl shadow-2xl hover:border-brand-500/50 transition-colors group">
              <ScanBeam delay={0.4} />
              <Layers className="w-10 h-10 text-brand-400 mb-6 group-hover:scale-110 transition-transform duration-500" />
              <h4 className="text-xl font-bold text-white mb-3">Open It, Do Not Watch It</h4>
              <p className="text-sm text-slate-400 leading-relaxed">The software on the simulation page is the real application, not a video of one. Change a buyer, edit a quantity, and the tax columns recompute.</p>
            </div>

            <div className="relative overflow-hidden p-8 rounded-3xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl shadow-2xl hover:border-blue-500/50 transition-colors group sm:translate-y-16">
              <ScanBeam tone="blue" delay={0.6} />
              <Zap className="w-10 h-10 text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-500" />
              <h4 className="text-xl font-bold text-white mb-3">Printed In-House</h4>
              <p className="text-sm text-slate-400 leading-relaxed">Resin and FDM on site, material grade chosen against your part, so a fit-check piece does not sit in a queue at an outside vendor.</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
