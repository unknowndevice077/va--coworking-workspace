import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VA Hub",
  description: "All-in-one workspace for Virtual Assistants — clients, projects, invoicing, and a Smart Design Template Engine.",
};

const THEME_SCRIPT = `
(function () {
  try {
    var stored = window.localStorage.getItem('va-hub-theme');
    var isDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@500;600;700&family=Public+Sans:wght@400;500;600;700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
