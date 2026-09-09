import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, FastForward, Rewind, Layers, Shield, Sparkles, Terminal, Activity, ArrowRight } from 'lucide-react';
import printerImg from '../assets/images/printer_additive_fab_1787995499367.jpg';
import mouldImg from '../assets/images/mould_die_engineering_1787995513683.jpg';
import softwareImg from '../assets/images/software_microservices_tech_1787995547133.jpg';
import tourImg from '../assets/images/virtual_tour_scanning_1787995529203.jpg';
import heroImg from '../assets/images/hero_robotic_precision_1787995484245.jpg';

interface CinemaClip {
  id: string;
  number: string;
  title: string;
  category: string;
  description: string;
  image: string;
  metrics: { label: string; value: string }[];
  tag: string;
}

const CINEMA_CLIPS: CinemaClip[] = [
  {
    id: 'clip-01',
    number: '01',
    title: 'Precision 3D Additive Layering & Prototyping',
    category: 'Prototyping + Physical Engineering',
    description: 'High-temperature carbon composite and metal filament deposition with sub-micron layer resolution.',
    image: printerImg,
    metrics: [
      { label: 'LAYER RESOLUTION', value: '25 MICRONS' },
      { label: 'CHAMBER TEMP', value: '90°C' },
      { label: 'CYCLE SPEED', value: '180 mm/s' }
    ],
    tag: 'ADDITIVE LAB'
  },
  {
    id: 'clip-02',
    number: '02',
    title: '5-Axis CNC Precision Mould & Tooling',
    category: 'Precision Tooling + Die Casting',
    description: 'Ultra-precision high-speed milling of hardened H13 injection mould cores and complex EDM cavities.',
    image: mouldImg,
    metrics: [
      { label: 'TOLERANCE', value: '±0.005 mm' },
      { label: 'TOOL LIFE', value: '1M+ SHOTS' },
      { label: 'SPINDLE SPEED', value: '24,000 RPM' }
    ],
    tag: 'SUBTRACTIVE MACHINING'
  },
  {
    id: 'clip-03',
    number: '03',
    title: 'Enterprise Microservices & Cloud Software',
    category: 'Software + Digital Architecture',
    description: 'Decoupled, high-throughput microservices for ERP, billing, and automated manufacturing execution.',
    image: softwareImg,
    metrics: [
      { label: 'UPTIME SLA', value: '99.95%' },
      { label: 'LATENCY', value: '< 15ms' },
      { label: 'ARCHITECTURE', value: 'K8s DOCKER' }
    ],
    tag: 'CLOUD SYSTEMS'
  },
  {
    id: 'clip-04',
    number: '04',
    title: 'Immersive 360° Spatial Digital Twins (SDMS)',
    category: 'Spatial Capture + Digital Environments',
    description: '12K HDR panoramic photogrammetry and spatial LiDAR point clouds for universities and plant facilities.',
    image: tourImg,
    metrics: [
      { label: 'PANORAMA NODES', value: '85+ NODES' },
      { label: 'RESOLUTION', value: '12K HDR' },
      { label: 'CLIENT', value: 'SDMS EDU' }
    ],
    tag: 'SPATIAL 360'
  },
  {
    id: 'clip-05',
    number: '05',
    title: 'Industrial Automation & Robotics Kinematics',
    category: 'Engineering + Automation',
    description: 'Custom robotic actuators, PLC automated workcells, and high-speed pick-and-place end effectors.',
    image: heroImg,
    metrics: [
      { label: 'REPEATABILITY', value: '±0.015 mm' },
      { label: 'THROUGHPUT', value: '+4.5X' },
      { label: 'SAFETY LEVEL', value: 'SIL 3' }
    ],
    tag: 'ROBOTICS'
  }
];

export const ScrollCinemaSection: React.FC = () => {
  const [activeClipIndex, setActiveClipIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [scrubProgress, setScrubProgress] = useState<number>(0);

  const activeClip = CINEMA_CLIPS[activeClipIndex];

  // Auto playback of cinematic clips
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveClipIndex((prev) => (prev + 1) % CINEMA_CLIPS.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <section id="cinema-experience" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 relative border-t border-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400">
              <Activity className="w-3.5 h-3.5" />
              <span>CHAPTER 02 // CINEMATIC SYSTEM TIMELINE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              SCROLL-CONTROLLED <span className="text-blue-400">ENGINEERING CINEMA</span>
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Traverse through MKRD’s core physical fabrication, mould toolmaking, spatial digital twins, and software ecosystems.
            </p>
          </div>

          {/* Timeline Navigation Indicators */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 text-xs font-mono text-slate-200 flex items-center gap-1.5 shadow-sm"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isPlaying ? 'Auto-Cycle ON' : 'Paused'}</span>
            </button>
          </div>
        </div>

        {/* Cinematic Master Player Frame */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl shadow-black/40">
          {/* Main Visual Display */}
          <div className="relative h-[420px] sm:h-[540px] w-full overflow-hidden">
            <img
              src={activeClip.image}
              alt={activeClip.title}
              className="w-full h-full object-cover transition-all duration-1000 transform scale-100 filter brightness-90 contrast-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
            <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/70 pointer-events-none" />

            {/* Top HUD Telemetry */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between font-mono text-xs text-slate-300 pointer-events-none">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-blue-950/90 border border-blue-500/40 text-blue-300 font-bold">
                  {activeClip.tag}
                </span>
                <span className="hidden sm:inline text-slate-300">MKRD TIMELINE SEQUENCE</span>
              </div>
              <div className="bg-slate-950/90 px-3 py-1 rounded border border-slate-800 text-blue-400 font-bold">
                CLIP {activeClip.number} / 05
              </div>
            </div>

            {/* Bottom Content Narrative Overlay */}
            <div className="absolute bottom-6 left-6 right-6 z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
              <div className="lg:col-span-8 space-y-2">
                <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                  {activeClip.category}
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white leading-tight">
                  {activeClip.title}
                </h3>
                <p className="text-sm text-slate-200 max-w-2xl leading-relaxed">
                  {activeClip.description}
                </p>
              </div>

              {/* Clip Metric Readouts */}
              <div className="lg:col-span-4 flex flex-wrap lg:flex-col gap-2 font-mono text-xs justify-end">
                {activeClip.metrics.map((m, idx) => (
                  <div key={idx} className="bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 flex items-center justify-between gap-4 shadow-sm">
                    <span className="text-slate-400 text-[11px]">{m.label}:</span>
                    <strong className="text-blue-300 font-semibold">{m.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Interactive Clip Selector Bar */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-2">
            {CINEMA_CLIPS.map((clip, index) => {
              const isActive = activeClipIndex === index;
              return (
                <button
                  key={clip.id}
                  id={`btn-cinema-clip-${index}`}
                  onClick={() => {
                    setActiveClipIndex(index);
                    setIsPlaying(false);
                  }}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    isActive
                      ? 'bg-blue-950/70 border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-400'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] font-bold text-blue-400">{clip.number}</span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{clip.tag}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 truncate">{clip.title}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
