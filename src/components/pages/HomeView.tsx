import React from 'react';
import { HeroSection } from '../HeroSection';
import { ServicesShowcase } from '../ServicesShowcase';
import { FeaturedProjectsSlider } from '../FeaturedProjectsSlider';
import { ScrollReveal } from '../ScrollReveal';
import { AboutUsSection } from '../AboutUsSection';
import { EngineeredForScaleSection } from '../EngineeredForScaleSection';

interface HomeViewProps {
  onNavigate: (page: string) => void;
  onOpenQuoteModal: () => void;
  showIntroSequence?: boolean;
}

/**
 * The ticker under the hero.
 *
 * It used to read as a list of the engineering side's work — moulds, dies,
 * sheet-metal tooling, fixtures, flow analysis — which is the one thing this
 * site is not about. It now names what runs in this unit, with the tooling
 * practice mentioned once at the end where it belongs, and the ends of the
 * strip fade out so the words arrive and leave rather than being clipped.
 */
const TextMarquee = () => {
  const words = [
    "3D PRINTING", "RESIN & FDM", "CUSTOM SOFTWARE", "GST BILLING SUITE",
    "WAREHOUSE MANAGER", "WEB ENGINEERING", "360° VIRTUAL TOURS",
    "RAPID PROTOTYPING", "MOULD & TOOLING — ENGINEERING SIDE"
  ];
  return (
    <div className="relative mt-10 py-8 bg-transparent border-y border-brand-800/20 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_9%,#000_91%,transparent)]">
      <div className="flex w-max animate-scroll-marquee">
        {/* First set of words */}
        <div className="flex items-center text-brand-400 font-display font-black text-3xl md:text-5xl tracking-widest uppercase">
          {words.map((word, i) => (
            <span key={i} className="mx-8 inline-flex items-center whitespace-nowrap">
              <span className="w-3 h-3 bg-brand-400 rounded-full mr-8 opacity-60 shadow-[0_0_15px_rgba(139,125,255,0.5)]" />
              {word}
            </span>
          ))}
        </div>
        {/* Duplicate set for seamless looping */}
        <div className="flex items-center text-brand-400 font-display font-black text-3xl md:text-5xl tracking-widest uppercase" aria-hidden="true">
          {words.map((word, i) => (
            <span key={`dup-${i}`} className="mx-8 inline-flex items-center whitespace-nowrap">
              <span className="w-3 h-3 bg-brand-400 rounded-full mr-8 opacity-60 shadow-[0_0_15px_rgba(139,125,255,0.5)]" />
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
        <AboutUsSection />

        {/* Left-to-Right Flagship Projects Slider */}
        <ScrollReveal direction="up" delay={0.2}>
          <FeaturedProjectsSlider />
        </ScrollReveal>

        {/* Stacked Services Showcase with Animations */}
        <div className="relative z-20 bg-[#06071A] py-8">
          <ScrollReveal direction="up">
            <ServicesShowcase onNavigate={onNavigate} />
          </ScrollReveal>
        </div>

        {/* NEW: Engineered For Scale Section */}
        <ScrollReveal direction="up">
          <EngineeredForScaleSection onNavigate={onNavigate} onOpenQuoteModal={onOpenQuoteModal} />
        </ScrollReveal>
      </div>
    </>
  );
};

export default HomeView;
