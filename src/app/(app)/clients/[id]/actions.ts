"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendMail } from "@/lib/mailer";
import { getAppUrl } from "@/lib/url";

const SETUP_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function sendPortalAccessAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const clientId = String(formData.get("clientId") ?? "");
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client || client.workspaceId !== user.workspaceId) redirect("/clients");

  let outcome: "sent" | "skipped";
  let link: string;

  if (client.passwordHash) {
    // Already activated — just resend the login link.
    link = `${getAppUrl()}/client/login`;
    const { sent } = await sendMail({
      to: client.contactEmail,
      subject: "Your VA Hub client portal",
      html: `<p>Hi ${client.contactName},</p><p>Here's your client portal — sign in any time to track projects, message us, review designs, and pay invoices:</p><p><a href="${link}">${link}</a></p>`,
    });
    outcome = sent ? "sent" : "skipped";
  } else {
    const setupToken = randomBytes(24).toString("base64url");
    const setupTokenExpiresAt = new Date(Date.now() + SETUP_TOKEN_TTL_MS);
    await prisma.client.update({ where: { id: clientId }, data: { setupToken, setupTokenExpiresAt } });

    link = `${getAppUrl()}/client/setup/${setupToken}`;
    const { sent } = await sendMail({
      to: client.contactEmail,
      subject: `${client.name}, your VA Hub client portal is ready`,
      html: `<p>Hi ${client.contactName},</p><p>Set up your client portal to track projects, message your VA, review designs, and pay invoices:</p><p><a href="${link}">${link}</a></p><p>This link expires in 7 days.</p>`,
    });
    outcome = sent ? "sent" : "skipped";
  }

  revalidatePath(`/clients/${clientId}`);
  // When there's no email provider configured, hand the VA the real link
  // directly (instead of just logging it server-side) so they can paste it
  // into Slack/text/whatever and actually get a real tester into the
  // client area before wiring up real email delivery.
  const linkParam = outcome === "skipped" ? `&link=${encodeURIComponent(link)}` : "";
  redirect(`/clients/${clientId}?portalEmail=${outcome}${linkParam}`);
}
