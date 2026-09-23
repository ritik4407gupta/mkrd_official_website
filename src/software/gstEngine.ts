/**
 * GST engine — a direct port of the real product.
 *
 * Ported line-for-line from the GST Billing Suite's own
 * `services/gst_engine.py` and `services/calculator.py`, including its two
 * defining decisions:
 *
 *   1. Money is carried as INTEGER PAISE, never as a float rupee amount.
 *   2. Every rounding step is HALF-UP at two decimal places, applied at the
 *      same points the Python applies it — the half rate is quantised before
 *      it is used, and each tax component is rounded before it is summed.
 *
 * Getting either of those wrong produces totals that differ from a filed
 * return by a paisa or two, which is exactly the kind of thing that makes a
 * demo untrustworthy. This file exists so the figures on the website are the
 * figures the software would actually print.
 */

/** Half-up rounding to 2dp, returned as integer paise. All amounts are ≥ 0. */
export const toPaise = (rupees: number): number =>
  Math.floor(rupees * 100 + 0.5 + Number.EPSILON * Math.abs(rupees) * 100);

/** Half-up rounding to 2dp, returned as rupees. Mirrors Decimal.quantize. */
export const round2 = (rupees: number): number => toPaise(rupees) / 100;

export const paiseToRupees = (paise: number): number => paise / 100;

export interface TaxBreakdown {
  isIntraState: boolean;
  gstRate: number;
  cgstRate: number;
  cgstAmount: number; // rupees
  sgstRate: number;
  sgstAmount: number; // rupees
  igstRate: number;
  igstAmount: number; // rupees
  totalTax: number; // rupees
}

export interface LineResult {
  taxableAmount: number; // paise
  cgstRate: number;
  cgstAmount: number; // paise
  sgstRate: number;
  sgstAmount: number; // paise
  igstRate: number;
  igstAmount: number; // paise
  lineTotal: number; // paise
}

export interface DocTotals {
  totalTaxable: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  grandTotal: number;
}

/** First two characters of a GSTIN are the state code. '' if absent. */
export const extractStateCodeFromGstin = (gstin: string): string => {
  const g = (gstin || '').trim();
  return g.length >= 2 && /^\d{2}$/.test(g.slice(0, 2)) ? g.slice(0, 2) : '';
};

/**
 * Same state → CGST + SGST. Different state → IGST.
 * When either code is missing the product treats the supply as inter-state,
 * because over-charging IGST is recoverable and under-charging is not.
 */
export const determineSupplyType = (sellerStateCode: string, buyerStateCode: string): boolean => {
  const s = (sellerStateCode || '').trim();
  const b = (buyerStateCode || '').trim();
  if (!s || !b) return false;
  return s === b;
};

export const calculateTax = (
  taxableAmount: number, // rupees, already rounded
  gstRate: number,
  isIntraState: boolean,
): TaxBreakdown => {
  if (isIntraState) {
    // The half rate is quantised before use — 0.25% GST becomes 0.13 + 0.13,
    // not 0.125 + 0.125. This is what the Python does.
    const halfRate = round2(gstRate / 2);
    const cgst = round2((taxableAmount * halfRate) / 100);
    const sgst = round2((taxableAmount * halfRate) / 100);
    return {
      isIntraState: true,
      gstRate,
      cgstRate: halfRate,
      cgstAmount: cgst,
      sgstRate: halfRate,
      sgstAmount: sgst,
      igstRate: 0,
      igstAmount: 0,
      totalTax: round2(cgst + sgst),
    };
  }
  const igst = round2((taxableAmount * gstRate) / 100);
  return {
    isIntraState: false,
    gstRate,
    cgstRate: 0,
    cgstAmount: 0,
    sgstRate: 0,
    sgstAmount: 0,
    igstRate: gstRate,
    igstAmount: igst,
    totalTax: igst,
  };
};

export const computeLineItem = (
  quantity: number,
  ratePaise: number,
  discountPct: number, // fraction, 0.05 = 5%
  gstRate: number,
  isIntraState: boolean,
): LineResult => {
  const rate = ratePaise / 100;
  const taxable = round2(quantity * rate * (1 - discountPct));
  const tb = calculateTax(taxable, gstRate, isIntraState);
  const lineTotal = taxable + tb.totalTax;

  return {
    taxableAmount: toPaise(taxable),
    cgstRate: tb.cgstRate,
    cgstAmount: toPaise(tb.cgstAmount),
    sgstRate: tb.sgstRate,
    sgstAmount: toPaise(tb.sgstAmount),
    igstRate: tb.igstRate,
    igstAmount: toPaise(tb.igstAmount),
    lineTotal: toPaise(lineTotal),
  };
};

export const computeDocTotals = (lines: LineResult[]): DocTotals => {
  const totalTaxable = lines.reduce((a, l) => a + l.taxableAmount, 0);
  const totalCgst = lines.reduce((a, l) => a + l.cgstAmount, 0);
  const totalSgst = lines.reduce((a, l) => a + l.sgstAmount, 0);
  const totalIgst = lines.reduce((a, l) => a + l.igstAmount, 0);
  return {
    totalTaxable,
    totalCgst,
    totalSgst,
    totalIgst,
    grandTotal: totalTaxable + totalCgst + totalSgst + totalIgst,
  };
};

/**
 * Indian digit grouping: last three digits, then pairs.
 * 1234567 paise → ₹12,345.67
 */
export const formatCurrency = (paise: number, symbol = '₹'): string => {
  const negative = paise < 0;
  const abs = Math.abs(paise);
  const rupees = Math.floor(abs / 100);
  const remainder = abs % 100;

  const s = String(rupees);
  let formatted: string;
  if (s.length > 3) {
    const last3 = s.slice(-3);
    let rest = s.slice(0, -3);
    const groups: string[] = [];
    while (rest.length) {
      groups.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    formatted = `${groups.join(',')},${last3}`;
  } else {
    formatted = s;
  }
  return `${negative ? '-' : ''}${symbol}${formatted}.${String(remainder).padStart(2, '0')}`;
};

/** Rupees in words, Indian scale — the amount_in_words line on the invoice. */
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const twoDigits = (n: number): string =>
  n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ''}`;

const threeDigits = (n: number): string => {
  const h = Math.floor(n / 100);
  const r = n % 100;
  return [h ? `${ONES[h]} Hundred` : '', r ? twoDigits(r) : ''].filter(Boolean).join(' ');
};

export const amountInWords = (paise: number): string => {
  const rupees = Math.floor(Math.abs(paise) / 100);
  const paisePart = Math.abs(paise) % 100;
  if (rupees === 0 && paisePart === 0) return 'Zero Rupees Only';

  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const rest = rupees % 1000;

  const parts = [
    crore ? `${threeDigits(crore)} Crore` : '',
    lakh ? `${threeDigits(lakh)} Lakh` : '',
    thousand ? `${threeDigits(thousand)} Thousand` : '',
    rest ? threeDigits(rest) : '',
  ].filter(Boolean);

  const rupeeWords = parts.length ? `${parts.join(' ')} Rupees` : '';
  const paiseWords = paisePart ? `${twoDigits(paisePart)} Paise` : '';
  return [rupeeWords, paiseWords && (rupeeWords ? `and ${paiseWords}` : paiseWords)]
    .filter(Boolean)
    .join(' ') + ' Only';
};

/**
 * Document numbering, matching the product's format tokens:
 * {YYYY} {YY} {FY} {FYS} {MM} {DD} {PREFIX} {NNNN}
 * The Indian financial year starts in April.
 */
export const financialYear = (d: Date): { long: string; short: string } => {
  const start = d.getMonth() + 1 >= 4 ? d.getFullYear() : d.getFullYear() - 1;
  const end = (start + 1) % 100;
  return {
    long: `${start}-${String(end).padStart(2, '0')}`,
    short: `${String(start % 100).padStart(2, '0')}-${String(end).padStart(2, '0')}`,
  };
};

export const formatDocumentNumber = (
  format: string,
  seq: number,
  prefix: string,
  paddingDigits = 4,
  refDate = new Date(),
): string => {
  const fy = financialYear(refDate);
  return (format || '{YYYY}{PREFIX}{NNNN}')
    .replace('{YYYY}', String(refDate.getFullYear()))
    .replace('{YY}', String(refDate.getFullYear() % 100).padStart(2, '0'))
    .replace('{FYS}', fy.short)
    .replace('{FY}', fy.long)
    .replace('{MM}', String(refDate.getMonth() + 1).padStart(2, '0'))
    .replace('{DD}', String(refDate.getDate()).padStart(2, '0'))
    .replace('{PREFIX}', prefix)
    .replace('{NNNN}', String(seq).padStart(paddingDigits, '0'));
};
