import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = {
  title: "Nuevo Producto | Admin",
};

export default async function NuevoProductoPage() {
  const [categories, suppliers] = await Promise.all([
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <ProductForm categories={categories} suppliers={suppliers} />
    </div>
  );
}
