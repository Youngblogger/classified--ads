const NIGERIAN_PREFIXES = [
  // MTN
  '0803', '0806', '0810', '0813', '0814', '0903', '0906',
  // Airtel
  '0802', '0808', '0812', '0701', '0902',
  // Glo
  '0805', '0807', '0815', '0811', '0705',
  // 9mobile
  '0809', '0817', '0818', '0909',
];

function hasExcessiveRepeatingDigits(num: string): boolean {
  for (let i = 0; i <= num.length - 6; i++) {
    const slice = num.slice(i, i + 6);
    if (/^(\d)\1{5,}$/.test(slice)) return true;
  }
  return false;
}

function hasPredictableEnding(num: string): boolean {
  const suffix = num.slice(-4);
  // Reject 0000-0009, 1111, 2222, ..., 9999
  if (/^0{3}[0-9]$/.test(suffix)) return true;
  if (/^(\d)\1{3}$/.test(suffix)) return true;
  // Reject sequential endings like 1234, 2345, 3456, etc.
  const seqMatches = ['0123', '1234', '2345', '3456', '4567', '5678', '6789'];
  if (seqMatches.includes(suffix)) return true;
  return false;
}

function isSequential(num: string): boolean {
  const digits = num.split('').map(Number);
  let ascending = 0;
  let descending = 0;
  for (let i = 1; i < digits.length; i++) {
    if (digits[i] === digits[i - 1] + 1) ascending++;
    else ascending = 0;
    if (digits[i] === digits[i - 1] - 1) descending++;
    else descending = 0;
    if (ascending >= 5 || descending >= 5) return true;
  }
  return false;
}

export function generateRealisticPhone(usedNumbers: Set<string> = new Set()): string {
  let attempts = 0;
  while (attempts < 1000) {
    const prefix = NIGERIAN_PREFIXES[Math.floor(Math.random() * NIGERIAN_PREFIXES.length)];
    // Generate 7 random digits for the remaining part
    let suffix = '';
    for (let i = 0; i < 7; i++) {
      suffix += Math.floor(Math.random() * 10).toString();
    }
    const phone = prefix + suffix;

    if (
      !usedNumbers.has(phone) &&
      !hasExcessiveRepeatingDigits(phone) &&
      !hasPredictableEnding(phone) &&
      !isSequential(phone)
    ) {
      usedNumbers.add(phone);
      return phone;
    }
    attempts++;
  }
  // Fallback - extremely unlikely to reach here
  const fallback = NIGERIAN_PREFIXES[0] + String(Math.floor(1000000 + Math.random() * 9000000));
  usedNumbers.add(fallback);
  return fallback;
}

export function isValidNigerianPhone(phone: string): boolean {
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  if (!/^\d{11}$/.test(clean)) return false;
  if (!clean.startsWith('0')) return false;
  const prefix = clean.substring(0, 4);
  if (!NIGERIAN_PREFIXES.includes(prefix)) return false;
  if (hasExcessiveRepeatingDigits(clean)) return false;
  if (hasPredictableEnding(clean)) return false;
  if (isSequential(clean)) return false;
  return true;
}

export function formatPhoneForDisplay(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
  }
  return phone;
}

export function formatNigerianPhoneForWhatsApp(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0')) {
    return '234' + clean.substring(1);
  }
  if (clean.startsWith('234')) {
    return clean;
  }
  return clean;
}

export { NIGERIAN_PREFIXES };
