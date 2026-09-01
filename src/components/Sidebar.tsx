"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AppShell.module.css";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import {
  IconHome,
  IconUsers,
  IconBoard,
  IconSparkle,
  IconCalendar,
  IconReceipt,
  IconInbox,
  IconGlobe,
  IconCheck,
  IconVideo,
  IconFile,
  IconChat,
  IconMenu,
  IconX,
} from "./icons";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: IconHome },
  { href: "/clients", label: "Clients", icon: IconUsers },
  { href: "/notes", label: "Notes", icon: IconFile },
  { href: "/projects", label: "Projects", icon: IconBoard },
  { href: "/design-engine", label: "Design Engine", icon: IconSparkle },
  { href: "/design-engine/sent", label: "Finished Designs", icon: IconCheck },
  { href: "/copy-chat", label: "AI Copy Chat", icon: IconChat },
  { href: "/videos", label: "Video Studio", icon: IconVideo },
  { href: "/calendar", label: "Calendar", icon: IconCalendar },
  { href: "/invoices", label: "Invoices", icon: IconReceipt },
  { href: "/inbox", label: "Inbox", icon: IconInbox },
  { href: "/portal", label: "Client Portal", icon: IconGlobe },
];

// The canvas and video editors are full-screen workspaces, like Canva's
// own editor — no room (or need) for the app's own nav alongside them.
// Both have their own Home button back to their library, so nothing is
// lost by hiding this.
function isFullScreenRoute(pathname: string | null) {
  const p = pathname ?? "";
  return /^\/design-engine\/studio\/[^/]+/.test(p) || /^\/videos\/[^/]+/.test(p);
}

export function Sidebar({ userName, userInitials }: { userName: string; userInitials: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const fullScreen = isFullScreenRoute(pathname);

  // Longest-prefix match, so "/design-engine/sent" doesn't also light up
  // the parent "/design-engine" item (and similar nested routes).
  const activeHref = [...NAV].sort((a, b) => b.href.length - a.href.length).find((item) => pathname?.startsWith(item.href))?.href;

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (fullScreen) return null;

  return (
    <>
      <div className={styles.mobileTopbar}>
        <button
          type="button"
          className={styles.hamburger}
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <IconMenu />
        </button>
        <div className={styles.brand} style={{ padding: 0 }}>
          <Logo size={27} />
          <div className={styles.brandName}>VA Hub</div>
        </div>
      </div>

      <div className={`${styles.backdrop} ${open ? styles.show : ""}`} onClick={() => setOpen(false)} />

      <div className={`${styles.side} ${open ? styles.open : ""}`}>
        <div className={styles.brand}>
          <Logo size={27} />
          <div className={styles.brandName}>VA Hub</div>
          <button
            type="button"
            className={styles.hamburger}
            style={{ marginLeft: "auto" }}
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <IconX />
          </button>
        </div>
        {NAV.map((item) => {
          const active = item.href === activeHref;
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
    </>
  );
}
