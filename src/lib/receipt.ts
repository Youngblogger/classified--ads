interface ReceiptData {
  reference: string;
  type: string;
  amount: string;
  status: string;
  payment_method: string;
  created_at: string;
  description?: string;
  receiptId?: string;
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

function getDescription(type: string, status: string, _method: string, _desc?: string): string {
  const s = status.toLowerCase();
  const isSuccess = ['success', 'successful', 'approved', 'confirmed', 'credited', 'completed'].includes(s);
  const isFailed = ['failed', 'declined', 'rejected', 'expired'].includes(s);

  if (type === 'deposit') {
    if (isSuccess) return 'Wallet successfully funded';
    if (isFailed) return 'Wallet funding failed';
    return 'Wallet funding pending confirmation';
  }
  if (type === 'payment') {
    if (isSuccess) return 'Boost payment successful';
    if (isFailed) return 'Boost payment failed';
    return 'Boost payment pending';
  }
  if (type === 'promotion') {
    return 'Ad promotion boost';
  }
  if (type === 'refund') {
    return 'Payment refund';
  }
  if (type === 'withdrawal') {
    if (isSuccess) return 'Withdrawal to bank account';
    return 'Withdrawal request pending';
  }
  return _desc || `${type} transaction`;
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

function formatStatus(status: string): string {
  const lower = status.toLowerCase();
  if (['success', 'successful', 'approved', 'confirmed', 'credited', 'completed'].includes(lower)) {
    return 'Successful';
  }
  if (['failed', 'declined', 'rejected'].includes(lower)) {
    return 'Failed';
  }
  if (['cancelled', 'canceled'].includes(lower)) {
    return 'Cancelled';
  }
  if (lower === 'refunded') return 'Refunded';
  if (lower === 'expired') return 'Expired';
  if (lower === 'pending') return 'Pending';
  return status.charAt(0).toUpperCase() + status.slice(1);
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

export async function generateReceiptPDF(data: ReceiptData): Promise<Blob> {
  const jsPDF = (await import('jspdf')).default;
  const doc = new jsPDF({ unit: 'mm', format: 'a5' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const green = [0, 158, 56] as const;
  const dark = '#1F2937';
  const muted = '#6B7280';

  const receiptId = data.receiptId || generateReceiptReference();
  const desc = getDescription(data.type, data.status, data.payment_method, data.description);
  const statusLabel = formatStatus(data.status);
  const txType = formatTransactionType(data.type);
  const amt = formatAmount(data.amount);
  const txDate = formatDateForDisplay(data.created_at);
  const issuedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // ── Header ──
  doc.setFillColor(green[0], green[1], green[2]);
  doc.rect(0, 0, pageW, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT RECEIPT', pageW / 2, 10, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('iList Marketplace', pageW / 2, 16, { align: 'center' });
  doc.text(`Issued: ${issuedDate}`, pageW / 2, 21, { align: 'center' });

  // ── Identifier block ──
  let y = 32;
  const leftX = 14;
  const labelW = 38;
  const gap = 4.5;

  doc.setTextColor(dark);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');

  doc.text('Receipt ID:', leftX, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(receiptId, leftX + labelW, y);
  y += gap;

  doc.setTextColor(dark);
  doc.setFont('helvetica', 'bold');
  doc.text('Reference ID:', leftX, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(data.reference, leftX + labelW, y);
  y += gap;

  // ── Separator ──
  y += 2;
  doc.setDrawColor(229, 231, 235);
  doc.line(leftX, y, pageW - leftX, y);
  y += 6;

  // ── Status & Type block ──
  doc.setTextColor(dark);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Status:', leftX, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(statusLabel, leftX + labelW, y);
  y += gap;

  doc.setTextColor(dark);
  doc.setFont('helvetica', 'bold');
  doc.text('Transaction Type:', leftX, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(txType, leftX + labelW, y);
  y += gap;

  doc.setTextColor(dark);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Method:', leftX, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(data.payment_method || 'Wallet', leftX + labelW, y);
  y += gap;

  doc.setTextColor(dark);
  doc.setFont('helvetica', 'bold');
  doc.text('Description:', leftX, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(desc, leftX + labelW, y);
  y += gap;

  // ── Separator ──
  y += 2;
  doc.setDrawColor(229, 231, 235);
  doc.line(leftX, y, pageW - leftX, y);
  y += 6;

  // ── Payment Summary ──
  doc.setTextColor(dark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT SUMMARY', pageW / 2, y, { align: 'center' });
  y += 7;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Amount Paid:', leftX, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(green[0], green[1], green[2]);
  doc.text(amt, pageW - leftX, y, { align: 'right' });
  y += gap;

  doc.setFontSize(8.5);
  doc.setTextColor(dark);
  doc.setFont('helvetica', 'bold');
  doc.text('Fees:', leftX, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(75, 85, 99);
  doc.text('\u20A60.00', pageW - leftX, y, { align: 'right' });
  y += gap;

  doc.setFontSize(8.5);
  doc.setTextColor(dark);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Credited:', leftX, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(green[0], green[1], green[2]);
  doc.text(amt, pageW - leftX, y, { align: 'right' });
  y += gap;

  // ── Separator ──
  y += 2;
  doc.setDrawColor(229, 231, 235);
  doc.line(leftX, y, pageW - leftX, y);
  y += 6;

  // ── Timeline ──
  doc.setTextColor(dark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TIMELINE', pageW / 2, y, { align: 'center' });
  y += 7;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Transaction Date:', leftX, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(txDate, leftX + labelW, y);
  y += gap;

  doc.setTextColor(dark);
  doc.setFont('helvetica', 'bold');
  doc.text('Issued Date:', leftX, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(issuedDate, leftX + labelW, y);
  y += gap;

  // ── Footer ──
  y = pageH - 22;
  doc.setDrawColor(229, 231, 235);
  doc.line(leftX, y, pageW - leftX, y);
  y += 6;

  doc.setFontSize(8);
  doc.setTextColor(muted);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for using iList Marketplace.', pageW / 2, y, { align: 'center' });
  y += 4.5;
  doc.text('This is a computer-generated receipt.', pageW / 2, y, { align: 'center' });

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
