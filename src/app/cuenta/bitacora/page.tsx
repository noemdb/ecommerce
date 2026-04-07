import { requireCustomerSession } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { History, Info } from "lucide-react";

export default async function BitacoraPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requireCustomerSession();
  const customerId = session.user.id;
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const pageSize = 20;

  const [actions, total] = await Promise.all([
    prisma.customerAction.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.customerAction.count({ where: { customerId } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Bitácora de Actividad
        </h1>
        <p className="text-neutral-500 mt-2">
          Registro histórico de acciones realizadas en tu cuenta.
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        {actions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Fecha</th>
                    <th className="px-6 py-4 font-semibold">Acción</th>
                    <th className="px-6 py-4 font-semibold">Descripción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {actions.map((action) => (
                    <tr key={action.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors text-neutral-600 dark:text-neutral-400">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(action.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {action.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                        {action.description || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls could be added here if totalPages > 1 */}
          </>
        ) : (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Sin actividad reciente</h3>
            <p className="text-neutral-500 max-w-sm mx-auto">
              Tu historial de actividad aparecerá aquí a medida que realices acciones en tu cuenta.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-4 border border-blue-100 dark:border-blue-800/50">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Este registro es solo informativo y te ayuda a monitorear la seguridad de tu cuenta. Si notas alguna actividad sospechosa, te recomendamos cambiar tu contraseña de inmediato.
        </p>
      </div>
    </div>
  );
}
