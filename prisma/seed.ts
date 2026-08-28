import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { findPreset } from "../src/lib/canvas-doc/presets";
import type { CanvasDoc } from "../src/lib/canvas-doc/types";

function withText(doc: CanvasDoc, matchText: string, newText: string): CanvasDoc {
  return {
    ...doc,
    pages: doc.pages.map((page) => ({
      ...page,
      elements: page.elements.map((el) => (el.type === "text" && el.text === matchText ? { ...el, text: newText } : el)),
    })),
  };
}

const prisma = new PrismaClient();

// Fixed id so re-running the seed always targets the same workspace instead
// of piling up duplicates, and so real signups (their own fresh Workspace
// rows, see src/app/signup/actions.ts) are never touched by it.
const DEMO_WORKSPACE_ID = "ws-demo";

async function main() {
  const workspace = await prisma.workspace.upsert({
    where: { id: DEMO_WORKSPACE_ID },
    update: {},
    create: { id: DEMO_WORKSPACE_ID, name: "Demo Workspace" },
  });
  const workspaceId = workspace.id;

  // Scoped to this one workspace — never touches a real signup's data.
  await prisma.designComment.deleteMany({ where: { workspaceId } });
  await prisma.designApproval.deleteMany({ where: { workspaceId } });
  await prisma.design.deleteMany({ where: { workspaceId } });
  await prisma.message.deleteMany({ where: { workspaceId } });
  await prisma.messageThread.deleteMany({ where: { workspaceId } });
  await prisma.clientFile.deleteMany({ where: { workspaceId } });
  await prisma.calendarEvent.deleteMany({ where: { workspaceId } });
  await prisma.invoice.deleteMany({ where: { workspaceId } });
  await prisma.timeEntry.deleteMany({ where: { workspaceId } });
  await prisma.project.deleteMany({ where: { workspaceId } });
  await prisma.client.deleteMany({ where: { workspaceId } });
  await prisma.user.deleteMany({ where: { workspaceId } });

  const passwordHash = await bcrypt.hash("password123", 10);
  const jamie = await prisma.user.create({
    data: { workspaceId, name: "Jamie Rios", email: "jamie@vahub.app", passwordHash, role: "VA" },
  });

  const brightleaf = await prisma.client.create({
    data: {
      workspaceId,
      name: "Brightleaf Studio",
      contactName: "Elena Cho",
      contactEmail: "elena@brightleafstudio.com",
      status: "ACTIVE",
      monthlyValueCents: 120000,
      services: "Design,Content",
    },
  });
  const coastal = await prisma.client.create({
    data: {
      workspaceId,
      name: "Coastal Realty Group",
      contactName: "Marcus Webb",
      contactEmail: "marcus@coastalrealty.com",
      status: "ACTIVE",
      monthlyValueCents: 85000,
      services: "Social,Admin",
    },
  });
  const pumpkin = await prisma.client.create({
    data: {
      workspaceId,
      name: "Pumpkin & Pine Bakery",
      contactName: "Ruth Alvarez",
      contactEmail: "ruth@pumpkinandpine.com",
      status: "ONBOARDING",
      monthlyValueCents: 43000,
      services: "Design",
    },
  });
  const vantage = await prisma.client.create({
    data: {
      workspaceId,
      name: "Vantage Fitness Co.",
      contactName: "Priya Nair",
      contactEmail: "priya@vantagefitness.com",
      status: "ACTIVE",
      monthlyValueCents: 210000,
      services: "Full Support",
    },
  });
  const marlowe = await prisma.client.create({
    data: {
      workspaceId,
      name: "Marlowe & Finch Law",
      contactName: "Devon Marlowe",
      contactEmail: "devon@marlowefinch.com",
      status: "PAUSED",
      monthlyValueCents: 0,
      services: "Admin,Inbox",
    },
  });

  await prisma.project.createMany({
    data: [
      { workspaceId, clientId: pumpkin.id, title: "Fall menu social pack", status: "TODO", dueLabel: "Due Fri" },
      { workspaceId, clientId: brightleaf.id, title: "Q4 content calendar", status: "TODO", dueLabel: "Due Mon" },
      { workspaceId, clientId: coastal.id, title: "Website copy refresh", status: "IN_PROGRESS", dueLabel: "Due Thu" },
      { workspaceId, clientId: vantage.id, title: "Onboarding checklist", status: "IN_PROGRESS", dueLabel: "Due Mon" },
      { workspaceId, clientId: pumpkin.id, title: "Logo revision v2", status: "REVIEW", dueLabel: "Awaiting approval" },
      { workspaceId, clientId: brightleaf.id, title: "September invoicing", status: "DONE", dueLabel: "Completed Tue" },
      { workspaceId, clientId: coastal.id, title: "Instagram grid — August", status: "DONE", dueLabel: "Completed Mon" },
    ],
  });

  await prisma.invoice.createMany({
    data: [
      { workspaceId, number: "1041", clientId: brightleaf.id, amountCents: 98000, status: "PAID" },
      { workspaceId, number: "1042", clientId: brightleaf.id, amountCents: 120000, status: "PAID" },
      { workspaceId, number: "1043", clientId: coastal.id, amountCents: 85000, status: "PENDING", dueLabel: "Aug 30" },
      { workspaceId, number: "1044", clientId: pumpkin.id, amountCents: 43000, status: "OVERDUE", dueLabel: "Aug 15" },
      { workspaceId, number: "1045", clientId: vantage.id, amountCents: 210000, status: "DRAFT" },
    ],
  });

  await prisma.calendarEvent.createMany({
    data: [
      { workspaceId, clientId: vantage.id, title: "Onboarding call", day: "MON", startHour: 10, endHour: 11 },
      { workspaceId, clientId: brightleaf.id, title: "Content review", day: "WED", startHour: 10, endHour: 10.5 },
      { workspaceId, clientId: coastal.id, title: "Client call", day: "THU", startHour: 14, endHour: 14.5 },
      { workspaceId, clientId: vantage.id, title: "Invoice due", day: "FRI", startHour: 0, endHour: 0, allDay: true },
      { workspaceId, clientId: pumpkin.id, title: "Logo approval deadline", day: "FRI", startHour: 0, endHour: 0, allDay: true },
    ],
  });

  const thread = await prisma.messageThread.create({ data: { workspaceId, clientId: coastal.id } });
  await prisma.message.createMany({
    data: [
      { workspaceId, threadId: thread.id, fromVA: false, body: "Hi Jamie — quick one, can we push today's call to 2:30 instead of 2:00?" },
      { workspaceId, threadId: thread.id, fromVA: true, body: "Of course, I'll update the calendar now and send a new invite." },
      { workspaceId, threadId: thread.id, fromVA: false, body: "Perfect, thank you!" },
    ],
  });
  await prisma.messageThread.create({ data: { workspaceId, clientId: brightleaf.id } }).then((t) =>
    prisma.message.create({ data: { workspaceId, threadId: t.id, fromVA: false, body: "Logo files look great, thank you!" } })
  );
  await prisma.messageThread.create({ data: { workspaceId, clientId: vantage.id } }).then((t) =>
    prisma.message.create({ data: { workspaceId, threadId: t.id, fromVA: false, body: "Sending onboarding docs now" } })
  );
  await prisma.messageThread.create({ data: { workspaceId, clientId: pumpkin.id } }).then((t) =>
    prisma.message.create({ data: { workspaceId, threadId: t.id, fromVA: false, body: "Loved revision 2, one small tweak" } })
  );

  await prisma.clientFile.createMany({
    data: [
      { workspaceId, clientId: brightleaf.id, filename: "Q4_content_calendar.pdf", sizeLabel: "1.2 MB" },
      { workspaceId, clientId: brightleaf.id, filename: "fall_menu_post_v2.png", sizeLabel: "840 KB" },
      { workspaceId, clientId: brightleaf.id, filename: "brand_refresh_notes.docx", sizeLabel: "96 KB" },
    ],
  });

  const sentPreset = findPreset("local-tip-pubmat")!;
  const sentDoc = withText(sentPreset.doc, "[Agent Name]", "Jamie Rios");
  await prisma.designApproval.create({
    data: {
      workspaceId,
      clientId: brightleaf.id,
      templateId: sentPreset.id,
      status: "PENDING",
      promptText: "insurance tip pubmat",
      doc: sentDoc as unknown as Prisma.InputJsonValue,
    },
  });

  // A private draft, sitting in the VA's own studio — not sent to anyone,
  // to demonstrate the "My Designs" library on a fresh seed.
  const draftPreset = findPreset("event-flyer")!;
  const draftDoc = withText(withText(draftPreset.doc, "Brightleaf Studio", "Coastal Realty Group"), "Fall Open House", "Waterfront Open House");
  await prisma.design.create({
    data: {
      workspaceId,
      templateId: draftPreset.id,
      name: "Coastal Realty — open house flyer",
      doc: draftDoc as unknown as Prisma.InputJsonValue,
      promptText: "open house flyer for coastal realty",
      status: "DRAFT",
    },
  });

  console.log("Seeded:", { jamie: jamie.email, workspace: workspace.name, marlowe: marlowe.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
