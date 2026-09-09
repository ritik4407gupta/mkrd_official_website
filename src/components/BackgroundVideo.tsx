import React, { useState } from 'react';
import heroImg from '../assets/images/hero_robotic_precision_1787995484245.jpg';

interface BackgroundVideoProps {
  className?: string;
  overlayOpacity?: string;
}

export const BackgroundVideo: React.FC<BackgroundVideoProps> = ({
  className = '',
  overlayOpacity = 'bg-slate-950/60',
}) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  
  // Cinematic 3D Printing / Robotic Arm Timelapse
  const videoId = 'XXvO86bHwZQ'; 

  return (
    <div className={`relative overflow-hidden w-full h-full bg-[#020617] ${className}`}>
      
      {/* Fallback/Poster Image shows until iframe loads */}
      <img
        src={heroImg}
        alt="MKRD Industrial Facility"
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${iframeLoaded ? 'opacity-0' : 'opacity-100'}`}
        referrerPolicy="no-referrer"
      />

      {/* YouTube Iframe Background (object-cover trick) */}
      <div className="absolute top-1/2 left-1/2 w-[150vw] h-[84.375vw] min-h-[150vh] min-w-[266.66vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <iframe
          onLoad={() => setIframeLoaded(true)}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}&modestbranding=1&playsinline=1`}
          allow="autoplay; encrypted-media"
          className="w-full h-full pointer-events-none border-0"
        ></iframe>
      </div>

      {/* Subtle Corporate Blue Tint & Tech Blueprint Overlay */}
      <div className={`absolute inset-0 ${overlayOpacity} backdrop-blur-[2px] pointer-events-none`} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/50 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-tech opacity-30 pointer-events-none" />

    </div>
  );
};
