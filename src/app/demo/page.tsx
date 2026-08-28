import { redirect } from "next/navigation";
import { getCurrentClient } from "@/lib/client-auth";
import { templateCategories } from "@/lib/canvas-doc/presets";
import { Logo } from "@/components/Logo";
import { DemoForm } from "./DemoForm";
import styles from "./demo.module.css";

// Public, no login — a visitor plays the client role and an automated
// "VA" (src/lib/demo-bot.ts) instantly responds: a real matched-and-filled
// design, a project, an invoice, all sent to a throwaway demo client
// account created on the spot. No signup, no email, nothing shared with
// any real workspace (isDemo-flagged clients live in their own sandbox
// workspace, swept clean after 24h).
export default async function DemoPage() {
  const existing = await getCurrentClient();
  if (existing?.isDemo) redirect("/client");

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <Logo size={32} />
          <div className={styles.name}>VA Hub</div>
        </div>
        <div className={styles.badge}>
          <span>●</span> LIVE DEMO — NO SIGNUP NEEDED
        </div>
        <h1 className={styles.h1}>See it from the client&apos;s side</h1>
        <p className={styles.sub}>
          Describe a design like a real client would. Your automated VA will match a template, fill it out, send it
          for approval, open a project, and drop an invoice — instantly, so you can see the whole loop.
        </p>
        <DemoForm categories={templateCategories} />
        <p className={styles.hint}>
          Running a real business? <a href="/signup">Create your own workspace →</a>
        </p>
      </div>
    </div>
  );
}
