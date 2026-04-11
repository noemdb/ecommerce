"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname, useParams } from "next/navigation";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function LanguageSelector() {
  const t = useTranslations("Language");
  const params = useParams();
  const currentLocale = params.locale as string;
  const router = useRouter(); // Stable native router
  const pathname = usePathname(); // Stable native pathname

  const handleLanguageChange = (newLocale: "en" | "es") => {
    if (!pathname) return;
    
    // Robust array-based path replacement to avoid /es/en errors
    const segments = pathname.split("/");
    // Standard structure: /locale/path... -> ['', 'es', 'path']
    if (segments.length > 1) {
      segments[1] = newLocale;
    }
    
    router.push(segments.join("/") || "/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-2 aspect-square text-neutral-600 dark:text-neutral-400">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Cambiar idioma</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleLanguageChange("es")}
          className={currentLocale === "es" ? "bg-neutral-100 dark:bg-neutral-800 font-bold" : ""}
        >
          {t("es")}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange("en")}
          className={currentLocale === "en" ? "bg-neutral-100 dark:bg-neutral-800 font-bold" : ""}
        >
          {t("en")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
