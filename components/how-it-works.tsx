"use client";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Wand2, BarChart3, Share2 } from "lucide-react";
import React, { useState } from "react";

type Step = {
  title: string;
  description: string;
  icon: React.ReactNode;
  demo: React.ReactNode;
};

const demos = {
  upload: (
    <div className="h-24 rounded-xl border border-dashed border-white/15 bg-white/5 grid place-items-center text-xs text-muted">
      Drop Excel, CSV, TSV, or ODS here
    </div>
  ),
  clean: (
    <div className="h-24 rounded-xl bg-white/5 p-3">
      <div className="h-2 w-3/5 rounded bg-secondary/40 mb-2" />
      <div className="h-2 w-2/5 rounded bg-white/10 mb-2" />
      <div className="h-2 w-4/5 rounded bg-white/10" />
    </div>
  ),
  visualize: (
    <div className="h-24 rounded-xl bg-white/5 p-3">
      <div className="flex items-end gap-2 h-full">
        <div className="w-6 bg-primary/60 rounded" style={{ height: "40%" }} />
        <div className="w-6 bg-primary/60 rounded" style={{ height: "70%" }} />
        <div className="w-6 bg-primary/60 rounded" style={{ height: "55%" }} />
        <div className="w-6 bg-secondary/70 rounded" style={{ height: "80%" }} />
      </div>
    </div>
  ),
  share: (
    <div className="h-24 rounded-xl bg-white/5 grid place-items-center text-xs text-muted">
      Link copied to clipboard
    </div>
  ),
};

const steps: Step[] = [
  {
    title: "Upload",
    description: "Drag and drop spreadsheets or browse to select files.",
    icon: <UploadCloud size={16} />,
    demo: demos.upload,
  },
  {
    title: "Clean",
    description: "Auto-fix headers, types, and missing values with one click.",
    icon: <Wand2 size={16} />,
    demo: demos.clean,
  },
  {
    title: "Visualize",
    description: "Generate beautiful, on-brand charts with smart defaults.",
    icon: <BarChart3 size={16} />,
    demo: demos.visualize,
  },
  {
    title: "Share",
    description: "Export PNG/SVG/CSV or share a secure link with teammates.",
    icon: <Share2 size={16} />,
    demo: demos.share,
  },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);
  return (
    <div className="glass p-4 md:p-6">
      <h3 className="text-lg font-semibold mb-3">How it works</h3>

      {/* Progress track */}
      <div className="relative mb-5">
        <div className="h-1 rounded bg-white/10" />
        <motion.div
          className="h-1 rounded absolute top-0 left-0 bg-gradient-to-r from-primary via-primary to-secondary"
          initial={false}
          animate={{ width: `${((active) / (steps.length - 1)) * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      <div className="space-y-3">
        {steps.map((s, i) => {
          const selected = i === active;
          return (
            <motion.button
              key={s.title}
              onClick={() => setActive(i)}
              whileHover={{ y: -2 }}
              className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                selected ? "border-primary/50 bg-primary/10" : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg ${selected ? "bg-primary/30 text-primary" : "bg-white/10 text-foreground/90"}`}>
                  {s.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{s.title}</div>
                  <AnimatePresence initial={false}>
                    {selected && (
                      <motion.p
                        className="mt-1 text-sm text-foreground/80"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {s.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <AnimatePresence initial={false}>
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="mt-3"
                  >
                    {s.demo}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
