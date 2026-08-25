"use client";

import { useEffect, useState } from "react";
import { IconSun, IconMoon } from "./icons";
import styles from "./AppShell.module.css";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = window.localStorage.getItem("va-hub-theme");
    const isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("va-hub-theme", next ? "dark" : "light");
  }

  if (!mounted) return <div className={styles.themeBtn} />;

  return (
    <button type="button" onClick={toggle} className={styles.themeBtn} title="Toggle theme" aria-label="Toggle theme">
      {dark ? <IconSun /> : <IconMoon />}
    </button>
  );
}
