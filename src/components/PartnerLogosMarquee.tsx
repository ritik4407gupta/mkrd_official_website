import React, { useMemo } from 'react';
import { CLIENT_PARTNERS } from '../data/mkrdData';

/**
 * The client wall.
 *
 * This used to be twelve <img> tags pointed at static.wixstatic.com — the CDN
 * behind the old Wix site — so every visitor to the new site fetched twelve
 * client logos from a third party, and the files themselves were screen crops
 * ("Screenshot.png", "images.jpeg", "god.png") of other companies' marks. Three
 * problems in one component: an uncontrolled third-party dependency on the
 * critical path, every visitor's IP handed to Wix, and other people's
 * trademarks reproduced from crops nobody supplied.
 *
 * So the wall is set in type instead. It reads better, it says who each client
 * actually is instead of twelve identical alt="Partner Logo", it costs zero
 * network requests, and it is honest. If MKRD holds written permission and the
 * supplied logo files, they drop straight into this layout.
 */

const Plate: React.FC<{ name: string; category: string }> = ({ name, category }) => (
  <div
    className="group/plate relative shrink-0 w-56 sm:w-64 px-5 py-4 rounded-xl border border-ink-700/80 bg-ink-900/50
               hover:border-brand-700/80 hover:bg-ink-850/70 transition-colors duration-300"
  >
    {/* the parting line, same motif as the mark and the page transition */}
    <span
      aria-hidden="true"
      className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-accent/45 group-hover/plate:bg-accent transition-colors duration-300"
    />
    <div className="font-display font-extrabold text-[15px] leading-tight text-fg group-hover/plate:text-white transition-colors">
      {name}
    </div>
    <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-fg-dim">
      {category}
    </div>
  </div>
);

export const PartnerLogosMarquee: React.FC = () => {
  const { rowA, rowB } = useMemo(() => {
    const half = Math.ceil(CLIENT_PARTNERS.length / 2);
    return { rowA: CLIENT_PARTNERS.slice(0, half), rowB: CLIENT_PARTNERS.slice(half) };
  }, []);

  return (
    <section className="w-full overflow-hidden py-12 sm:py-16 relative z-10" aria-labelledby="client-wall-heading">
      <div className="text-center mb-9 px-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-brand-400 mb-3">Client roster</p>
        <h2 id="client-wall-heading" className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white uppercase">
          Who we build for
        </h2>
        <div className="w-14 h-[3px] bg-gradient-to-r from-brand-500 to-accent mx-auto mt-4 rounded-full" />
      </div>

      <style>{`
        @keyframes mkrdRosterL { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes mkrdRosterR { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .mkrd-roster-l { animation: mkrdRosterL 46s linear infinite; }
        .mkrd-roster-r { animation: mkrdRosterR 52s linear infinite; }
        .mkrd-roster-l:hover, .mkrd-roster-r:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .mkrd-roster-l, .mkrd-roster-r { animation: none; transform: none; }
        }
      `}</style>

      <div className="relative">
        {/* edge fades, in the page's own ink rather than a stray slate */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-40 z-20 bg-gradient-to-r from-ink-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-40 z-20 bg-gradient-to-l from-ink-950 to-transparent" />

        <div className="flex flex-col gap-4">
          <div className="flex gap-4 px-4 mkrd-roster-r" style={{ width: 'max-content' }}>
            {[...rowA, ...rowA, ...rowA].map((c, i) => (
              <Plate key={`a-${i}`} name={c.name} category={c.category} />
            ))}
          </div>
          <div className="flex gap-4 px-4 mkrd-roster-l" style={{ width: 'max-content' }}>
            {[...rowB, ...rowB, ...rowB].map((c, i) => (
              <Plate key={`b-${i}`} name={c.name} category={c.category} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
