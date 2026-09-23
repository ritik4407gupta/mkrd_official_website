import React, { useMemo, useState } from 'react';
import {
  LayoutDashboard, FilePlus2, Files, Users, Package, Truck,
  FileSpreadsheet, Settings, Printer, Plus, Trash2, Search,
} from 'lucide-react';
import {
  computeLineItem, computeDocTotals, formatCurrency, amountInWords,
  determineSupplyType, extractStateCodeFromGstin, formatDocumentNumber,
} from './gstEngine';
import {
  SELLER, CUSTOMERS, PRODUCTS, RECENT_DOCS, GSTR1_SUMMARY, DEFAULT_LINES,
  type DemoCustomer,
} from './gstDemoData';

/**
 * A faithful web reproduction of the GST Billing Suite, for the 3D workstation.
 *
 * This is a demonstration, not the product: there is no database, no NIC
 * connection and no filing. What IS real is the arithmetic — every figure on
 * screen comes from gstEngine.ts, which is a verified port of the desktop
 * app's own calculator, so the totals here are the totals it would print.
 *
 * Structure follows the real application: the same sidebar sections, the same
 * twelve columns in the item grid, the same document types and status values.
 */

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'new', label: 'New Document', icon: FilePlus2 },
  { id: 'documents', label: 'Documents', icon: Files },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'eway', label: 'E-Way Bills', icon: Truck },
  { id: 'gstr', label: 'GSTR Reports', icon: FileSpreadsheet },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

type ScreenId = (typeof NAV)[number]['id'];

interface Line { key: number; productId: string; qty: number; discountPct: number }

const STATUS_STYLE: Record<string, string> = {
  saved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  exported: 'bg-blue-50 text-blue-700 ring-blue-200',
  draft: 'bg-slate-100 text-slate-600 ring-slate-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  partial: 'bg-amber-50 text-amber-700 ring-amber-200',
  unpaid: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const Badge = ({ v }: { v: string }) => (
  <span className={`px-1.5 py-[1px] rounded text-[9px] font-semibold uppercase tracking-wide ring-1 ${STATUS_STYLE[v] ?? STATUS_STYLE.draft}`}>
    {v}
  </span>
);

export const GstBillingApp: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [screen, setScreen] = useState<ScreenId>('new');
  const [customer, setCustomer] = useState<DemoCustomer>(CUSTOMERS[0]);
  const [lines, setLines] = useState<Line[]>(
    DEFAULT_LINES.map((l, i) => ({ key: i, ...l })),
  );

  const isIntra = determineSupplyType(
    SELLER.stateCode,
    extractStateCodeFromGstin(customer.gstin),
  );

  const computed = useMemo(
    () =>
      lines.map((l) => {
        const p = PRODUCTS.find((x) => x.id === l.productId)!;
        return { line: l, product: p, r: computeLineItem(l.qty, p.ratePaise, l.discountPct, p.gstRate, isIntra) };
      }),
    [lines, isIntra],
  );

  const totals = useMemo(() => computeDocTotals(computed.map((c) => c.r)), [computed]);
  const docNumber = formatDocumentNumber('{PREFIX}/{FYS}/{NNNN}', 143, 'MKRD', 4, new Date('2026-09-09'));

  const setLine = (key: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const addLine = () =>
    setLines((ls) => [...ls, { key: Math.max(0, ...ls.map((l) => l.key)) + 1, productId: 'p9', qty: 1, discountPct: 0 }]);

  const t = compact ? 'text-[10px]' : 'text-[11px]';

  return (
    <div className="w-full h-full flex bg-[#F5F6FA] text-[#212121] font-sans antialiased overflow-hidden select-none">
      {/* ---------------------------------------------------------- sidebar */}
      <aside className="w-[168px] shrink-0 bg-[#232A46] flex flex-col">
        <div className="px-3 pt-3 pb-2.5 border-b border-white/10">
          <div className="text-white font-bold text-[12px] leading-tight">GST Billing Suite</div>
          <div className="text-white/40 text-[9px] font-mono mt-0.5">v2.4 · MKRD</div>
        </div>
        <nav className="flex-1 py-1.5">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setScreen(id)}
              className={`w-full flex items-center gap-2 px-3 py-[7px] text-[11px] text-left transition-colors ${
                screen === id
                  ? 'bg-[#2E22E6] text-white font-semibold'
                  : 'text-[#C9CEE4] hover:bg-white/10'
              }`}
            >
              <Icon className="w-3 h-3 shrink-0" />
              {label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-2 border-t border-white/10 text-[9px] font-mono text-white/35 leading-relaxed">
          LAN SYNC · ONLINE
          <br />
          {SELLER.gstin}
        </div>
      </aside>

      {/* ------------------------------------------------------------- main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-9 shrink-0 bg-white border-b border-slate-200 flex items-center px-3 gap-3">
          <span className="font-semibold text-[12px]">
            {screen === 'new' ? 'Tax Invoice — New' : NAV.find((n) => n.id === screen)?.label}
          </span>
          <span className="text-[10px] font-mono text-slate-400">{docNumber}</span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-2 py-[3px] rounded bg-slate-100 text-slate-500 text-[10px]">
              <Search className="w-2.5 h-2.5" /> Search
            </div>
            <span className="px-1.5 py-[2px] rounded bg-amber-100 text-amber-800 text-[8px] font-bold uppercase tracking-wider">
              Demo data
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {screen === 'new' && (
            <div className="h-full flex">
              {/* ------------------------------------------- editor column */}
              <div className="flex-1 min-w-0 flex flex-col">
                {/* buyer */}
                <div className="px-3 py-2 bg-white border-b border-slate-200 grid grid-cols-[1fr_auto] gap-3 items-end">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                      Bill to
                    </label>
                    <select
                      value={customer.id}
                      onChange={(e) => setCustomer(CUSTOMERS.find((c) => c.id === e.target.value)!)}
                      className="w-full border border-slate-300 rounded px-2 py-1 text-[11px] bg-white focus:outline-none focus:ring-2 focus:ring-[#2E22E6]/40"
                    >
                      {CUSTOMERS.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <div className="mt-1 text-[10px] text-slate-500 font-mono">
                      {customer.gstin} · {customer.stateName} · {customer.address}
                    </div>
                  </div>
                  <div
                    className={`px-2.5 py-1.5 rounded text-[10px] font-semibold whitespace-nowrap ring-1 ${
                      isIntra
                        ? 'bg-[#EFEDFF] text-[#241BB4] ring-[#C2BBFF]'
                        : 'bg-amber-50 text-amber-800 ring-amber-200'
                    }`}
                  >
                    {isIntra ? 'Intra-state · CGST + SGST' : 'Inter-state · IGST'}
                    <div className="font-mono font-normal text-[9px] opacity-70 mt-0.5">
                      {SELLER.stateCode} → {extractStateCodeFromGstin(customer.gstin)}
                    </div>
                  </div>
                </div>

                {/* item grid — the product's own twelve columns */}
                <div className="flex-1 overflow-auto">
                  <table className={`w-full border-collapse ${t}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                    <thead className="sticky top-0">
                      <tr className="bg-[#EAECF3] text-slate-600">
                        {['#', 'Category', 'Item Name', 'HSN', 'Qty', 'Rate', 'Disc %', 'Taxable', 'CGST', 'SGST', 'IGST', 'Total', ''].map((h) => (
                          <th key={h} className="px-1.5 py-1.5 text-left font-semibold text-[9px] uppercase tracking-wide border-b border-slate-300 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {computed.map(({ line, product, r }, i) => (
                        <tr key={line.key} className="bg-white border-b border-slate-100 hover:bg-[#F7F8FD]">
                          <td className="px-1.5 py-1 text-slate-400">{i + 1}</td>
                          <td className="px-1.5 py-1 text-slate-500 whitespace-nowrap">{product.category}</td>
                          <td className="px-1.5 py-1">
                            <select
                              value={line.productId}
                              onChange={(e) => setLine(line.key, { productId: e.target.value })}
                              className="w-full bg-transparent border-0 p-0 text-[inherit] focus:outline-none focus:ring-1 focus:ring-[#2E22E6]/40 rounded cursor-pointer"
                            >
                              {PRODUCTS.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-1.5 py-1 font-mono text-slate-500">{product.hsn}</td>
                          <td className="px-1.5 py-1">
                            <input
                              type="number" min={0} step={1} value={line.qty}
                              onChange={(e) => setLine(line.key, { qty: Math.max(0, Number(e.target.value) || 0) })}
                              className="w-12 bg-transparent border border-transparent hover:border-slate-300 focus:border-[#2E22E6] rounded px-1 text-right focus:outline-none"
                            />
                          </td>
                          <td className="px-1.5 py-1 text-right">{formatCurrency(product.ratePaise)}</td>
                          <td className="px-1.5 py-1">
                            <input
                              type="number" min={0} max={100} step={1} value={Math.round(line.discountPct * 100)}
                              onChange={(e) => setLine(line.key, { discountPct: Math.min(100, Math.max(0, Number(e.target.value) || 0)) / 100 })}
                              className="w-10 bg-transparent border border-transparent hover:border-slate-300 focus:border-[#2E22E6] rounded px-1 text-right focus:outline-none"
                            />
                          </td>
                          <td className="px-1.5 py-1 text-right font-medium">{formatCurrency(r.taxableAmount)}</td>
                          <td className={`px-1.5 py-1 text-right ${isIntra ? '' : 'text-slate-300'}`}>
                            {isIntra ? formatCurrency(r.cgstAmount) : '—'}
                          </td>
                          <td className={`px-1.5 py-1 text-right ${isIntra ? '' : 'text-slate-300'}`}>
                            {isIntra ? formatCurrency(r.sgstAmount) : '—'}
                          </td>
                          <td className={`px-1.5 py-1 text-right ${isIntra ? 'text-slate-300' : ''}`}>
                            {isIntra ? '—' : formatCurrency(r.igstAmount)}
                          </td>
                          <td className="px-1.5 py-1 text-right font-semibold">{formatCurrency(r.lineTotal)}</td>
                          <td className="px-1 py-1">
                            {lines.length > 1 && (
                              <button
                                type="button"
                                aria-label={`Remove line ${i + 1}`}
                                onClick={() => setLines((ls) => ls.filter((l) => l.key !== line.key))}
                                className="text-slate-300 hover:text-rose-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    onClick={addLine}
                    className="m-2 flex items-center gap-1 px-2 py-1 rounded border border-dashed border-slate-300 text-[10px] text-slate-500 hover:border-[#2E22E6] hover:text-[#2E22E6]"
                  >
                    <Plus className="w-3 h-3" /> Add line
                  </button>
                </div>
              </div>

              {/* ------------------------------------------- totals column */}
              <aside className="w-[210px] shrink-0 bg-white border-l border-slate-200 flex flex-col">
                <div className="px-3 py-2 border-b border-slate-200 text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                  Document totals
                </div>
                <div className="px-3 py-2 space-y-1.5 text-[11px]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {[
                    ['Taxable value', totals.totalTaxable, true],
                    ['CGST', totals.totalCgst, isIntra],
                    ['SGST', totals.totalSgst, isIntra],
                    ['IGST', totals.totalIgst, !isIntra],
                  ].map(([label, value, show]) => (
                    <div key={label as string} className={`flex justify-between ${show ? '' : 'text-slate-300'}`}>
                      <span className="text-slate-500">{label as string}</span>
                      <span className="font-medium">{show ? formatCurrency(value as number) : '—'}</span>
                    </div>
                  ))}
                  <div className="pt-2 mt-1 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">Grand total</span>
                    <span className="text-[15px] font-bold text-[#2E22E6]">{formatCurrency(totals.grandTotal)}</span>
                  </div>
                  <p className="text-[9px] text-slate-500 leading-snug pt-1 italic">
                    {amountInWords(totals.grandTotal)}
                  </p>
                </div>
                <div className="mt-auto p-2.5 space-y-1.5 border-t border-slate-200">
                  <button type="button" className="w-full py-1.5 rounded bg-[#2E22E6] hover:bg-[#241BB4] text-white text-[11px] font-semibold transition-colors">
                    Save invoice
                  </button>
                  <button type="button" className="w-full py-1.5 rounded border border-slate-300 text-slate-600 text-[11px] font-medium flex items-center justify-center gap-1 hover:border-slate-400">
                    <Printer className="w-3 h-3" /> Print preview
                  </button>
                  <div className="text-[8px] text-slate-400 font-mono leading-relaxed pt-1">
                    ORIGINAL FOR RECIPIENT
                    <br />
                    {SELLER.bank}
                  </div>
                </div>
              </aside>
            </div>
          )}

          {screen === 'dashboard' && (
            <div className="p-3 h-full overflow-auto">
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  ['Outward supplies · Aug', formatCurrency(89823000)],
                  ['Tax collected · Aug', formatCurrency(16168140)],
                  ['Invoices issued', '34'],
                  ['E-way bills active', '6'],
                ].map(([l, v]) => (
                  <div key={l} className="bg-white rounded border border-slate-200 p-2.5">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">{l}</div>
                    <div className="text-[15px] font-bold mt-1" style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</div>
                  </div>
                ))}
              </div>
              <DocTable rows={RECENT_DOCS} title="Recent documents" />
            </div>
          )}

          {screen === 'documents' && (
            <div className="p-3 h-full overflow-auto">
              <DocTable rows={RECENT_DOCS} title="All documents" />
            </div>
          )}

          {screen === 'gstr' && (
            <div className="p-3 h-full overflow-auto">
              <div className="bg-white rounded border border-slate-200 overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-semibold">GSTR-1 · Outward supplies · Aug 2026</span>
                  <span className="text-[9px] font-mono text-slate-400">Ready to export</span>
                </div>
                <table className="w-full text-[10px]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  <thead className="bg-[#EAECF3] text-slate-600">
                    <tr>
                      {['Table', 'Description', 'Invoices', 'Taxable value', 'Tax'].map((h) => (
                        <th key={h} className="px-2 py-1.5 text-left font-semibold text-[9px] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {GSTR1_SUMMARY.map((r) => (
                      <tr key={r.table} className="border-b border-slate-100">
                        <td className="px-2 py-1.5 font-mono font-semibold">{r.table}</td>
                        <td className="px-2 py-1.5 text-slate-600">{r.label}</td>
                        <td className="px-2 py-1.5">{r.invoices}</td>
                        <td className="px-2 py-1.5 text-right">{formatCurrency(r.taxablePaise)}</td>
                        <td className="px-2 py-1.5 text-right">{formatCurrency(r.taxPaise)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!['new', 'dashboard', 'documents', 'gstr'].includes(screen) && (
            <div className="h-full flex flex-col items-center justify-center gap-1 text-slate-400">
              <span className="text-[12px] font-semibold text-slate-500">
                {NAV.find((n) => n.id === screen)?.label}
              </span>
              <span className="text-[10px]">Available in the full application</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DocTable = ({ rows, title }: { rows: typeof RECENT_DOCS; title: string }) => (
  <div className="bg-white rounded border border-slate-200 overflow-hidden">
    <div className="px-3 py-2 border-b border-slate-200 text-[11px] font-semibold">{title}</div>
    <table className="w-full text-[10px]" style={{ fontVariantNumeric: 'tabular-nums' }}>
      <thead className="bg-[#EAECF3] text-slate-600">
        <tr>
          {['Number', 'Date', 'Customer', 'Type', 'Total', 'Status', 'Payment', 'E-Way Bill'].map((h) => (
            <th key={h} className="px-2 py-1.5 text-left font-semibold text-[9px] uppercase tracking-wide">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.number} className="border-b border-slate-100 hover:bg-[#F7F8FD]">
            <td className="px-2 py-1.5 font-mono">{r.number}</td>
            <td className="px-2 py-1.5 text-slate-500 whitespace-nowrap">{r.date}</td>
            <td className="px-2 py-1.5 truncate max-w-[180px]">{r.customer}</td>
            <td className="px-2 py-1.5 font-mono font-semibold text-slate-500">{r.type}</td>
            <td className="px-2 py-1.5 text-right">{formatCurrency(r.totalPaise)}</td>
            <td className="px-2 py-1.5"><Badge v={r.status} /></td>
            <td className="px-2 py-1.5"><Badge v={r.payment} /></td>
            <td className="px-2 py-1.5 font-mono text-slate-400">{r.ewb ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default GstBillingApp;
