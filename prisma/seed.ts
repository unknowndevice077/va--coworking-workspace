import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { designTemplates } from "../src/lib/design-templates";

const prisma = new PrismaClient();

async function main() {
  await prisma.designApproval.deleteMany();
  await prisma.designTemplate.deleteMany();
  await prisma.message.deleteMany();
  await prisma.messageThread.deleteMany();
  await prisma.clientFile.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);
  const jamie = await prisma.user.create({
    data: { name: "Jamie Rios", email: "jamie@vahub.app", passwordHash, role: "VA" },
  });

  const brightleaf = await prisma.client.create({
    data: {
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
      { clientId: pumpkin.id, title: "Fall menu social pack", status: "TODO", dueLabel: "Due Fri" },
      { clientId: brightleaf.id, title: "Q4 content calendar", status: "TODO", dueLabel: "Due Mon" },
      { clientId: coastal.id, title: "Website copy refresh", status: "IN_PROGRESS", dueLabel: "Due Thu" },
      { clientId: vantage.id, title: "Onboarding checklist", status: "IN_PROGRESS", dueLabel: "Due Mon" },
      { clientId: pumpkin.id, title: "Logo revision v2", status: "REVIEW", dueLabel: "Awaiting approval" },
      { clientId: brightleaf.id, title: "September invoicing", status: "DONE", dueLabel: "Completed Tue" },
      { clientId: coastal.id, title: "Instagram grid — August", status: "DONE", dueLabel: "Completed Mon" },
    ],
  });

  await prisma.invoice.createMany({
    data: [
      { number: "1041", clientId: brightleaf.id, amountCents: 98000, status: "PAID" },
      { number: "1042", clientId: brightleaf.id, amountCents: 120000, status: "PAID" },
      { number: "1043", clientId: coastal.id, amountCents: 85000, status: "PENDING", dueLabel: "Aug 30" },
      { number: "1044", clientId: pumpkin.id, amountCents: 43000, status: "OVERDUE", dueLabel: "Aug 15" },
      { number: "1045", clientId: vantage.id, amountCents: 210000, status: "DRAFT" },
    ],
  });

  await prisma.calendarEvent.createMany({
    data: [
      { clientId: vantage.id, title: "Onboarding call", day: "MON", startHour: 10, endHour: 11 },
      { clientId: brightleaf.id, title: "Content review", day: "WED", startHour: 10, endHour: 10.5 },
      { clientId: coastal.id, title: "Client call", day: "THU", startHour: 14, endHour: 14.5 },
      { clientId: vantage.id, title: "Invoice due", day: "FRI", startHour: 0, endHour: 0, allDay: true },
      { clientId: pumpkin.id, title: "Logo approval deadline", day: "FRI", startHour: 0, endHour: 0, allDay: true },
    ],
  });

  const thread = await prisma.messageThread.create({ data: { clientId: coastal.id } });
  await prisma.message.createMany({
    data: [
      { threadId: thread.id, fromVA: false, body: "Hi Jamie — quick one, can we push today's call to 2:30 instead of 2:00?" },
      { threadId: thread.id, fromVA: true, body: "Of course, I'll update the calendar now and send a new invite." },
      { threadId: thread.id, fromVA: false, body: "Perfect, thank you!" },
    ],
  });
  await prisma.messageThread.create({ data: { clientId: brightleaf.id } }).then((t) =>
    prisma.message.create({ data: { threadId: t.id, fromVA: false, body: "Logo files look great, thank you!" } })
  );
  await prisma.messageThread.create({ data: { clientId: vantage.id } }).then((t) =>
    prisma.message.create({ data: { threadId: t.id, fromVA: false, body: "Sending onboarding docs now" } })
  );
  await prisma.messageThread.create({ data: { clientId: pumpkin.id } }).then((t) =>
    prisma.message.create({ data: { threadId: t.id, fromVA: false, body: "Loved revision 2, one small tweak" } })
  );

  await prisma.clientFile.createMany({
    data: [
      { clientId: brightleaf.id, filename: "Q4_content_calendar.pdf", sizeLabel: "1.2 MB" },
      { clientId: brightleaf.id, filename: "fall_menu_post_v2.png", sizeLabel: "840 KB" },
      { clientId: brightleaf.id, filename: "brand_refresh_notes.docx", sizeLabel: "96 KB" },
    ],
  });

  for (const t of designTemplates) {
    await prisma.designTemplate.create({
      data: {
        id: t.id,
        name: t.name,
        category: t.category,
        keywords: t.keywords.join(","),
        svg: t.iconPath,
      },
    });
  }

  await prisma.designApproval.create({
    data: {
      clientId: brightleaf.id,
      templateId: "social-bold-announcement",
      status: "PENDING",
      promptText: "Instagram post announcing our fall bakery menu",
    },
  });

  console.log("Seeded:", { jamie: jamie.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
