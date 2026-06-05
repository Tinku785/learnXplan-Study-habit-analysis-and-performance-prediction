import * as React from "react";
import { clsx } from "clsx";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={clsx(
          "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/10":
              variant === "default",
            "border border-slate-800 bg-slate-900/40 hover:bg-slate-900 text-slate-200":
              variant === "outline",
            "hover:bg-slate-900/40 hover:text-slate-100 text-slate-400":
              variant === "ghost",
          },
          {
            "px-4 py-2.5 text-sm": size === "default",
            "px-3 py-1.5 text-xs": size === "sm",
            "px-6 py-3.5 text-md": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
