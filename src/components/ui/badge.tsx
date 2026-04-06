import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium",
        {
          "bg-zinc-100 text-zinc-600": variant === "default",
          "bg-emerald-50 text-emerald-700 border border-emerald-100": variant === "success",
          "bg-amber-50 text-amber-700 border border-amber-100": variant === "warning",
          "bg-red-50 text-red-700 border border-red-100": variant === "error",
          "bg-violet-50 text-violet-700 border border-violet-100": variant === "info",
        },
        className
      )}
      {...props}
    />
  );
}
