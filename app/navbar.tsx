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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        {/* Brand Logo */}
        <Link href="/" className="hidden md:flex items-center gap-2.5 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400 text-sm font-black text-slate-950">
            S
          </span>
          <div>
            <p className="text-sm font-bold tracking-wide whitespace-nowrap">
              ScopeGuard AI
            </p>
            <p className="hidden text-[10px] uppercase tracking-wider text-slate-700 dark:text-slate-400 sm:block">
              Autonomous scope enforcement
            </p>
          </div>
        </Link>

        {/* Dynamic Navigation Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link href="/pr-intake" className={getLinkStyle("/pr-intake")}>
            Start Audit
          </Link>

          <Link href="/audit-dashboard" className={getLinkStyle("/audit-dashboard")}>
            Audit Dashboard
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
