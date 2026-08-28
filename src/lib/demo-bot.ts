import "server-only";
import { prisma } from "./prisma";
import { createClientSession } from "./client-auth";
import {
  matchPresets,
  templatePresets,
  templateCategories,
  applyLogo,
  applyPromptHeadline,
  type TemplateCategory,
} from "./canvas-doc/presets";
import type { Prisma } from "@prisma/client";

// Everything behind the public /demo sandbox — no real AI here either,
// same "smart matching, not generative" rule as autoDesignAction
// (src/app/(app)/design-engine/actions.ts). The "bot" is a scripted
// stand-in for a VA: canned replies plus the same template-matching
// engine real VAs use for Auto Design, so a visitor sees a genuinely
// finished design, not a mockup.

const DEMO_WORKSPACE_ID = "ws-demo-sandbox";
const DEMO_CLIENT_TTL_MS = 24 * 60 * 60 * 1000; // sweep anything older than a day

async function getOrCreateDemoWorkspace() {
  return prisma.workspace.upsert({
    where: { id: DEMO_WORKSPACE_ID },
    update: {},
    create: { id: DEMO_WORKSPACE_ID, name: "Demo Sandbox" },
  });
}

/** Deletes stale demo clients (and everything cascading off them) so the sandbox doesn't grow forever. */
async function sweepStaleDemoClients() {
  await prisma.client.deleteMany({
    where: { workspaceId: DEMO_WORKSPACE_ID, isDemo: true, createdAt: { lt: new Date(Date.now() - DEMO_CLIENT_TTL_MS) } },
  });
}

const DEMO_NAMES = ["Jordan Blake", "Sam Rivera", "Casey Morgan", "Riley Chen", "Avery Quinn"];
function randomDemoContact() {
  const name = DEMO_NAMES[Math.floor(Math.random() * DEMO_NAMES.length)];
  const n = Math.floor(Math.random() * 9000) + 1000;
  return { name, email: `${name.split(" ")[0].toLowerCase()}.demo${n}@example.com` };
}

/**
 * The whole "client requests a design" demo loop in one step: makes a
 * fresh throwaway Client, runs the same matching engine as Auto Design to
 * pick and fill a real template, sends it for approval, drops in a
 * project and an invoice so the dashboard isn't empty, and logs the
 * visitor straight into /client as that client — no signup, no email.
 */
export async function startDemo({
  promptText,
  category,
  logoDataUrl,
}: {
  promptText: string;
  category: string;
  logoDataUrl?: string;
}) {
  await sweepStaleDemoClients();
  const workspace = await getOrCreateDemoWorkspace();
  const contact = randomDemoContact();

  const client = await prisma.client.create({
    data: {
      workspaceId: workspace.id,
      isDemo: true,
      name: `${contact.name}'s Business`,
      contactName: contact.name,
      contactEmail: contact.email,
      status: "ACTIVE",
      monthlyValueCents: 0,
      services: "Design",
    },
  });

  const cat = (templateCategories as readonly string[]).includes(category) ? (category as TemplateCategory) : "All";
  const [best] = matchPresets(promptText, { category: cat, limit: 1 });
  const preset = best ?? templatePresets[0];
  const doc = structuredClone(preset.doc);

  if (logoDataUrl) applyLogo(doc, logoDataUrl);
  applyPromptHeadline(doc, promptText);

  const design = await prisma.design.create({
    data: {
      workspaceId: workspace.id,
      templateId: preset.id,
      name: preset.name,
      doc: doc as unknown as Prisma.InputJsonValue,
      promptText,
      status: "SENT",
    },
  });

  await prisma.designApproval.create({
    data: {
      workspaceId: workspace.id,
      clientId: client.id,
      templateId: preset.id,
      designId: design.id,
      doc: doc as unknown as Prisma.InputJsonValue,
      promptText,
      status: "PENDING",
    },
  });

  await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      clientId: client.id,
      title: `Design: ${preset.name}`,
      status: "IN_PROGRESS",
      dueLabel: "Delivered today",
    },
  });

  const amountCents = (Math.floor(Math.random() * 8) + 5) * 5000; // $250–$600, in $50 steps
  await prisma.invoice.create({
    data: {
      workspaceId: workspace.id,
      number: `DEMO-${Math.floor(Math.random() * 9000) + 1000}`,
      clientId: client.id,
      amountCents,
      status: "PENDING",
      dueLabel: "Due in 7 days",
    },
  });

  const thread = await prisma.messageThread.create({
    data: { workspaceId: workspace.id, clientId: client.id },
  });
  await prisma.message.create({
    data: {
      workspaceId: workspace.id,
      threadId: thread.id,
      fromVA: true,
      body: `Hi ${contact.name.split(" ")[0]}! I put together a design based on "${promptText}" — take a look under Designs. I've also opened a project and sent an invoice for this piece. Ask me anything here any time.`,
    },
  });

  await createClientSession(client.id);
  return client;
}

const ACK_REPLIES = [
  "Got it — I'll take a look and get right back to you.",
  "Sounds good, I'm on it!",
  "Thanks for the details — I'll factor that in.",
  "Noted! I'll follow up shortly.",
];

/** Called right after a demo client's own message is saved — replies in the same thread so it feels instant, no polling needed. */
export async function botReplyToMessage({
  workspaceId,
  threadId,
  clientId,
  incomingBody,
}: {
  workspaceId: string;
  threadId: string;
  clientId: string;
  incomingBody: string;
}) {
  const lower = incomingBody.toLowerCase();
  let reply: string;

  if (/invoice|price|cost|pay/.test(lower)) {
    reply = "Good question — you can see the current invoice and pay it right from your dashboard. Let me know if the amount needs adjusting.";
  } else if (/design|logo|flyer|post|color|colour/.test(lower)) {
    reply = "Happy to adjust the design — leave a comment on it directly (under Designs) and I'll get a revision to you.";
  } else if (/project|timeline|when|done|finish/.test(lower)) {
    reply = "It's moving along — I just nudged the project forward, check the dashboard for the latest status.";
    await bumpDemoProject(workspaceId, clientId);
  } else {
    reply = ACK_REPLIES[Math.floor(Math.random() * ACK_REPLIES.length)];
  }

  await prisma.message.create({ data: { workspaceId, threadId, fromVA: true, body: reply } });
  await prisma.messageThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });
}

const STAGES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;
async function bumpDemoProject(workspaceId: string, clientId: string) {
  const project = await prisma.project.findFirst({ where: { workspaceId, clientId }, orderBy: { createdAt: "desc" } });
  if (!project) return;
  const idx = STAGES.indexOf(project.status as (typeof STAGES)[number]);
  if (idx < 0 || idx >= STAGES.length - 1) return;
  await prisma.project.update({ where: { id: project.id }, data: { status: STAGES[idx + 1] } });
}

/** Called right after a demo client posts a comment on a sent design. */
export async function botReplyToDesignComment({
  workspaceId,
  approvalId,
}: {
  workspaceId: string;
  approvalId: string;
}) {
  await prisma.designComment.create({
    data: {
      workspaceId,
      approvalId,
      fromVA: true,
      body: "Thanks for the note — I'll get a revision over to you shortly.",
    },
  });
}

/** Called right after a demo client approves a design — closes the loop with a thank-you and marks the project done. */
export async function botReplyToApproval({
  workspaceId,
  approvalId,
  clientId,
}: {
  workspaceId: string;
  approvalId: string;
  clientId: string;
}) {
  await prisma.designComment.create({
    data: {
      workspaceId,
      approvalId,
      fromVA: true,
      body: "Love it, thank you! I'll get this finalized and delivered.",
    },
  });
  await prisma.project.updateMany({
    where: { workspaceId, clientId },
    data: { status: "DONE", dueLabel: "Delivered" },
  });
}

