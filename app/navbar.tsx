"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./theme-toggle";

export default function Navbar() {
  const pathname = usePathname();

  const getLinkStyle = (path: string) => {
    const isActive = pathname === path;
    if (isActive) {
      return "rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-800 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-400 transition sm:px-3.5 sm:py-2 sm:text-sm whitespace-nowrap";
    }
    return "rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 transition hover:bg-slate-200/60 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white sm:px-3 sm:py-2 sm:text-sm whitespace-nowrap";
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-background/80 backdrop-blur dark:border-slate-800">
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between px-4 py-2.5 sm:py-4 gap-2 sm:gap-0">
        
        {/* Top Row on Mobile: Logo + Theme Toggle */}
        <div className="flex w-full sm:w-auto items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-400 text-xs font-black text-slate-950">
              S
            </span>
            <span className="text-sm font-bold tracking-wide">ScopeGuard AI</span>
          </Link>

          {/* Theme toggle visible on mobile top bar */}
          <div className="sm:hidden">
            <ThemeToggle />
          </div>
        </div>

        {/* Navigation Links & Desktop Theme Toggle */}
        <div className="flex w-full sm:w-auto items-center justify-center sm:justify-end gap-2 text-xs sm:text-sm">
          <Link
            href="/"
            aria-label="Main Dashboard"
            title="Main Dashboard"
            className={getLinkStyle("/")}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.5V21h14V9.5" />
              <path d="M9 21v-6h6v6" />
            </svg>
            <span className="sr-only">Main Dashboard</span>
          </Link>
          <Link href="/scope-analyzer" className={getLinkStyle("/scope-analyzer")}>
            Start Audit
          </Link>
          <Link href="/audit-dashboard" className={getLinkStyle("/audit-dashboard")}>
            Audit Dashboard
          </Link>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
        </div>

      </div>
    </nav>
  );
}
