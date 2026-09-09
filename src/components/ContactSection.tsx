import React, { useState } from 'react';
import { COMPANY_DETAILS } from '../data/mkrdData';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ContactSection: React.FC = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Mould Design & 3D Prototyping Inquiry',
    message: ''
  });
  const [isSent, setIsSent] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-700">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>CHAPTER 06 // DIRECT CONTACT & ENGINEERING HUB</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-blue-950 tracking-tight">
            CONNECT WITH <span className="text-blue-600">MKRD ENGINEERS</span>
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Visit our IMT Manesar technology facility, schedule a confidential technical consultation, or discuss your next manufacturing & digital initiative.
          </p>
        </div>

        {/* 2-Column Layout: Left Contact Cards & Map, Right Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Info & Location Map */}
          <div className="lg:col-span-5 space-y-5">
            {/* Address Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-100/80 border border-blue-200 text-blue-700">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono text-slate-500 uppercase font-semibold">Registered Tech Facility</div>
                  <div className="font-bold text-sm text-blue-950">{COMPANY_DETAILS.name}</div>
                </div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-mono pl-1">
                {COMPANY_DETAILS.address}
              </p>
              <div className="text-[11px] font-mono text-blue-700 font-bold pl-1">
                COORDINATES: {COMPANY_DETAILS.coordinates.lat}, {COMPANY_DETAILS.coordinates.long}
              </div>
            </div>

            {/* Direct Phone & Email Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                id="link-call-mkrd"
                href={`tel:${COMPANY_DETAILS.phone}`}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-500/60 transition-all space-y-2 group shadow-md hover:shadow-lg"
              >
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 w-fit text-blue-600 group-hover:scale-105 transition-transform shadow-xs">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono text-slate-500 uppercase font-semibold">Direct Mobile Line</div>
                <div className="font-bold text-sm text-blue-950 group-hover:text-blue-600 font-mono">
                  {COMPANY_DETAILS.phoneFormatted}
                </div>
                <div className="text-[11px] text-emerald-700 font-mono font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Mon-Sat 9AM-8PM IST
                </div>
              </a>

              <a
                id="link-email-mkrd"
                href={`mailto:${COMPANY_DETAILS.email}`}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-500/60 transition-all space-y-2 group shadow-md hover:shadow-lg"
              >
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 w-fit text-blue-600 group-hover:scale-105 transition-transform shadow-xs">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono text-slate-500 uppercase font-semibold">Inquiry Email</div>
                <div className="font-bold text-xs text-blue-950 group-hover:text-blue-600 font-mono truncate">
                  {COMPANY_DETAILS.email}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Quick Turnaround
                </div>
              </a>
            </div>

            {/* Stylized IMT Manesar Map Card */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md relative">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-700 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                  <span>IMT MANESAR SECTOR-7 LOCATION</span>
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=Plot+no.370+Sector-7+IMT+Manesar+Haryana+122051`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-bold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Open Directions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Map Canvas Frame */}
              <div className="relative h-48 w-full bg-slate-100 bg-grid-tech flex items-center justify-center p-4">
                <div className="relative z-10 text-center space-y-2 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-xl">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-600/30">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="font-extrabold text-xs text-blue-950">MKRD ENGINEERS PVT. LTD.</div>
                  <div className="text-[11px] font-mono text-slate-600">Sector-7, IMT Manesar, Gurugram, Haryana</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Direct Engineering Inquiry Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <div className="text-xs font-mono text-blue-700 font-bold uppercase tracking-wider">DIRECT TRANSMISSION</div>
              <h3 className="text-2xl font-display font-extrabold text-blue-950 mt-1">Send a Message</h3>
              <p className="text-xs text-slate-600">Our engineering leads respond within 4 business hours.</p>
            </div>

            {isSent ? (
              <div className="p-8 rounded-xl bg-blue-50 border border-blue-200 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-blue-600 mx-auto" />
                <h4 className="text-lg font-bold text-blue-950">Message Transmitted Successfully</h4>
                <p className="text-xs text-slate-700 max-w-sm mx-auto">
                  Thank you for reaching out to MKRD Engineers. A representative from our Manesar technical office will connect with you promptly.
                </p>
                <button
                  onClick={() => setIsSent(false)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs text-white font-bold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">YOUR NAME *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">EMAIL ADDRESS *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@organization.com"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">PHONE NUMBER *</label>
                    <input
                      type="tel"
                      required
                      placeholder={COMPANY_DETAILS.phoneFormatted}
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">SUBJECT</label>
                    <select
                      value={formState.subject}
                      onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:bg-white focus:outline-none"
                    >
                      <option value="3D Printing & Prototyping">3D Printing & Prototyping</option>
                      <option value="Plastic Injection Mould Tooling">Plastic Injection Mould Tooling</option>
                      <option value="360 Virtual Tours & Digital Twin">360° Virtual Tours & Digital Twin</option>
                      <option value="Custom Software & Microservices">Custom Software & Microservices</option>
                      <option value="Automation & Robotics">Industrial Automation & Robotics</option>
                      <option value="Corporate Partnership">General Consultation / Partnership</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">MESSAGE / TECHNICAL SPECIFICATIONS *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details about your design requirements, quantity, tolerances, or timeline..."
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Protected by Non-Disclosure Protocol</span>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/25 active:scale-95 transition-all"
                  >
                    <span>Transmit Message</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
