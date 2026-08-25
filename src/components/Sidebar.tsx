"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AppShell.module.css";
import { ThemeToggle } from "./ThemeToggle";
import {
  IconHome,
  IconUsers,
  IconBoard,
  IconSparkle,
  IconCalendar,
  IconReceipt,
  IconInbox,
  IconGlobe,
  IconBrandMark,
} from "./icons";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: IconHome },
  { href: "/clients", label: "Clients", icon: IconUsers },
  { href: "/projects", label: "Projects", icon: IconBoard },
  { href: "/design-engine", label: "Design Engine", icon: IconSparkle },
  { href: "/calendar", label: "Calendar", icon: IconCalendar },
  { href: "/invoices", label: "Invoices", icon: IconReceipt },
  { href: "/inbox", label: "Inbox", icon: IconInbox },
  { href: "/portal", label: "Client Portal", icon: IconGlobe },
];

export function Sidebar({ userName, userInitials }: { userName: string; userInitials: string }) {
  const pathname = usePathname();

  return (
    <div className={styles.side}>
      <div className={styles.brand}>
        <div className={styles.mark}>
          <IconBrandMark />
        </div>
        <div className={styles.brandName}>VA Hub</div>
      </div>
      {NAV.map((item) => {
        const active = pathname?.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} className={`${styles.navitem} ${active ? styles.active : ""}`}>
            <Icon />
            {item.label}
          </Link>
        );
      })}
      <div className={styles.foot}>
        <div className={styles.avatar}>{userInitials}</div>
        <div>
          <div className={styles.footWho}>{userName}</div>
          <div className={styles.footRole}>Virtual Assistant</div>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
