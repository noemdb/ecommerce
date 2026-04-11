"use client";

import { useState, useTransition } from "react";
import { createSupplier, updateSupplier } from "@/actions/suppliers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Truck, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
}

interface SupplierModalProps {
  supplier?: Supplier;
  onClose: () => void;
}

export function SupplierModal({ supplier, onClose }: SupplierModalProps) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: supplier?.name || "",
    rif: supplier?.rif || "",
    contactName: supplier?.contactName || "",
    phone: supplier?.phone || "",
    email: supplier?.email || "",
    address: supplier?.address || "",
    commercialTerms: supplier?.commercialTerms || "",
    isActive: supplier?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      const result = supplier 
        ? await updateSupplier(supplier.id, form)
        : await createSupplier(form);

      if (result.success) {
        toast.success(supplier ? "Proveedor actualizado" : "Proveedor creado");
        onClose();
      } else {
        toast.error(result.error || "Ocurrió un error");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-7 py-6 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold">
              {supplier ? "Editar Proveedor" : "Nuevo Proveedor"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre del Proveedor *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Distribuidora Global S.A."
              required
            />
            <Input
              label="RIF / Identificación"
              value={form.rif}
              onChange={(e) => setForm({ ...form, rif: e.target.value })}
              placeholder="J-12345678-0"
            />
            <Input
              label="Persona de Contacto"
              value={form.contactName}
              onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              placeholder="Nombre del contacto..."
            />
            <Input
              label="Correo Electrónico"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="correo@proveedor.com"
            />
            <Input
              label="Teléfono"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+58 412..."
            />
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">Estado</label>
              <select
                className="flex h-14 w-full rounded-md border-2 border-neutral-100 bg-white px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white"
                value={form.isActive ? "true" : "false"}
                onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">Dirección Física</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Dirección completa del proveedor..."
              className="flex w-full rounded-md border-2 border-neutral-100 bg-white px-4 py-3 text-sm font-medium transition-all duration-300 placeholder:text-neutral-300 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white dark:placeholder:text-neutral-600 resize-none h-20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">Términos Comerciales</label>
            <textarea
              value={form.commercialTerms}
              onChange={(e) => setForm({ ...form, commercialTerms: e.target.value })}
              placeholder="Condiciones de pago, tiempos de entrega, etc..."
              className="flex w-full rounded-md border-2 border-neutral-100 bg-white px-4 py-3 text-sm font-medium transition-all duration-300 placeholder:text-neutral-300 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white dark:placeholder:text-neutral-600 resize-none h-20"
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={isPending}
            >
              {supplier ? "Guardar Cambios" : "Crear Proveedor"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
