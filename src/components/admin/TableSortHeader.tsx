"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableSortHeaderProps {
  label: string;
  sortKey: string;
}

export function TableSortHeader({ label, sortKey }: TableSortHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentSort = searchParams.get("sort") || "";
  const [field, direction] = currentSort.split("_");
  
  const isSorted = field === sortKey;
  
  function handleSort() {
    const params = new URLSearchParams(searchParams.toString());
    
    if (isSorted && direction === "asc") {
      params.set("sort", `${sortKey}_desc`);
    } else if (isSorted && direction === "desc") {
      params.delete("sort"); // Clear sort on third click
    } else {
      params.set("sort", `${sortKey}_asc`);
    }
    
    // Reset to page 1 on sort change
    params.set("page", "1");
    
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <button
      onClick={handleSort}
      className={cn(
        "group flex items-center gap-1.5 transition-all text-[9px] font-black tracking-[0.2em] uppercase",
        isSorted ? "text-blue-600" : "text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
      )}
    >
      {label}
      <span className={cn(
        "transition-all duration-300",
        isSorted ? "opacity-100 scale-110" : "opacity-30 group-hover:opacity-100 group-hover:scale-105"
      )}>
        {isSorted ? (
          direction === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronsUpDown className="w-3.5 h-3.5" />
        )}
      </span>
    </button>
  );
}
