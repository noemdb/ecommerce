"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Tags, 
  Users, 
  Truck, 
  MessageSquare, 
  ShieldCheck, 
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Database,
  UserCircle
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// Case Study Sections
import { DashboardSection } from "./_components/DashboardSection";
import { OrdersSection } from "./_components/OrdersSection";
import { ProductsSection } from "./_components/ProductsSection";
import { InventorySection } from "./_components/InventorySection";
import { CategoriesSection } from "./_components/CategoriesSection";
import { CustomersSection } from "./_components/CustomersSection";
import { SuppliersSection } from "./_components/SuppliersSection";
import { ReviewsSection } from "./_components/ReviewsSection";
import { StaffSection } from "./_components/StaffSection";
import { ConfigSection } from "./_components/ConfigSection";
import { DatabaseSection } from "./_components/DatabaseSection";
import { NosotrosSection } from "./_components/NosotrosSection";

const MANUAL_SECTIONS = [
  {
    id: "dashboard",
    title: "1. Primeros Pasos",
    icon: LayoutDashboard,
    content: <DashboardSection />
  },
  {
    id: "ordenes",
    title: "2. Procesar Pedidos",
    icon: ShoppingBag,
    content: <OrdersSection />
  },
  {
    id: "productos",
    title: "3. Añadir Productos",
    icon: Tags,
    content: <ProductsSection />
  },
  {
    id: "inventario",
    title: "4. Inventario",
    icon: Package,
    content: <InventorySection />
  },
  {
    id: "categorias",
    title: "5. Categorías",
    icon: LayoutDashboard,
    content: <CategoriesSection />
  },
  {
    id: "clientes",
    title: "6. Clientes",
    icon: Users,
    content: <CustomersSection />
  },
  {
    id: "proveedores",
    title: "7. Proveedores",
    icon: Truck,
    content: <SuppliersSection />
  },
  {
    id: "resenas",
    title: "8. Reseñas",
    icon: MessageSquare,
    content: <ReviewsSection />
  },
  {
    id: "staff",
    title: "9. Usuarios (Staff)",
    icon: ShieldCheck,
    content: <StaffSection />
  },
  {
    id: "config",
    title: "10. Config. Sitio",
    icon: Settings,
    content: <ConfigSection />
  },
  {
    id: "database",
    title: "11. Base de Datos",
    icon: Database,
    content: <DatabaseSection />
  },
  {
    id: "nosotros",
    title: "12. Perfil (Nosotros)",
    icon: UserCircle,
    content: <NosotrosSection />
  }
];

export default function AdminManualPage() {
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Persistence of sidebar state
  React.useEffect(() => {
    const saved = localStorage.getItem("admin-manual-sidebar-collapsed");
    if (saved) setSidebarCollapsed(saved === "true");
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("admin-manual-sidebar-collapsed", String(newState));
  };

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
      {/* Premium Sidebar */}
      <aside 
        className={cn(
          "bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300 flex flex-col relative group",
          sidebarCollapsed ? "w-20" : "w-80"
        )}
      >
        <div className={cn(
          "h-20 border-b border-neutral-100 dark:border-neutral-800 flex items-center overflow-hidden transition-all duration-300",
          sidebarCollapsed ? "justify-center px-2" : "justify-between px-6"
        )}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-black text-neutral-900 dark:text-neutral-100 tracking-tight whitespace-nowrap">
                MANUAL <span className="text-blue-600 italic">ADMIN</span>
              </h2>
            </div>
          )}
          <button 
            onClick={toggleSidebar}
            className={cn(
              "p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-blue-500 transition-colors shrink-0",
              sidebarCollapsed ? "mx-auto" : ""
            )}
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {MANUAL_SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative",
                activeTab === section.id 
                  ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-500/20"
                  : "text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100"
              )}
            >
              <section.icon className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110",
                activeTab === section.id ? "text-blue-600 dark:text-blue-400" : "text-neutral-400"
              )} />
              <span className={cn(
                "font-bold text-sm tracking-tight transition-all duration-300",
                sidebarCollapsed ? "opacity-0 invisible absolute left-14" : "opacity-100 visible"
              )}>
                {section.title}
              </span>
              
              {activeTab === section.id && !sidebarCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
              )}
            </button>
          ))}
        </nav>

        <div className={cn("p-4 border-t border-neutral-200 dark:border-neutral-800 transition-all", sidebarCollapsed ? "items-center" : "")}>
          <div className={cn(
            "bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-3",
            sidebarCollapsed ? "hidden" : "block"
          )}>
            <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold text-xs uppercase tracking-widest">
              <HelpCircle className="w-4 h-4 text-blue-500" /> Soporte
            </div>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
              ¿Tienes dudas técnicas o necesitas una nueva función? Contacta al equipo de desarrollo.
            </p>
            <button className="w-full py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-[10px] font-black hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm">
              WHATSAPP SOPORTE
            </button>
          </div>
        </div>
      </aside>

      {/* Dynamic Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-white dark:bg-neutral-950">
        <div className="w-full space-y-12">
          {MANUAL_SECTIONS.map((section) => (
            <div 
              key={section.id} 
              className={cn(
                "transition-all duration-500",
                activeTab === section.id ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 absolute invisible pointer-events-none"
              )}
            >
              {section.content}
            </div>
          ))}

          {/* Footer of help */}
          <footer className="pt-12 border-t border-neutral-100 dark:border-neutral-900">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-neutral-400 text-xs">
              <p>© 2026 SIPAP 6.0 - Sistema de Gestión Empresarial. Todos los derechos reservados.</p>
              <div className="flex gap-4">
                <button className="hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors">Política de Privacidad</button>
                <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                <button className="hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors">Términos de Uso</button>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
