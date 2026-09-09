import React from 'react';
import { CLIENT_PARTNERS } from '../data/mkrdData';
import { Hexagon, Circle, Square, Triangle } from 'lucide-react';

export const InfiniteMarquee: React.FC = () => {
  const icons = [Hexagon, Circle, Square, Triangle];

  return (
    <div className="w-full overflow-hidden bg-slate-950 border-y border-slate-800 py-10 sm:py-12 flex relative z-10 group">
      {/* CSS Animation defined inline for portability */}
      <style>{`
        @keyframes scrollMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: scrollMarquee 35s linear infinite;
        }
        .group:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>
      
      {/* Dark gradient fade masks for seamless edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-20 pointer-events-none" />
      
      <div className="flex gap-20 sm:gap-32 whitespace-nowrap px-10 items-center animate-marquee" style={{ width: 'max-content' }}>
        {[...CLIENT_PARTNERS, ...CLIENT_PARTNERS, ...CLIENT_PARTNERS, ...CLIENT_PARTNERS].map((partner, idx) => {
          const Icon = icons[idx % icons.length];
          return (
            <div key={idx} className="flex items-center gap-4 text-slate-500 hover:text-cyan-400 transition-colors duration-300 cursor-pointer">
              <Icon className="w-8 h-8" />
              <span className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tighter">
                {partner.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
