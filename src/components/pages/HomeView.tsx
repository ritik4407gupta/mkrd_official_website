import React, { lazy, Suspense } from 'react';
import { HeroSection } from '../HeroSection';
import { ServicesShowcase } from '../ServicesShowcase';
import { FeaturedProjectsSlider } from '../FeaturedProjectsSlider';
import { PartnerLogosMarquee } from '../PartnerLogosMarquee';
import { ParallaxSection } from '../ParallaxSection';
import { ScrollReveal } from '../ScrollReveal';
import { AboutUsSection } from '../AboutUsSection';
import { EngineeredForScaleSection } from '../EngineeredForScaleSection';

interface HomeViewProps {
  onNavigate: (page: string) => void;
  onOpenQuoteModal: () => void;
  showIntroSequence?: boolean;
}

const TextMarquee = () => {
  const words = [
    "SUB-MICRON PRECISION", "AEROSPACE GRADE TOLERANCES", "INDUSTRY 4.0 INTEGRATION", 
    "RAPID PROTOTYPING", "GD&T VERIFIED EXCELLENCE", "SMART MANUFACTURING"
  ];
  return (
    <div className="relative mt-10 py-8 bg-transparent border-y border-cyan-800/20 overflow-hidden">
      <div className="flex w-max animate-scroll-marquee">
        {/* First set of words */}
        <div className="flex items-center text-cyan-400 font-display font-black text-3xl md:text-5xl tracking-widest uppercase">
          {words.map((word, i) => (
            <span key={i} className="mx-8 inline-flex items-center whitespace-nowrap">
              <span className="w-3 h-3 bg-cyan-400 rounded-full mr-8 opacity-60 shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
              {word}
            </span>
          ))}
        </div>
        {/* Duplicate set for seamless looping */}
        <div className="flex items-center text-cyan-400 font-display font-black text-3xl md:text-5xl tracking-widest uppercase" aria-hidden="true">
          {words.map((word, i) => (
            <span key={`dup-${i}`} className="mx-8 inline-flex items-center whitespace-nowrap">
              <span className="w-3 h-3 bg-cyan-400 rounded-full mr-8 opacity-60 shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenQuoteModal }) => {
  return (
    <>
      {/* 1. Main 3D Hero Environment */}
      <HeroSection onOpenQuoteModal={onOpenQuoteModal} />

      <div className="relative z-20 bg-slate-950 overflow-hidden">
        
        {/* Text Marquee Divider - Smooth sliding right to left, big text */}
        <ScrollReveal direction="up" blur={false}>
          <TextMarquee />
        </ScrollReveal>

        {/* NEW: Animated Parallax About Us Section */}
        <ScrollReveal direction="up">
          <AboutUsSection />
        </ScrollReveal>

        {/* Left-to-Right Flagship Projects Slider */}
        <ScrollReveal direction="up" delay={0.2}>
          <FeaturedProjectsSlider />
        </ScrollReveal>

        {/* Stacked Services Showcase with Animations */}
        <div className="relative z-20 bg-[#020617] py-8">
          <ScrollReveal direction="up">
            <ServicesShowcase onNavigate={onNavigate} />
          </ScrollReveal>
        </div>

        {/* Scroll-Triggered Parallax Interstitial */}
        <ScrollReveal direction="up">
          <ParallaxSection />
        </ScrollReveal>

        {/* NEW: Engineered For Scale Section */}
        <ScrollReveal direction="up">
          <EngineeredForScaleSection onNavigate={onNavigate} onOpenQuoteModal={onOpenQuoteModal} />
        </ScrollReveal>

        {/* Trusted By Industry Leaders - Moved to bottom above footer */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="py-24">
            <PartnerLogosMarquee />
          </div>
        </ScrollReveal>
      </div>
    </>
  );
};

export default HomeView;
