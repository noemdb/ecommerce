import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { ReviewsModerator } from "@/components/admin/ReviewsModerator";

export const metadata = {
  title: "Reseñas | Admin",
  description: "Moderación de reseñas de productos",
};

export default async function ResenasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requirePermission("reviews:moderate");

  const params = await searchParams;
  const status = (params.status ?? "PENDING") as "PENDING" | "APPROVED" | "REJECTED";

  const [reviews, counts] = await Promise.all([
    prisma.review.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        product: { select: { id: true, name: true, slug: true } },
        customer: { select: { id: true, name: true } },
      },
    }),
    prisma.review.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  return (
    <div className="p-8">
      <ReviewsModerator
        reviews={reviews}
        counts={countMap}
        currentStatus={status}
      />
    </div>
  );
}
