import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "default" | "success" | "warning" | "danger";
}

const toneClasses = {
  default: "bg-primary/15 text-primary border-primary/35",
  success: "bg-emerald-500/15 text-emerald-500 border-emerald-500/35",
  warning: "bg-amber-500/15 text-amber-500 border-amber-500/35",
  danger: "bg-rose-500/15 text-rose-500 border-rose-500/35"
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", toneClasses[tone], className)}
      {...props}
    />
  );
}
