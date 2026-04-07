"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  isCollapsed?: boolean;
}

export function ThemeToggle({ isCollapsed }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn(
        "flex items-center gap-3 h-12 w-full rounded-md px-4 opacity-50",
        isCollapsed && "justify-center px-0"
      )}>
        <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        {!isCollapsed && <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />}
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "w-full gap-3 h-12 rounded-md font-bold transition-all duration-300",
        isCollapsed ? "justify-center px-0" : "justify-start px-4",
        "text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10"
      )}
      title={isCollapsed ? (isDark ? "Modo Claro" : "Modo Oscuro") : undefined}
    >
      <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
        <Sun className={cn(
          "h-5 w-5 transition-all duration-500 absolute",
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        )} />
        <Moon className={cn(
          "h-5 w-5 transition-all duration-500 absolute",
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        )} />
      </div>
      {!isCollapsed && (
        <span className="truncate">
          {isDark ? "Modo Claro" : "Modo Oscuro"}
        </span>
      )}
    </Button>
  );
}
