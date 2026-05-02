"use client";

import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LogOut, 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Package, 
  Settings,
  Settings2,
  Tags,
  Truck,
  MessageSquare,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  BookOpen,
  Database,
  UserCircle,
  GraduationCap,
  BarChart2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LanguageSelector } from "@/components/layout/LanguageSelector";

const SIDEBAR_GROUPS = [
  {
    group: "General",
    icon: LayoutDashboard,
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ]
  },
  {
    group: "Ventas",
    icon: ShoppingBag,
    items: [
      { label: "Órdenes", href: "/admin/ordenes", icon: ShoppingBag },
      { label: "Clientes", href: "/admin/clientes", icon: Users },
      { label: "Reseñas", href: "/admin/resenas", icon: MessageSquare },
    ]
  },
  {
    group: "Catálogo",
    icon: Package,
    items: [
      { label: "Productos", href: "/admin/productos", icon: Tags },
      { label: "Categorías", href: "/admin/categorias", icon: Tags },
      { label: "Inventario", href: "/admin/inventario", icon: Package },
      { label: "Proveedores", href: "/admin/proveedores", icon: Truck },
    ]
  },
  {
    group: "LMS",
    icon: GraduationCap,
    items: [
      { label: "Dashboard LMS", href: "/admin/lms", icon: GraduationCap },
      { label: "Cursos", href: "/admin/lms/courses", icon: BookOpen },
      { label: "Analíticas", href: "/admin/lms/analytics", icon: BarChart2 },
    ]
  },
  {
    group: "Contenido",
    icon: BookOpen,
    items: [
      { label: "Nosotros", href: "/admin/nosotros", icon: UserCircle },
      { label: "Prompts AI", href: "/admin/prompts", icon: Sparkles },
      { label: "Manual de Uso", href: "/admin/manual", icon: BookOpen },
    ]
  },
  {
    group: "Configuración",
    icon: Settings,
    items: [
      { label: "Métricas", href: "/admin/metricas", icon: Settings2 },
      { label: "Base de Datos", href: "/admin/backup", icon: Database },
      { label: "Usuarios", href: "/admin/usuarios", icon: ShieldCheck },
      { label: "Config. Sitio", href: "/admin/site-config", icon: Settings },
    ]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    General: true,
    Ventas: false,
    Catálogo: false,
    LMS: false,
    Contenido: false,
    Configuración: false,
  });

  useEffect(() => {
    setIsMounted(true);
    const savedState = localStorage.getItem("admin-sidebar-collapsed");
    if (savedState) setIsCollapsed(savedState === "true");

    // Expand the group that has the active item
    SIDEBAR_GROUPS.forEach(group => {
      const hasActiveChild = group.items.some(item => 
        pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href))
      );
      if (hasActiveChild) {
        setExpandedGroups(prev => ({ ...prev, [group.group]: true }));
      }
    });
  }, [pathname]);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("admin-sidebar-collapsed", String(newState));
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  if (!isMounted) return <aside className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800" />;

  return (
    <aside className={cn(
      "bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-400 flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out shrink-0",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Header / Logo */}
      <div className="h-20 flex items-center px-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0 relative overflow-hidden">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <span className="text-xs text-white font-black">v2</span>
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white truncate">
              Premium Admin
            </span>
          )}
        </Link>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-24 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-1 shadow-sm text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 z-50 transition-colors"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
        {SIDEBAR_GROUPS.map((group) => {
          const isExpanded = expandedGroups[group.group];
          const hasActiveChild = group.items.some(item => 
            pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href))
          );

          if (isCollapsed) {
            return (
              <button
                key={group.group}
                onClick={toggleSidebar}
                title={group.group}
                className={cn(
                  "w-full flex items-center justify-center py-3 rounded-md transition-all duration-300",
                  hasActiveChild 
                    ? "bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500 shadow-sm" 
                    : "hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800/50 dark:hover:text-white text-neutral-500"
                )}
              >
                <group.icon className={cn("w-6 h-6", hasActiveChild ? "text-blue-600 dark:text-blue-500" : "text-neutral-500")} />
              </button>
            );
          }

          return (
            <div key={group.group} className="space-y-1">
              <button
                onClick={() => toggleGroup(group.group)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800/50",
                  hasActiveChild ? "text-blue-600 dark:text-blue-500" : "text-neutral-400"
                )}
              >
                <span>{group.group}</span>
                <div className="flex items-center gap-1">
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </div>
              </button>
              
              <div className={cn(
                "space-y-1 transition-all duration-300 overflow-hidden",
                !isExpanded ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"
              )}>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md transition-all duration-300 text-sm font-bold px-4 py-2.5 ml-2",
                        isActive 
                          ? "bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500 shadow-sm" 
                          : "hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800/50 dark:hover:text-white text-neutral-500"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-blue-600 dark:text-blue-500" : "text-neutral-500")} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Theme & Logout */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 shrink-0 space-y-1">
        <div className={cn("flex items-center gap-2 mb-2", isCollapsed ? "justify-center flex-col" : "justify-between px-2")}>
          <ThemeToggle isCollapsed={isCollapsed} />
          {!isCollapsed && <LanguageSelector />}
        </div>
        <Button 
          variant="ghost" 
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={isCollapsed ? "Cerrar Sesión" : undefined}
          className={cn(
            "w-full gap-3 h-12 rounded-md text-neutral-600 dark:text-neutral-400 font-bold hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all",
            isCollapsed ? "justify-center px-0" : "justify-start px-4"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </Button>
      </div>
    </aside>
  );
}
