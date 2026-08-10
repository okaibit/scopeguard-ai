"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem("scopeguard-theme");
    const isDark = saved !== "light";

    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const nextDark = !dark;

    setDark(nextDark);
    document.documentElement.classList.toggle(
      "dark",
      nextDark
    );

    window.localStorage.setItem(
      "scopeguard-theme",
      nextDark ? "dark" : "light"
    );
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        dark
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      className="rounded-lg border border-slate-700 px-3 py-2 text-sm transition hover:bg-slate-800"
    >
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
