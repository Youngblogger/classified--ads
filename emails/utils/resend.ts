import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

let resend: Resend | null = null;

export function getResend(): Resend {
  if (!resend) {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resend = new Resend(RESEND_API_KEY);
  }
  return resend;
}
