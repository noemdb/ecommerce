"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { deleteFullAccountAction, clearCustomerBitacoraAction } from "@/actions/customer-account";
import { AlertTriangle, LogOut, CheckCircle2, ShieldAlert, History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import { toast } from "sonner";

export default function DangerZonePage() {
  const confirm = useConfirm();

  // State for Full Account Deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedSuccess, setDeletedSuccess] = useState(false);

  // State for Bitacora Cleaning
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanSuccess, setCleanSuccess] = useState(false);

  const handleDeleteFullAccount = async () => {
    if (deleteInput !== "CONFIRMAR") return;
    
    setIsDeleting(true);
    const res = await deleteFullAccountAction();
    if (res.success) {
      setDeletedSuccess(true);
      toast.success("Cuenta eliminada exitosamente");
      setTimeout(() => signOut({ callbackUrl: "/login" }), 5000);
    } else {
      toast.error(res.error || "Error al eliminar la cuenta");
    }
    setIsDeleting(false);
  };

  const handleClearBitacora = async () => {
    const isConfirmed = await confirm({
      title: "¿Vaciar bitácora de actividad?",
      description: "Esta acción eliminará de forma permanente todo tu historial de actividad. No se puede deshacer.",
      confirmText: "Vaciar ahora",
      cancelText: "Mantener datos",
      variant: "danger"
    });

    if (!isConfirmed) return;
    
    setIsCleaning(true);
    const res = await clearCustomerBitacoraAction();
    if (res.success) {
      setCleanSuccess(true);
      toast.success("Bitácora de actividad limpiada");
      setTimeout(() => setCleanSuccess(false), 3000);
    } else {
      toast.error(res.error || "Error al limpiar la bitácora");
    }
    setIsCleaning(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Zona de Riesgo
        </h1>
        <p className="text-neutral-500 mt-2">
          Acciones irreversibles sobre tu cuenta y datos personales.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Cerrar Sesión */}
        <div className="bg-white dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800 shadow-sm p-6 overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-md">
              <LogOut className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Cerrar sesión en todos los dispositivos</h2>
              <p className="text-sm text-neutral-500 mb-6">
                Esto invalidará todas las sesiones activas en navegadores y otros dispositivos.
              </p>
              <Button 
                variant="outline" 
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-md border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
              >
                Cerrar todas las sesiones
              </Button>
            </div>
          </div>
        </div>

        {/* Borrar Datos (Bitácora) */}
        <div className="bg-white dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800 shadow-sm p-6 overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-md">
              <History className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Borrar datos de actividad</h2>
              <p className="text-sm text-neutral-500 mb-6">
                Elimina permanentemente todo tu historial de la bitácora. Tus pedidos y datos de perfil permanecerán intactos.
              </p>
              
              {cleanSuccess ? (
                <div className="inline-flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 rounded-md border border-emerald-100 dark:border-emerald-800">
                  <CheckCircle2 className="w-5 h-5" />
                  Bitácora limpiada
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={handleClearBitacora}
                  disabled={isCleaning}
                  className="rounded-md border-neutral-200 dark:border-neutral-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {isCleaning ? "Limpiando..." : "Vaciar bitácora"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Eliminar Cuenta (Completa) */}
        <div className="bg-white dark:bg-neutral-900 rounded-md border border-red-200 dark:border-red-900 shadow-lg p-6 relative overflow-hidden">
          {/* Fondo decorativo */}
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <ShieldAlert className="w-48 h-48 text-red-600" />
          </div>

          <div className="flex items-start gap-4 relative z-10">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-md">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Eliminar cuenta por completo</h2>
              
              {!deletedSuccess ? (
                <>
                  <p className="text-sm text-neutral-500 mb-6 max-w-lg">
                    Esta acción elmina permanentemente tu perfil, **compras**, reseñas y bitácora. No podrás recuperar esta información ni el acceso a esta cuenta.
                  </p>

                  {!showDeleteConfirm ? (
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="rounded-md bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 font-bold"
                    >
                      Eliminar cuenta y compras
                    </Button>
                  ) : (
                    <div className="mt-4 p-6 bg-red-50 dark:bg-red-900/10 rounded-md border border-red-100 dark:border-red-900/30">
                      <p className="text-sm font-bold text-red-800 dark:text-red-400 mb-4">
                        ¿Estás seguro de querer elminar TODO? Escribe <span className="underline italic">CONFIRMAR</span>:
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input 
                          value={deleteInput}
                          onChange={(e) => setDeleteInput(e.target.value)}
                          placeholder="Escribe CONFIRMAR"
                          className="max-w-xs border-red-200 dark:border-red-900 bg-white"
                        />
                        <div className="flex gap-2">
                          <Button 
                            disabled={deleteInput !== "CONFIRMAR" || isDeleting}
                            onClick={handleDeleteFullAccount}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-md shadow-md disabled:bg-neutral-300 dark:disabled:bg-neutral-800 transition-all font-bold"
                          >
                            {isDeleting ? "Eliminando..." : "Confirmar Eliminación"}
                          </Button>
                          <Button 
                            variant="ghost" 
                            onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-md"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-2 py-4 px-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-md border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-4">
                   <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-300">Cuenta Eliminada</h4>
                    <p className="text-sm text-emerald-700 dark:text-emerald-500">
                      Tu cuenta ha sido elminada permanentemente. Serás desconectado...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
