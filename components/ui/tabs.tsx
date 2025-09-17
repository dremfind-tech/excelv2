"use client";
import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

type TabsContext = { value: string; setValue: (v: string) => void };
const Ctx = createContext<TabsContext | null>(null);

export function Tabs({ defaultValue, children, className }: { defaultValue: string; children: React.ReactNode; className?: string }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <Ctx.Provider value={{ value, setValue }}>
      <div className={cn("w-full", className)}>{children}</div>
    </Ctx.Provider>
  );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("inline-flex gap-2 rounded-xl border p-1 border-[color:var(--border)] bg-[color:var(--card)]", className)}>{children}</div>;
}

export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("TabsTrigger must be used within <Tabs>");
  const active = ctx.value === value;
  return (
    <button
      onClick={() => ctx.setValue(value)}
      className={cn(
        "px-4 py-1.5 text-sm rounded-full focus-ring transition",
        active
          ? "bg-primary text-white shadow ring-2 ring-primary/70"
          : "text-foreground/80 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("TabsContent must be used within <Tabs>");
  if (ctx.value !== value) return null;
  return <div className="mt-4">{children}</div>;
}
