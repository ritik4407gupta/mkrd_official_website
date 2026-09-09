import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  UploadCloud,
  ChevronRight,
  Globe2,
  Clock,
  Shield
} from 'lucide-react';
import { COMPANY_DETAILS, SERVICES } from '../../data/mkrdData';
import { MkrdCinematicBackground } from '../MkrdCinematicBackground';

interface ContactViewProps {
  onOpenQuoteModal: (serviceId?: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 20 } }
};

export const ContactView: React.FC<ContactViewProps> = ({ onOpenQuoteModal }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: SERVICES[0].id,
    message: '',
    ndaRequested: false,
  });

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [fileAttached, setFileAttached] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const serviceName = SERVICES.find(s => s.id === formData.service)?.title || formData.service;
    const subject = encodeURIComponent(`Engineering Request: ${serviceName} from ${formData.company || formData.name}`);
    const body = encodeURIComponent(`Name: ${formData.name}
Company: ${formData.company || 'N/A'}
Phone: ${formData.phone}
Email: ${formData.email}
Service: ${serviceName}
NDA Requested: ${formData.ndaRequested ? 'Yes' : 'No'}

Project Details:
${formData.message}${fileAttached ? `\n\n[Note: Please attach your file (${fileName}) to this email manually before sending.]` : ''}`);
    
    window.location.href = `mailto:mkrdengineers@gmail.com?subject=${subject}&body=${body}`;
    
    setSubmitted(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
      setFileAttached(true);
    }
  };

  return (
    <div className="relative min-h-[100vh] bg-[#020617] text-slate-300 pt-28 pb-20 overflow-hidden flex flex-col justify-center">
      {/* The Animated Cinematic Background */}
      <MkrdCinematicBackground />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        {/* Cinematic Header Section */}
        <motion.div variants={itemVariants} className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold uppercase tracking-widest backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Global Engineering Hub
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-white tracking-tight">
            INITIATE <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-400">TECHNICAL REVIEW</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Connect directly with MKRD's lead engineers in IMT Manesar for feasibility analysis, CAD review, and manufacturing pipeline integration.
          </p>
        </motion.div>

        {/* Top Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: MapPin,
              title: "INDUSTRIAL FACILITY",
              detail1: COMPANY_DETAILS.address,
              detail2: "Haryana, India",
              action: "Get Directions",
              link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY_DETAILS.address)}`
            },
            {
              icon: Phone,
              title: "DIRECT HOTLINE",
              detail1: COMPANY_DETAILS.phone,
              detail2: "Available 24/6 for urgent matters",
              action: "Call Now",
              link: `tel:${COMPANY_DETAILS.phone.replace(/[^0-9+]/g, '')}`
            },
            {
              icon: Mail,
              title: "TECHNICAL SUPPORT",
              detail1: COMPANY_DETAILS.email,
              detail2: "CAD & Spec submissions",
              action: "Send Email",
              link: `mailto:${COMPANY_DETAILS.email}`
            }
          ].map((card, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 transition-all group relative overflow-hidden flex flex-col items-start"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <card.icon className="w-16 h-16 text-blue-500" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center mb-4 shadow-lg">
                <card.icon className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-mono font-bold text-slate-300 mb-2 tracking-widest">{card.title}</h3>
              <p className="text-white font-medium text-sm mb-1">{card.detail1}</p>
              <p className="text-slate-400 text-xs mb-6">{card.detail2}</p>
              <a href={card.link} target={card.icon === MapPin ? "_blank" : undefined} rel={card.icon === MapPin ? "noopener noreferrer" : undefined} className="mt-auto text-blue-400 text-xs font-bold flex items-center gap-1 group-hover:text-blue-300 transition-colors">
                {card.action} <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          ))}
        </div>

        {/* Engineering Request Form */}
        <motion.div variants={itemVariants} className="bg-[#020617]/80 backdrop-blur-2xl border border-slate-700/60 rounded-[2rem] p-6 sm:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden group/form">
          {/* Animated Background Ambience */}
          <div className="absolute inset-0 bg-grid-tech opacity-10 pointer-events-none group-hover/form:opacity-20 transition-opacity duration-700" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none transition-all duration-1000 group-hover/form:bg-blue-600/15" />
          
          {/* Continuous Scanline in Form */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20 group-hover/form:opacity-30 transition-opacity duration-700 mix-blend-screen">
             <div className="w-full h-[25%] bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-scanline" />
          </div>

          {submitted ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-20 relative z-10"
            >
              <div className="w-24 h-24 rounded-full bg-emerald-950/50 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.2)] mb-8">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-4xl font-display font-black text-white mb-4">Specification Received</h2>
              <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed mb-10">
                Thank you, <strong className="text-white">{formData.name}</strong>. Our senior tooling engineers at MKRD are analyzing your requirements. We will contact you shortly with a technical roadmap.
              </p>
              <div className="inline-flex flex-col p-6 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-xs font-mono text-slate-400 text-left space-y-3 mb-10 shadow-inner w-full max-w-sm">
                <div className="flex justify-between gap-8 border-b border-slate-800 pb-2"><span>TICKET:</span> <span className="text-cyan-300 font-bold">MKRD-REQ-{Math.floor(100000 + Math.random() * 900000)}</span></div>
                <div className="flex justify-between gap-8 border-b border-slate-800 pb-2"><span>FACILITY:</span> <span className="text-white">IMT Manesar Lab</span></div>
                <div className="flex justify-between gap-8"><span>STATUS:</span> <span className="text-emerald-400 font-bold flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> QUEUED FOR FEASIBILITY</span></div>
              </div>
              <div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-8 py-4 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-600 transition-all shadow-lg"
                >
                  Submit Another Project
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-8">
                <div>
                  <h3 className="text-3xl font-display font-extrabold text-white">Project Blueprint Submission</h3>
                  <p className="text-xs font-mono text-cyan-400 mt-2 uppercase tracking-widest font-bold">Secure encrypted portal</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-950/30 px-4 py-2 rounded-full border border-emerald-800/50 shadow-sm">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  NDA Protected
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">Lead Engineer Name</label>
                  <div className="relative group/input">
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-4 rounded-xl bg-slate-900/60 border border-slate-700 text-white text-sm placeholder:text-slate-600 focus:border-cyan-500 focus:bg-[#020617]/80 focus:ring-1 focus:ring-cyan-500 transition-all outline-none"
                    />
                    <div className="absolute inset-0 rounded-xl border border-cyan-500/0 group-hover/input:border-cyan-500/30 transition-colors pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">Corporate Email</label>
                  <div className="relative group/input">
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-5 py-4 rounded-xl bg-slate-900/60 border border-slate-700 text-white text-sm placeholder:text-slate-600 focus:border-cyan-500 focus:bg-[#020617]/80 focus:ring-1 focus:ring-cyan-500 transition-all outline-none"
                    />
                    <div className="absolute inset-0 rounded-xl border border-cyan-500/0 group-hover/input:border-cyan-500/30 transition-colors pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">Direct Phone</label>
                  <div className="relative group/input">
                    <input
                      type="tel"
                      required
                      placeholder="+91"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-5 py-4 rounded-xl bg-slate-900/60 border border-slate-700 text-white text-sm placeholder:text-slate-600 focus:border-cyan-500 focus:bg-[#020617]/80 focus:ring-1 focus:ring-cyan-500 transition-all outline-none"
                    />
                    <div className="absolute inset-0 rounded-xl border border-cyan-500/0 group-hover/input:border-cyan-500/30 transition-colors pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">Organization</label>
                  <div className="relative group/input">
                    <input
                      type="text"
                      placeholder="Company name"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-5 py-4 rounded-xl bg-slate-900/60 border border-slate-700 text-white text-sm placeholder:text-slate-600 focus:border-cyan-500 focus:bg-[#020617]/80 focus:ring-1 focus:ring-cyan-500 transition-all outline-none"
                    />
                    <div className="absolute inset-0 rounded-xl border border-cyan-500/0 group-hover/input:border-cyan-500/30 transition-colors pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">Target Service Domain</label>
                <div className="relative group/input">
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full px-5 py-4 rounded-xl bg-slate-900/60 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:bg-[#020617]/80 focus:ring-1 focus:ring-cyan-500 transition-all outline-none appearance-none cursor-pointer"
                  >
                    {SERVICES.map(s => (
                      <option key={s.id} value={s.id} className="bg-slate-900">{s.title}</option>
                    ))}
                  </select>
                  <div className="absolute inset-0 rounded-xl border border-cyan-500/0 group-hover/input:border-cyan-500/30 transition-colors pointer-events-none" />
                  <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                    <ChevronRight className="w-5 h-5 text-slate-500 rotate-90" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">Technical Specifications (Optional)</label>
                <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer bg-slate-900/40 hover:bg-slate-800/60 transition-all group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-cyan-900/40 flex items-center justify-center mb-4 transition-colors relative z-10 shadow-inner">
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <span className="text-base text-slate-200 font-bold mb-2 relative z-10 group-hover:text-white">
                    {fileAttached ? `Attached: ${fileName}` : 'Upload CAD Models & Blueprints'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono relative z-10">
                    Supports STEP, IGES, STL, DXF, PDF (Max 100MB)
                  </span>
                  <input
                    type="file"
                    accept=".step,.stp,.iges,.igs,.stl,.dxf,.pdf,.zip"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">Project Scope & Tolerances</label>
                <div className="relative group/input">
                  <textarea
                    rows={5}
                    required
                    placeholder="Describe material requirements, batch sizes, timeline..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-5 py-4 rounded-xl bg-slate-900/60 border border-slate-700 text-white text-sm placeholder:text-slate-600 focus:border-cyan-500 focus:bg-[#020617]/80 focus:ring-1 focus:ring-cyan-500 transition-all outline-none resize-none"
                  />
                  <div className="absolute inset-0 rounded-xl border border-cyan-500/0 group-hover/input:border-cyan-500/30 transition-colors pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-8 border-t border-slate-800">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={formData.ndaRequested}
                      onChange={(e) => setFormData({ ...formData, ndaRequested: e.target.checked })}
                      className="peer appearance-none w-6 h-6 border-2 border-slate-600 rounded bg-slate-900 checked:bg-cyan-600 checked:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all cursor-pointer"
                    />
                    <CheckCircle2 className="w-4 h-4 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors font-bold">Require Mutual NDA</span>
                    <span className="text-[11px] text-slate-500 font-mono mt-0.5">We will send a counter-signed NDA before reviewing files.</span>
                  </div>
                </label>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 group/btn overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] translate-x-[-150%] group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                  <span className="relative z-10">Transmit to Engineering</span>
                  <Send className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};
