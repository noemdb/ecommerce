"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
}

export function AuthCard({ children, title, subtitle, icon, className }: AuthCardProps) {
  return (
    <div className={cn("w-full max-w-xl mx-auto", className)}>
      <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-2xl shadow-blue-500/5 border border-neutral-100 dark:border-neutral-800 overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="text-center mb-10 space-y-4">
            {icon && (
              <div className="flex justify-center">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-md text-blue-600">
                  {icon}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter text-neutral-900 dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="text-neutral-500 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {children}
        </div>
        
        <div className="px-8 py-6 bg-neutral-50 dark:bg-neutral-950/40 border-t border-neutral-100 dark:border-neutral-800 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">
            Seguridad de Grado Bancario & Encriptación SSL
          </p>
        </div>
      </div>
    </div>
  );
}
