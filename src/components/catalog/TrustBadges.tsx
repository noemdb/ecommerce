"use client";

import * as React from "react";
import { Lock, FileCheck, MessageCircle, ShieldCheck, X, ChevronRight, Check } from "lucide-react";
import type { SiteConfigData } from "@/lib/site-config/default-site-config";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

interface TrustBadgesProps {
  config: SiteConfigData;
}

export function TrustBadges({ config }: TrustBadgesProps) {
  const badges = [
    {
      icon: Lock,
      title: config.trustBadge1Title,
      description: config.trustBadge1Description,
      color: "text-blue-600 dark:text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: FileCheck,
      title: config.trustBadge2Title,
      description: config.trustBadge2Description,
      color: "text-emerald-600 dark:text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      icon: MessageCircle,
      title: config.trustBadge3Title,
      description: config.trustBadge3Description,
      color: "text-purple-600 dark:text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      icon: ShieldCheck,
      title: config.trustBadge4Title,
      description: config.trustBadge4Description,
      color: "text-amber-600 dark:text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  return (
    <section className="py-12 md:py-24 bg-neutral-50 dark:bg-neutral-900/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {badges.map((badge, index) => (
            <DialogPrimitive.Root key={index}>
              <DialogPrimitive.Trigger asChild>
                <div 
                  role="button" 
                  tabIndex={0} 
                  className="flex flex-col items-center text-center group cursor-pointer p-6 rounded-2xl hover:bg-white dark:hover:bg-neutral-800/50 transition-all duration-300 hover:shadow-lg dark:hover:shadow-neutral-900/50 hover:-translate-y-1 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm mb-5 group-hover:scale-110 transition-transform duration-300", badge.bgColor)}>
                    <badge.icon className={cn("w-8 h-8", badge.color)} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 tracking-tight flex items-center gap-2">
                    {badge.title}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-[200px] leading-relaxed line-clamp-2">
                    {badge.description}
                  </p>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                    Saber más <ChevronRight className="w-3 h-3 ml-1" />
                  </p>
                </div>
              </DialogPrimitive.Trigger>

              <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-[95%] max-w-md translate-x-[-50%] translate-y-[-50%] p-0 border-0 bg-white shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-2xl dark:bg-neutral-950 overflow-hidden outline-none">
                  
                  {/* Visual Header Banner */}
                  <div className={cn("px-8 py-10 flex flex-col items-center justify-center text-center relative", badge.bgColor)}>
                    <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-2 text-neutral-500 opacity-70 transition-opacity hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 outline-none focus:ring-2 focus:ring-black">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Cerrar</span>
                    </DialogPrimitive.Close>
                    
                    <div className="relative mb-4">
                      <div className="absolute inset-0 animate-ping opacity-20 rounded-full" style={{ backgroundColor: "currentColor" }}></div>
                      <div className={cn("relative w-20 h-20 rounded-full bg-white dark:bg-neutral-900 shadow-md flex items-center justify-center")}>
                        <badge.icon className={cn("w-10 h-10", badge.color)} />
                      </div>
                    </div>
                    
                    <DialogPrimitive.Title className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-2">
                      {badge.title}
                    </DialogPrimitive.Title>
                  </div>

                  {/* Expanded Content Area */}
                  <div className="p-8">
                    <DialogPrimitive.Description className="text-base text-neutral-600 dark:text-neutral-300 leading-relaxed text-center mb-8">
                      {badge.description}
                    </DialogPrimitive.Description>
                    
                    <div className="space-y-4">
                      {/* Decorative elements representing extra info */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                        <div className="p-2 rounded-md bg-white dark:bg-neutral-950 shadow-sm shrink-0">
                          <Check className={cn("w-5 h-5", badge.color)} />
                        </div>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                          Compromiso garantizado
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                        <div className="p-2 rounded-md bg-white dark:bg-neutral-950 shadow-sm shrink-0">
                          <ShieldCheck className={cn("w-5 h-5", badge.color)} />
                        </div>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                          Seguridad y confianza total
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex justify-center">
                      <DialogPrimitive.Close className="px-6 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors w-full sm:w-auto text-center outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                        Entendido
                      </DialogPrimitive.Close>
                    </div>
                  </div>
                </DialogPrimitive.Content>
              </DialogPrimitive.Portal>
            </DialogPrimitive.Root>
          ))}
        </div>
      </div>
    </section>
  );
}
