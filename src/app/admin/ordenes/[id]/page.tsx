import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { OrderDetail } from "@/components/admin/OrderDetail";

export default async function OrdenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("orders:read");
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true } },
          variant: { select: { id: true, name: true, value: true } },
        },
      },
      customer: { select: { id: true, name: true, email: true } },
      confirmedBy: { select: { id: true, name: true } },
      statusHistory: { orderBy: { changedAt: "asc" } },
    },
  });

  if (!order) notFound();

  return (
    <div className="p-8">
      <OrderDetail order={order} />
    </div>
  );
}
