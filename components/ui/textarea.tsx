import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
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
Textarea.displayName = "Textarea";
