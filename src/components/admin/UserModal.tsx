"use client";

import { useState, useTransition } from "react";
import { createUser, updateUser } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Shield, UserCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
  isActive: boolean;
}

interface UserModalProps {
  user?: User;
  onClose: () => void;
}

export function UserModal({ user, onClose }: UserModalProps) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "STAFF",
    isActive: user?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user && !form.password) {
      toast.error("La contraseña es requerida para nuevos usuarios");
      return;
    }

    startTransition(async () => {
      const result = user 
        ? await updateUser(user.id, {
            name: form.name,
            email: form.email,
            role: form.role,
            isActive: form.isActive,
            password: form.password || undefined,
          })
        : await createUser({
            name: form.name,
            email: form.email,
            role: form.role,
            password: form.password,
          });

      if (result.success) {
        toast.success(user ? "Usuario actualizado" : "Usuario creado");
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
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-7 py-6 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold">
              {user ? "Editar Staff" : "Nuevo Staff"}
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
          <Input
            label="Nombre Completo *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ej: Juan Pérez"
            required
          />
          
          <Input
            label="Correo Electrónico *"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="correo@empresa.com"
            required
          />

          <Input
            label={user ? "Nueva Contraseña (opcional)" : "Contraseña *"}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder={user ? "Dejar en blanco para no cambiar" : "••••••••"}
            required={!user}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">Rol</label>
              <select
                className="flex h-14 w-full rounded-md border-2 border-neutral-100 bg-white px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as any })}
              >
                <option value="STAFF">Staff (Lectura/Escritura)</option>
                <option value="ADMIN">Admin (Control Total)</option>
              </select>
            </div>
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
              {user ? "Guardar" : "Crear Usuario"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
