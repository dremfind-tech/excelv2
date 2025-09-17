"use client";
import React, { useId, useState } from "react";
import { cn } from "@/lib/utils";

export function Accordion({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-3", className)}>{children}</div>;
}

export function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="glass">
      <button
        aria-controls={id}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-4 py-3 flex items-center justify-between"
      >
        <span className="font-medium">{title}</span>
        <span className="text-sm text-muted">{open ? "−" : "+"}</span>
      </button>
      <div id={id} hidden={!open} className="px-4 pb-4 text-sm text-muted">
        {children}
      </div>
    </div>
  );
}
