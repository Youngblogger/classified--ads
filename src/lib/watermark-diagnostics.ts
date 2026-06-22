import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_WATERMARK_ID } from './config';

export type WatermarkDiagnostic = {
  cloudNameConfigured: boolean;
  watermarkIdConfigured: boolean;
  imageBasedWatermarkEnabled: boolean;
  severity: 'ok' | 'warning' | 'error';
  message: string;
};

let diagnosticsLogged = false;

export function checkWatermarkConfiguration(): WatermarkDiagnostic {
  const cloudNameConfigured = !!CLOUDINARY_CLOUD_NAME;
  const watermarkIdConfigured = !!CLOUDINARY_WATERMARK_ID;
  const imageBasedWatermarkEnabled = cloudNameConfigured && watermarkIdConfigured;

  if (imageBasedWatermarkEnabled) {
    return {
      cloudNameConfigured,
      watermarkIdConfigured,
      imageBasedWatermarkEnabled,
      severity: 'ok',
      message: `Cloudinary watermark is active (public ID: ${CLOUDINARY_WATERMARK_ID})`,
    };
  }

  if (!cloudNameConfigured && !watermarkIdConfigured) {
    return {
      cloudNameConfigured,
      watermarkIdConfigured,
      imageBasedWatermarkEnabled,
      severity: 'error',
      message: 'Watermark is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_WATERMARK_ID in your environment.',
    };
  }

  if (!watermarkIdConfigured) {
    return {
      cloudNameConfigured,
      watermarkIdConfigured,
      imageBasedWatermarkEnabled,
      severity: 'warning',
      message: 'NEXT_PUBLIC_CLOUDINARY_WATERMARK_ID is not set. Cloudinary-based watermark overlay is disabled.',
    };
  }

  return {
    cloudNameConfigured,
    watermarkIdConfigured,
    imageBasedWatermarkEnabled,
    severity: 'ok',
    message: 'Watermark is configured.',
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
  } else if (diag.severity === 'warning') {
    console.warn(
      '%c[Watermark] %cConfiguration Warning%c\n%s',
      'font-weight:bold;color:#f59e0b',
      'font-weight:bold;color:#f59e0b',
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

  if (diag.imageBasedWatermarkEnabled) {
    console.info('[Watermark] URL watermark transformation is active on Cloudinary images.');
  } else {
    console.info('[Watermark] Images will be served without watermark overlay.');
    console.info('[Watermark] To enable, set NEXT_PUBLIC_CLOUDINARY_WATERMARK_ID to your uploaded watermark public ID.');
    console.info('[Watermark] Server-side Sharp watermarking (upload API) is configured separately via watermark_settings DB table.');
  }
}
