import { render } from '@react-email/render';
import { getResend } from './resend';
import type { SendEmailParams } from './types';

const DEFAULT_FROM = 'iList <noreply@ilist.ng>';

export async function sendEmail({
  to,
  subject,
  react,
  from = DEFAULT_FROM,
  replyTo,
}: SendEmailParams) {
  const startTime = Date.now();

  console.log(`[Email] Preparing to send "${subject}" to ${typeof to === 'string' ? to : to.join(', ')}`);

  try {
    const html = await render(react);

    const resend = getResend();

    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo,
    });

    if (error) {
      console.error(`[Email] Failed to send "${subject}" to ${to}:`, error);
      return { success: false, error: error.message };
    }

    const duration = Date.now() - startTime;
    console.log(`[Email] Successfully sent "${subject}" to ${to} (${duration}ms)`);

    return { success: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Email] Exception sending "${subject}" to ${to}:`, message);
    return { success: false, error: message };
  }
}
