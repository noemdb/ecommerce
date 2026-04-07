"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            type={type}
            className={cn(
              "flex h-14 w-full rounded-2xl border-2 border-neutral-100 bg-white px-4 py-2 text-sm font-medium transition-all duration-300 placeholder:text-neutral-300 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white dark:placeholder:text-neutral-600",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
              className
            )}
            ref={ref}
            {...props}
          />
          {/* subtle glow on focus via group */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-focus-within:opacity-100 ring-2 ring-blue-600/5 pointer-events-none transition-opacity" />
        </div>
        {error && (
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
