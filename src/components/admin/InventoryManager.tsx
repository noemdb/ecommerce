"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  BarChart3,
  History,
  Settings2,
  Search,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StockAdjustmentModal } from "./StockAdjustmentModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Product = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  category: { name: string };
};

type Movement = {
  id: string;
  productId: string;
  type: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  reason: string | null;
  createdAt: Date;
  product: { name: string; sku: string };
};

interface InventoryManagerProps {
  products: Product[];
  recentMovements: Movement[];
  outOfStock: number;
  lowStock: number;
  totalUnits: number;
}

export function InventoryManager({
  products: initialProducts,
  recentMovements,
  outOfStock,
  lowStock,
  totalUnits,
}: InventoryManagerProps) {
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = initialProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filter === "out") return p.stock <= 0;
    if (filter === "low") return p.stock > 0 && p.stock <= p.lowStockThreshold;
    return true;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Sin stock",
            value: outOfStock,
            icon: TrendingDown,
            color: "text-red-500",
            bg: "bg-red-500/10",
          },
          {
            label: "Stock bajo",
            value: lowStock,
            icon: AlertTriangle,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            label: "Unidades totales",
            value: totalUnits,
            icon: BarChart3,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md p-6 flex items-center gap-4 shadow-sm"
          >
            <div
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                stat.bg
              )}
            >
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-3xl font-black">{stat.value}</p>
              <p className="text-xs text-neutral-500 uppercase tracking-widest font-black">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="bg-neutral-100 dark:bg-neutral-800 p-1 mb-6">
          <TabsTrigger value="inventory" className="gap-2">
            <Package className="w-4 h-4" />
            Stock Actual
          </TabsTrigger>
          <TabsTrigger value="movements" className="gap-2">
            <History className="w-4 h-4" />
            Historial de Movimientos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="flex flex-col gap-6">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-md">
              {[
                { key: "all", label: "Todos" },
                { key: "low", label: "Bajo Stock" },
                { key: "out", label: "Agotados" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all",
                    filter === tab.key
                      ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative group max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Buscar por nombre o SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-md border-2 border-neutral-100 bg-white dark:bg-neutral-900 dark:border-neutral-800 text-sm focus:outline-none focus:border-blue-600 transition-all font-medium"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50">
                    {["Producto", "SKU", "Categoría", "Stock", "Estado", "Acción"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-neutral-400">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">No se encontraron productos</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isOut = p.stock <= 0;
                      const isLow = !isOut && p.stock <= p.lowStockThreshold;
                      return (
                        <tr
                          key={p.id}
                          className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="font-bold block">{p.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-[10px] font-black bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-neutral-500">
                              {p.sku}
                            </code>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-neutral-500">
                            {p.category.name}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                "text-lg font-black tabular-nums",
                                isOut ? "text-red-500" : isLow ? "text-amber-500" : ""
                              )}
                            >
                              {p.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {isOut ? (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded">
                                Agotado
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded">
                                Stock Bajo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">
                                Óptimo
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-2 border-dashed opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setSelectedProduct(p)}
                            >
                              <Settings2 className="w-3.5 h-3.5" />
                              Ajustar
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="movements">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50">
                    {["Fecha", "Producto", "Tipo", "Cantidad", "Stock", "Motivo"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {recentMovements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-neutral-400">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">No hay movimientos registrados</p>
                      </td>
                    </tr>
                  ) : (
                    recentMovements.map((m) => (
                      <tr key={m.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-500 font-medium">
                          {new Date(m.createdAt).toLocaleDateString("es-VE", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-xs block">{m.product.name}</span>
                          <span className="text-[10px] text-neutral-400">{m.product.sku}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "text-[10px] font-black uppercase px-2 py-1 rounded",
                              m.type === "ENTRADA" ? "bg-emerald-500/10 text-emerald-600" :
                              m.type === "SALIDA" ? "bg-red-500/10 text-red-600" :
                              "bg-blue-500/10 text-blue-600"
                            )}
                          >
                            {m.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "font-bold",
                            m.type === "ENTRADA" ? "text-emerald-600" : 
                            m.type === "SALIDA" ? "text-red-600" : ""
                          )}>
                            {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex items-center gap-2 text-xs grayscale opacity-60">
                          <span>{m.stockBefore}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="font-bold">{m.stockAfter}</span>
                        </td>
                        <td className="px-6 py-4 italic text-neutral-500 text-xs">
                          {m.reason || "Sin motivo"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {selectedProduct && (
        <StockAdjustmentModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
