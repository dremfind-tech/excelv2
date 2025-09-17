"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const d = stored ? stored === "dark" : prefersDark;
      setDark(d);
      document.documentElement.classList.toggle("dark", d);
    } catch {}
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <button
      aria-label="Toggle theme"
      onClick={toggle}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] text-foreground/90 hover:opacity-90 focus-ring"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

