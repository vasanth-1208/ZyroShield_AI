import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn(
          "h-10 w-full rounded-lg border border-border bg-white/65 px-3 text-sm outline-none transition duration-200 focus:border-primary/50 focus:ring-2 focus:ring-ring dark:bg-slate-900/55",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
