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
    return "rounded-full px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200/60 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white sm:px-3 sm:py-2 sm:text-sm whitespace-nowrap";
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
          <Link href="/pr-intake" className={getLinkStyle("/pr-intake")}>
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
