import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import {
  FolderGit2,
  ExternalLink,
  CheckCircle,
  X,
  ArrowRight
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Mousewheel, Pagination, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

import {
  GhostWord,
  MaskedHeading,
  Eyebrow,
  StatStrip,
  DrawRule,
  ScanBeam,
  useSectionScroll,
  useParallaxY,
} from '../../motion/SectionFX';
import { VIEWPORT, DUR, EASE } from '../../motion/tokens';
import { CASE_STUDIES } from '../../data/mkrdData';
import { ProjectCaseStudy } from '../../types';
import { ThreeDDigitalExperience } from '../ThreeDDigitalExperience';
import { RadialImageEmitter } from '../RadialImageEmitter';
import { RedDotsBackground } from '../RedDotsBackground';

interface ProjectsViewProps {
  onNavigate?: (pageId: string) => void;
  onOpenQuoteModal: (serviceId?: string) => void;
}

const headerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 }
  }
};

const textVariants: any = {
  hidden: { opacity: 0, y: 50, scale: 0.8, rotateX: 20 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: { type: "spring", stiffness: 70, damping: 15, mass: 1.2 }
  }
};

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onNavigate, onOpenQuoteModal }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });

  // The copy holds until the hero is genuinely on its way out, then clears in
  // the last third — so there is never a stretch of scrolling with nothing on
  // screen. The emitter accelerates through the same window and hands off to
  // the index band rather than fading into an empty viewport.
  // Measured across the whole time the title card is on screen rather than
  // across a tall spacer, so the copy is fully legible while it is the subject
  // and clears only as the index arrives.
  const textOpacity = useTransform(scrollYProgress, [0.3, 0.62, 0.86], [1, 1, 0]);
  const textScale = useTransform(scrollYProgress, [0.3, 0.86], [1, 1.06]);
  const textY = useTransform(scrollYProgress, [0.3, 0.86], [0, -60]);

  const emitterScale = useTransform(scrollYProgress, [0, 1], [0.94, 1.9]);
  const emitterOpacity = useTransform(scrollYProgress, [0.1, 0.5, 0.95], [0.5, 1, 0.1]);

  const indexRef = useRef<HTMLElement>(null);
  const { scrollYProgress: indexProgress } = useSectionScroll(indexRef);
  const indexY = useParallaxY(indexProgress, 8);

  const [activeProject, setActiveProject] = useState<ProjectCaseStudy | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // overflow-x-clip below, not overflow-hidden: `hidden` makes this element the
  // scroll container for anything sticky inside it, so a sticky child pins to a
  // box that never scrolls — which is to say it does not pin at all. `clip`
  // contains the glows the same way without that side effect.
  return (
    <div className="bg-[#06071A] min-h-screen text-slate-300 font-sans pb-24 overflow-x-clip relative">

      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />

      {/* 2. Side Interface Rulers */}
      <div className="hidden 2xl:flex fixed left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-brand-900/40 to-transparent z-0 items-center justify-center pointer-events-none">
        <div className="absolute -left-[50px] -rotate-90 text-[9px] font-mono tracking-[0.3em] text-brand-600/60 uppercase whitespace-nowrap">
          SYS.ARCHIVE // {new Date().getFullYear()} // MKRD_ENGINEERING
        </div>
      </div>

      <div className="hidden 2xl:flex fixed right-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-900/40 to-transparent z-0 items-center justify-center pointer-events-none">
        <div className="absolute -left-[30px] rotate-90 text-[9px] font-mono tracking-[0.3em] text-blue-600/60 uppercase whitespace-nowrap">
          LAT: 28.4595° N / LON: 77.0266° E // GURUGRAM, HARYANA
        </div>
      </div>

      {/* 3. Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-brand-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[800px] bg-brand-900/10 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 mix-blend-screen" />

      {/* The title card.
          This was a 200vh block with a sticky 100vh child. The sticky never
          engaged — an ancestor was overflow-hidden — so the copy simply scrolled
          away at 40% and left a full viewport of nothing behind it before the
          work started. That hole is the thing people noticed.

          It is now exactly one screen: the emitter behind, the copy in front,
          both moving on the page's own scroll, and the index directly beneath.
          There is no arrangement of this section that can produce an empty
          viewport, because the section is not taller than one. */}
      <div ref={containerRef} className="relative min-h-[86vh] w-full flex flex-col justify-center pt-20 pb-10 overflow-hidden">
        <motion.div style={{ scale: emitterScale, opacity: emitterOpacity }} className="absolute inset-0 z-0 origin-center">
          <RadialImageEmitter />
        </motion.div>

        <motion.section
          style={{ opacity: textOpacity, y: textY, scale: textScale }}
          className="relative z-10 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={headerVariants}
            className="space-y-6 flex flex-col items-center justify-center w-full"
          >
            <motion.div variants={textVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/50 border border-blue-800/50 text-xs font-mono font-bold text-brand-400 backdrop-blur-sm shadow-xl shadow-brand-900/20">
              <FolderGit2 className="w-4 h-4 text-brand-400" />
              <span>WORK YOU CAN GO AND CHECK</span>
            </motion.div>

            <motion.h1 variants={textVariants} className="text-4xl sm:text-6xl lg:text-[7rem] leading-none font-display font-black text-white tracking-tight drop-shadow-2xl">
              ENGINEERING<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent">PROJECTS</span>
            </motion.h1>

            <motion.p variants={textVariants} className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed mt-4 drop-shadow-md">
              Software we ship and licence, sites and 360° tours that are live and linkable, and
              parts printed in our own unit. Every project here can be opened, used or verified —
              and the tooling work our engineering side does is named rather than borrowed.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mt-10 flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500"
          >
            <span>Five of them, below</span>
            <motion.span
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
              className="w-px h-8 bg-gradient-to-b from-brand-500 to-transparent"
            />
          </motion.div>
        </motion.section>
      </div>

      {/* THE INDEX — what used to be a viewport of empty scroll.
          Every project on the page, numbered, arriving line by line. It gives
          the eye somewhere to land between the title card and the carousel, and
          it doubles as a contents list for a page whose cards move on their
          own. */}
      <section ref={indexRef} className="relative z-10 w-full pt-10 pb-20 sm:pt-14 sm:pb-28 overflow-hidden">
        <GhostWord text="SELECTED WORK" progress={indexProgress} strength={18} />

        <motion.div style={{ y: indexY }} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
            <div>
              <Eyebrow tone="brand">The index</Eyebrow>
              <MaskedHeading
                as="h2"
                text={'Five things you can\nopen right now.'}
                highlight={['open', 'right', 'now.']}
                className="mt-5 text-3xl sm:text-5xl font-display font-black text-white leading-[1.05] tracking-tight"
              />
            </div>
            <StatStrip
              className="shrink-0"
              items={[
                { value: CASE_STUDIES.length, label: 'Case studies' },
                { value: 2, label: 'Shipping products' },
                { value: 2018, label: 'Since', count: false },
              ]}
            />
          </div>

          <DrawRule className="mb-2" />

          <ul className="divide-y divide-ink-800/70">
            {CASE_STUDIES.map((project, i) => (
              <motion.li
                key={project.id}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: DUR.slow, ease: EASE.out, delay: i * 0.07 }}
              >
                <button
                  type="button"
                  onClick={() => { setActiveProject(project); setActiveIndex(i); }}
                  className="group w-full text-left py-6 sm:py-7 flex items-baseline gap-5 sm:gap-8 relative overflow-hidden focus-visible:outline-2 focus-visible:outline-brand-400"
                >
                  <ScanBeam delay={0.3 + i * 0.07} />
                  <span className="font-mono text-[11px] text-brand-500/70 tabular-nums shrink-0 pt-1">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-xl sm:text-3xl font-display font-bold text-slate-200 group-hover:text-white transition-colors truncate">
                      {project.title}
                    </span>
                    <span className="block mt-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500 truncate">
                      {project.category}
                    </span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-2 shrink-0 text-xs font-mono text-slate-500 group-hover:text-brand-300 transition-colors">
                    Open
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </span>
                </button>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* SWIPER 3D COVERFLOW PROJECT CARDS */}
      <section className="relative z-10 w-full mb-12">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: DUR.slow, ease: EASE.out }}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-center gap-4"
        >
          <Eyebrow tone="blue">Drag, scroll or click a card</Eyebrow>
          <DrawRule className="flex-1" delay={0.2} />
        </motion.div>
        <div className="w-full max-w-[1300px] mx-auto overflow-hidden">
          <Swiper
            effect={'coverflow'}
            speed={800}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            keyboard={{
              enabled: true,
            }}
            mousewheel={{
              forceToAxis: true,
              sensitivity: 0.1,
            }}
            coverflowEffect={{
              rotate: 55,
              stretch: -20,
              depth: 350,
              modifier: 1,
              slideShadows: true,
              scale: 0.85,
            }}
            pagination={{ clickable: true, dynamicBullets: true }}
            modules={[EffectCoverflow, Autoplay, Mousewheel, Pagination, Keyboard]}
            className="w-full py-16"
          >
            {[...CASE_STUDIES, ...CASE_STUDIES].map((project, index) => (
              <SwiperSlide
                key={`${project.id}-${index}`}
                className="w-[280px] sm:w-[400px] lg:w-[450px] h-[380px] sm:h-[550px] flex shrink-0"
              >
                <div
                  className="w-full h-full relative rounded-[2rem] overflow-hidden shadow-2xl border border-slate-700/50 group cursor-pointer"
                  onClick={() => { setActiveProject(project); setActiveIndex(index); }}
                >
                  <div className="absolute inset-0 bg-[#06071A]/20 z-10 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />

                  {project.id === 'mkrd-cs-04' ? (
                    <div className="w-full h-full relative z-10 group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100 pointer-events-auto">
                      <ThreeDDigitalExperience />
                    </div>
                  ) : (
                    <motion.img
                      layoutId={`project-image-${project.id}-${index}`}
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                    />
                  )}

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
                    <span className="px-3 py-1 rounded-full bg-blue-950/80 backdrop-blur-md border border-blue-800/80 text-[10px] font-mono text-brand-300 uppercase font-bold shadow-md">
                      {project.category}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-slate-300 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded border border-slate-700 shadow-md">
                      {project.client}
                    </span>
                  </div>

                  {/* Dark gradient for text readability */}
                  <div className="absolute bottom-0 inset-x-0 h-2/3 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent z-20 pointer-events-none" />

                  <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 z-30 pointer-events-none">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white mb-3 leading-tight drop-shadow-xl group-hover:text-brand-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-slate-300 line-clamp-2 mb-4 drop-shadow-md">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.slice(0, 3).map((tag, tagIdx) => (
                        <span key={tagIdx} className="text-[10px] font-bold text-brand-200/90 border border-brand-800/50 bg-brand-950/50 rounded px-2 py-1 font-mono backdrop-blur-md shadow">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* FULL SCREEN MODAL */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          >
            {/* Massive blur backdrop covering EVERYTHING including navbar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#06071A]/40 backdrop-blur-3xl"
              onClick={() => { setActiveProject(null); setActiveIndex(null); }}
            >
              <RedDotsBackground />
            </motion.div>

            <motion.div
              layoutId={`project-container-${activeProject.id}`}
              className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => { setActiveProject(null); setActiveIndex(null); }}
                className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Image Side */}
              <motion.div
                layoutId={`project-image-container-${activeProject.id}`}
                className="w-full md:w-1/2 h-64 md:h-auto relative bg-black"
              >
                {activeProject.id === 'mkrd-cs-04' ? (
                  <div className="w-full h-full relative z-10 pointer-events-auto">
                    <ThreeDDigitalExperience />
                  </div>
                ) : (
                  <motion.img
                    layoutId={`project-image-${activeProject.id}-${activeIndex}`}
                    src={activeProject.image}
                    alt={activeProject.title}
                    className="w-full h-full object-cover opacity-90"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none md:hidden" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900 pointer-events-none hidden md:block" />
              </motion.div>

              {/* Modal Content Side */}
              <div className="w-full md:w-1/2 p-6 sm:p-10 overflow-y-auto flex flex-col gap-6">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full bg-blue-950/50 border border-blue-800/50 text-brand-400 text-[10px] font-mono font-bold uppercase tracking-widest inline-block">
                    {activeProject.category}
                  </span>

                  <motion.h3
                    layoutId={`project-title-${activeProject.id}`}
                    className="text-3xl sm:text-4xl font-display font-black text-white leading-tight"
                  >
                    {activeProject.title}
                  </motion.h3>

                  <motion.div
                    layoutId={`project-client-${activeProject.id}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 font-mono text-[10px] text-slate-300 font-semibold tracking-widest uppercase"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse"></span>
                    CLIENT: <span className="text-white">{activeProject.client}</span>
                  </motion.div>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed">
                  {activeProject.description}
                </p>

                <div className="space-y-3 bg-slate-950/50 p-5 rounded-2xl border border-slate-800/50">
                  <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Complete Deliverables</div>
                  <ul className="space-y-2.5 pt-2">
                    {activeProject.deliverables.map((del, dIdx) => (
                      <motion.li
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + (dIdx * 0.1) }}
                        key={dIdx}
                        className="text-xs text-slate-300 flex items-start gap-2.5"
                      >
                        <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>{del}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono mt-auto">
                  {activeProject.metrics.map((m, mIdx) => (
                    <div key={mIdx} className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-center">
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">{m.label}</div>
                      <div className="text-sm font-bold text-brand-400">{m.value}</div>
                    </div>
                  ))}
                </div>

                {activeProject.link ? (
                  <a
                    href={activeProject.id === 'sdms-virtual-tour' ? '#simulations' : activeProject.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => {
                      if (activeProject.id === 'sdms-virtual-tour') {
                        event.preventDefault();
                        setActiveProject(null);
                        setActiveIndex(null);
                        onNavigate?.('simulations');
                      }
                    }}
                    className="mt-4 px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all hover:scale-105 shadow-lg shadow-blue-900/30 w-full text-center uppercase tracking-wide flex items-center justify-center gap-2"
                  >
                    <span>
                      {activeProject.id === 'sdms-virtual-tour'
                        ? 'Enter 360° Virtual Tour'
                        : 'View Live Deployment'}
                    </span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      setActiveProject(null);
                      setActiveIndex(null);
                      onOpenQuoteModal(activeProject.category);
                    }}
                    className="mt-4 px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all hover:scale-105 shadow-lg shadow-blue-900/30 w-full text-center uppercase tracking-wide"
                  >
                    Inquire Similar Architecture
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
