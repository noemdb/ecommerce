"use client";

import { useState } from "react";
import { Sparkles, Search, ExternalLink, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { PromptActions } from "./PromptActions";
import Link from "next/link";

interface PromptWithProduct {
  id: string;
  productId: string;
  version: number;
  prompt: string;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  product: {
    name: string;
    sku: string;
  };
}

interface PromptListProps {
  initialPrompts: PromptWithProduct[];
}

export function PromptList({ initialPrompts }: PromptListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPrompts = initialPrompts.filter((p) =>
    p.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="relative max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Buscar por producto, SKU o contenido..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-11 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
        />
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
        {filteredPrompts.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4 text-neutral-400">
            <Sparkles className="w-12 h-12 opacity-20" />
            <p className="font-medium">No se encontraron prompts AI.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-white/5">
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-neutral-400">Producto</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-neutral-400">Contenido del Prompt</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-neutral-400 text-center">Versión</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-neutral-400">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-neutral-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredPrompts.map((p) => (
                  <tr key={p.id} className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <Link 
                          href={`/admin/productos/${p.productId}`}
                          className="font-bold text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors"
                        >
                          {p.product.name}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <code className="text-[10px] tabular-nums uppercase font-black text-neutral-400 tracking-wider">
                          {p.product.sku}
                        </code>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <p className="line-clamp-2 text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed italic">
                        "{p.prompt}"
                      </p>
                      {p.notes && (
                        <p className="mt-1 text-[10px] text-neutral-400 font-medium truncate">
                           Nota: {p.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-black text-xs">
                        v{p.version}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] uppercase font-black px-2.5 py-1 rounded-full",
                        p.isActive 
                          ? "text-emerald-600 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.1)]" 
                          : "text-neutral-400 bg-neutral-100 dark:bg-neutral-800"
                      )}>
                        {p.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <PromptActions id={p.id} isActive={p.isActive} productName={p.product.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
