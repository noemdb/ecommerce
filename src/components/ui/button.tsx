"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, asChild = false, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-[0.98]",
      secondary: "bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-white dark:border-neutral-800 dark:hover:bg-neutral-800 shadow-sm active:scale-[0.98]",
      outline: "bg-transparent border-2 border-neutral-200 text-neutral-900 hover:border-blue-600 hover:text-blue-600 dark:border-neutral-800 dark:text-white dark:hover:border-blue-600 dark:hover:text-blue-600 active:scale-[0.98]",
      ghost: "bg-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800",
      danger: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 active:scale-[0.98]",
    };

    const sizes = {
      sm: "h-9 px-4 text-xs font-bold uppercase tracking-wider",
      md: "h-11 px-6 text-sm font-bold uppercase tracking-wider",
      lg: "h-14 px-8 text-base font-bold uppercase tracking-wider",
      xl: "h-16 px-10 text-lg font-black uppercase tracking-widest",
    };

    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-md transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        <span className={cn(isLoading && "opacity-0")}>{children}</span>
        
        {/* Premium Glow Effect */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </Comp>
    );
  }
);

Button.displayName = "Button";
