import React from 'react';
import { StationData } from './InteractiveStationProps';
import { Server, Printer, Monitor, Bot, ArrowRight, X, Cpu, Activity, Zap, Compass } from 'lucide-react';

interface EntranceOverlayHUDProps {
  selectedStation: StationData | null;
  onSelectStation: (station: StationData | null) => void;
  onOpenDoors: () => void;
  isOpening?: boolean;
}

export const EntranceOverlayHUD: React.FC<EntranceOverlayHUDProps> = ({
  selectedStation,
  onSelectStation,
  onOpenDoors,
  isOpening
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top Header Information Strip */}
      <div className="flex items-center justify-between w-full">
        {/* MKRD Brand Hub */}
        <div className="pointer-events-auto flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700/80 shadow-2xl">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
              MKRD Virtual Engineering Lab
            </div>
            <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
              <span>Next-Gen R&D Facility</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                LIVE 3D
              </span>
            </div>
          </div>
        </div>

        {/* Enter Direct Shortcut Button */}
        <button
          id="btn-quick-enter-door"
          onClick={onOpenDoors}
          disabled={isOpening}
          className="pointer-events-auto group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold font-mono tracking-wider shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>{isOpening ? 'ENTERING PORTAL...' : 'ENTER HEADQUARTERS'}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Center Detail Drawer if Station is Selected */}
      {selectedStation && (
        <div className="pointer-events-auto self-center max-w-md w-full bg-slate-950/95 backdrop-blur-xl border border-cyan-500/50 rounded-2xl p-5 shadow-[0_0_50px_rgba(6,182,212,0.3)] animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                {selectedStation.category}
              </span>
              <h3 className="text-base font-bold text-white font-display">
                {selectedStation.name}
              </h3>
            </div>
            <button
              onClick={() => onSelectStation(null)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {selectedStation.description}
          </p>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-cyan-300">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>{selectedStation.spec}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">{selectedStation.status}</span>
            </span>
            <span className="text-cyan-400">TOUCH 3D TO INTERACT</span>
          </div>
        </div>
      )}

      {/* Bottom Interactive Navigation & Station Selectors */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
        {/* Interaction Hint */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
          <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
          <span>Hover & Click 3D Units • Click Doors to Enter</span>
        </div>

        {/* Quick Station Highlight Bar */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto max-w-full">
          <div className="px-2 text-[10px] font-mono font-bold text-slate-400 uppercase hidden md:block">
            Units:
          </div>

          <button
            onClick={() => onSelectStation(selectedStation?.id === 'server' ? null : (window as any).__MKRD_STATIONS?.server)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
              selectedStation?.id === 'server'
                ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Server</span>
          </button>

          <button
            onClick={() => onSelectStation(selectedStation?.id === 'printer' ? null : (window as any).__MKRD_STATIONS?.printer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
              selectedStation?.id === 'printer'
                ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D Printer</span>
          </button>

          <button
            onClick={() => onSelectStation(selectedStation?.id === 'workstation' ? null : (window as any).__MKRD_STATIONS?.workstation)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
              selectedStation?.id === 'workstation'
                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-indigo-400" />
            <span>CAD PC</span>
          </button>

          <button
            onClick={() => onSelectStation(selectedStation?.id === 'robot' ? null : (window as any).__MKRD_STATIONS?.robot)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
              selectedStation?.id === 'robot'
                ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span>Robot Arm</span>
          </button>
        </div>
      </div>
    </div>
  );
};
