"use client";
import React, { createContext, useContext, useState, cloneElement } from "react";
import { cn } from "@/lib/utils";

type DialogContext = { open: boolean; setOpen: (v: boolean) => void };
const Ctx = createContext<DialogContext | null>(null);

export function Dialog({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (v: boolean) => void }) {
  const [inner, setInner] = useState(false);
  const isControlled = typeof open === "boolean";
  const value = isControlled ? open! : inner;
  const setValue = (v: boolean) => (isControlled ? onOpenChange?.(v) : setInner(v));
  return <Ctx.Provider value={{ open: value, setOpen: setValue }}>{children}</Ctx.Provider>;
}

export function DialogTrigger({ children }: { children: React.ReactElement }) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("DialogTrigger must be used within <Dialog>");
  return cloneElement(children, { onClick: () => ctx.setOpen(true) });
}

export function DialogContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("DialogContent must be used within <Dialog>");
  if (!ctx.open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center"
      onClick={() => ctx.setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className={cn("glass relative mx-4 max-w-lg w-full", className)} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="px-6 pt-6 text-lg font-semibold">{children}</div>;
}
export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="px-6 pb-6 flex justify-end gap-2">{children}</div>;
}
