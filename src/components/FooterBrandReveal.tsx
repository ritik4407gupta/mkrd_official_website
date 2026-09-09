import React from 'react';
import { COMPANY_DETAILS } from '../data/mkrdData';
import { MkrdLogo } from './MkrdLogo';
import { ArrowUp, Phone, Mail, MapPin, Box, Factory, Cpu, Layers, GitBranch, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface FooterBrandRevealProps {
  onNavigate: (page: string) => void;
  onOpenQuoteModal: () => void;
  onReplayIntro: () => void;
}

export const FooterBrandReveal: React.FC<FooterBrandRevealProps> = ({
  onNavigate,
  onOpenQuoteModal,
  onReplayIntro
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (page: string) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#020617] pt-20 pb-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-slate-300 font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-grid-tech opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-16 lg:space-y-24">
        
        {/* 1. Pre-footer conversion zone */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="border border-slate-800/80 bg-slate-900/30 p-8 sm:p-12 rounded-xl flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 relative overflow-hidden"
        >
          {/* Subtle blueprint highlight on top of the border */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
          
          <div className="space-y-4 max-w-2xl relative z-10">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full inline-block animate-pulse"></span>
              READY TO BUILD WHAT’S NEXT?
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-white tracking-tight leading-tight">
              From Digital Concept to <br className="hidden sm:block" /> Industrial Reality.
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              End-to-end engineering excellence. We build the future through precision tooling, 3D printing, robotics, custom software systems, and robust digital infrastructure.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0 relative z-10 w-full xl:w-auto">
            <button
              onClick={onOpenQuoteModal}
              className="group px-7 py-4 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 hover:border-cyan-500 text-white font-medium text-sm transition-all flex items-center justify-center gap-3 relative overflow-hidden rounded-md"
            >
              <span className="relative z-10">Request an Engineering Quote</span>
              <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform relative z-10" />
            </button>
            <a
              href={`tel:${COMPANY_DETAILS.phone}`}
              className="group px-7 py-4 bg-slate-900/50 border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-3 rounded-md"
            >
              <Phone className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>{COMPANY_DETAILS.phoneFormatted}</span>
            </a>
          </div>
        </motion.div>

        {/* 2. Main footer navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-10 border-b border-slate-800/50">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-6">
            <MkrdLogo size="lg" theme="dark" />
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              {COMPANY_DETAILS.tagline} Delivering precision engineering, advanced manufacturing, and enterprise-grade digital systems.
            </p>
            <div className="space-y-2.5 font-mono text-[11px] text-slate-500 pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-cyan-500 shrink-0" />
                <span className="text-slate-400 leading-relaxed">{COMPANY_DETAILS.address}</span>
              </div>
              <div className="pl-6">CIN: {COMPANY_DETAILS.cin}</div>
              <div className="pl-6">Est. {COMPANY_DETAILS.established}</div>
              <div className="pl-6 text-cyan-500/80 font-medium">{COMPANY_DETAILS.isoCertified}</div>
            </div>
          </div>

          {/* Explore */}
          <div className="lg:col-span-2 space-y-5 lg:ml-auto">
            <h4 className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Explore
            </h4>
            <ul className="space-y-3.5 text-sm">
              {[
                { name: 'Home', path: 'home' },
                { name: 'Projects', path: 'projects' },
                { name: 'Services', path: 'services' },
                { name: '3D Simulation Lab', path: 'simulations' },
                { name: 'Infrastructure', path: 'infrastructure' },
                { name: 'Contact', path: 'contact' },
              ].map((link) => (
                <li key={link.name}>
                  <button 
                    onClick={() => handleNavClick(link.path)} 
                    className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-2.5 group"
                  >
                    <span className="w-0 overflow-hidden group-hover:w-2 transition-all duration-300 ease-out h-[1px] bg-cyan-400 block" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300 text-left">{link.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Capabilities */}
          <div className="lg:col-span-3 space-y-5 lg:ml-8">
            <h4 className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Capabilities
            </h4>
            <ul className="space-y-3.5 text-sm text-slate-400">
              <li className="flex items-center gap-3 group cursor-pointer hover:text-cyan-400 transition-colors">
                <Box className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" /> 
                <span>3D Printing & Prototyping</span>
              </li>
              <li className="flex items-center gap-3 group cursor-pointer hover:text-cyan-400 transition-colors">
                <Factory className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" /> 
                <span>Injection Mould & Tooling</span>
              </li>
              <li className="flex items-center gap-3 group cursor-pointer hover:text-cyan-400 transition-colors">
                <Cpu className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" /> 
                <span>Industrial Automation & Robotics</span>
              </li>
              <li className="flex items-center gap-3 group cursor-pointer hover:text-cyan-400 transition-colors">
                <Layers className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" /> 
                <span>Digital Twins & Virtual Tours</span>
              </li>
              <li className="flex items-center gap-3 group cursor-pointer hover:text-cyan-400 transition-colors">
                <GitBranch className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" /> 
                <span>Custom Software Systems</span>
              </li>
              <li className="flex items-center gap-3 group cursor-pointer hover:text-cyan-400 transition-colors">
                <Shield className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" /> 
                <span>Network Infrastructure</span>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="lg:col-span-3 space-y-5">
            <h4 className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Connect
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <a href={`tel:${COMPANY_DETAILS.phone}`} className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-3 group">
                  <Phone className="w-4 h-4 text-slate-600 group-hover:text-cyan-400" />
                  <span>{COMPANY_DETAILS.phoneFormatted}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${COMPANY_DETAILS.email}`} className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-3 group">
                  <Mail className="w-4 h-4 text-slate-600 group-hover:text-cyan-400" />
                  <span>{COMPANY_DETAILS.email}</span>
                </a>
              </li>
              <li className="text-slate-500 flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-700" />
                <span>Gurgaon, Haryana, India</span>
              </li>
              <li className="pt-2">
                <button 
                  onClick={onOpenQuoteModal}
                  className="text-cyan-500 hover:text-cyan-400 text-sm font-medium transition-colors flex items-center gap-2 group"
                >
                  Request Quote
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </li>
              <li>
                <button 
                  onClick={onReplayIntro}
                  className="text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors flex items-center gap-2 mt-1"
                >
                  Replay Intro Experience
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Oversized MKRD brand section */}
        <div className="relative overflow-hidden flex flex-col items-center justify-end select-none w-full group pt-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 1 }}
            className="text-[9px] sm:text-[11px] font-mono tracking-[0.3em] sm:tracking-[0.5em] text-slate-500/60 uppercase mb-2 text-center relative z-20"
          >
            PRECISION ENGINEERING / DIGITAL SYSTEMS / INDUSTRIAL FUTURES
          </motion.div>
          
          <div className="relative w-full flex justify-center h-32 sm:h-48 md:h-64 lg:h-[22rem] items-end overflow-hidden pb-4">
            {/* Ambient hover glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-1/2 bg-cyan-600/0 group-hover:bg-cyan-600/10 transition-colors duration-1000 blur-3xl rounded-[100%] pointer-events-none" />
            
            <motion.h1 
              initial={{ opacity: 0, y: "30%" }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-[28vw] sm:text-[25vw] font-display font-black leading-[0.8] text-[#060c21] group-hover:text-[#0a1630] transition-colors duration-700 whitespace-nowrap cursor-default z-10"
            >
              <span className="relative inline-block">
                MKRD
                {/* Scanning line animation overlay via motion */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
                  className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent absolute top-0 -left-[50%] opacity-0 group-hover:opacity-100 pointer-events-none mix-blend-overlay"
                />
              </span>
            </motion.h1>
          </div>
        </div>
      </div>

      {/* 4. Footer bottom strip */}
      <div className="relative z-20 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-4 pt-4 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 justify-center sm:justify-start">
          <span>© {new Date().getFullYear()} MKRD Engineers Pvt. Ltd.</span>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span className="text-cyan-700 font-medium">ISO 9001:2015</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
          <button 
            onClick={scrollToTop}
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all hover:-translate-y-1"
            aria-label="Back to top"
            title="Back to top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
