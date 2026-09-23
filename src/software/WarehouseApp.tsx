import React, { useMemo, useState } from 'react';
import {
  LayoutDashboard, Boxes, ArrowLeftRight, ClipboardList, Radio,
  Users, Truck, Trash2, RefreshCw, BarChart3, ScanLine,
} from 'lucide-react';
import { formatCurrency } from './gstEngine';

/**
 * Warehouse Manager, reproduced for the workstation demo.
 *
 * Sections and vocabulary follow the real PyQt application: the same sidebar
 * (with the role-gated RFID Admin), the same movement types — issue, return,
 * transfer and scrap — against employees and vendors, and the same LAN sync
 * indicator. Data is invented; the behaviour is not.
 */

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'requests', label: 'Requests', icon: ClipboardList },
  { id: 'rfid', label: 'RFID Admin', icon: Radio },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'vendors', label: 'Vendors', icon: Truck },
  { id: 'scrap', label: 'Scrap Inventory', icon: Trash2 },
  { id: 'sync', label: 'LAN Sync', icon: RefreshCw },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
] as const;

type ScreenId = (typeof NAV)[number]['id'];

interface Item {
  code: string; name: string; category: string; stock: number; min: number;
  unit: string; valuePaise: number; rfid: boolean;
}

const ITEMS: Item[] = [
  { code: 'TL-0412', name: 'Carbide End Mill 8 mm', category: 'Cutting Tools', stock: 42, min: 20, unit: 'pc', valuePaise: 128000, rfid: true },
  { code: 'TL-0418', name: 'Carbide End Mill 12 mm', category: 'Cutting Tools', stock: 11, min: 15, unit: 'pc', valuePaise: 196000, rfid: true },
  { code: 'MS-2201', name: 'P20 Mould Steel Block 200×150', category: 'Raw Material', stock: 6, min: 4, unit: 'blk', valuePaise: 4850000, rfid: false },
  { code: 'MS-2208', name: 'H13 Hardened Insert Blank', category: 'Raw Material', stock: 3, min: 6, unit: 'blk', valuePaise: 7120000, rfid: false },
  { code: 'HR-1103', name: 'Hot Runner Nozzle Tip', category: 'Mould Components', stock: 28, min: 12, unit: 'pc', valuePaise: 845000, rfid: true },
  { code: 'EJ-0907', name: 'Ejector Pin Ø4 × 200', category: 'Mould Components', stock: 164, min: 60, unit: 'pc', valuePaise: 32000, rfid: false },
  { code: 'FL-3310', name: 'PETG Filament 1.75 mm — 1 kg', category: 'Additive', stock: 19, min: 8, unit: 'spool', valuePaise: 145000, rfid: true },
  { code: 'FL-3316', name: 'CF Nylon Filament — 750 g', category: 'Additive', stock: 4, min: 5, unit: 'spool', valuePaise: 480000, rfid: true },
];

const MOVEMENTS = [
  { ts: '09 Sep · 11:42', type: 'ISSUE', item: 'TL-0412', qty: 4, party: 'R. Yadav · Tool Room', ref: 'RQ-2211' },
  { ts: '09 Sep · 10:15', type: 'RETURN', item: 'HR-1103', qty: 2, party: 'S. Kumar · Assembly', ref: 'RQ-2208' },
  { ts: '08 Sep · 17:03', type: 'INWARD', item: 'FL-3310', qty: 12, party: 'Meridian Supplies', ref: 'PO-0884' },
  { ts: '08 Sep · 15:28', type: 'TRANSFER', item: 'MS-2201', qty: 1, party: 'Bay B → Bay D', ref: 'TR-0142' },
  { ts: '08 Sep · 12:10', type: 'SCRAP', item: 'EJ-0907', qty: 6, party: 'QC reject · bent', ref: 'SC-0071' },
  { ts: '07 Sep · 16:49', type: 'ISSUE', item: 'FL-3316', qty: 1, party: 'A. Sharma · Additive', ref: 'RQ-2205' },
];

const TYPE_STYLE: Record<string, string> = {
  ISSUE: 'text-brand-300 bg-brand-950/70 ring-brand-800',
  RETURN: 'text-emerald-300 bg-emerald-950/60 ring-emerald-800',
  INWARD: 'text-emerald-200 bg-emerald-900/40 ring-emerald-700',
  TRANSFER: 'text-slate-300 bg-slate-800/70 ring-slate-600',
  SCRAP: 'text-rose-300 bg-rose-950/60 ring-rose-800',
};

export const WarehouseApp: React.FC = () => {
  const [screen, setScreen] = useState<ScreenId>('inventory');
  const [scanned, setScanned] = useState<string | null>(null);

  const lowStock = useMemo(() => ITEMS.filter((i) => i.stock < i.min), []);
  const totalValue = useMemo(
    () => ITEMS.reduce((a, i) => a + i.stock * i.valuePaise, 0),
    [],
  );

  return (
    <div className="w-full h-full flex bg-[#1C1C22] text-[#D9DDEA] font-sans antialiased overflow-hidden select-none">
      <aside className="w-[160px] shrink-0 bg-[#141419] border-r border-white/5 flex flex-col">
        <div className="px-3 pt-3 pb-2.5 border-b border-white/5">
          <div className="text-white font-bold text-[12px]">Warehouse Manager</div>
          <div className="text-white/35 text-[9px] font-mono mt-0.5">v1.0 · MKRD</div>
        </div>
        <nav className="flex-1 py-1.5 overflow-auto">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setScreen(id)}
              className={`w-full flex items-center gap-2 px-3 py-[6px] text-[10.5px] text-left transition-colors ${
                screen === id ? 'bg-[#2E22E6] text-white font-semibold' : 'text-[#9DA3BD] hover:bg-white/5'
              }`}
            >
              <Icon className="w-3 h-3 shrink-0" />
              {label}
              {id === 'rfid' && (
                <span className="ml-auto text-[7px] font-mono px-1 rounded bg-white/10 text-white/50">ADMIN</span>
              )}
            </button>
          ))}
        </nav>
        <div className="px-3 py-2 border-t border-white/5 text-[9px] font-mono text-emerald-400/80 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          LAN SYNC · 3 NODES
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-9 shrink-0 bg-[#232329] border-b border-white/5 flex items-center px-3 gap-3">
          <span className="font-semibold text-[12px] text-white">
            {NAV.find((n) => n.id === screen)?.label}
          </span>
          {lowStock.length > 0 && (
            <span className="px-1.5 py-[2px] rounded bg-amber-500/15 text-amber-300 text-[9px] font-semibold ring-1 ring-amber-500/30">
              {lowStock.length} below minimum
            </span>
          )}
          <span className="ml-auto px-1.5 py-[2px] rounded bg-amber-500/15 text-amber-300 text-[8px] font-bold uppercase tracking-wider">
            Demo data
          </span>
        </header>

        <div className="flex-1 overflow-auto p-3">
          {screen === 'dashboard' && (
            <>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  ['SKUs tracked', String(ITEMS.length)],
                  ['Stock value', formatCurrency(totalValue)],
                  ['Below minimum', String(lowStock.length)],
                  ['RFID tagged', String(ITEMS.filter((i) => i.rfid).length)],
                ].map(([l, v]) => (
                  <div key={l} className="bg-[#232329] rounded border border-white/5 p-2.5">
                    <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">{l}</div>
                    <div className="text-[15px] font-bold text-white mt-1" style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</div>
                  </div>
                ))}
              </div>
              <Panel title="Below minimum level">
                <Table head={['Code', 'Item', 'On hand', 'Minimum', 'Short by']}>
                  {lowStock.map((i) => (
                    <tr key={i.code} className="border-b border-white/5">
                      <td className="px-2 py-1.5 font-mono text-brand-300">{i.code}</td>
                      <td className="px-2 py-1.5">{i.name}</td>
                      <td className="px-2 py-1.5 text-right">{i.stock} {i.unit}</td>
                      <td className="px-2 py-1.5 text-right text-slate-500">{i.min} {i.unit}</td>
                      <td className="px-2 py-1.5 text-right text-amber-300 font-semibold">{i.min - i.stock}</td>
                    </tr>
                  ))}
                </Table>
              </Panel>
            </>
          )}

          {screen === 'inventory' && (
            <Panel title="Inventory">
              <Table head={['Code', 'Item', 'Category', 'On hand', 'Min', 'Unit value', 'Stock value', 'RFID']}>
                {ITEMS.map((i) => (
                  <tr key={i.code} className="border-b border-white/5 hover:bg-white/[0.03]">
                    <td className="px-2 py-1.5 font-mono text-brand-300">{i.code}</td>
                    <td className="px-2 py-1.5 text-white">{i.name}</td>
                    <td className="px-2 py-1.5 text-slate-400">{i.category}</td>
                    <td className={`px-2 py-1.5 text-right font-semibold ${i.stock < i.min ? 'text-amber-300' : ''}`}>
                      {i.stock}
                    </td>
                    <td className="px-2 py-1.5 text-right text-slate-500">{i.min}</td>
                    <td className="px-2 py-1.5 text-right">{formatCurrency(i.valuePaise)}</td>
                    <td className="px-2 py-1.5 text-right">{formatCurrency(i.stock * i.valuePaise)}</td>
                    <td className="px-2 py-1.5">
                      {i.rfid ? (
                        <span className="text-[9px] font-mono px-1 rounded bg-brand-950/70 text-brand-300 ring-1 ring-brand-800">TAG</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>
            </Panel>
          )}

          {(screen === 'transactions' || screen === 'requests' || screen === 'scrap') && (
            <Panel title="Movement ledger">
              <Table head={['When', 'Type', 'Item', 'Qty', 'Party / Location', 'Reference']}>
                {MOVEMENTS.filter((m) => (screen === 'scrap' ? m.type === 'SCRAP' : true)).map((m, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03]">
                    <td className="px-2 py-1.5 text-slate-400 font-mono whitespace-nowrap">{m.ts}</td>
                    <td className="px-2 py-1.5">
                      <span className={`px-1.5 py-[1px] rounded text-[9px] font-bold ring-1 ${TYPE_STYLE[m.type]}`}>{m.type}</span>
                    </td>
                    <td className="px-2 py-1.5 font-mono text-brand-300">{m.item}</td>
                    <td className="px-2 py-1.5 text-right">{m.qty}</td>
                    <td className="px-2 py-1.5 text-slate-300">{m.party}</td>
                    <td className="px-2 py-1.5 font-mono text-slate-500">{m.ref}</td>
                  </tr>
                ))}
              </Table>
            </Panel>
          )}

          {screen === 'rfid' && (
            <div className="grid grid-cols-[260px_1fr] gap-3 h-full">
              <Panel title="Scanner">
                <div className="p-3 flex flex-col items-center gap-3">
                  <div className={`w-full aspect-[4/3] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${scanned ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-brand-700/60 bg-brand-950/30'}`}>
                    <ScanLine className={`w-7 h-7 ${scanned ? 'text-emerald-400' : 'text-brand-400 animate-pulse'}`} />
                    <span className="font-mono text-[10px] text-slate-400">
                      {scanned ? `TAG ${scanned}` : 'Waiting for tag…'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setScanned(ITEMS.filter((i) => i.rfid)[Math.floor(Math.random() * 4)].code)}
                    className="w-full py-1.5 rounded bg-[#2E22E6] hover:bg-[#241BB4] text-white text-[11px] font-semibold transition-colors"
                  >
                    Simulate scan
                  </button>
                </div>
              </Panel>
              <Panel title="Tagged items">
                <Table head={['Code', 'Item', 'On hand', 'Status']}>
                  {ITEMS.filter((i) => i.rfid).map((i) => (
                    <tr key={i.code} className={`border-b border-white/5 ${scanned === i.code ? 'bg-emerald-500/10' : ''}`}>
                      <td className="px-2 py-1.5 font-mono text-brand-300">{i.code}</td>
                      <td className="px-2 py-1.5">{i.name}</td>
                      <td className="px-2 py-1.5 text-right">{i.stock}</td>
                      <td className="px-2 py-1.5 text-[9px] font-mono">
                        {scanned === i.code ? <span className="text-emerald-300">READ JUST NOW</span> : <span className="text-slate-500">IDLE</span>}
                      </td>
                    </tr>
                  ))}
                </Table>
              </Panel>
            </div>
          )}

          {['employees', 'vendors', 'sync', 'reports'].includes(screen) && (
            <div className="h-full flex flex-col items-center justify-center gap-1 text-slate-500">
              <span className="text-[12px] font-semibold text-slate-400">
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

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-[#232329] rounded border border-white/5 overflow-hidden">
    <div className="px-3 py-2 border-b border-white/5 text-[11px] font-semibold text-white">{title}</div>
    {children}
  </div>
);

const Table = ({ head, children }: { head: string[]; children: React.ReactNode }) => (
  <table className="w-full text-[10px]" style={{ fontVariantNumeric: 'tabular-nums' }}>
    <thead className="bg-white/[0.04] text-slate-400">
      <tr>
        {head.map((h) => (
          <th key={h} className="px-2 py-1.5 text-left font-semibold text-[9px] uppercase tracking-wide">{h}</th>
        ))}
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);

export default WarehouseApp;
