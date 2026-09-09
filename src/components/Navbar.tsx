import React, { useState, useEffect } from 'react';
import { COMPANY_DETAILS } from '../data/mkrdData';
import { MkrdLogo } from './MkrdLogo';
import { Magnetic } from './Magnetic';
import {
  Menu,
  X,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  FolderGit2,
  Cpu,
  Layers,
  Factory,
  Home
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenQuoteModal: (serviceId?: string) => void;
  onReplayIntro: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenQuoteModal,
  onReplayIntro,
}) => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'projects', label: 'Projects', icon: FolderGit2, badge: 'Portfolio' },
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'simulations', label: '3D Simulation Lab', icon: Cpu },
    { id: 'infrastructure', label: 'Infrastructure', icon: Factory },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  const isDarkPage = true;
  const isTransparent = !isScrolled && isDarkPage;
  const isInfrastructureHero = currentPage === 'infrastructure' && !isScrolled;

  // Both transparent state (hero / dark pages) and scrolled state (glassmorphism) will use dark mode text
  const isDarkThemeNav = isTransparent || isScrolled;

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 pointer-events-none">
      {/* Top Banner with Direct Phone & Email when not scrolled */}
      {!isScrolled && (
        <div className={`w-full py-1.5 px-6 hidden md:flex items-center justify-between text-[11px] font-mono pointer-events-auto transition-colors duration-300 ${isTransparent
            ? isInfrastructureHero
              ? 'bg-slate-950/10 backdrop-blur-[2px] border-b border-white/15 text-slate-100'
              : 'bg-slate-950/40 backdrop-blur-xs border-b border-white/10 text-slate-200'
            : 'bg-blue-950 border-b border-blue-900/60 text-blue-200 shadow-sm'
          }`}>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              IMT MANESAR FACILITY: ONLINE (2 SHIFTS)
            </span>
            <span className="text-blue-400">•</span>
            <span className={isTransparent ? 'text-slate-300' : 'text-blue-200'}>ISO 9001:2015 CERTIFIED</span>
            <span className="text-blue-400">•</span>
            <span className="text-cyan-300 font-bold">CIN: {COMPANY_DETAILS.cin}</span>
          </div>
          <div className="flex items-center gap-6">
            <a href={`tel:${COMPANY_DETAILS.phone}`} className="hover:text-white transition-colors flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-cyan-300" />
              <span>{COMPANY_DETAILS.phoneFormatted}</span>
            </a>
            <a href={`mailto:${COMPANY_DETAILS.email}`} className="hover:text-white transition-colors flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-cyan-300" />
              <span>{COMPANY_DETAILS.email}</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Navbar container */}
      <div className={`w-full transition-all duration-500 ease-out px-4 sm:px-6 ${isScrolled ? 'pt-2.5 pb-2' : 'pt-3 pb-3'
        }`}>
        <div className={`mx-auto transition-all duration-500 pointer-events-auto flex items-center justify-between ${isScrolled
            ? 'max-w-6xl bg-slate-950/70 backdrop-blur-xl border border-slate-800 rounded-full px-5 py-2 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
            : isTransparent
              ? isInfrastructureHero
                ? 'max-w-7xl bg-transparent backdrop-blur-none border border-white/20 rounded-2xl px-5 py-3 shadow-none'
                : 'max-w-7xl bg-slate-950/20 backdrop-blur-xs border border-white/15 rounded-2xl px-5 py-3 shadow-none'
              : 'max-w-7xl bg-slate-950/70 backdrop-blur-md border border-slate-800 rounded-2xl px-5 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
          }`}>
          {/* MKRD Brand Logo */}
          <Magnetic intensity={0.1}>
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center text-left group"
            >
              <MkrdLogo size="md" theme={isDarkThemeNav ? 'dark' : 'light'} />
            </button>
          </Magnetic>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPage === link.id;
              return (
                <Magnetic key={link.id} intensity={0.2}>
                  <button
                    id={`nav-link-${link.id}`}
                    onClick={() => handleNavClick(link.id)}
                    className={`px-3.5 py-2 rounded-full transition-all flex items-center gap-1.5 relative ${isDarkThemeNav
                        ? isActive
                          ? 'text-white bg-white/10 border border-white/20 font-bold shadow-sm backdrop-blur-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                        : isActive
                          ? 'text-blue-700 bg-blue-50 border border-blue-200 font-bold shadow-xs'
                          : 'text-slate-600 hover:text-blue-950 hover:bg-slate-100'
                      }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isDarkThemeNav
                        ? isActive ? 'text-cyan-300' : 'text-slate-400'
                        : isActive ? 'text-blue-600' : 'text-slate-500'
                      }`} />
                    <span>{link.label}</span>
                    {link.badge && !isActive && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${isDarkThemeNav
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                          : 'bg-blue-100 text-blue-700'
                        }`}>
                        {link.badge}
                      </span>
                    )}
                  </button>
                </Magnetic>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <Magnetic intensity={0.15}>
              <button
                id="nav-btn-quote"
                onClick={() => onOpenQuoteModal()}
                className={`px-4 py-2 rounded-full text-xs font-bold font-sans flex items-center gap-1.5 transition-all active:scale-95 border ${isDarkThemeNav
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30 border-cyan-400/30'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 border-blue-400/30'
                  }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                <span>Request Quote</span>
              </button>
            </Magnetic>

            {/* Mobile Menu Toggle Button */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-xl border transition-colors ${isDarkThemeNav
                  ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-blue-950'
                }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-4 top-20 z-50 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-cyan-950/20 space-y-5 animate-in fade-in duration-200 pointer-events-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <MkrdLogo size="sm" theme="dark" />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-full bg-slate-800 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${isActive
                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                      : 'text-slate-300 hover:bg-slate-800'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuoteModal();
              }}
              className="w-full py-3 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-600/20"
            >
              Get Engineering Quote
            </button>
            <a
              href={`tel:${COMPANY_DETAILS.phone}`}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Call {COMPANY_DETAILS.phoneFormatted}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
