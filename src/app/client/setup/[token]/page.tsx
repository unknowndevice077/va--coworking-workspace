import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";
import { SetupForm } from "./SetupForm";
import styles from "../../client-auth.module.css";

export default async function ClientSetupPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const client = await prisma.client.findUnique({ where: { setupToken: token } });
  const expired = !client || !client.setupTokenExpiresAt || client.setupTokenExpiresAt < new Date();

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <Logo size={32} />
          <div className={styles.name}>VA Hub</div>
        </div>
        {expired ? (
          <>
            <h1 className={styles.h1}>Link expired</h1>
            <p className={styles.sub}>This setup link is invalid or has expired. Ask your VA to send you a new one.</p>
            <p className={styles.hint}>
              Already set up? <Link href="/client/login">Sign in →</Link>
            </p>
          </>
        ) : (
          <>
            <h1 className={styles.h1}>Set up your client portal</h1>
            <p className={styles.sub}>
              Welcome, {client.contactName.split(" ")[0]} — choose a password to finish setting up {client.name}&apos;s portal.
            </p>
            <SetupForm token={token} firstName={client.contactName.split(" ")[0]} />
          </>
        )}
      </div>
    </div>
  );
}
