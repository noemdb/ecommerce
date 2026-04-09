"use client";

import { useState, useMemo } from "react";
import { Sparkles, Search, ExternalLink, Calendar, Eye, ArrowUpDown, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { PromptActions } from "./PromptActions";
import { ProductPreviewModal } from "./ProductPreviewModal";
import { PromptDetailModal } from "./PromptDetailModal";
import { Button as UIButton } from "@/components/ui/button";
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
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    promoPrice: number | null;
    sku: string;
    stock: number;
    categoryId: string;
    isNew: boolean;
    images: { url: string; isPrimary: boolean }[];
    category: { name: string };
  };
}

interface Category {
  id: string;
  name: string;
}

interface PromptListProps {
  initialPrompts: PromptWithProduct[];
  categories: Category[];
}

export function PromptList({ initialPrompts, categories }: PromptListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [previewProduct, setPreviewProduct] = useState<any>(null);
  const [detailPrompt, setDetailPrompt] = useState<PromptWithProduct | null>(null);
  
  // New States: Pagination, Sorting, Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortField, setSortField] = useState<"product" | "version" | "status" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // Filtering Logic
  const filteredPrompts = useMemo(() => {
    return initialPrompts.filter((p) => {
      const matchesSearch = 
        p.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.prompt.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        filterStatus === "all" || 
        (filterStatus === "active" && p.isActive) || 
        (filterStatus === "inactive" && !p.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [initialPrompts, searchTerm, filterStatus]);

  // Sorting Logic
  const sortedPrompts = useMemo(() => {
    const data = [...filteredPrompts];
    data.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "product":
          comparison = a.product.name.localeCompare(b.product.name);
          break;
        case "version":
          comparison = a.version - b.version;
          break;
        case "status":
          comparison = Number(a.isActive) - Number(b.isActive);
          break;
        case "date":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
    return data;
  }, [filteredPrompts, sortField, sortOrder]);

  // Pagination Logic
  const totalItems = sortedPrompts.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedPrompts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedPrompts.slice(start, start + pageSize);
  }, [sortedPrompts, currentPage, pageSize]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-20 group-hover:opacity-100 transition-opacity" />;
    return sortOrder === "asc" ? <ChevronUp className="w-3 h-3 ml-1 text-blue-500" /> : <ChevronDown className="w-3 h-3 ml-1 text-blue-500" />;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Buscar por producto o SKU..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="h-11 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-1 rounded-lg">
          {(["all", "active", "inactive"] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status);
                setCurrentPage(1);
              }}
              className={cn(
                "px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                filterStatus === status 
                  ? "bg-neutral-100 dark:bg-neutral-800 text-blue-600 dark:text-blue-400" 
                  : "text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              {status === "all" ? "Todos" : status === "active" ? "Activos" : "Inactivos"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
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
                  <th 
                    onClick={() => handleSort("product")}
                    className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-neutral-400 cursor-pointer group hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center">Producto <SortIcon field="product" /></div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-neutral-400">Contenido del Prompt</th>
                  <th 
                    onClick={() => handleSort("version")}
                    className="px-6 py-4 text-xs font-black uppercase tracking-widest text-neutral-400 text-center cursor-pointer group hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center justify-center">Versión <SortIcon field="version" /></div>
                  </th>
                  <th 
                    onClick={() => handleSort("status")}
                    className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-neutral-400 cursor-pointer group hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center">Estado <SortIcon field="status" /></div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-neutral-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {paginatedPrompts.map((p) => (
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
                        "text-[10px] uppercase font-black px-2.5 py-1 rounded-lg",
                        p.isActive 
                          ? "text-emerald-600 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.1)]" 
                          : "text-neutral-400 bg-neutral-100 dark:bg-neutral-800"
                      )}>
                        {p.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <UIButton
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewProduct(p.product)}
                          className="h-9 px-3 gap-2 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all shadow-sm"
                          title="Vista Previa de Producto"
                        >
                          <Eye className="w-4 h-4 text-blue-500" />
                        </UIButton>
                        <UIButton
                          variant="outline"
                          size="sm"
                          onClick={() => setDetailPrompt(p)}
                          className="h-9 px-3 gap-2 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all shadow-sm"
                          title="Ver Detalles de Prompt"
                        >
                          <Sparkles className="w-4 h-4 text-emerald-500" />
                        </UIButton>
                        <PromptActions id={p.id} isActive={p.isActive} productName={p.product.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-[10px] uppercase font-black tracking-widest text-neutral-400">
            Mostrando {Math.min(totalItems, (currentPage - 1) * pageSize + 1)} - {Math.min(totalItems, currentPage * pageSize)} de {totalItems} prompts
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-black transition-all",
                    currentPage === page 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                      : "text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}


      {previewProduct && (
        <ProductPreviewModal 
          isOpen={!!previewProduct} 
          onClose={() => setPreviewProduct(null)} 
          productData={{
            ...previewProduct,
            images: previewProduct.images.map((img: any) => img.url)
          }} 
          categories={categories} 
        />
      )}

      {detailPrompt && (
        <PromptDetailModal
          isOpen={!!detailPrompt}
          onClose={() => setDetailPrompt(null)}
          prompt={detailPrompt}
        />
      )}
    </div>
  );
}
