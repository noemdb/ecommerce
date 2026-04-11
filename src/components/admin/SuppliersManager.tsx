"use client";

import { useState, useTransition } from "react";
import { deleteSupplier } from "@/actions/suppliers";
import { Button } from "@/components/ui/button";
import { SupplierModal } from "./SupplierModal";
import {
  Truck,
  Plus,
  Mail,
  Phone,
  Pencil,
  Trash2,
  MapPin,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/providers/ConfirmProvider";

interface Supplier {
  id: string;
  name: string;
  rif: string | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  commercialTerms: string | null;
  isActive: boolean;
  _count: { products: number };
}

interface SuppliersManagerProps {
  suppliers: Supplier[];
}

export function SuppliersManager({ suppliers }: SuppliersManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>();
  const confirm = useConfirm();

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingSupplier(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "¿Eliminar proveedor?",
      description: "Si el proveedor tiene productos asociados, no podrá ser eliminado. ¿Deseas continuar?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (!isConfirmed) return;

    startTransition(async () => {
      const result = await deleteSupplier(id);
      if (result.success) {
        toast.success("Proveedor eliminado");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 font-black uppercase text-neutral-800 dark:text-neutral-100">
            Gestión de Proveedores
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
            Administra tus fuentes de suministro y condiciones comerciales.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Proveedor
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {suppliers.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md py-20 flex flex-col items-center gap-4 text-neutral-400">
            <Truck className="w-12 h-12 opacity-20" />
            <p className="font-medium">No hay proveedores registrados aún.</p>
          </div>
        ) : (
          suppliers.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md p-6 flex flex-col gap-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
            >
              {/* Status indicator line */}
              <div className={`absolute top-0 left-0 w-1 h-full ${s.isActive ? 'bg-emerald-500' : 'bg-neutral-300'}`} />

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${s.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-neutral-100 text-neutral-400'}`}>
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{s.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                        {s.rif || "SIN RIF"}
                      </span>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded",
                        s.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-neutral-100 text-neutral-400"
                      )}>
                        {s.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:text-blue-600"
                    onClick={() => handleEdit(s)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:text-red-500"
                    onClick={() => handleDelete(s.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center">
                      <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                    <span className="text-neutral-600 dark:text-neutral-400 truncate">
                      {s.email || "No especificado"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {s.phone || "No especificado"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                    <span className="text-neutral-600 dark:text-neutral-400 line-clamp-1">
                      {s.address || "Sin dirección"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center">
                      <ClipboardList className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                    <span className="text-neutral-600 dark:text-neutral-400 line-clamp-1">
                      {s.commercialTerms || "Sin términos"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Productos Asociados</span>
                  <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs font-black">
                    {s._count.products}
                  </span>
                </div>
                {s.contactName && (
                  <span className="text-[10px] font-bold text-neutral-500 italic">
                    Contacto: {s.contactName}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <SupplierModal
          supplier={editingSupplier}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
