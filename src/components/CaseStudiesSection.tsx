import React, { useState } from 'react';
import { CASE_STUDIES } from '../data/mkrdData';
import { ProjectCaseStudy } from '../types';
import { ExternalLink, CheckCircle, Sparkles, ArrowUpRight, FolderGit2 } from 'lucide-react';

export const CaseStudiesSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeProject, setActiveProject] = useState<ProjectCaseStudy | null>(null);

  const categories = [
    { id: 'all', label: 'All Projects' },
    { id: '360 Virtual Tours & Digital Twin', label: '360° Virtual Tours' },
    { id: 'Enterprise Web Systems', label: 'Enterprise Web' },
    { id: 'Precision Mould & Tooling', label: 'Mould & Tooling' },
    { id: '3D Printing & Additive', label: 'Additive Prototypes' },
  ];

  const filteredProjects = selectedCategory === 'all'
    ? CASE_STUDIES
    : CASE_STUDIES.filter(p => p.category === selectedCategory);

  return (
    <section id="case-studies" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-700">
              <FolderGit2 className="w-3.5 h-3.5 text-blue-600" />
              <span>CHAPTER 04 // VERIFIED PROJECT CASE STUDIES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-blue-950 tracking-tight">
              RECENT <span className="text-blue-600">CASE STUDIES</span>
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Proven engineering deployments across academic institutions, Tier-1 automotive manufacturing, and aerospace laboratories.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`btn-case-filter-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-blue-950 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              id={`case-card-${project.id}`}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-500/70 transition-all duration-300 group flex flex-col justify-between shadow-md hover:shadow-xl shadow-blue-950/5"
            >
              <div>
                {/* Editorial Image & Overlay */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-100">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  {/* Top Bar on Image */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-blue-950/90 backdrop-blur-md border border-blue-800 text-[10px] font-mono text-cyan-300 uppercase font-bold">
                      {project.category}
                    </span>
                    <span className="font-mono text-xs font-bold text-white bg-slate-950/80 px-2.5 py-0.5 rounded border border-slate-800">
                      PROJECT / 0{index + 1}
                    </span>
                  </div>

                  {/* Client Tag */}
                  <div className="absolute bottom-4 left-4 font-mono text-xs text-slate-200 flex items-center gap-1.5 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span>Client: <strong className="text-white">{project.client}</strong></span>
                  </div>
                </div>

                {/* Card Narrative */}
                <div className="p-6 space-y-4">
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold text-blue-950 group-hover:text-blue-600 transition-colors leading-snug">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Key Deliverables Bullet Points */}
                  <div className="space-y-1.5 pt-2">
                    <div className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">Key Deliverables:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {project.deliverables.slice(0, 2).map((del, dIdx) => (
                        <div key={dIdx} className="text-[11px] text-slate-700 flex items-start gap-1.5 truncate font-medium">
                          <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span className="truncate">{del}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metric Chips */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100 font-mono text-xs">
                    {project.metrics.map((m, mIdx) => (
                      <div key={mIdx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                        <div className="text-slate-500 text-[9px] uppercase">{m.label}</div>
                        <div className="text-blue-700 font-bold truncate">{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card CTA Footer */}
              <div className="p-6 pt-0 flex items-center justify-between gap-4 border-t border-slate-100">
                {project.link ? (
                  <a
                    id={`btn-view-project-${project.id}`}
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span>View Live Deployment ({project.link.replace('https://', '')})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs font-mono text-slate-500">
                    Proprietary OEM Project • Under NDA
                  </span>
                )}

                <div className="flex gap-1.5">
                  {project.tags.slice(0, 2).map((tag, tIdx) => (
                    <span key={tIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
