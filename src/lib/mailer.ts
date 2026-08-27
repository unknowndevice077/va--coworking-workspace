import "server-only";
import { Resend } from "resend";

// Zero-config-safe email sending: with no RESEND_API_KEY set, sendMail
// logs what it would have sent and returns { sent: false } instead of
// throwing — the app stays fully usable without an email provider, it
// just can't deliver anything for real yet.
export function isMailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

let cached: Resend | null = null;
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!cached) cached = new Resend(key);
  return cached;
}

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean }> {
  const resend = getResend();
  const from = process.env.MAIL_FROM ?? "VA Hub <onboarding@resend.dev>";

  if (!resend) {
    console.log(`[mailer] RESEND_API_KEY not set — would send "${subject}" to ${to}`);
    return { sent: false };
  }

  try {
    await resend.emails.send({ from, to, subject, html });
    return { sent: true };
  } catch (err) {
    console.error("[mailer] send failed:", err);
    return { sent: false };
  }
}
