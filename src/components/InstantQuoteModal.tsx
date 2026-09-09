import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle, Clock, ShieldCheck, Mail, Phone, User, FileText, Cpu, Sparkles, ArrowUpRight } from 'lucide-react';

interface InstantQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
}

export const InstantQuoteModal: React.FC<InstantQuoteModalProps> = ({ isOpen, onClose, initialService = '' }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 bg-[#01050b]/85 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          className="relative z-10 my-auto w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-cyan-400/20 bg-[#07111d]/95 shadow-[0_25px_100px_rgba(0,0,0,0.65),0_0_45px_rgba(8,145,178,0.12)]"
        >
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-300" />

          <div className="p-6 sm:p-10 relative overflow-hidden group/modal">
            {/* Animated Background Ambience */}
            <div className="absolute inset-0 bg-grid-tech opacity-10 pointer-events-none group-hover/modal:opacity-20 transition-opacity duration-700" />
            <div className="absolute left-1/2 top-[-12rem] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[110px] pointer-events-none transition-all duration-1000 group-hover/modal:bg-blue-600/15" />
            <div className="absolute bottom-[-8rem] right-[-8rem] h-64 w-64 rounded-full bg-amber-400/5 blur-[90px] pointer-events-none" />

            {/* Continuous Scanline */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20 group-hover/modal:opacity-30 transition-opacity duration-700 mix-blend-screen">
              <div className="w-full h-[25%] bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-scanline" />
            </div>

            <button
              onClick={onClose}
              aria-label="Close quote request"
              className="absolute right-5 top-5 z-20 rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition-all hover:border-cyan-300/40 hover:bg-cyan-950/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center relative z-10"
              >
                <motion.div
                  animate={{ scale: [1, 1.06, 1], boxShadow: ['0 0 25px rgba(16,185,129,0.15)', '0 0 55px rgba(16,185,129,0.35)', '0 0 25px rgba(16,185,129,0.15)'] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-950/50"
                >
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </motion.div>
                <div className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400"><Sparkles className="h-3.5 w-3.5" /> Intake accepted</div>
                <h3 className="mb-3 text-3xl font-display font-black text-white">Request Received</h3>
                <p className="text-slate-400 text-sm max-w-sm">Our engineering team will review your specifications and contact you within 24 hours.</p>
              </motion.div>
            ) : (
              <motion.div
                className="relative z-10"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
              >
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="mb-7 flex items-start justify-between gap-4 pr-10">
                  <div>
                    <div className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300"><Cpu className="h-3.5 w-3.5" /> Engineering intake / RFQ-01</div>
                    <h2 className="mb-2 text-3xl font-display font-black text-white sm:text-4xl">Project Inquiry</h2>
                    <p className="text-sm text-slate-400">Turn your technical brief into a production-ready plan.</p>
                  </div>
                  <ArrowUpRight className="mt-1 h-6 w-6 shrink-0 text-cyan-400/60" />
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-1.5 group/input">
                      <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><User className="w-3.5 h-3.5 text-cyan-500/50" /> Full Name</label>
                      <div className="relative">
                        <input type="text" required className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-cyan-500 focus:bg-[#020617]/80 focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="John Doe" />
                        <div className="absolute inset-0 rounded-xl border border-cyan-500/0 group-hover/input:border-cyan-500/30 transition-colors pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-1.5 group/input">
                      <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-cyan-500/50" /> Work Email</label>
                      <div className="relative">
                        <input type="email" required className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-cyan-500 focus:bg-[#020617]/80 focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="john@company.com" />
                        <div className="absolute inset-0 rounded-xl border border-cyan-500/0 group-hover/input:border-cyan-500/30 transition-colors pointer-events-none" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} className="space-y-1.5 group/input">
                    <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-cyan-500/50" /> Service Category</label>
                    <div className="relative">
                      <select className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-cyan-500 focus:bg-[#020617]/80 focus:ring-1 focus:ring-cyan-500 transition-all appearance-none cursor-pointer" defaultValue={initialService || ""}>
                        <option value="" disabled className="bg-slate-900">Select a capability...</option>
                        <option value="precision-machining" className="bg-slate-900">Precision CNC Machining</option>
                        <option value="additive-manufacturing" className="bg-slate-900">Additive Manufacturing</option>
                        <option value="injection-molding" className="bg-slate-900">Injection Molding</option>
                        <option value="digital-twin" className="bg-slate-900">Digital Twin & IoT</option>
                        <option value="system-integration" className="bg-slate-900">System Integration</option>
                      </select>
                      <div className="absolute inset-0 rounded-xl border border-cyan-500/0 group-hover/input:border-cyan-500/30 transition-colors pointer-events-none" />
                    </div>
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} className="space-y-1.5 group/input">
                    <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">Project Specifications</label>
                    <div className="relative">
                      <textarea required rows={4} className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500 focus:bg-[#020617]/80 focus:ring-1 focus:ring-cyan-500 transition-all resize-none" placeholder="Briefly describe your technical requirements, materials, and timeline..." />
                      <div className="absolute inset-0 rounded-xl border border-cyan-500/0 group-hover/input:border-cyan-500/30 transition-colors pointer-events-none" />
                    </div>
                  </motion.div>

                  <motion.button
                    variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold tracking-wide flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-70 disabled:cursor-not-allowed group/submit overflow-hidden relative mt-4"
                  >
                    {!isSubmitting && <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] translate-x-[-150%] group-hover/submit:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none" />}
                    {isSubmitting ? (
                      <div className="relative z-10 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        <span className="relative z-10">Submit Inquiry</span>
                        <Send className="relative z-10 h-4 w-4 transition-transform group-hover/submit:-translate-y-1 group-hover/submit:translate-x-1" />
                      </>
                    )}
                  </motion.button>

                  <div className="pt-5 mt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" /> NDA Compliant</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-cyan-500/70" /> 24h Response</span>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
