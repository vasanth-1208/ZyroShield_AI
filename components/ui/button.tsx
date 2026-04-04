import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-primary to-cyan-500 text-primary-foreground shadow-[0_8px_20px_rgba(14,165,233,0.35)] hover:brightness-110",
        secondary: "bg-gradient-to-br from-secondary to-emerald-500 text-secondary-foreground shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:brightness-110",
        ghost: "hover:bg-muted/70 hover:text-foreground",
        outline: "border border-border bg-white/45 dark:bg-slate-950/35 hover:bg-muted/60"
      },
      size: {
        default: "h-10 px-4 py-2.5",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-xl px-6"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
