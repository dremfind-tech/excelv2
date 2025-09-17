import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs text-foreground/90",
        "border-[color:var(--border)] bg-[color:var(--card)]",
        className
      )}
      {...props}
    />
  );
}
