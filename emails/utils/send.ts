import { render } from '@react-email/render';
import { getResend } from './resend';
import type { SendEmailParams } from './types';

/**
 * Default sender for transactional emails.
 *
 * DEVELOPMENT: Uses Resend's built-in testing address (onboarding@resend.dev).
 *              This requires no domain verification and works immediately.
 *
 * PRODUCTION:  Must use a verified custom domain (e.g. noreply@ilist.ng).
 *              Before switching, configure SPF, DKIM, and DMARC records for
 *              the domain in your DNS provider and verify it in Resend.
 *
 * Switching to the production sender is a one-line change:
 *   export const DEFAULT_FROM = 'iList <noreply@ilist.ng>';
 */
export const DEFAULT_FROM =
  process.env.NODE_ENV === 'production'
    ? 'iList <noreply@ilist.ng>'
    : 'iList <onboarding@resend.dev>';

if (
  process.env.NODE_ENV === 'production' &&
  DEFAULT_FROM.includes('onboarding@resend.dev')
) {
  console.warn(
    '[Email] WARNING: Using Resend testing sender (onboarding@resend.dev) in production. ' +
    'Configure SPF/DKIM/DMARC and verify your domain in Resend before going live.'
  );
}

export async function sendEmail({
  to,
  subject,
  react,
  from,
  replyTo,
}: SendEmailParams) {
  const resolvedFrom = from || DEFAULT_FROM;
  const startTime = Date.now();

  console.log(`[Email] Preparing to send "${subject}" to ${typeof to === 'string' ? to : to.join(', ')}`);

  try {
    const html = await render(react);

    const resend = getResend();

    const { data, error } = await resend.emails.send({
      from: resolvedFrom,
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
