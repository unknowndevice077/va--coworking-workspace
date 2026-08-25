import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import styles from "@/components/AppShell.module.css";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className={styles.shell}>
      <Sidebar userName={user.name} userInitials={initialsOf(user.name)} />
      <div className={styles.main}>
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}
