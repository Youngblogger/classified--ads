import { CLOUDINARY_CLOUD_NAME } from './config';

export type WatermarkDiagnostic = {
  cloudNameConfigured: boolean;
  severity: 'ok' | 'warning' | 'error';
  message: string;
};

let diagnosticsLogged = false;

export function checkWatermarkConfiguration(): WatermarkDiagnostic {
  const cloudNameConfigured = !!CLOUDINARY_CLOUD_NAME;

  if (cloudNameConfigured) {
    return {
      cloudNameConfigured,
      severity: 'ok',
      message: 'Cloudinary watermark system is active (DB-driven admin configuration)',
    };
  }

  return {
    cloudNameConfigured,
    severity: 'error',
    message: 'Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your environment.',
  };
}

export function logWatermarkDiagnostic(): void {
  if (typeof window === 'undefined') return;
  if (diagnosticsLogged) return;
  diagnosticsLogged = true;

  const diag = checkWatermarkConfiguration();

  if (diag.severity === 'error') {
    console.error(
      '%c[Watermark] %cConfiguration Error%c\n%s',
      'font-weight:bold;color:#f59e0b',
      'font-weight:bold;color:#ef4444',
      'font-weight:normal;color:inherit',
      diag.message
    );
  } else {
    console.info(
      '%c[Watermark] %cOK%c\n%s',
      'font-weight:bold;color:#f59e0b',
      'font-weight:bold;color:#22c55e',
      'font-weight:normal;color:inherit',
      diag.message
    );
  }
}
