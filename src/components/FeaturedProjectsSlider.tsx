import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { DepthImage } from '../motion/DepthImage';
import { CASE_STUDIES } from '../data/mkrdData';
import { ExternalLink, Flame } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { GhostWord, MaskedHeading, useSectionScroll } from '../motion/SectionFX';
import { VIEWPORT, DUR, EASE } from '../motion/tokens';

export const FeaturedProjectsSlider: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: progress } = useSectionScroll(sectionRef);
  // We double the projects array so the infinite marquee loops smoothly
  const projects = [...CASE_STUDIES, ...CASE_STUDIES, ...CASE_STUDIES, ...CASE_STUDIES];

  return (
    <div ref={sectionRef} className="relative py-24 bg-[#06071A] overflow-hidden border-t border-slate-800/50">
      <GhostWord text="SHIPPED" progress={progress} strength={14} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 flex flex-col items-center text-center">
        <ScrollReveal delay={0.1}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-950/40 border border-brand-800/40 text-brand-400 text-xs font-mono font-bold backdrop-blur-md mb-6">
            <Flame className="w-3.5 h-3.5" />
            <span>FLAGSHIP DEPLOYMENTS</span>
          </div>
        </ScrollReveal>
        
        <MaskedHeading
          as="h2"
          align="center"
          text="PROVEN IN THE FIELD"
          highlight={['FIELD']}
          className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white tracking-tight uppercase"
        />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: DUR.slow, ease: EASE.out, delay: 0.25 }}
          className="text-slate-400 font-medium mt-4 max-w-2xl text-sm sm:text-base"
        >
          Each of these is running somewhere right now — installed on a client's machines, or live
          at an address you can open in a new tab.
        </motion.p>
      </div>

      <div className="relative w-full overflow-hidden flex group/slider pb-8">
        
        {/* Track - left to right animation */}
        <div className="flex gap-8 px-4 w-max animate-scroll-marquee-reverse hover:pause-animation" style={{ animationDuration: '60s' }}>
          {projects.map((project, index) => (
            <div 
              key={`${project.id}-${index}`} 
              className="relative w-[320px] sm:w-[420px] shrink-0 bg-[#0B0D24] backdrop-blur-3xl rounded-[2rem] border-2 border-slate-800/80 overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-brand-900/30 hover:border-brand-800/80 hover:-translate-y-3 cursor-pointer group/card"
            >
              
              <div className="relative h-[200px] sm:h-[260px] w-full overflow-hidden bg-slate-950 border-b border-slate-800/80">
                <DepthImage
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full"
                  imgClassName="opacity-85 group-hover/card:opacity-100 transition-opacity duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D24] via-transparent to-transparent opacity-100 pointer-events-none" />
                
                <div className="absolute top-5 left-5">
                  <span className="px-3 py-1.5 text-[9px] uppercase tracking-wider font-bold bg-slate-950/90 text-brand-400 border border-brand-500/30 rounded-full backdrop-blur-md shadow-lg">
                    {project.category}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8 flex flex-col h-[160px]">
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white mb-auto leading-tight group-hover/card:text-brand-400 transition-colors duration-300">
                  {project.title}
                </h3>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/60">
                  <div className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase truncate max-w-[200px]">
                    {project.client}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
