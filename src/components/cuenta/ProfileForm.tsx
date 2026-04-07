"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateCustomerProfileSchema, type UpdateCustomerProfileInput } from "@/lib/validators/auth";
import { updateCustomerProfileAction } from "@/actions/customer-account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export function ProfileForm({ 
  initialData 
}: { 
  initialData: { name: string; email: string; phone?: string | null; idDoc?: string | null; address?: string | null } 
}) {
  const [isPending, setIsPending] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateCustomerProfileInput>({
    resolver: zodResolver(updateCustomerProfileSchema),
    defaultValues: {
      name: initialData.name,
      phone: initialData.phone || "",
      idDoc: initialData.idDoc || "",
      address: initialData.address || ""
    }
  });

  const onSubmit = async (data: UpdateCustomerProfileInput) => {
    setIsPending(true);

    const res = await updateCustomerProfileAction(data);
    if (!res.success) {
      toast.error(res.error || "Error al actualizar perfil");
    } else {
      toast.success("Perfil actualizado correctamente.");
    }
    setIsPending(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Correo Electrónico
          </label>
          <Input value={initialData.email} disabled className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500" />
          <p className="text-xs text-neutral-500 mt-1">El email no puede ser modificado.</p>
        </div>

        <div>
           <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Nombre Completo
          </label>
          <Input {...register("name")} placeholder="Tu nombre" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
           <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Teléfono
          </label>
          <Input {...register("phone")} placeholder="Ej. 0414..." />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div>
           <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Documento / RIF
          </label>
          <Input {...register("idDoc")} placeholder="Ej. V-12345678" />
        </div>

        <div className="sm:col-span-2">
           <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Dirección
          </label>
          <Input {...register("address")} placeholder="Dirección completa" />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
