import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  UploadCloud,
  ChevronRight,
  Shield,
  FileCode2,
  Ruler,
  PackageCheck,
  Loader2,
} from 'lucide-react';
import { COMPANY_DETAILS, SERVICES, ENGINEERING_SIDE } from '../../data/mkrdData';
import { MkrdCinematicBackground } from '../MkrdCinematicBackground';
import { TraceField } from '../TraceField';
import {
  GhostWord,
  MaskedHeading,
  Eyebrow,
  OffsetGrid,
  DrawRule,
  ScanBeam,
  StatStrip,
  useSectionScroll,
  useParallaxY,
  useSpotlight,
} from '../../motion/SectionFX';
import { VIEWPORT, DUR, EASE, prefersReducedMotion } from '../../motion/tokens';

interface ContactViewProps {
  onOpenQuoteModal: (serviceId?: string) => void;
}

/* ────────────────────────────────────────────────────────── the live clock ──── */

/**
 * The time where the work actually happens.
 *
 * A contact page that says "24/6" and nothing else is a claim. This is a fact:
 * the current time in the unit, and whether anyone is in it. It ticks, so the
 * page is never quite the same twice — and it is the smallest honest thing that
 * could sit in that slot.
 */
const useUnitClock = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return useMemo(() => {
    const fmt = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      hour: 'numeric',
      hour12: false,
    }).formatToParts(now);
    const weekday = parts.find((p) => p.type === 'weekday')?.value ?? '';
    const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
    const open = weekday !== 'Sun' && hour >= 9 && hour < 19;
    return { time: fmt.format(now), open, weekday };
  }, [now]);
};

/* ───────────────────────────────────────────────────────────── the fields ──── */

/**
 * One form field.
 *
 * Focus draws a bracket into each corner and lifts the rule underneath — the
 * same gesture a machine makes when it picks up a datum. It is one element and
 * two transforms, so a form full of them costs nothing.
 */
const Field: React.FC<{
  label: string;
  children: React.ReactNode;
  focused: boolean;
  filled: boolean;
  hint?: string;
}> = ({ label, children, focused, filled, hint }) => (
  <div className="space-y-2">
    <div className="flex items-baseline justify-between gap-3">
      <label
        className={`block text-[11px] font-mono font-bold uppercase tracking-[0.2em] transition-colors ${
          focused ? 'text-brand-300' : filled ? 'text-slate-300' : 'text-slate-500'
        }`}
      >
        {label}
      </label>
      {hint ? <span className="text-[10px] font-mono text-slate-600">{hint}</span> : null}
    </div>

    <div className="relative">
      {children}

      {/* corner brackets — drawn only while the field has focus */}
      <AnimatePresence>
        {focused && (
          <>
            {(
              [
                'top-0 left-0 border-t border-l rounded-tl-xl',
                'top-0 right-0 border-t border-r rounded-tr-xl',
                'bottom-0 left-0 border-b border-l rounded-bl-xl',
                'bottom-0 right-0 border-b border-r rounded-br-xl',
              ] as const
            ).map((pos) => (
              <motion.span
                key={pos}
                aria-hidden
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: DUR.fast, ease: EASE.out }}
                className={`absolute w-3.5 h-3.5 border-brand-400 pointer-events-none ${pos}`}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      <motion.span
        aria-hidden
        initial={false}
        animate={{ scaleX: focused ? 1 : 0 }}
        transition={{ duration: DUR.base, ease: EASE.out }}
        className="absolute -bottom-px left-3 right-3 h-px origin-left bg-gradient-to-r from-brand-400 via-brand-500 to-accent pointer-events-none"
      />
    </div>
  </div>
);

const inputClass =
  'w-full px-5 py-4 rounded-xl bg-ink-900/60 border border-ink-700 text-white text-sm ' +
  'placeholder:text-slate-600 focus:border-brand-500/70 focus:bg-ink-950/80 transition-colors outline-none';

/* ─────────────────────────────────────────────────────────────── the page ──── */

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

  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [fileAttached, setFileAttached] = useState(false);
  const [fileName, setFileName] = useState('');
  const [focus, setFocus] = useState<string | null>(null);
  const [ticket] = useState(() => `MKRD-REQ-${Math.floor(100000 + Math.random() * 900000)}`);

  const heroRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useSectionScroll(heroRef);
  const { scrollYProgress: formProgress } = useSectionScroll(formRef);
  const heroY = useParallaxY(heroProgress, 10);
  const formY = useParallaxY(formProgress, 6);

  const clock = useUnitClock();
  const reduced = prefersReducedMotion();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const serviceName = SERVICES.find((s) => s.id === formData.service)?.title || formData.service;
    const subject = encodeURIComponent(
      `Engineering Request: ${serviceName} from ${formData.company || formData.name}`,
    );
    const body = encodeURIComponent(`Name: ${formData.name}
Company: ${formData.company || 'N/A'}
Phone: ${formData.phone}
Email: ${formData.email}
Service: ${serviceName}
NDA Requested: ${formData.ndaRequested ? 'Yes' : 'No'}
Reference: ${ticket}

Project Details:
${formData.message}${
      fileAttached
        ? `\n\n[Note: Please attach your file (${fileName}) to this email manually before sending.]`
        : ''
    }`);

    // A short hold before the handoff: the mail client takes a moment to come
    // up, and a button that changes state is the difference between "it worked"
    // and "did I click it?".
    setSending(true);
    window.setTimeout(
      () => {
        window.location.href = `mailto:${COMPANY_DETAILS.email}?subject=${subject}&body=${body}`;
        setSending(false);
        setSubmitted(true);
      },
      reduced ? 0 : 900,
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
      setFileAttached(true);
    }
  };

  const cards = [
    {
      icon: MapPin,
      title: 'The unit',
      detail1: COMPANY_DETAILS.address,
      detail2: `${COMPANY_DETAILS.coordinates.lat} · ${COMPANY_DETAILS.coordinates.long}`,
      action: 'Open in Maps',
      link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY_DETAILS.address)}`,
      external: true,
      tone: 'brand' as const,
    },
    {
      icon: Phone,
      title: 'Speak to someone',
      detail1: COMPANY_DETAILS.phoneFormatted,
      detail2: clock.open
        ? `${clock.time} IST — someone is in`
        : `${clock.time} IST — leave a message`,
      action: 'Call now',
      link: `tel:${COMPANY_DETAILS.phone.replace(/[^0-9+]/g, '')}`,
      external: false,
      tone: 'ok' as const,
    },
    {
      icon: Mail,
      title: 'Send files',
      detail1: COMPANY_DETAILS.email,
      detail2: 'STEP, IGES, STL, DXF or a written brief',
      action: 'Compose email',
      link: `mailto:${COMPANY_DETAILS.email}`,
      external: false,
      tone: 'blue' as const,
    },
  ];

  const steps = [
    {
      icon: FileCode2,
      title: 'We read the part, not the form',
      body: 'Geometry, material and quantity first. If the brief is a paragraph rather than a model, that is fine — most of them are.',
    },
    {
      icon: Ruler,
      title: 'We say what it will actually cost',
      body: 'Process, grade, lead time, and whether the part will print well as drawn. If it will not, we say what to change before you pay for it.',
    },
    {
      icon: PackageCheck,
      title: 'It runs here, or it is routed',
      body: `Printing, software and web run in this unit. Mould, die and fixture work goes to ${ENGINEERING_SIDE.name} rather than being quoted twice.`,
    },
  ];

  return (
    <div className="relative min-h-screen bg-ink-950 text-slate-300 pt-28 pb-24 overflow-hidden">
      <MkrdCinematicBackground />

      {/* ── header ─────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <GhostWord text="GURUGRAM" progress={heroProgress} strength={16} />

        <motion.div style={{ y: heroY }} className="relative z-10 text-center mb-16 sm:mb-20">
          <Eyebrow tone={clock.open ? 'ok' : 'brand'}>
            {clock.time} IST · {clock.open ? 'the unit is open' : 'out of hours'}
          </Eyebrow>

          <MaskedHeading
            as="h1"
            align="center"
            text={'Send us the part.\nWe will tell you the truth about it.'}
            highlight={['truth', 'about', 'it.']}
            className="mt-6 text-3xl sm:text-5xl lg:text-6xl font-display font-black text-white tracking-tight leading-[1.06]"
          />

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: DUR.slow, ease: EASE.out, delay: 0.25 }}
            className="mt-6 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed"
          >
            A drawing, an STL, or a paragraph describing the job. We come back with what it costs,
            how long it takes, and whether it should be printed here or routed to our engineering
            side.
          </motion.p>
        </motion.div>

        {/* ── the three ways in ─────────────────────────────────────────── */}
        <OffsetGrid className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10" offset={false}>
          {cards.map((card) => (
            <ContactCard key={card.title} {...card} />
          ))}
        </OffsetGrid>
      </section>

      {/* ── what happens after you press send ──────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 sm:mt-32">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div>
            <Eyebrow tone="blue">After you press send</Eyebrow>
            <MaskedHeading
              as="h2"
              text={'Three steps, no\nsales call in between.'}
              highlight={['no', 'sales', 'call']}
              className="mt-5 text-2xl sm:text-4xl font-display font-black text-white leading-[1.1] tracking-tight"
            />
          </div>
          <StatStrip
            className="shrink-0"
            items={[
              { value: 2018, label: 'Established', count: false },
              { value: SERVICES.length, label: 'Services' },
              { value: 0.1, decimals: 1, suffix: 'mm', label: 'Layer resolution' },
            ]}
          />
        </div>

        <DrawRule className="mb-12" />

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: DUR.slow, ease: EASE.out, delay: i * 0.12 }}
              className="relative p-7 rounded-3xl bg-ink-900/40 border border-ink-700/70 backdrop-blur-md overflow-hidden group"
            >
              <ScanBeam delay={0.35 + i * 0.12} tone={i === 2 ? 'accent' : 'brand'} />
              <div className="flex items-center justify-between mb-6">
                <div className="w-11 h-11 rounded-xl bg-brand-950/60 border border-brand-900/70 flex items-center justify-center text-brand-300">
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="font-mono text-[11px] text-slate-600 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-3 leading-snug">
                {step.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.body}</p>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* ── the form ───────────────────────────────────────────────────── */}
      <section ref={formRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 sm:mt-32">
        <motion.div
          style={{ y: formY }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: DUR.slow, ease: EASE.out }}
          className="relative rounded-[2rem] border border-ink-700/70 bg-ink-950/80 backdrop-blur-2xl shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* the board behind the glass: routes fanning in from both edges and
              landing on pads under the form */}
          <TraceField className="opacity-[0.55]" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-950/20 via-transparent to-ink-950/60 pointer-events-none" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[760px] h-[380px] bg-brand-700/10 blur-[140px] rounded-full pointer-events-none" />

          <div className="relative z-10 p-6 sm:p-12">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="receipt"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: DUR.slow, ease: EASE.out }}
                  className="text-center py-16"
                >
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: DUR.base, ease: EASE.spring, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(16,185,129,0.18)] mb-8"
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </motion.div>

                  <h2 className="text-3xl sm:text-4xl font-display font-black text-white mb-4">
                    That is with us.
                  </h2>
                  <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed mb-10">
                    Your mail client should have opened with everything filled in — send it and we
                    have it. If it did not, write to{' '}
                    <a className="text-brand-300 hover:text-brand-200" href={`mailto:${COMPANY_DETAILS.email}`}>
                      {COMPANY_DETAILS.email}
                    </a>{' '}
                    and quote the reference below.
                  </p>

                  <div className="inline-flex flex-col p-6 rounded-2xl bg-ink-900/70 border border-ink-700/70 text-xs font-mono text-slate-400 text-left gap-3 mb-10 w-full max-w-sm">
                    {[
                      ['REFERENCE', <span key="r" className="text-brand-300 font-bold">{ticket}</span>],
                      ['UNIT', <span key="u" className="text-white">Gurugram, Haryana</span>],
                      [
                        'LOCAL TIME',
                        <span key="t" className="text-white tabular-nums">{clock.time} IST</span>,
                      ],
                    ].map(([k, v], i) => (
                      <div
                        key={String(k)}
                        className={`flex justify-between gap-8 ${i < 2 ? 'border-b border-ink-800 pb-3' : ''}`}
                      >
                        <span>{k}</span>
                        {v}
                      </div>
                    ))}
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="px-8 py-4 rounded-full bg-ink-800 hover:bg-ink-700 text-white font-bold text-sm border border-ink-600 transition-colors"
                    >
                      Send another
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 relative">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                        Project brief
                      </h2>
                      <p className="text-[11px] font-mono text-brand-400 mt-2 uppercase tracking-[0.2em] font-bold">
                        Goes straight to {COMPANY_DETAILS.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-300 font-mono bg-emerald-950/30 px-4 py-2 rounded-full border border-emerald-800/50">
                      <Shield className="w-4 h-4" />
                      NDA on request
                    </div>
                    <DrawRule className="absolute bottom-0 inset-x-0" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Field label="Your name" focused={focus === 'name'} filled={!!formData.name}>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="Who we are replying to"
                        value={formData.name}
                        onFocus={() => setFocus('name')}
                        onBlur={() => setFocus(null)}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Email" focused={focus === 'email'} filled={!!formData.email}>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        placeholder="name@company.com"
                        value={formData.email}
                        onFocus={() => setFocus('email')}
                        onBlur={() => setFocus(null)}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Phone" focused={focus === 'phone'} filled={!!formData.phone}>
                      <input
                        id="contact-phone"
                        type="tel"
                        required
                        placeholder="+91"
                        value={formData.phone}
                        onFocus={() => setFocus('phone')}
                        onBlur={() => setFocus(null)}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={inputClass}
                      />
                    </Field>

                    <Field
                      label="Company"
                      hint="optional"
                      focused={focus === 'company'}
                      filled={!!formData.company}
                    >
                      <input
                        id="contact-company"
                        type="text"
                        placeholder="Company name"
                        value={formData.company}
                        onFocus={() => setFocus('company')}
                        onBlur={() => setFocus(null)}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <Field label="What do you need" focused={focus === 'service'} filled>
                    <select
                      id="contact-service"
                      value={formData.service}
                      onFocus={() => setFocus('service')}
                      onBlur={() => setFocus(null)}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className={`${inputClass} appearance-none cursor-pointer pr-12`}
                    >
                      {SERVICES.map((s) => (
                        <option key={s.id} value={s.id} className="bg-ink-900">
                          {s.title}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                      <ChevronRight className="w-5 h-5 text-slate-500 rotate-90" />
                    </div>
                  </Field>

                  <div className="space-y-2">
                    <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em]">
                      Files <span className="text-slate-600">optional</span>
                    </div>
                    <motion.label
                      whileHover={reduced ? undefined : { scale: 1.006 }}
                      transition={{ duration: DUR.fast, ease: EASE.out }}
                      className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden group ${
                        fileAttached
                          ? 'border-emerald-600/60 bg-emerald-950/20'
                          : 'border-ink-700 hover:border-brand-500/60 bg-ink-900/40 hover:bg-ink-800/50'
                      }`}
                    >
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${
                          fileAttached
                            ? 'bg-emerald-900/40 text-emerald-300'
                            : 'bg-ink-800 text-slate-400 group-hover:bg-brand-900/40 group-hover:text-brand-300'
                        }`}
                      >
                        {fileAttached ? (
                          <CheckCircle2 className="w-7 h-7" />
                        ) : (
                          <UploadCloud className="w-7 h-7" />
                        )}
                      </div>
                      <span className="text-sm text-slate-200 font-bold mb-1.5 text-center px-4">
                        {fileAttached ? fileName : 'Attach a model or a drawing'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono text-center px-4">
                        {fileAttached
                          ? 'Attach it to the email your client opens'
                          : 'STEP · IGES · STL · DXF · PDF'}
                      </span>
                      <input
                        type="file"
                        accept=".step,.stp,.iges,.igs,.stl,.dxf,.pdf,.zip"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </motion.label>
                  </div>

                  <Field
                    label="The job"
                    hint={`${formData.message.length} characters`}
                    focused={focus === 'message'}
                    filled={!!formData.message}
                  >
                    <textarea
                      id="contact-message"
                      rows={5}
                      required
                      placeholder="Material, quantity, finish, when you need it. A paragraph is plenty."
                      value={formData.message}
                      onFocus={() => setFocus('message')}
                      onBlur={() => setFocus(null)}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={`${inputClass} resize-none`}
                    />
                  </Field>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-8 relative">
                    <DrawRule className="absolute top-0 inset-x-0" />
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <span className="relative flex items-center justify-center">
                        <input
                          id="contact-nda"
                          type="checkbox"
                          checked={formData.ndaRequested}
                          onChange={(e) =>
                            setFormData({ ...formData, ndaRequested: e.target.checked })
                          }
                          className="peer appearance-none w-6 h-6 border-2 border-ink-600 rounded bg-ink-900 checked:bg-brand-600 checked:border-brand-600 focus-visible:outline-2 focus-visible:outline-brand-400 transition-colors cursor-pointer"
                        />
                        <CheckCircle2 className="w-4 h-4 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors font-bold">
                          Send an NDA first
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono mt-0.5">
                          We counter-sign before opening any file.
                        </span>
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 disabled:opacity-80 text-white font-bold text-sm tracking-wide shadow-[0_0_24px_rgba(139,125,255,0.22)] hover:shadow-[0_0_36px_rgba(139,125,255,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 group/btn overflow-hidden relative"
                    >
                      <span className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.28)_50%,transparent_75%)] translate-x-[-150%] group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                      <span className="relative z-10">{sending ? 'Opening your mail…' : 'Send it'}</span>
                      {sending ? (
                        <Loader2 className="w-4 h-4 relative z-10 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] font-mono text-slate-600 text-center pt-2">
                    Prefer a guided form?{' '}
                    <button
                      type="button"
                      onClick={() => onOpenQuoteModal(formData.service)}
                      className="text-brand-400 hover:text-brand-300 underline underline-offset-4"
                    >
                      Use the quote builder instead
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

/* ───────────────────────────────────────────────────────────── one card ──── */

const ContactCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail1: string;
  detail2: string;
  action: string;
  link: string;
  external: boolean;
  tone: 'brand' | 'blue' | 'ok';
}> = ({ icon: Icon, title, detail1, detail2, action, link, external, tone }) => {
  const spot = useSpotlight();
  const accent =
    tone === 'ok'
      ? 'text-emerald-300 border-emerald-900/70 bg-emerald-950/40'
      : tone === 'blue'
        ? 'text-blue-300 border-blue-900/70 bg-blue-950/40'
        : 'text-brand-300 border-brand-900/70 bg-brand-950/40';

  return (
    <motion.div
      onPointerMove={spot.onPointerMove}
      onPointerLeave={spot.onPointerLeave}
      whileHover={{ y: -6 }}
      transition={{ duration: DUR.base, ease: EASE.out }}
      className="relative h-full rounded-2xl border border-ink-700/70 bg-ink-900/50 backdrop-blur-xl p-6 flex flex-col items-start overflow-hidden group"
    >
      <motion.div
        aria-hidden
        style={{ background: spot.background }}
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
      <ScanBeam tone={tone === 'ok' ? 'brand' : tone} delay={0.4} />

      <div className="absolute top-0 right-0 p-4 opacity-[0.07] group-hover:opacity-[0.14] transition-opacity">
        <Icon className="w-16 h-16" />
      </div>

      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>

      <h3 className="text-[11px] font-mono font-bold text-slate-400 mb-2 tracking-[0.2em] uppercase">
        {title}
      </h3>
      <p className="text-white font-medium text-sm mb-1 relative z-10">{detail1}</p>
      <p className="text-slate-500 text-xs mb-6 font-mono relative z-10">{detail2}</p>

      <a
        href={link}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className="mt-auto text-brand-300 text-xs font-bold flex items-center gap-1 hover:text-brand-200 transition-colors relative z-10"
      >
        {action}
        <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
      </a>
    </motion.div>
  );
};
