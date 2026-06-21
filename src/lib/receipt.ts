import { formatTransactionDescription, formatTransactionStatus } from './transaction-utils';

interface ReceiptData {
  reference: string;
  type: string;
  amount: string;
  status: string;
  payment_method: string;
  created_at: string;
  description?: string;
  receiptId?: string;
  currency?: string;
}

function generateReceiptReference(): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const now = new Date();
  const yyyymmdd = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map(b => charset[b % charset.length])
    .join('');
  return `ILR-${yyyymmdd}-${random}`;
}

function formatTransactionType(type: string): string {
  const map: Record<string, string> = {
    deposit: 'Wallet Funding',
    payment: 'Boost Payment',
    withdrawal: 'Withdrawal',
    promotion: 'Ad Promotion',
    refund: 'Refund',
  };
  return map[type] || type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatAmount(value: string | number) {
  const n = Number(value);
  const formatted = n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `\u20A6${formatted}`;
}

function formatDateForDisplay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

let logoDataUrl: string | null = null;

async function loadLogo(): Promise<string | null> {
  if (logoDataUrl) return logoDataUrl;
  try {
    const res = await fetch('/icons/iList-white.png');
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        logoDataUrl = reader.result as string;
        resolve(logoDataUrl);
      };
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function dashedLine(doc: any, x: number, y: number, w: number): void {
  const dashLen = 1.2;
  const gapLen = 0.8;
  let cx = x;
  while (cx < x + w) {
    const end = Math.min(cx + dashLen, x + w);
    doc.line(cx, y, end, y);
    cx += dashLen + gapLen;
  }
}

function sectionTitle(doc: any, text: string, pageW: number, y: number): number {
  const leftX = 14;
  const rightX = pageW - 14;
  const sepW = rightX - leftX;

  doc.setDrawColor(180, 180, 180);
  dashedLine(doc, leftX, y, sepW);
  y += 5;

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(text, pageW / 2, y, { align: 'center' });
  y += 5;

  doc.setDrawColor(180, 180, 180);
  dashedLine(doc, leftX, y, sepW);
  y += 5;

  return y;
}

function infoRow(doc: any, label: string, value: string, x: number, y: number, labelW: number, gap: number): number {
  doc.setTextColor('#1F2937');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(label + ':', x, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(value, x + labelW, y);
  return y + gap;
}

export async function generateReceiptPDF(data: ReceiptData): Promise<Blob> {
  const jsPDF = (await import('jspdf')).default;
  const doc = new jsPDF({ unit: 'mm', format: 'a5' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const leftX = 14;
  const rightX = pageW - 14;

  const receiptId = data.receiptId || generateReceiptReference();
  const desc = formatTransactionDescription(data.type, data.status);
  const statusLabel = formatTransactionStatus(data.status);
  const txType = formatTransactionType(data.type);
  const amt = formatAmount(data.amount);
  const txDate = formatDateForDisplay(data.created_at);
  const issuedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const currency = data.currency || 'NGN';
  const walletRef = data.reference;

  // ── Watermarks (background) ──
  const drawWatermark = (cy: number) => {
    doc.setTextColor(240, 240, 240);
    doc.setFontSize(48);
    doc.setFont('helvetica', 'bold');
    doc.text('iList', pageW / 2, cy, { align: 'center', angle: 30 });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('classified ads marketplace', pageW / 2, cy + 14, { align: 'center', angle: 30 });
  };
  drawWatermark(pageH * 0.28);
  drawWatermark(pageH * 0.62);

  // ── Header ──
  doc.setFillColor(0, 158, 56);
  doc.rect(0, 0, pageW, 24, 'F');

  const logo = await loadLogo();
  if (logo) {
    doc.addImage(logo, 'PNG', 10, 7.5, 14, 4.7);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT RECEIPT', pageW / 2, 11, { align: 'center' });

  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('iList Classified Ads Marketplace', pageW / 2, 18, { align: 'center' });

  let y = 34;

  // ── TRANSACTION CONFIRMATION ──
  y = sectionTitle(doc, 'TRANSACTION CONFIRMATION', pageW, y);

  const labelW = 42;
  const gap = 5;

  y = infoRow(doc, 'Receipt ID', receiptId, leftX, y, labelW, gap);
  y = infoRow(doc, 'Status', statusLabel, leftX, y, labelW, gap);
  y = infoRow(doc, 'Transaction Type', txType, leftX, y, labelW, gap);
  y = infoRow(doc, 'Payment Method', data.payment_method || 'Wallet', leftX, y, labelW, gap);
  y = infoRow(doc, 'Currency', currency, leftX, y, labelW, gap);

  y += 2;

  // ── PAYMENT DETAILS ──
  y = sectionTitle(doc, 'PAYMENT DETAILS', pageW, y);

  y = infoRow(doc, 'Description', desc, leftX, y, labelW, gap);
  y = infoRow(doc, 'Amount Paid', amt, leftX, y, labelW, gap);
  y = infoRow(doc, 'Fees', '\u20A60.00', leftX, y, labelW, gap);
  y = infoRow(doc, 'Total Credited', amt, leftX, y, labelW, gap);

  y += 2;

  // ── ACCOUNT INFORMATION ──
  y = sectionTitle(doc, 'ACCOUNT INFORMATION', pageW, y);

  y = infoRow(doc, 'Platform', 'iList Classified Marketplace', leftX, y, labelW, gap);
  y = infoRow(doc, 'Wallet ID', walletRef, leftX, y, labelW, gap);

  y += 2;

  // ── TIMELINE ──
  y = sectionTitle(doc, 'TIMELINE', pageW, y);

  y = infoRow(doc, 'Transaction Date', txDate, leftX, y, labelW, gap);
  y = infoRow(doc, 'Issued Date', issuedDate, leftX, y, labelW, gap);

  y += 4;

  // ── Footer separator ──
  doc.setDrawColor(180, 180, 180);
  dashedLine(doc, leftX, y, rightX - leftX);
  y += 6;

  doc.setFontSize(8);
  doc.setTextColor('#6B7280');
  doc.setFont('helvetica', 'normal');
  doc.text('iList Classified Ads Marketplace \u00A9 2026', pageW / 2, y, { align: 'center' });

  return doc.output('blob');
}

export async function downloadReceipt(data: ReceiptData, filename?: string): Promise<void> {
  const blob = await generateReceiptPDF(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const receiptId = data.receiptId || generateReceiptReference();
  a.download = filename || `receipt-${receiptId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
