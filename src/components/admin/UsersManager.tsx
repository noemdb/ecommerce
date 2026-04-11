"use client";

import { useState, useTransition } from "react";
import { deleteUser } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { UserModal } from "./UserModal";
import {
  Users,
  Plus,
  Shield,
  UserCheck,
  Pencil,
  Trash2,
  Mail,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
  isActive: boolean;
  createdAt: Date;
  _count?: { ordersConfirmed: number };
}

interface UsersManagerProps {
  users: User[];
  currentUserId: string;
}

export function UsersManager({ users, currentUserId }: UsersManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const confirm = useConfirm();

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (id === currentUserId) {
      toast.error("No puedes eliminar tu propia cuenta");
      return;
    }

    const isConfirmed = await confirm({
      title: "¿Eliminar usuario?",
      description: "Esta acción revocará permanentemente el acceso a este miembro del staff.",
      confirmText: "Eliminar Usuario",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (!isConfirmed) return;

    startTransition(async () => {
      const result = await deleteUser(id);
      if (result.success) {
        toast.success("Usuario eliminado");
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
            Usuarios Staff
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
            Gestiona los permisos y accesos de tu equipo administrativo.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Agregar Staff
        </Button>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50">
              {["Usuario", "Contacto", "Rol", "Estado", "Actividad", "Acciones"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {users.map((u) => (
              <tr key={u.id} className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center font-black",
                      u.role === "ADMIN" ? "bg-purple-500/10 text-purple-600" : "bg-blue-500/10 text-blue-600"
                    )}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold flex items-center gap-2">
                        {u.name}
                        {u.id === currentUserId && (
                          <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">Tú</span>
                        )}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                        <Calendar className="w-3 h-3" />
                        Staff desde {new Date(u.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="text-xs">{u.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded",
                    u.role === "ADMIN" ? "bg-purple-500/10 text-purple-600" : "bg-blue-500/10 text-blue-600"
                  )}>
                    {u.role === "ADMIN" ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded",
                    u.isActive ? "text-emerald-600 bg-emerald-500/10" : "text-neutral-400 bg-neutral-100 dark:bg-neutral-800"
                  )}>
                    {u.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">{u._count?.ordersConfirmed || 0}</span>
                    <span className="text-[8px] uppercase tracking-tighter text-neutral-400">Órdenes confirmadas</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleEdit(u)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:text-red-500"
                      onClick={() => handleDelete(u.id)}
                      disabled={isPending || u.id === currentUserId}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <UserModal
          user={editingUser}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
