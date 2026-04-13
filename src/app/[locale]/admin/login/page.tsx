"use client";

import { StaffLoginForm } from "@/components/auth/StaffLoginForm";
import { ShieldAlert, ShieldCheck, Lock, Terminal } from "lucide-react";
import { Suspense, use } from "react";
import { motion } from "framer-motion";

export default function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);

  return (
    <div className="min-h-screen flex bg-neutral-950 text-white overflow-hidden">
      {/* 
        ========================================================================
        COLUMNA IZQUIERDA: BRANDING & INFO
        ========================================================================
      */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden items-center justify-center p-20 border-r border-neutral-800">
        
        {/* Mesh Gradients Animados */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-900/15 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* Contenido de Branding */}
        <div className="relative z-10 max-w-2xl space-y-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              <ShieldCheck className="w-3 h-3" />
              Acceso Restringido
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.95] mb-6">
              Control <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                Center
              </span>
            </h1>
            <p className="text-xl text-neutral-400 font-medium italic max-w-lg leading-relaxed">
              Bienvenido al núcleo de gestión de Ecommerce Premium. Gestiona productos, pedidos y analíticas con seguridad de grado institucional.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 gap-8 text-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="space-y-3">
              <div className="p-3 w-fit bg-neutral-900 rounded-xl border border-neutral-800">
                <Lock className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="font-bold uppercase tracking-wider text-neutral-200">Encriptación AES</h3>
              <p className="text-xs text-neutral-500 leading-relaxed italic">Comunicaciones protegidas mediante túneles seguros y cifrado de punto a punto.</p>
            </div>
            <div className="space-y-3">
              <div className="p-3 w-fit bg-neutral-900 rounded-xl border border-neutral-800">
                <Terminal className="w-5 h-5 text-indigo-500" />
              </div>
              <h3 className="font-bold uppercase tracking-wider text-neutral-200">Auditoría Total</h3>
              <p className="text-xs text-neutral-500 leading-relaxed italic">Cada acción es registrada en los logs del sistema para máxima trazabilidad institucional.</p>
            </div>
          </motion.div>
        </div>

        {/* Logo Flotante de Fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none select-none">
          <ShieldAlert className="w-[800px] h-[800px]" />
        </div>
      </div>

      {/* 
        ========================================================================
        COLUMNA DERECHA: LOGIN FORM
        ========================================================================
      */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-8 md:p-12 relative">
        {/* Decoración para móvil */}
        <div className="lg:hidden absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/30 rounded-full blur-[80px]" />
        </div>

        <motion.div 
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-12 text-center lg:text-left">
            <h2 className="text-3xl font-black tracking-tighter mb-2">Administración</h2>
            <p className="text-neutral-500 text-sm italic">Digita tus credenciales autorizadas para continuar.</p>
          </div>

          <div className="bg-neutral-900/50 p-8 md:p-10 rounded-[2.5rem] border border-neutral-800 backdrop-blur-sm shadow-2xl">
            <Suspense fallback={<div className="h-64 flex items-center justify-center text-neutral-500 italic">Estableciendo conexión segura...</div>}>
              <StaffLoginForm />
            </Suspense>
          </div>

          <div className="mt-12 flex items-center justify-center lg:justify-start gap-4 opacity-40">
            <div className="h-px w-8 bg-neutral-800" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Institutional Access</p>
            <div className="h-px w-8 bg-neutral-800" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
