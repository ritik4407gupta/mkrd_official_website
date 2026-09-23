import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { SERVICES } from '../data/mkrdData';
import { ScrollReveal } from './ScrollReveal';
import { MaskedHeading, StatStrip, DrawRule } from '../motion/SectionFX';
import { VIEWPORT, DUR, EASE } from '../motion/tokens';

interface ServicesShowcaseProps {
  onNavigate: (pageId: string) => void;
}

const COLORS = [
  { bg: 'bg-gradient-to-br from-brand-500 to-brand-800', border: 'border-brand-400', text: 'text-brand-400', desc: 'text-brand-100', num: 'text-brand-950/60', shadow: 'shadow-brand-900/50' },
  { bg: 'bg-gradient-to-br from-blue-500 to-blue-800', border: 'border-blue-400', text: 'text-blue-400', desc: 'text-blue-100', num: 'text-blue-950/60', shadow: 'shadow-blue-900/50' },
  { bg: 'bg-gradient-to-br from-brand-500 to-brand-800', border: 'border-brand-400', text: 'text-brand-400', desc: 'text-brand-100', num: 'text-brand-950/60', shadow: 'shadow-brand-900/50' },
  { bg: 'bg-gradient-to-br from-emerald-500 to-emerald-800', border: 'border-emerald-400', text: 'text-emerald-400', desc: 'text-emerald-100', num: 'text-emerald-950/60', shadow: 'shadow-emerald-900/50' },
  { bg: 'bg-gradient-to-br from-accent to-brand-800', border: 'border-accent', text: 'text-accent', desc: 'text-brand-100', num: 'text-brand-950/60', shadow: 'shadow-brand-900/50' },
  { bg: 'bg-gradient-to-br from-brand-500 to-brand-800', border: 'border-brand-400', text: 'text-brand-400', desc: 'text-brand-100', num: 'text-brand-950/60', shadow: 'shadow-brand-900/50' },
];

export const ServicesShowcase: React.FC<ServicesShowcaseProps> = ({ onNavigate }) => {
  const [isSliderHovered, setIsSliderHovered] = useState(false);

  return (
    <section className="relative py-24 sm:py-32 bg-transparent">
      {/* Cinematic Top Fade */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#06071A] to-transparent z-10 pointer-events-none" />

      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mb-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          <ScrollReveal delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-950/50 border border-brand-800/50 text-brand-400 text-xs font-mono font-bold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CORE CAPABILITIES</span>
            </div>
          </ScrollReveal>

          <MaskedHeading
            as="h2"
            text="INDUSTRIAL SYSTEMS"
            highlight={['SYSTEMS']}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-white tracking-tight uppercase"
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: DUR.slow, ease: EASE.out, delay: 0.25 }}
            className="text-slate-400 text-sm sm:text-base max-w-xl font-medium"
          >
            What we take on, and which half of the group runs it. Drag the row or let it carry on
            by itself.
          </motion.p>
        </div>

        <div className="shrink-0">
          <StatStrip
            items={[
              { value: SERVICES.length, label: 'Services' },
              { value: 2, label: 'Print processes' },
            ]}
          />
          <DrawRule className="mt-6 w-48" delay={0.3} />
        </div>
      </div>

      {/* Infinite Horizontal Scrolling 3D Gallery */}
      <div
        className="relative w-full mt-16 sm:mt-24 pb-24 overflow-hidden flex flex-col justify-center group/slider"
        onPointerEnter={() => setIsSliderHovered(true)}
        onPointerLeave={() => setIsSliderHovered(false)}
      >

        {/* Deep edge masks to create depth-of-field entrance/exit */}
        <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-64 bg-gradient-to-r from-[#06071A] via-[#06071A]/80 to-transparent z-30 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-64 bg-gradient-to-l from-[#06071A] via-[#06071A]/80 to-transparent z-30 pointer-events-none" />

        <div
          className="flex gap-8 sm:gap-12 w-max animate-scroll-marquee px-16 items-center"
          style={{ animationDuration: '60s', animationPlayState: isSliderHovered ? 'paused' : 'running' }}
        >
          {[...SERVICES, ...SERVICES, ...SERVICES].map((service, index) => {
            const actualIndex = index % SERVICES.length;
            const color = COLORS[actualIndex % COLORS.length];

            return (
              <div
                key={`${service.id}-${index}`}
                className="relative group cursor-pointer shrink-0"
                onClick={() => onNavigate('services')}
                style={{ perspective: '2000px' }}
              >
                {/* 3D Premium Gallery Card (Image + Text only) */}
                <div
                  className={`w-[320px] sm:w-[450px] lg:w-[550px] bg-[#06071A] border border-slate-700/80 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${color.shadow} relative z-10 transition-all duration-700 ease-out group-hover:-translate-y-8 group-hover:rotate-y-[-5deg] group-hover:rotate-x-[5deg] group-hover:scale-[1.02] group-hover:shadow-[0_40px_100px_rgba(0,0,0,0.8)] group-hover:border-slate-400/50`}
                  style={{ transformStyle: 'preserve-3d' }}
                >

                  {/* Image Window */}
                  <div className="relative h-[400px] sm:h-[500px] w-full bg-slate-950 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover object-left opacity-70 group-hover:scale-[1.04] group-hover:opacity-100 transition-all duration-1000 ease-out"
                      referrerPolicy="no-referrer"
                    />
                    {/* Deep Cinematic Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#06071A] via-[#06071A]/40 to-transparent transition-opacity duration-700 group-hover:opacity-70" />

                    {/* Content (Title & Badge) absolutely anchored to bottom */}
                    <div className="absolute bottom-0 left-0 w-full p-8 sm:p-12 transition-transform duration-700 group-hover:-translate-y-4">
                      <div className="mb-5">
                        <span className={`px-5 py-2 rounded-full text-[11px] font-mono font-bold tracking-widest border ${color.border} text-white bg-slate-950/80 backdrop-blur-md uppercase shadow-lg`}>
                          {service.category}
                        </span>
                      </div>
                      <h3 className="text-3xl sm:text-5xl font-display font-black text-white leading-tight drop-shadow-2xl">
                        {service.title}
                      </h3>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
