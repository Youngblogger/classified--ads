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

export function generateReceiptPDF(data: ReceiptData): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a5' });
  const pageW = doc.internal.pageSize.getWidth();

  const green = [0, 158, 56] as const;
  const dark = '#1F2937';
  const muted = '#6B7280';

  doc.setFillColor(green[0], green[1], green[2]);
  doc.rect(0, 0, pageW, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT RECEIPT', pageW / 2, 16, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('iList Marketplace', pageW / 2, 24, { align: 'center' });
  doc.text(
    `Issued: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    pageW / 2,
    30,
    { align: 'center' },
  );

  let y = 48;

  doc.setTextColor(dark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Transaction Details', pageW / 2, y, { align: 'center' });
  y += 10;

  const rows: [string, string][] = [
    ['Reference ID', data.reference],
    ['Type', data.type.charAt(0).toUpperCase() + data.type.slice(1)],
    ['Description', getDescription(data.type, data.status, data.payment_method, data.description)],
    ['Amount', formatAmount(data.amount)],
    ['Status', data.status.charAt(0).toUpperCase() + data.status.slice(1)],
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
  const col2 = pageW - leftMargin - rightMargin - col1;
  const rowH = 7;

  doc.setFillColor(245, 247, 250);
  doc.rect(leftMargin, y, pageW - leftMargin - rightMargin, rowH, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(green[0], green[1], green[2]);
  doc.text('Item', leftMargin + 3, y + 5);
  doc.text('Details', leftMargin + col1 + 3, y + 5);

  y += rowH;
  let alt = false;

  for (const [label, value] of rows) {
    if (alt) {
      doc.setFillColor(249, 250, 251);
      doc.rect(leftMargin, y, pageW - leftMargin - rightMargin, rowH, 'F');
    }

    doc.setFontSize(9);
    doc.setTextColor(dark);
    doc.setFont('helvetica', 'bold');
    doc.text(label, leftMargin + 3, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(value, leftMargin + col1 + 3, y + 5);

    y += rowH;
    alt = !alt;
  }

  y += 8;

  const lineL = 14;
  doc.setDrawColor(229, 231, 235);
  doc.line(lineL, y, pageW - lineL, y);
  y += 10;

  doc.setFontSize(8);
  doc.setTextColor(muted);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for using iList Marketplace.', pageW / 2, y, { align: 'center' });
  y += 5;
  doc.text('This is a computer-generated receipt.', pageW / 2, y, { align: 'center' });

  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text(`Receipt #${data.reference}`, pageW / 2, footerY, { align: 'center' });

  return doc.output('blob');
}

export function downloadReceipt(data: ReceiptData, filename?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const blob = generateReceiptPDF(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `receipt-${data.reference}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}
