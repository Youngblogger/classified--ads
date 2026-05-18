import jsPDF from 'jspdf';

interface ReceiptData {
  reference: string;
  type: string;
  amount: string;
  status: string;
  payment_method: string;
  created_at: string;
  description?: string;
}

function getDescription(type: string, status: string, method: string, desc?: string): string {
  const d = desc?.toLowerCase() || '';
  if (d && !d.includes('wallet funding pending') && !d.includes('pending') && (status === 'success' || status === 'completed')) {
    return desc!;
  }
  if (type === 'deposit') {
    if (status === 'success' || status === 'completed') {
      return `Wallet funding via ${method === 'paystack' ? 'Paystack' : 'Wallet transfer'}`;
    }
    return 'Wallet funding - pending confirmation';
  }
  if (type === 'payment') {
    if (status === 'success' || status === 'completed') {
      return 'Payment for ad listing';
    }
    return 'Payment for ad listing - pending';
  }
  if (type === 'promotion') {
    return 'Ad promotion boost';
  }
  if (type === 'refund') {
    return 'Payment refund';
  }
  if (type === 'withdrawal') {
    if (status === 'success' || status === 'completed') {
      return 'Withdrawal to bank account';
    }
    return 'Withdrawal request - pending';
  }
  return desc || `${type} transaction`;
}

function formatAmount(value: string | number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(Number(value));
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
  const doc = new jsPDF({ unit: 'mm', format: 'a5' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const green = [0, 158, 56] as const;
  const dark = '#1F2937';
  const muted = '#6B7280';

  doc.setFillColor(green[0], green[1], green[2]);
  doc.rect(0, 0, pageW, 30, 'F');

  const logo = await loadLogo();
  if (logo) {
    doc.addImage(logo, 'PNG', 14, 8, 14, 14);
  } else {
    doc.setFillColor(255, 255, 255);
    doc.circle(21, 15, 5);
    doc.fill();
    doc.setTextColor(green[0], green[1], green[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('i', 21, 17.5, { align: 'center' });
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT RECEIPT', pageW / 2, 18, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('iList Marketplace', pageW / 2, 24, { align: 'center' });
  doc.text(
    `Issued: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    pageW / 2,
    28,
    { align: 'center' },
  );

  doc.setTextColor(235, 235, 235);
  doc.setFontSize(56);
  doc.setFont('helvetica', 'bold');
  doc.text('iList', pageW / 2, pageH - 65, { align: 'center', angle: 35 });

  for (let ry = pageH * 0.44; ry < pageH - 15; ry += 7) {
    doc.setTextColor(248, 248, 248);
    doc.setFontSize(3.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`  ${data.reference}  |  ILIST  |  ${data.reference}  |  ILIST  |  ${data.reference}  |  ILIST  |  ${data.reference}  |  ILIST  |  ${data.reference}  |  ILIST  |  ${data.reference}  |  ILIST  |  ${data.reference}  |  ILIST  |  `, 0, ry, { angle: 35 });
  }

  let y = 38;

  doc.setTextColor(dark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Transaction Details', pageW / 2, y, { align: 'center' });
  y += 9;

  const rows: [string, string][] = [
    ['Reference ID', data.reference],
    ['Type', data.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())],
    ['Description', getDescription(data.type, data.status, data.payment_method, data.description)],
    ['Amount', formatAmount(data.amount)],
    ['Status', formatStatus(data.status)],
    ['Payment Method', data.payment_method || 'Wallet'],
    [
      'Date',
      new Date(data.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    ],
    ['Transaction Fee', 'N0.00'],
  ];

  const leftMargin = 14;
  const rightMargin = 14;
  const col1 = 48;
  const rowH = 6.5;

  doc.setFillColor(245, 247, 250);
  doc.rect(leftMargin, y, pageW - leftMargin - rightMargin, rowH, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(green[0], green[1], green[2]);
  doc.text('Item', leftMargin + 3, y + 4.5);
  doc.text('Details', leftMargin + col1 + 3, y + 4.5);

  y += rowH;
  let alt = false;

  for (const [label, value] of rows) {
    if (alt) {
      doc.setFillColor(249, 250, 251);
      doc.rect(leftMargin, y, pageW - leftMargin - rightMargin, rowH, 'F');
    }

    doc.setFontSize(8.5);
    doc.setTextColor(dark);
    doc.setFont('helvetica', 'bold');
    doc.text(label, leftMargin + 3, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(value, leftMargin + col1 + 3, y + 4.5);

    y += rowH;
    alt = !alt;
  }

  y = pageH - 28;

  const lineL = 14;
  doc.setDrawColor(229, 231, 235);
  doc.line(lineL, y, pageW - lineL, y);
  y += 8;

  doc.setFontSize(8);
  doc.setTextColor(muted);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for using iList Marketplace.', pageW / 2, y, { align: 'center' });
  y += 5;
  doc.text('This is a computer-generated receipt.', pageW / 2, y, { align: 'center' });

  return doc.output('blob');
}

export async function downloadReceipt(data: ReceiptData, filename?: string): Promise<void> {
  const blob = await generateReceiptPDF(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `receipt-${data.reference}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
