import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeToggle from "./theme-toggle";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "ScopeGuard AI",
  description:
    "AI-powered scope enforcement, overage recommendations, and onchain settlement for software work.",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <a
              href="/"
              className="flex items-center gap-3"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400 text-sm font-black text-slate-950">
                S
              </span>
              <div>
                <p className="text-sm font-bold tracking-wide">
                  ScopeGuard AI
                </p>
                <p className="hidden text-[10px] uppercase tracking-wider text-slate-700 dark:text-slate-300 dark:text-slate-400 sm:block">
                  Autonomous scope enforcement
                </p>
              </div>
            </a>
            <div className="flex items-center gap-2">
              <a
                href="/pr-intake"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                Start Audit
              </a>
              <a
                href="/audit-dashboard"
                className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-400/10"
              >
                Audit Dashboard
              </a>
              <ThemeToggle />
            </div>
          </div>
        </nav>
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
