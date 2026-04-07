import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { 
  Users, 
  Package, 
  ShoppingBag, 
  TrendingUp,
  ChevronRight,
  Plus
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session || (session.user as any).role === "CUSTOMER") {
    redirect("/admin/login");
  }

  // ═══════════════════════════════════════════════════════════════
  // KPI CALCULATIONS
  // ═══════════════════════════════════════════════════════════════
  
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalCustomers,
    totalStock,
    ordersToday,
    revenueMonth
  ] = await Promise.all([
    // Total Customers
    prisma.customer.count(),
    
    // Total Products Stock (Sum of all individual items)
    prisma.product.aggregate({
      _sum: { stock: true }
    }),
    
    // Orders Created Today
    prisma.order.count({
      where: {
        createdAt: { gte: startOfToday }
      }
    }),
    
    // Total Revenue This Month
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfMonth },
        status: { not: "CANCELADA" } // Excluir órdenes canceladas del ingreso real
      },
      _sum: {
        total: true
      }
    })
  ]);

  const kpis = [
    { 
      label: "Usuarios Totales", 
      value: totalCustomers.toLocaleString(), 
      icon: Users, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10" 
    },
    { 
      label: "Artículos en Stock", 
      value: (totalStock._sum.stock || 0).toLocaleString(), 
      icon: Package, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10" 
    },
    { 
      label: "Órdenes Hoy", 
      value: ordersToday.toLocaleString(), 
      icon: ShoppingBag, 
      color: "text-amber-500", 
      bg: "bg-amber-500/10" 
    },
    { 
      label: "Ventas Mes (" + now.toLocaleString('es-VE', { month: 'short' }) + ")", 
      value: formatPrice(revenueMonth._sum?.total || 0), 
      icon: TrendingUp, 
      color: "text-blue-600", 
      bg: "bg-blue-600/10" 
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Panel de Control</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Bienvenido de nuevo, {session.user?.name}. Aquí tienes un resumen en tiempo real de tu tienda.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/productos/nuevo">
            <Button className="h-11 rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${kpi.bg} rounded-xl flex items-center justify-center`}>
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{kpi.label}</p>
              <h2 className="text-2xl font-bold">{kpi.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <h3 className="font-bold">Accesos Directos</h3>
          </div>
          <div className="p-2">
            {[
              { label: "Gestionar Inventario", href: "/admin/inventario" },
              { label: "Ver Órdenes Pendientes", href: "/admin/ordenes" },
              { label: "Lista de Clientes", href: "/admin/clientes" },
              { label: "Configurar Categorías", href: "/admin/categorias" },
            ].map((link, i) => (
              <Link 
                key={i} 
                href={link.href}
                className="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-xl transition-colors group"
              >
                <span className="font-medium">{link.label}</span>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-neutral-900 text-white rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden shadow-xl shadow-blue-900/10">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Infraestructura v2.0</h3>
            <p className="text-neutral-400 max-w-sm mb-6">El motor de analítica está consultando directamente el clúster de Neon Postgres para reportar cifras con latencia mínima.</p>
            <Link href="/admin/metricas" className="text-blue-400 font-bold hover:text-blue-300 transition-colors uppercase tracking-[0.2em] text-[10px]">
              Ver Análisis Avanzado →
            </Link>
          </div>
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    </div>
  );
}
