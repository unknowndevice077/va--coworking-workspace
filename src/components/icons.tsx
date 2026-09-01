type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconHome({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

export function IconUsers({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15.5 14.2c2.6.4 4.5 2.6 4.5 5.3" />
    </svg>
  );
}

export function IconBoard({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <line x1="9" y1="4" x2="9" y2="20" />
      <line x1="15" y1="4" x2="15" y2="20" />
    </svg>
  );
}

export function IconSparkle({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8Z" />
    </svg>
  );
}

export function IconCalendar({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </svg>
  );
}

export function IconReceipt({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z" />
      <line x1="8.5" y1="8" x2="15.5" y2="8" />
      <line x1="8.5" y1="12" x2="15.5" y2="12" />
    </svg>
  );
}

export function IconInbox({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 12h4l1.5 3h5L16 12h4" />
      <path d="M4 12 5.5 5h13L20 12v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" />
    </svg>
  );
}

export function IconVideo({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2.5" y="6" width="14" height="12" rx="2" />
      <path d="m16.5 10.5 5-3v9l-5-3Z" />
    </svg>
  );
}

export function IconGlobe({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

export function IconPlus({ className }: IconProps) {
  return (
    <svg {...base} className={className} strokeWidth={2}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconArrowRight({ className }: IconProps) {
  return (
    <svg {...base} className={className} strokeWidth={2}>
      <path d="m11 4 7 7-7 7M4 11h13" />
    </svg>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function IconFile({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 2h9l5 5v15H6Z" />
      <path d="M15 2v5h5" />
    </svg>
  );
}

export function IconChat({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 5h16v11H8l-4 4Z" />
      <path d="M8 9h8M8 12.5h5" />
    </svg>
  );
}

export function IconSun({ className }: IconProps) {
  return (
    <svg {...base} className={className} strokeWidth={2}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function IconMoon({ className }: IconProps) {
  return (
    <svg {...base} className={className} strokeWidth={2}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg {...base} className={className} strokeWidth={2.2}>
      <path d="M5 12.5 10 17l9-10" />
    </svg>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <svg {...base} className={className} strokeWidth={2}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconX({ className }: IconProps) {
  return (
    <svg {...base} className={className} strokeWidth={2}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
