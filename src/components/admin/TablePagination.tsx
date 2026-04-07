"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export function TablePagination({ currentPage, totalPages, totalItems, pageSize }: TablePaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onPageChange(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  }

  if (totalPages <= 1 && totalItems > 0) return (
     <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-white/5">
        <div className="text-xs text-neutral-500 font-medium">
          Mostrando <span className="font-bold text-neutral-900 dark:text-neutral-200">{totalItems}</span> productos
        </div>
     </div>
  );
  
  if (totalItems === 0) return null;

  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalItems);

  // Simple range logic for page numbers
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-white/5">
      <div className="text-xs text-neutral-500 font-medium">
        Mostrando <span className="font-bold text-neutral-900 dark:text-neutral-200">{startIdx}</span> - <span className="font-bold text-neutral-900 dark:text-neutral-200">{endIdx}</span> de <span className="font-bold">{totalItems}</span> productos
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 w-8 p-0 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-1">
          {visiblePages.map((page, idx) => {
            const prev = visiblePages[idx - 1];
            const showEllipsis = prev && page - prev > 1;

            return (
              <React.Fragment key={page}>
                {showEllipsis && <span className="text-neutral-300 px-1 font-bold">...</span>}
                <Button
                  variant={currentPage === page ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className={cn(
                    "h-8 min-w-[32px] px-2 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all duration-300",
                    currentPage === page 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-105" 
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                >
                  {page}
                </Button>
              </React.Fragment>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 w-8 p-0 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
