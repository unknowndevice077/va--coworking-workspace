"use client";

import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Keying on the pathname forces a remount on navigation, which replays
  // the CSS entrance animation (see .animIn in globals.css) for a
  // consistent, low-cost "page transition" feel across the whole app.
  return (
    <div key={pathname} className="animIn">
      {children}
    </div>
  );
}
