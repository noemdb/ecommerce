"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useDebounce } from "@/hooks/use-debounce"; // I'll check if this exists or create it

export function ProductSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const initialValue = searchParams.get("q") || "";
  const [value, setValue] = useState(initialValue);
  
  // Update state if URL changes externally
  useEffect(() => {
    setValue(searchParams.get("q") || "");
  }, [searchParams]);

  const debouncedValue = useDebounce(value, 400);

  useEffect(() => {
    if (debouncedValue === initialValue) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedValue) {
      params.set("q", debouncedValue);
    } else {
      params.delete("q");
    }
    params.set("page", "1"); // Reset pagination

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  }, [debouncedValue, initialValue, router, searchParams]);

  return (
    <div className="relative max-w-sm w-full group">
      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isPending ? "text-blue-500 animate-pulse" : "text-neutral-400 group-focus-within:text-blue-500"}`} />
      <input
        type="search"
        placeholder="Buscar producto o SKU..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-11 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 pl-11 pr-10 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
      />
      {value && (
        <button
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
