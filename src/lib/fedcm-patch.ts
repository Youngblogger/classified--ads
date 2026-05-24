'use client';

export function patchFedCmWidgetMode(): void {
  if (typeof navigator === 'undefined' || !navigator.credentials) return;

  try {
    const originalGet = navigator.credentials.get.bind(navigator.credentials);

    (navigator.credentials as any).get = function (options?: any) {
      if (options?.identity?.mode === 'widget') {
        options.identity.mode = 'optional';
      }
      return originalGet(options);
    };
  } catch {
    // Browser may prevent overriding native credentials.get
  }
}
