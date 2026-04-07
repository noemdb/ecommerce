"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validators/auth";
import { changeCustomerPasswordAction } from "@/actions/customer-account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export function ChangePasswordForm() {
  const [isPending, setIsPending] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsPending(true);

    const res = await changeCustomerPasswordAction(data);
    if (!res.success) {
      toast.error(res.error || "Error al cambiar la contraseña");
    } else {
      toast.success("Contraseña actualizada correctamente.");
      reset();
    }
    setIsPending(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      <div className="grid grid-cols-1 gap-6 max-w-md">
        <div>
           <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Contraseña Actual
          </label>
          <Input type="password" {...register("currentPassword")} placeholder="Ingresa tu contraseña actual" />
          {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>}
        </div>

        <div>
           <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Nueva Contraseña
          </label>
          <Input type="password" {...register("newPassword")} placeholder="Mínimo 8 caracteres" />
          {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
        </div>

        <div>
           <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Confirmar Nueva Contraseña
          </label>
          <Input type="password" {...register("confirmNewPassword")} placeholder="Repite la nueva contraseña" />
          {errors.confirmNewPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmNewPassword.message}</p>}
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isPending} variant="outline">
          {isPending ? "Actualizando..." : "Cambiar Contraseña"}
        </Button>
      </div>
    </form>
  );
}
