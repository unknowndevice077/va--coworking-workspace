"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clientLogoutAction } from "@/app/client/logout/actions";
import styles from "./ClientShell.module.css";

function initialsOf(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

const NAV = [
  { href: "/client", label: "Dashboard" },
  { href: "/client/inbox", label: "Messages" },
];

export function ClientShell({
  clientName,
  contactName,
  children,
}: {
  clientName: string;
  contactName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <div className={styles.brandrow}>
          <div className={styles.clientmark}>{initialsOf(clientName)}</div>
          <div>
            <div className={styles.clientname}>{clientName}</div>
            <div className={styles.poweredby}>CLIENT PORTAL · POWERED BY VA HUB</div>
          </div>
        </div>
        <div className={styles.right}>
          <nav className={styles.nav}>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navlink} ${pathname === item.href ? styles.navlinkOn : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className={styles.who}>{contactName}</div>
          <form action={clientLogoutAction}>
            <button className={styles.logout} type="submit">Sign out</button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
