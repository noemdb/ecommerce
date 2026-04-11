import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export const metadata = {
  title: "Categorías | Admin",
  description: "Gestión de categorías de productos",
};

export default async function CategoriasPage() {
  await requirePermission("categories:write");

  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { order: "asc" }, { name: "asc" }],
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { products: true, children: true } },
    },
  });

  return (
    <div className="p-8">
      <CategoriesManager categories={categories} />
    </div>
  );
}
