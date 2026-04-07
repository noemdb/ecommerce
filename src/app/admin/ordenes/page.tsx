import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { OrdersTable } from "@/components/admin/OrdersTable";
import type { OrderStatus } from "@prisma/client";

export const metadata = {
  title: "Órdenes | Admin",
  description: "Gestión de pedidos y verificación de pagos",
};

export default async function OrdenesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  await requirePermission("orders:read");

  const params = await searchParams;
  const status = params.status as OrderStatus | undefined;
  const q = params.q ?? "";
  const page = parseInt(params.page ?? "1") || 1;
  const pageSize = 20;

  const where = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" as const } },
            { customerName: { contains: q, mode: "insensitive" as const } },
            { customerEmail: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const statusCounts = await prisma.order.groupBy({
    by: ["status"],
    _count: true,
  });

  return (
    <div className="p-8">
      <OrdersTable
        orders={orders}
        total={total}
        page={page}
        pageSize={pageSize}
        statusCounts={Object.fromEntries(
          statusCounts.map((s) => [s.status, s._count])
        )}
        currentStatus={status}
        query={q}
      />
    </div>
  );
}
