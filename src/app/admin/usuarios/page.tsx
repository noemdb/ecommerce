import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Shield, UserCheck } from "lucide-react";

export const metadata = {
  title: "Usuarios | Admin",
  description: "Gestión de usuarios y staff administrativo",
};

export default async function UsuariosPage() {
  await requirePermission("users:manage");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { ordersConfirmed: true } } },
  });

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            Usuarios Staff
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {users.length} usuario{users.length !== 1 ? "s" : ""} administrativo
            {users.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        {users.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4 text-neutral-400">
            <Users className="w-12 h-12" />
            <p className="font-medium">No hay usuarios staff.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  {["Nombre", "Email", "Rol", "Órdenes confirmadas", "Estado", "Creado"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-4 text-left text-xs font-black uppercase tracking-widest text-neutral-400"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-600">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-neutral-500 text-xs">{u.email}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                          u.role === "ADMIN"
                            ? "text-purple-600 bg-purple-500/10"
                            : "text-blue-600 bg-blue-500/10"
                        }`}
                      >
                        {u.role === "ADMIN" ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <UserCheck className="w-3 h-3" />
                        )}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center tabular-nums">
                      {u._count.ordersConfirmed}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          u.isActive
                            ? "text-emerald-600 bg-emerald-500/10"
                            : "text-neutral-400 bg-neutral-100 dark:bg-neutral-800"
                        }`}
                      >
                        {u.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-neutral-400 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString("es-VE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
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
