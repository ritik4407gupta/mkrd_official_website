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
  ChevronDown,
  Sparkles,
  FolderGit2,
  Cpu,
  Layers,
  Factory,
  Home
} from 'lucide-react';
import { SERVICES } from '../data/mkrdData';
import { motion } from 'framer-motion';

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
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState<boolean>(false);
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
              GURUGRAM, HARYANA
            </span>
            <span className="text-blue-400">•</span>
            <span className={isTransparent ? 'text-fg-muted' : 'text-brand-200'}>{COMPANY_DETAILS.credential} &middot; SINCE {COMPANY_DETAILS.established}</span>
            <span className="text-blue-400">•</span>
            {COMPANY_DETAILS.gstin && <span className="text-brand-300 font-bold">GSTIN: {COMPANY_DETAILS.gstin}</span>}
          </div>
          <div className="flex items-center gap-6">
            <a href={`tel:${COMPANY_DETAILS.phone}`} className="hover:text-white transition-colors flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-brand-300" />
              <span>{COMPANY_DETAILS.phoneFormatted}</span>
            </a>
            <a href={`mailto:${COMPANY_DETAILS.email}`} className="hover:text-white transition-colors flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-brand-300" />
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
              className="flex items-center text-left group min-w-0 shrink"
            >
              <MkrdLogo size="md" theme={isDarkThemeNav ? 'dark' : 'light'} />
            </button>
          </Magnetic>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold"
            onMouseLeave={() => setServicesDropdownOpen(false)}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPage === link.id; // Determine active link
              if (link.id === 'services') {
                return (
                  <div
                    key={link.id}
                    className="relative inline-flex items-center"
                    onMouseEnter={() => setServicesDropdownOpen(true)}
                  >
                    <Magnetic intensity={0.2}>
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
                          ? isActive ? 'text-brand-300' : 'text-slate-400'
                          : isActive ? 'text-blue-600' : 'text-slate-500'
                          }`} />
                        <span className="whitespace-nowrap">{link.label}</span>
                      </button>
                    </Magnetic>
                    <button
                      type="button"
                      aria-label="Open services menu"
                      onClick={() => setServicesDropdownOpen(prev => !prev)}
                      className="group ml-0.5 flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:text-white ${servicesDropdownOpen ? 'rotate-180' : ''} ${isDarkThemeNav ? 'text-slate-400' : 'text-slate-500'}`}
                      />
                    </button>
                    {/* Dropdown panel */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: servicesDropdownOpen ? 1 : 0, y: servicesDropdownOpen ? 0 : -10 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      style={{ pointerEvents: servicesDropdownOpen ? 'auto' : 'none' }}
                      className="absolute top-full left-0 mt-0 w-64 overflow-hidden rounded-2xl border border-white/15 bg-slate-950/60 p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-10xl"
                      onMouseEnter={() => setServicesDropdownOpen(true)}
                      onMouseLeave={() => setServicesDropdownOpen(false)}
                    >
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-400/10 via-transparent to-accent/10" />
                      {SERVICES.map((service) => (
                        <motion.button
                          key={service.id}
                          onClick={() => {
                            setServicesDropdownOpen(true);
                            setMobileMenuOpen(false);
                            window.location.hash = `service-${service.id}`;
                          }}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: servicesDropdownOpen ? 1 : 0, x: servicesDropdownOpen ? 0 : -6 }}
                          transition={{ duration: 0.18, delay: servicesDropdownOpen ? 0.03 : 0 }}
                          whileHover={{ x: 3 }}
                          className="group relative z-10 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-brand-300 transition-all duration-200 group-hover:border-brand-300/40 group-hover:bg-brand-400/15 group-hover:text-brand-200 group-hover:shadow-[0_0_16px_rgba(124,113,255,0.25)]">
                            <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                          </span>
                          <span className="min-w-0 flex-1 leading-snug transition-transform duration-200 group-hover:translate-x-0.5">
                            {service.title}
                          </span>
                          <span className="h-1 w-1 shrink-0 rounded-full bg-brand-300/30 transition-all duration-200 group-hover:scale-150 group-hover:bg-brand-300" />
                        </motion.button>
                      ))}
                    </motion.div>
                  </div>
                );
              }

              // Default link rendering
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
                      ? isActive ? 'text-brand-300' : 'text-slate-400'
                      : isActive ? 'text-blue-600' : 'text-slate-500'
                      }`} />
                    <span className="whitespace-nowrap">{link.label}</span>
                    {link.badge && !isActive && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${isDarkThemeNav
                        ? 'bg-brand-500/20 text-brand-300 border border-brand-400/30'
                        : 'bg-blue-100 text-blue-700'
                        }`}> {link.badge} </span>
                    )}
                  </button>
                </Magnetic>
              );
            })}
          </nav>

          {/* Action CTAs.
              `Request Quote` is hidden below sm: the bar cannot hold the logo,
              this button and the menu toggle at 390px, and it was the toggle
              that got pushed off the edge — which left a phone with no
              navigation at all. The quote action is the first item inside the
              drawer, so nothing is lost. */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Magnetic intensity={0.15}>
              <button
                id="nav-btn-quote"
                onClick={() => onOpenQuoteModal()}
                className={`hidden sm:flex px-4 py-2 rounded-full text-xs font-bold font-sans items-center gap-1.5 transition-all active:scale-95 border ${isDarkThemeNav
                  ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30 border-brand-400/30'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 border-blue-400/30'
                  }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-200" />
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
        <div className="lg:hidden fixed inset-x-4 top-20 z-50 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-brand-950/20 space-y-5 animate-in fade-in duration-200 pointer-events-auto">
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
                    ? 'bg-brand-950 text-brand-400 border border-brand-800'
                    : 'text-slate-300 hover:bg-slate-800'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
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
              className="w-full py-3 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-600/20"
            >
              Get Engineering Quote
            </button>
            <a
              href={`tel:${COMPANY_DETAILS.phone}`}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-brand-400" />
              <span>Call {COMPANY_DETAILS.phoneFormatted}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
