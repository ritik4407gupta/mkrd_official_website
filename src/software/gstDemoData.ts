/**
 * Demo data for the GST Billing Suite showcase.
 *
 * Deliberately fictional. The customer names, GSTINs and amounts here are
 * invented — a demo invoice showing a real client's name against a GSTIN we
 * made up would be a fabricated tax record, which is not something to publish
 * on a company website. The GSTINs are structurally valid (state code + PAN
 * shape + entity + Z + check char) so the state-code logic behaves exactly as
 * it does in production, but they are not real registrations.
 *
 * The seller is MKRD in Haryana (state code 06), so a Haryana buyer produces
 * CGST + SGST and any other state produces IGST — which is the switch the
 * demo is built to show.
 */

export interface DemoCustomer {
  id: string;
  name: string;
  gstin: string;
  address: string;
  stateName: string;
}

export interface DemoProduct {
  id: string;
  category: string;
  name: string;
  hsn: string;
  ratePaise: number;
  gstRate: number;
  unit: string;
}

export const SELLER = {
  name: 'MKRD DEMO SELLER',
  gstin: '06AABCM4471K1Z8',
  stateCode: '06',
  stateName: 'Haryana',
  address: 'Gurugram, Haryana 122001',
  cin: 'U29253HR2018PTC073921',
  bank: 'Sample Bank · A/C ****4471 · IFSC SMPL0000123',
};

export const CUSTOMERS: DemoCustomer[] = [
  {
    id: 'c1',
    name: 'Northline Auto Components Pvt. Ltd.',
    gstin: '06AAFCN8821L1ZK',
    address: 'Plot 44, Sector 7, IMT Manesar',
    stateName: 'Haryana',
  },
  {
    id: 'c2',
    name: 'Vaidya Polymers Pvt. Ltd.',
    gstin: '27AACCV3390M1Z4',
    address: 'MIDC Bhosari, Pune',
    stateName: 'Maharashtra',
  },
  {
    id: 'c3',
    name: 'Coastal Electricals Ltd.',
    gstin: '33AAGCC7712N1ZR',
    address: 'Ambattur Industrial Estate, Chennai',
    stateName: 'Tamil Nadu',
  },
  {
    id: 'c4',
    name: 'Bharat Precision Works',
    gstin: '09AADFB2205P1Z9',
    address: 'Site IV, Sahibabad, Ghaziabad',
    stateName: 'Uttar Pradesh',
  },
];

export const PRODUCTS: DemoProduct[] = [
  { id: 'p1', category: 'Mould Design', name: '2-Plate Injection Mould Design', hsn: '998333', ratePaise: 18500000, gstRate: 18, unit: 'Tool' },
  { id: 'p2', category: 'Mould Design', name: '3-Plate Hot Runner Mould Design', hsn: '998333', ratePaise: 31000000, gstRate: 18, unit: 'Tool' },
  { id: 'p3', category: 'Mould Design', name: 'Auto-Unscrewing Mould Design', hsn: '998333', ratePaise: 42500000, gstRate: 18, unit: 'Tool' },
  { id: 'p4', category: 'Die Casting', name: 'High-Pressure Die Casting Tool Design', hsn: '998333', ratePaise: 27500000, gstRate: 18, unit: 'Tool' },
  { id: 'p5', category: 'Sheet Metal', name: 'Progressive Tool Design', hsn: '998333', ratePaise: 21000000, gstRate: 18, unit: 'Tool' },
  { id: 'p6', category: 'Fixtures', name: 'Welding Fixture Design', hsn: '998333', ratePaise: 6750000, gstRate: 18, unit: 'Fixture' },
  { id: 'p7', category: 'Fixtures', name: 'Pad-Printing Holding Fixture', hsn: '998333', ratePaise: 4250000, gstRate: 18, unit: 'Fixture' },
  { id: 'p8', category: 'Simulation', name: 'Mould Flow Analysis Report', hsn: '998333', ratePaise: 3500000, gstRate: 18, unit: 'Report' },
  { id: 'p9', category: 'Reverse Eng.', name: '3D Scan to CAD Conversion', hsn: '998333', ratePaise: 1850000, gstRate: 18, unit: 'Part' },
  { id: 'p10', category: 'Additive', name: 'FDM Prototype — PETG', hsn: '392690', ratePaise: 285000, gstRate: 18, unit: 'Piece' },
  { id: 'p11', category: 'Additive', name: 'FDM Prototype — CF Nylon', hsn: '392690', ratePaise: 640000, gstRate: 18, unit: 'Piece' },
  { id: 'p12', category: 'Animation', name: 'Mould Assembly Animation', hsn: '998333', ratePaise: 2400000, gstRate: 18, unit: 'Sequence' },
];

export interface DemoDocRow {
  number: string;
  date: string;
  customer: string;
  type: 'IN' | 'QT' | 'PI' | 'DC' | 'PO';
  totalPaise: number;
  status: 'saved' | 'draft' | 'exported' | 'cancelled';
  payment: 'paid' | 'partial' | 'unpaid';
  ewb: string | null;
}

export const RECENT_DOCS: DemoDocRow[] = [
  { number: 'MKRD/25-26/0142', date: '02 Sep 2026', customer: 'Northline Auto Components Pvt. Ltd.', type: 'IN', totalPaise: 21830000, status: 'saved', payment: 'unpaid', ewb: '371002884516' },
  { number: 'MKRD/25-26/0141', date: '29 Aug 2026', customer: 'Vaidya Polymers Pvt. Ltd.', type: 'IN', totalPaise: 36580000, status: 'exported', payment: 'paid', ewb: '371002881204' },
  { number: 'MKRD/25-26/0140', date: '26 Aug 2026', customer: 'Coastal Electricals Ltd.', type: 'IN', totalPaise: 8024000, status: 'exported', payment: 'partial', ewb: null },
  { number: 'MKRD-Q/25-26/0067', date: '22 Aug 2026', customer: 'Bharat Precision Works', type: 'QT', totalPaise: 50150000, status: 'saved', payment: 'unpaid', ewb: null },
  { number: 'MKRD/25-26/0139', date: '19 Aug 2026', customer: 'Northline Auto Components Pvt. Ltd.', type: 'IN', totalPaise: 4130000, status: 'exported', payment: 'paid', ewb: null },
  { number: 'MKRD-DC/25-26/0031', date: '14 Aug 2026', customer: 'Vaidya Polymers Pvt. Ltd.', type: 'DC', totalPaise: 1121500, status: 'saved', payment: 'unpaid', ewb: '371002877930' },
  { number: 'MKRD/25-26/0138', date: '11 Aug 2026', customer: 'Coastal Electricals Ltd.', type: 'IN', totalPaise: 32450000, status: 'cancelled', payment: 'unpaid', ewb: null },
];

/** GSTR-1 outward supply summary, as the product's B2B table presents it. */
export const GSTR1_SUMMARY = [
  { table: '4A', label: 'B2B — Regular taxable supplies', invoices: 34, taxablePaise: 782450000, taxPaise: 140841000 },
  { table: '5A', label: 'B2C Large — inter-state, above ₹2.5L', invoices: 3, taxablePaise: 91200000, taxPaise: 16416000 },
  { table: '7', label: 'B2C Others', invoices: 11, taxablePaise: 24380000, taxPaise: 4388400 },
  { table: '9B', label: 'Credit / Debit notes — registered', invoices: 2, taxablePaise: -6400000, taxPaise: -1152000 },
];

export const DEFAULT_LINES = [
  { productId: 'p2', qty: 1, discountPct: 0 },
  { productId: 'p8', qty: 2, discountPct: 0.05 },
  { productId: 'p10', qty: 24, discountPct: 0 },
];
