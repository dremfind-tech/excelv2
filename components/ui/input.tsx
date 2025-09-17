import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl border px-3 py-2 text-sm placeholder:text-muted focus-ring",
          "border-[color:var(--border)] bg-[color:var(--card)]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
