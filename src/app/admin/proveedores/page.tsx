import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Truck, Plus, Mail, Phone } from "lucide-react";

export const metadata = {
  title: "Proveedores | Admin",
  description: "Gestión de proveedores de productos",
};

export default async function ProveedoresPage() {
  await requirePermission("suppliers:write");

  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Proveedores</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {suppliers.length} proveedor{suppliers.length !== 1 ? "es" : ""} registrado
            {suppliers.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        {suppliers.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4 text-neutral-400">
            <Truck className="w-12 h-12" />
            <p className="font-medium">No hay proveedores registrados aún.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  {["Proveedor", "RIF", "Contacto", "Email", "Teléfono", "Productos", "Estado"].map(
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
                {suppliers.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-5 py-4 font-semibold">{s.name}</td>
                    <td className="px-5 py-4">
                      {s.rif ? (
                        <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-lg text-neutral-600 dark:text-neutral-400">
                          {s.rif}
                        </code>
                      ) : (
                        <span className="text-neutral-300 dark:text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-neutral-500 text-xs">
                      {s.contactName ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      {s.email ? (
                        <a
                          href={`mailto:${s.email}`}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <Mail className="w-3 h-3" />
                          {s.email}
                        </a>
                      ) : (
                        <span className="text-neutral-300 dark:text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {s.phone ? (
                        <a
                          href={`tel:${s.phone}`}
                          className="flex items-center gap-1 text-xs text-neutral-500"
                        >
                          <Phone className="w-3 h-3" />
                          {s.phone}
                        </a>
                      ) : (
                        <span className="text-neutral-300 dark:text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/10 text-xs font-bold text-blue-600">
                        {s._count.products}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          s.isActive
                            ? "text-emerald-600 bg-emerald-500/10"
                            : "text-neutral-400 bg-neutral-100 dark:bg-neutral-800"
                        }`}
                      >
                        {s.isActive ? "Activo" : "Inactivo"}
                      </span>
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
