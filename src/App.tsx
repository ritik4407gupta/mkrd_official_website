import React, { useState, useEffect, useLayoutEffect } from 'react';
import { NewOpeningIntro } from './components/NewOpeningIntro';
import { Navbar } from './components/Navbar';
import { FooterBrandReveal } from './components/FooterBrandReveal';
import { InstantQuoteModal } from './components/InstantQuoteModal';

import { CustomCursor } from './components/CustomCursor';

// Dedicated Page Views
import { HomeView } from './components/pages/HomeView';
import { ProjectsView } from './components/pages/ProjectsView';
import { ServicesView } from './components/pages/ServicesView';
import { SimulationsView } from './components/pages/SimulationsView';
import { InfrastructureView } from './components/pages/InfrastructureView';
import { ContactView } from './components/pages/ContactView';
import Lenis from 'lenis';

import { PageTransition } from './components/PageTransition';

export default function App() {
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [isInitialBoot, setIsInitialBoot] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [quoteModalOpen, setQuoteModalOpen] = useState<boolean>(false);
  const [initialServiceForQuote, setInitialServiceForQuote] = useState<string | undefined>(undefined);

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
      if (validPages.includes(hash)) {
        setCurrentPage(hash);
      } else if (hash === 'case-studies' || hash === 'virtual-tour-section' || hash === 'virtual-tour') {
        setCurrentPage('projects');
      } else if (hash === 'interactive-3d-lab') {
        setCurrentPage('simulations');
      }
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

      let rafId: number;
      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }

      rafId = requestAnimationFrame(raf);

      return () => {
        lenis.destroy();
        cancelAnimationFrame(rafId);
      };
    }
  }, [showIntro]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setShowIntro(false);
    setTimeout(() => {
      setIsInitialBoot(false);
    }, 2000); // Give enough time for the initial logo wipe
  };

  return (
    <div className={`min-h-screen bg-[#020617] text-slate-300 selection:bg-cyan-600 selection:text-white flex flex-col justify-between relative`}>

      <CustomCursor />

      {/* 1. Cinematic Opening Intro (Door + Text Sequence) */}
      {showIntro && (
        <NewOpeningIntro onComplete={handleIntroComplete} />
      )}

      {/* Primary Floating Navigation System */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenQuoteModal={handleOpenQuoteModal}
        onReplayIntro={handleReplayIntro}
      />

      {/* Main Page Stage with Smooth View Switching */}
      <main className={`flex-grow ${currentPage === 'home' ? 'pt-0' : 'pt-24 sm:pt-28'} relative z-0`}>
        {!showIntro && (<PageTransition pageKey={currentPage} isInitialBoot={isInitialBoot}>
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
        </PageTransition>)}
      </main>

      {/* Grounded Corporate Footer & MKRD Reveal */}
      <FooterBrandReveal
        onNavigate={handleNavigate}
        onOpenQuoteModal={() => handleOpenQuoteModal()}
        onReplayIntro={handleReplayIntro}
      />

      {/* Rapid RFQ CAD Estimator Modal */}
      <InstantQuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        initialServiceId={initialServiceForQuote}
      />
    </div>
  );
}

