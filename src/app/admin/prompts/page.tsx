import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Sparkles, Plus, Search, HelpCircle } from "lucide-react";
import { PromptList } from "@/components/admin/PromptList";
import { PromptForm } from "@/components/admin/PromptForm";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";

export const metadata = {
  title: "Prompts AI | Admin",
  description: "Gestión de prompts para optimización de catálogo",
};

export default async function PromptsPage() {
  await requirePermission("products:read");

  // Fetch data
  const [prompts, products] = await Promise.all([
    prisma.productPrompt.findMany({
      include: {
        product: {
          select: {
            name: true,
            sku: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true
      },
      orderBy: { name: "asc" }
    })
  ]);

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="w-4 h-4 text-white" />
             </div>
             <h1 className="text-3xl font-black tracking-tight">Prompts AI</h1>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
            Gestión centralizada de instrucciones para mejoramiento de imágenes de productos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Tabs defaultValue="list" className="w-full">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2 mb-8 inline-block shadow-sm">
            <TabsList className="bg-transparent border-0 gap-2">
              <TabsTrigger 
                value="list" 
                className="rounded-md px-6 py-2.5 data-[state=active]:bg-neutral-100 dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-none font-bold text-xs uppercase tracking-widest transition-all"
              >
                Todos los Prompts
              </TabsTrigger>
              <TabsTrigger 
                value="new" 
                className="rounded-md px-6 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow-none font-bold text-xs uppercase tracking-widest transition-all gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Nuevo Prompt
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="list" className="mt-0 focus-visible:outline-none focus:outline-none ring-0">
            <PromptList initialPrompts={prompts} />
          </TabsContent>

          <TabsContent value="new" className="mt-0 focus-visible:outline-none focus:outline-none ring-0">
            <div className="max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-10 shadow-2xl shadow-blue-500/5">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 rounded-[1.25rem] bg-blue-500/10 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-blue-600" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black tracking-tight">Crear Nuevo Prompt</h2>
                    <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Define instrucciones para un producto específico</p>
                 </div>
              </div>
              <PromptForm products={products} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Tips Section */}
        <section className="bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-[2rem] p-8 mt-4">
           <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="w-5 h-5 text-blue-500" />
              <h3 className="font-black text-sm uppercase tracking-widest text-blue-900 dark:text-blue-400">Guía de Prompts</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { t: "Claridad", d: "Describe el producto con precisión: materiales, colores y texturas." },
                { t: "Entorno", d: "Define el fondo (estudio, lifestyle, naturaleza) para coherencia visual." },
                { t: "Iluminación", d: "Específica 'cinematográfica', 'suave' o 'luz de día' para realismo." }
              ].map((tip, i) => (
                <div key={i} className="flex flex-col gap-1">
                   <span className="text-xs font-black text-blue-800 dark:text-blue-300">{tip.t}</span>
                   <p className="text-xs text-blue-700/70 dark:text-blue-300/50 leading-relaxed font-medium">{tip.d}</p>
                </div>
              ))}
           </div>
        </section>
      </div>
    </div>
  );
}
