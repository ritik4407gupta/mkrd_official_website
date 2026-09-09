import React from 'react';
import { MACHINERY_SPECS } from '../data/mkrdData';
import { Cpu, ShieldCheck, Wrench, Gauge, Zap } from 'lucide-react';

export const InfrastructureSection: React.FC = () => {
  return (
    <section id="infrastructure" className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-700">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>CHAPTER 05 // MANUFACTURING & LAB INFRASTRUCTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-blue-950 tracking-tight">
            IMT MANESAR <span className="text-blue-600">PLANT & MACHINERY</span>
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            State-of-the-art subtractive, additive, and metrological machinery installed at our Sector-7 IMT Manesar technology facility.
          </p>
        </div>

        {/* Machinery Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MACHINERY_SPECS.map((machine) => (
            <div
              key={machine.id}
              id={`machine-spec-${machine.id}`}
              className="p-6 bg-slate-50/70 border border-slate-200 rounded-2xl flex flex-col justify-between hover:border-blue-500/60 transition-all duration-300 shadow-md hover:shadow-xl shadow-blue-950/5 group"
            >
              <div className="space-y-4">
                {/* Status & Type Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 font-semibold">
                    {machine.type}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {machine.status}
                  </span>
                </div>

                {/* Machine Name */}
                <h3 className="text-lg font-display font-extrabold text-blue-950 group-hover:text-blue-600 transition-colors leading-snug">
                  {machine.name}
                </h3>

                {/* Key specs */}
                <div className="space-y-2 font-mono text-xs pt-2 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[11px]">ENVELOPE:</span>
                    <span className="text-slate-900 font-semibold">{machine.workEnvelope}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[11px]">TOLERANCE:</span>
                    <span className="text-blue-700 font-bold">{machine.tolerance}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {machine.keyCapability}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span className="font-medium">SECTOR-7 IMT MANESAR</span>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
