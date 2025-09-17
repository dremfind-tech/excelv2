"use client";
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline" | "secondary";
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variants: Record<string, string> = {
      default:
        "relative inline-flex items-center justify-center rounded-xl bg-primary text-white shadow-soft transition-all disabled:opacity-50 disabled:pointer-events-none hover:shadow-lg hover:-translate-y-0.5",
      ghost:
        "inline-flex items-center justify-center rounded-xl bg-transparent text-foreground/80 hover:text-foreground border border-white/10",
      outline:
        "inline-flex items-center justify-center rounded-xl bg-transparent text-foreground border border-white/20 hover:border-white/40",
      secondary:
        "inline-flex items-center justify-center rounded-xl bg-secondary text-black hover:opacity-90",
    };
    const sizes: Record<string, string> = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-5 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(variants[variant], sizes[size], "focus-ring", className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
