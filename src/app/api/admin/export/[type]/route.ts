import { NextRequest, NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    // Proteger la ruta (req staff/admin)
    const session = await requireStaffSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { type } = await params;
    let csvData = "";
    let filename = "";

    if (type === "orders") {
      const orders = await prisma.order.findMany({
        select: {
          orderNumber: true,
          customerName: true,
          customerEmail: true,
          total: true,
          status: true,
          createdAt: true,
          bankName: true,
          referenceNumber: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const header = ["Orden", "Cliente", "Email", "Total", "Estado", "Banco", "Referencia", "Fecha"];
      const rows = orders.map(o => [
        o.orderNumber,
        `"${o.customerName.replace(/"/g, '""')}"`,
        o.customerEmail,
        o.total,
        o.status,
        `"${o.bankName.replace(/"/g, '""')}"`,
        `"${o.referenceNumber.replace(/"/g, '""')}"`,
        o.createdAt.toISOString()
      ]);
      
      csvData = [header.join(","), ...rows.map(r => r.join(","))].join("\n");
      filename = `ordenes_${new Date().toISOString().split("T")[0]}.csv`;

    } else if (type === "customers") {
      const customers = await prisma.customer.findMany({
        select: {
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          isBlocked: true,
          password: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const header = ["Nombre", "Email", "Teléfono", "Registrado", "Estado", "Tipo"];
      const rows = customers.map(c => [
        `"${c.name.replace(/"/g, '""')}"`,
        c.email,
        c.phone || "N/A",
        c.createdAt.toISOString(),
        c.isBlocked ? "Bloqueado" : "Activo",
        c.password ? "Registrado" : "Invitado"
      ]);

      csvData = [header.join(","), ...rows.map(r => r.join(","))].join("\n");
      filename = `clientes_${new Date().toISOString().split("T")[0]}.csv`;

    } else if (type === "products") {
      const products = await prisma.product.findMany({
        select: {
          name: true,
          slug: true,
          price: true,
          stock: true,
          isActive: true,
          category: { select: { name: true } }
        },
        orderBy: { name: "asc" },
      });

      const header = ["Producto", "Slug", "Precio", "Stock", "Estado", "Categoría"];
      const rows = products.map(p => [
        `"${p.name.replace(/"/g, '""')}"`,
        p.slug,
        p.price,
        p.stock,
        p.isActive ? "Activo" : "Inactivo",
        `"${p.category?.name?.replace(/"/g, '""') || "Sin categoría"}"`
      ]);

      csvData = [header.join(","), ...rows.map(r => r.join(","))].join("\n");
      filename = `productos_${new Date().toISOString().split("T")[0]}.csv`;

    } else {
      return new NextResponse("Invalid export type", { status: 400 });
    }

    const res = new NextResponse(csvData);
    res.headers.set("Content-Type", "text/csv; charset=utf-8");
    res.headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    return res;

  } catch (error) {
    console.error("[EXPORT_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
