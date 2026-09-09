import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { Hexagon, Cpu, Settings, Orbit } from 'lucide-react';

const TearLineSVG = ({ svgPathData, pathLength, strokeDashoffset, pathRef }: any) => (
  <svg
    className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
  >
    <path
      ref={pathRef}
      d={svgPathData}
      fill="none"
      stroke="#22d3ee"
      strokeWidth="0.2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      style={{
        strokeDasharray: pathLength,
        strokeDashoffset: strokeDashoffset,
      }}
    />
  </svg>
);

const VideoBackground = () => (
  <>
    <video
      src="/videos/engineering-bg.mp4"
      autoPlay
      loop
      muted
      playsInline
      className="absolute top-0 left-0 w-full h-full object-cover"
    />
    <div className="absolute top-0 left-0 w-full h-full bg-slate-900/40" />
  </>
);

const RingLoader = () => (
  <div className="absolute top-1/2 left-1/2 w-[250px] h-[250px] pointer-events-none z-5 -translate-x-1/2 -translate-y-[40%] animate-[ring-spin_10s_linear_infinite] drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
    <svg width="250" height="250" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      <circle cx="50" cy="50" r="45" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="square" strokeDasharray="10 15" opacity="0.9" />
      <circle cx="50" cy="50" r="35" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="square" strokeDasharray="5 10" opacity="0.6" style={{ animation: 'ring-spin-reverse 4s linear infinite', transformOrigin: '50% 50%' }} />
      <circle cx="50" cy="50" r="28" fill="none" stroke="#60a5fa" strokeWidth="1" strokeDasharray="2 4" opacity="0.4" style={{ animation: 'ring-spin 6s linear infinite', transformOrigin: '50% 50%' }} />
      {/* Outer framing ring */}
      <circle cx="50" cy="50" r="52" fill="none" stroke="#0ea5e9" strokeWidth="0.5" strokeDasharray="1 6" opacity="0.3" style={{ animation: 'ring-spin-reverse 20s linear infinite', transformOrigin: '50% 50%' }} />
    </svg>
    <style>{`
      @keyframes ring-spin { 0% { transform: translate(-50%, -50%) rotate(0deg); } 100% { transform: translate(-50%, -50%) rotate(360deg); } }
      @keyframes ring-spin-reverse { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
    `}</style>
  </div>
);

const percentageStyle: React.CSSProperties = {
  position: 'absolute', top: '50%', left: '0', width: '100%', transform: 'translateY(-40%)', textAlign: 'center', zIndex: 20, fontSize: '2rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'visible', fontFamily: 'monospace'
};

const Preloader = ({ onComplete, ready }: any) => {
  const [isDone, setIsDone] = useState(false);
  const [realProgress, setRealProgress] = useState(0);
  const [active, setActive] = useState(true);

  useEffect(() => {
    let t = 0;
    const origOnStart = THREE.DefaultLoadingManager.onStart;
    const origOnProgress = THREE.DefaultLoadingManager.onProgress;
    const origOnLoad = THREE.DefaultLoadingManager.onLoad;

    THREE.DefaultLoadingManager.onStart = (url, loaded, total) => {
      setActive(true);
      origOnStart?.(url, loaded, total);
    };

    THREE.DefaultLoadingManager.onProgress = (url, loaded, total) => {
      cancelAnimationFrame(t);
      t = requestAnimationFrame(() => {
        setRealProgress((loaded / total) * 100);
      });
      origOnProgress?.(url, loaded, total);
    };

    THREE.DefaultLoadingManager.onLoad = () => {
      cancelAnimationFrame(t);
      setRealProgress(100);
      setActive(false);
      origOnLoad?.();
    };

    return () => {
      THREE.DefaultLoadingManager.onStart = origOnStart;
      THREE.DefaultLoadingManager.onProgress = origOnProgress;
      THREE.DefaultLoadingManager.onLoad = origOnLoad;
    };
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftHalfRef = useRef<HTMLDivElement>(null);
  const rightHalfRef = useRef<HTMLDivElement>(null);
  const pathLeftRef = useRef<SVGPathElement>(null);
  const pathRightRef = useRef<SVGPathElement>(null);
  const textLeftRef = useRef<HTMLSpanElement>(null);
  const textRightRef = useRef<HTMLSpanElement>(null);

  const [targetProgress, setTargetProgress] = useState(0);
  const displayProgressRef = useRef(0);
  const trackerRef = useRef({ val: 0 });
  const readyRef = useRef(ready);
  useEffect(() => { readyRef.current = ready; }, [ready]);

  const tearPoints = useMemo(() => {
    // A robotic stepped cut instead of a paper tear
    return [
      [50, 0],
      [50, 20],
      [45, 25],
      [45, 45],
      [55, 55],
      [55, 75],
      [50, 80],
      [50, 100]
    ];
  }, []);

  const svgPathData = useMemo(() => tearPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]} `).join(' '), [tearPoints]);

  const leftClipPoly = useMemo(() => {
    let poly = '0% 0%, ';
    tearPoints.forEach(p => { poly += `${p[0]}% ${p[1]}%, `; });
    poly += '0% 100%';
    return `polygon(${poly})`;
  }, [tearPoints]);

  const rightClipPoly = useMemo(() => {
    let poly = '100% 0%, 100% 100%, ';
    [...tearPoints].reverse().forEach(p => { poly += `${p[0]}% ${p[1]}%, `; });
    return `polygon(${poly.slice(0, -2)})`;
  }, [tearPoints]);

  useEffect(() => {
    let newTarget = 0;
    if (active) newTarget = (realProgress / 100) * 85;
    else newTarget = ready ? 100 : 90;
    setTargetProgress(prev => Math.max(prev, newTarget));
  }, [realProgress, active, ready]);

  const exitStarted = useRef(false);
  const startExit = () => {
    exitStarted.current = true;
    const tl = gsap.timeline({
      onComplete: () => {
        setIsDone(true);
        onComplete?.();
      }
    });
    tl.to({}, { duration: 0.1 });
    if (leftHalfRef.current) tl.to(leftHalfRef.current, { xPercent: -100, rotation: -2, duration: 1.8, ease: "power3.inOut" }, 'tear');
    if (rightHalfRef.current) tl.to(rightHalfRef.current, { xPercent: 100, rotation: 2, duration: 1.8, ease: "power3.inOut" }, 'tear');
    if (containerRef.current) tl.to(containerRef.current, { opacity: 0, duration: 0.5 }, '-=0.5');
  };

  useEffect(() => {
    if (displayProgressRef.current >= 99.5 && ready && !exitStarted.current) {
      exitStarted.current = true;
      startExit();
    }
  }, [ready]);

  useEffect(() => {
    const distance = targetProgress - displayProgressRef.current;
    let duration = distance > 60 ? 1.5 : distance > 30 ? 1.0 : distance > 10 ? 0.6 : 0.4;
    gsap.to(trackerRef.current, {
      val: targetProgress, duration: duration, ease: "power2.out", overwrite: true,
      onUpdate: () => {
        const val = trackerRef.current.val;
        displayProgressRef.current = val;
        const safeProgress = Math.min(100, Math.max(0, val));
        const strokeDashoffset = 120 - (120 * safeProgress) / 100;
        const percentageText = `${Math.round(safeProgress)}%`;
        if (textLeftRef.current) textLeftRef.current.innerText = percentageText;
        if (textRightRef.current) textRightRef.current.innerText = percentageText;
        if (pathLeftRef.current) pathLeftRef.current.style.strokeDashoffset = `${strokeDashoffset}`;
        if (pathRightRef.current) pathRightRef.current.style.strokeDashoffset = `${strokeDashoffset}`;
        if (val >= 99.5 && readyRef.current && !exitStarted.current) {
          exitStarted.current = true;
          startExit();
        }
      }
    });
  }, [targetProgress]);

  if (isDone) return null;
  const pathLength = 120;
  const safeProgress = Math.min(100, Math.max(0, displayProgressRef.current));
  const strokeDashoffset = pathLength - (pathLength * safeProgress) / 100;
  const percentageText = `${Math.round(safeProgress)}%`;

  const halfStyle: React.CSSProperties = {
    position: 'absolute', top: 0, bottom: 0, width: '100%', height: '100%',
    backgroundColor: '#0f172a',
    overflow: 'hidden',
    willChange: 'transform',
    filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))'
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto bg-black" ref={containerRef}>
      <div className="left-0" ref={leftHalfRef} style={{ ...halfStyle, left: 0, clipPath: leftClipPoly }}>
        <VideoBackground />
        <div style={percentageStyle}>
          <div className="flex flex-col items-center justify-center relative z-10">
            <img src="/images/mkrd-logo.png" alt="MKRD Logo" className="w-[400px] mb-8 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
            <span className="text-sm font-bold text-cyan-400 mb-1 tracking-[0.3em] drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]">SYSTEM INITIALIZING</span>
            <span ref={textLeftRef} className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,1)]">{percentageText}</span>
          </div>
          <RingLoader />
        </div>
        <TearLineSVG pathRef={pathLeftRef} svgPathData={svgPathData} pathLength={pathLength} strokeDashoffset={strokeDashoffset} />
      </div>
      <div className="right-0" ref={rightHalfRef} style={{ ...halfStyle, right: 0, clipPath: rightClipPoly }}>
        <VideoBackground />
        <div style={percentageStyle}>
          <div className="flex flex-col items-center justify-center relative z-10">
            <img src="/images/mkrd-logo.png" alt="MKRD Logo" className="w-[400px] mb-8 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
            <span className="text-sm font-bold text-cyan-400 mb-1 tracking-[0.3em] drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]">SYSTEM INITIALIZING</span>
            <span ref={textRightRef} className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,1)]">{percentageText}</span>
          </div>
          <RingLoader />
        </div>
        <TearLineSVG pathRef={pathRightRef} svgPathData={svgPathData} pathLength={pathLength} strokeDashoffset={strokeDashoffset} />
      </div>
    </div>
  );
};

export default Preloader;
