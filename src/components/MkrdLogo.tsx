import React, { lazy, Suspense } from 'react';

// Lazy load the 3D logo so it doesn't block main render
const MkrdLogo3D = lazy(() => import('./MkrdLogo3D').then(m => ({ default: m.MkrdLogo3D })));

interface MkrdLogoProps {
  variant?: 'full' | 'icon' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

export const MkrdLogo: React.FC<MkrdLogoProps> = ({
  variant = 'full',
  size = 'md',
  theme = 'auto',
  className = '',
}) => {
  const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-sm', sub: 'text-[8px]', box: 'h-7' },
    md: { icon: 'w-10 h-10', text: 'text-base', sub: 'text-[9px]', box: 'h-9' }, // Bumped slightly for 3D view
    lg: { icon: 'w-12 h-12', text: 'text-xl', sub: 'text-[10px]', box: 'h-11' },
    xl: { icon: 'w-16 h-16', text: 'text-2xl', sub: 'text-xs', box: 'h-16' },
  }[size];

  const textColor = theme === 'dark' ? 'text-white' : 'text-blue-950';
  const subColor = theme === 'dark' ? 'text-cyan-300' : 'text-blue-600';

  if (variant === 'icon') {
    return (
      <div className={`relative flex items-center justify-center ${sizeClasses.icon} ${className}`}>
        <Suspense fallback={<div className="w-full h-full rounded-full bg-slate-800 animate-pulse" />}>
          <MkrdLogo3D className="w-full h-full" />
        </Suspense>
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-display font-black tracking-wider shadow-sm border border-blue-500 ${className}`}>
        <span className="text-sm font-black tracking-widest">MKRD</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 3D Precision Geometric MKRD Icon Mark */}
      <div className="relative group shrink-0">
        <div className={`${sizeClasses.icon} rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,240,255,0.2)] border border-cyan-400/30 group-hover:scale-105 transition-transform overflow-hidden`}>
          <Suspense fallback={<div className="w-full h-full rounded-full bg-slate-800 animate-pulse" />}>
            <MkrdLogo3D className="w-[120%] h-[120%]" />
          </Suspense>
        </div>
      </div>

      {/* Typography Label */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-display font-extrabold ${sizeClasses.text} ${textColor} tracking-tight leading-none`}>
            MKRD
          </span>
          <span className={`font-display font-bold ${sizeClasses.text} ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'} tracking-tight leading-none`}>
            ENGINEERS
          </span>
        </div>
        <span className={`font-mono ${sizeClasses.sub} ${subColor} tracking-widest leading-tight mt-1 uppercase font-bold`}>
          PVT. LTD. • IMT MANESAR
        </span>
      </div>
    </div>
  );
};
