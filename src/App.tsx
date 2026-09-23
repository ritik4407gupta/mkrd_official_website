import React, { useState, useEffect, useLayoutEffect, useRef, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { FooterBrandReveal } from './components/FooterBrandReveal';
import { InstantQuoteModal } from './components/InstantQuoteModal';

import { CustomCursor } from './components/CustomCursor';

// Dedicated Page Views
// HomeView stays eager - it is the first paint. Every other route is split out
// so that three/drei, swiper and the four simulation canvases are not in the
// initial bundle for a visitor who never leaves the homepage.
import { HomeView } from './components/pages/HomeView';

const ProjectsView = lazy(() =>
  import('./components/pages/ProjectsView').then((m) => ({ default: m.ProjectsView })),
);
const ServicesView = lazy(() =>
  import('./components/pages/ServicesView').then((m) => ({ default: m.ServicesView })),
);
const SimulationsView = lazy(() =>
  import('./components/pages/SimulationsView').then((m) => ({ default: m.SimulationsView })),
);
const InfrastructureView = lazy(() =>
  import('./components/pages/InfrastructureView').then((m) => ({ default: m.InfrastructureView })),
);
const ContactView = lazy(() =>
  import('./components/pages/ContactView').then((m) => ({ default: m.ContactView })),
);

// The opening sequence is the only thing that needs three.js on the homepage.
// Splitting it out drops ~370 kB (gzipped) off first paint; the boot screen
// below is pure CSS and an inline SVG, so something branded is on screen
// while the 3D bundle streams in behind it.
const MkrdEntrance = lazy(() =>
  import('./components/entrance/MkrdEntrance').then((m) => ({ default: m.MkrdEntrance })),
);

const BootScreen = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[#06071A]">
    <svg viewBox="0 0 64 64" className="w-16 h-16" role="img" aria-label="MKRD">
      <path fillRule="evenodd" fill="#7C71FF" d="M7 4h22v56H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3zM35 4h22a3 3 0 0 1 3 3v50a3 3 0 0 1-3 3H35zM11 42V17h9l12 16 12-16h9v25h-7.5V28L34 43h-4L18.5 28v14zM9.2 11a1.9 1.9 0 1 0 3.8 0 1.9 1.9 0 1 0-3.8 0zM51.1 11a1.9 1.9 0 1 0 3.8 0 1.9 1.9 0 1 0-3.8 0zM9.2 53a1.9 1.9 0 1 0 3.8 0 1.9 1.9 0 1 0-3.8 0zM51.1 53a1.9 1.9 0 1 0 3.8 0 1.9 1.9 0 1 0-3.8 0z" />
      <rect x="30.6" y="4" width="2.8" height="56" fill="#E20207" />
    </svg>
    <span className="font-mono text-[10px] tracking-[0.34em] uppercase text-slate-500">
      Loading environment
    </span>
  </div>
);

const RouteFallback = () => (
  <div className="min-h-[70vh] flex items-center justify-center" role="status" aria-live="polite">
    <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-slate-500">
      Loading module
    </span>
  </div>
);
import Lenis from 'lenis';

import { PageTransition } from './components/PageTransition';

export default function App() {
  // The opening sequence is a first-impression, not a toll gate. It plays once
  // per browser session; a returning visitor, a deep link, or ?skipIntro=1 goes
  // straight to the site. "Replay intro" in the footer still forces it.
  const introAlreadySeen = (): boolean => {
    if (typeof window === 'undefined') return false;
    if (new URLSearchParams(window.location.search).has('skipIntro')) return true;
    try {
      return window.sessionStorage.getItem('mkrd:intro-seen') === '1';
    } catch {
      return false;
    }
  };

  const [showIntro, setShowIntro] = useState<boolean>(() => !introAlreadySeen());
  // Held so the hash handler can reset the scroll through Lenis rather than
  // around it. Lenis re-applies its own target every frame, so a scroll it does
  // not know about is undone before the next paint.
  const lenisRef = useRef<Lenis | null>(null);
  const [isInitialBoot, setIsInitialBoot] = useState<boolean>(() => !introAlreadySeen());
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [quoteModalOpen, setQuoteModalOpen] = useState<boolean>(false);
  const [initialServiceForQuote, setInitialServiceForQuote] = useState<string | undefined>(undefined);

  const resetScroll = () => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  // Sync with URL Hash on Mount & Popstate
  useEffect(() => {
    // Force home page on reload
    if (window.location.hash !== '' && window.location.hash !== '#home') {
      window.history.replaceState(null, '', '#home');
    }
    setCurrentPage('home');

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim().toLowerCase();
      const validPages = ['home', 'projects', 'services', 'simulations', 'infrastructure', 'contact'];
      let next: string | null = null;
      if (validPages.includes(hash)) next = hash;
      else if (hash === 'case-studies' || hash === 'virtual-tour-section' || hash === 'virtual-tour') next = 'projects';
      else if (hash === 'interactive-3d-lab') next = 'simulations';
      else if (hash.startsWith('service-')) next = 'services';
      if (!next) return;

      setCurrentPage(next);

      // Land at the top of the new page. Through Lenis where it is running:
      // it owns the scroll position and re-applies its own target every frame,
      // so a bare window.scrollTo gets pulled straight back.
      //
      // This is not cosmetic. Sections reveal on scroll through an
      // IntersectionObserver, which only fires when an element crosses the
      // viewport — so arriving at a route already scrolled halfway down leaves
      // everything above that point parked at opacity 0 for good. A visitor who
      // used the back button, followed a hash link from the footer, or reloaded
      // a page the browser had restored the scroll position for would see a
      // half-blank page. Starting at the top means every section is below the
      // fold and reveals the way it is meant to.
      resetScroll();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Initialize Global Smooth Scrolling (Lenis) after intro finishes
  useEffect(() => {
    if (!showIntro) {
      const lenis = new Lenis({
        lerp: 0.08, // Physics-based linear interpolation for natural fluid momentum
        wheelMultiplier: 1.2, // Slightly more distance per scroll notch
        smoothWheel: true,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
      });

      lenisRef.current = lenis;

      let rafId: number;
      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }

      rafId = requestAnimationFrame(raf);

      return () => {
        lenisRef.current = null;
        lenis.destroy();
        cancelAnimationFrame(rafId);
      };
    }
  }, [showIntro]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    const curHash = window.location.hash.replace('#', '').trim().toLowerCase();
    if (page === 'services' && curHash.startsWith('service-')) {
      // keep specific service target
    } else {
      window.location.hash = page;
    }
    resetScroll();
  };

  const handleOpenQuoteModal = (serviceId?: string) => {
    setInitialServiceForQuote(serviceId);
    setQuoteModalOpen(true);
  };

  const handleReplayIntro = () => {
    setShowIntro(true);
    setIsInitialBoot(true); // reset initial boot state too
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleIntroComplete = () => {
    try {
      window.sessionStorage.setItem('mkrd:intro-seen', '1');
    } catch {
      /* private browsing — the intro simply plays again next load */
    }
    window.scrollTo(0, 0);
    setShowIntro(false);
    setTimeout(() => {
      setIsInitialBoot(false);
    }, 2000); // Give enough time for the initial logo wipe
  };

  return (
    <div className={`min-h-screen bg-[#06071A] text-slate-300 selection:bg-brand-600 selection:text-white flex flex-col justify-between relative`}>

      <CustomCursor />

      {/* 1. Cinematic Opening Intro (Door + Text Sequence) */}
      {showIntro && (
        <Suspense fallback={<BootScreen />}>
          <MkrdEntrance onComplete={handleIntroComplete} />
        </Suspense>
      )}

      {/* Primary Floating Navigation System */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenQuoteModal={handleOpenQuoteModal}
        onReplayIntro={handleReplayIntro}
      />

      {/* Main Page Stage with Smooth View Switching */}
      <main className={`flex-grow ${currentPage === 'home' ? 'pt-0' : 'pt-24 sm:pt-28'} relative`}>
        {!showIntro && (<PageTransition pageKey={currentPage} isInitialBoot={isInitialBoot}>
          <Suspense fallback={<RouteFallback />}>
            {currentPage === 'home' && (
              <HomeView
                onNavigate={handleNavigate}
                onOpenQuoteModal={handleOpenQuoteModal}
              />
            )}

            {currentPage === 'projects' && (
              <ProjectsView
                onNavigate={handleNavigate}
                onOpenQuoteModal={handleOpenQuoteModal}
              />
            )}

            {currentPage === 'services' && (
              <ServicesView
                onOpenQuoteModal={handleOpenQuoteModal}
              />
            )}

            {currentPage === 'simulations' && (
              <SimulationsView
                onOpenQuoteModal={() => handleOpenQuoteModal()}
              />
            )}

            {currentPage === 'infrastructure' && (
              <InfrastructureView
                onOpenQuoteModal={() => handleOpenQuoteModal()}
              />
            )}

            {currentPage === 'contact' && (
              <ContactView
                onOpenQuoteModal={handleOpenQuoteModal}
              />
            )}
          </Suspense>
        </PageTransition>)}
      </main>

      {/* Grounded Corporate Footer & MKRD Reveal */}
      {!showIntro && (
        <FooterBrandReveal
          onNavigate={handleNavigate}
          onOpenQuoteModal={() => handleOpenQuoteModal()}
          onReplayIntro={handleReplayIntro}
        />
      )}

      {/* Rapid RFQ CAD Estimator Modal */}
      <InstantQuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        initialService={initialServiceForQuote}
      />
    </div>
  );
}

