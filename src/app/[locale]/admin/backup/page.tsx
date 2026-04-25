"use client";

import { useState } from "react";
import { Download, Upload, Server, FileJson, AlertTriangle } from "lucide-react";
import { exportDatabase, importDatabase, seedCatalogFromJSON, resetToInitialState, seedNosotrosFromJSON, seedPromptsFromJSON } from "@/actions/database-manager";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

export default function BackupPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const [importFile, setImportFile] = useState<File | null>(null);

  const [catFile, setCatFile] = useState<File | null>(null);
  const [prodFile, setProdFile] = useState<File | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [nosotrosFile, setNosotrosFile] = useState<File | null>(null);
  const [promptsFile, setPromptsFile] = useState<File | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await exportDatabase();
      if (res.success && res.data) {
        const blob = new Blob([res.data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `backup-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Backup exportado correctamente");
      } else {
        toast.error("Error al exportar", { description: res.error });
      }
    } catch (e) {
      toast.error("Error inesperado en exportación");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    if (!confirm("⚠️ ATENCIÓN: Esto borrará permanentemente TODOS los datos actuales de la base de datos y los reemplazará con los del archivo. ¿Estás absolutamente seguro de continuar?")) return;
    
    setIsImporting(true);
    try {
      const text = await importFile.text();
      const res = await importDatabase(text);
      if (res.success) {
        toast.success("Base de datos restaurada correctamente");
        setImportFile(null);
      } else {
        toast.error("Error al restaurar", { description: res.error });
      }
    } catch (e) {
      toast.error("Error inesperado en restauración");
    } finally {
      setIsImporting(false);
    }
  };

  const handleSeed = async () => {
     if (!catFile && !prodFile && !imgFile) {
        toast.error("Debes cargar al menos un archivo JSON");
        return;
     }

     setIsSeeding(true);
     try {
        const catStr = catFile ? await catFile.text() : "";
        const prodStr = prodFile ? await prodFile.text() : "";
        const imgStr = imgFile ? await imgFile.text() : "";

        const res = await seedCatalogFromJSON(catStr, prodStr, imgStr);
        if (res.success) {
          toast.success("Catálogo inyectado correctamente");
          setCatFile(null);
          setProdFile(null);
          setImgFile(null);
        } else {
           toast.error("Error inyectando catálogo", { description: res.error });
        }
     } catch(e) {
        toast.error("Error inesperado ejecutando seed");
     } finally {
        setIsSeeding(false);
     }
  };

  const handleSeedNosotros = async () => {
    if (!nosotrosFile) {
       toast.error("Debes cargar el archivo JSON de Nosotros & Prompts");
       return;
    }

    setIsSeeding(true);
    try {
       const jsonStr = await nosotrosFile.text();
       const res = await seedNosotrosFromJSON(jsonStr);
       if (res.success) {
         toast.success("Información de Nosotros y Prompts inyectada");
         setNosotrosFile(null);
       } else {
          toast.error("Error inyectando información", { description: res.error });
       }
    } catch(e) {
       toast.error("Error inesperado ejecutando seed");
    } finally {
       setIsSeeding(false);
    }
 };

  const handleSeedPrompts = async () => {
    if (!promptsFile) {
       toast.error("Debes cargar el archivo JSON de Prompts");
       return;
    }

    setIsSeeding(true);
    try {
       const jsonStr = await promptsFile.text();
       const res = await seedPromptsFromJSON(jsonStr);
       if (res.success) {
         toast.success("Prompts de productos inyectados correctamente");
         setPromptsFile(null);
       } else {
          toast.error("Error inyectando prompts", { description: res.error });
       }
    } catch(e) {
       toast.error("Error inesperado ejecutando seed");
    } finally {
       setIsSeeding(false);
    }
 };
 
  const handleReset = async () => {
    setShowResetDialog(false);
    setIsResetting(true);
    try {
      const res = await resetToInitialState();
      if (res.success) {
        toast.success("Tienda restaurada al estado inicial con éxito");
      } else {
        toast.error("Error al resetear", { description: res.error });
      }
    } catch (e) {
      toast.error("Error inesperado en el reseteo");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <Server className="w-6 h-6 text-blue-600" />
            Base de Datos
          </h1>
          <p className="text-neutral-500 mt-1 dark:text-neutral-400">
            Respaldo, Restauración y Gestión de Catálogo Dinámico
          </p>
        </div>
      </div>

      <Tabs defaultValue="backup" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="backup" className="font-semibold">Backup Completo</TabsTrigger>
          <TabsTrigger value="seed" className="font-semibold">Seeder de Catálogo</TabsTrigger>
          <TabsTrigger value="nosotros-seed" className="font-semibold">Seeder Nosotros & Prompts</TabsTrigger>
        </TabsList>
        
        {/* TAB BACKUP */}
        <TabsContent value="backup" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="w-5 h-5 text-blue-600" />
                        Exportar Base de Datos
                    </CardTitle>
                    <CardDescription>
                        Descarga un archivo JSON con absolutamente todos los registros actuales de tu base de datos (Usuarios, Productos, Órdenes, etc.).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Este proceso puede tardar unos segundos dependiendo de la cantidad de registros.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleExport} disabled={isExporting} className="w-full sm:w-auto font-bold bg-blue-600 hover:bg-blue-700">
                        {isExporting ? "Exportando..." : "Descargar Backup (JSON)"}
                    </Button>
                </CardFooter>
            </Card>

            <Card className="border-red-200 dark:border-red-900/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <Upload className="w-5 h-5" />
                        Restaurar Base de Datos
                    </CardTitle>
                    <CardDescription>
                        Sube un archivo de backup previamente exportado para restaurar el sistema a ese punto.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900/50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Operación Peligrosa</AlertTitle>
                        <AlertDescription>
                            Restaurar la base de datos limpiará TODAS las tablas y se reemplazarán permanentemente por los datos del archivo subido. 
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2 pt-2">
                        <Label htmlFor="import-file">Archivo JSON de Backup</Label>
                        <Input 
                            id="import-file" 
                            type="file" 
                            accept=".json" 
                            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button 
                        variant="danger" 
                        onClick={handleImport} 
                        disabled={!importFile || isImporting}
                        className="w-full sm:w-auto font-bold"
                    >
                        {isImporting ? "Restaurando..." : "Ejecutar Restauración"}
                    </Button>
                </CardFooter>
            </Card>

            <Card className="border-orange-200 dark:border-orange-900/50 bg-orange-50/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="w-5 h-5" />
                        Configuración de Fábrica
                    </CardTitle>
                    <CardDescription>
                        Borra absolutamente todo y vuelve a la configuración inicial con productos de demostración y cuenta de administrador por defecto.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Útil para limpiar el sistema después de pruebas o para comenzar una nueva tienda desde cero.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button 
                        variant="outline" 
                        onClick={() => setShowResetDialog(true)} 
                        disabled={isResetting}
                        className="w-full sm:w-auto font-bold border-orange-200 hover:bg-orange-100 dark:border-orange-900 dark:hover:bg-orange-900/20 text-orange-700 dark:text-orange-400"
                    >
                        {isResetting ? "Reseteando Sistema..." : "Resetear al Inicio"}
                    </Button>
                </CardFooter>
            </Card>

            <ConfirmationDialog 
                isOpen={showResetDialog}
                onConfirm={handleReset}
                onCancel={() => setShowResetDialog(false)}
                variant="danger"
                title="¿Resetear Tienda al Inicio?"
                description="🚨 PELIGRO EXTREMO: Esta acción eliminará COMPLETAMENTE todos los datos (Pedidos, Clientes, Productos, Configuración) y restaurará la tienda a su estado de fábrica original. Esta operación es irreversible."
                confirmText="Sí, Resetear Todo"
                cancelText="Cancelar"
            />
        </TabsContent>

        {/* TAB SEEDER CATALOGO */}
        <TabsContent value="seed" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileJson className="w-5 h-5 text-emerald-600" />
                        Semilla de Catálogo (Uploader)
                    </CardTitle>
                    <CardDescription>
                        Carga información predefinida desde los archivos JSON (`categorias.json`, `products.json`, `product_images.json`).
                        Esta acción "upsertea" la información: creará registros nuevos o actualizará existentes basándose en sus IDs.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="cat-file">Archivo Categorías (`categorias.json`)</Label>
                        <Input 
                            id="cat-file" 
                            type="file" 
                            accept=".json" 
                            onChange={(e) => setCatFile(e.target.files?.[0] || null)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="prod-file">Archivo Productos (`products.json`)</Label>
                        <Input 
                            id="prod-file" 
                            type="file" 
                            accept=".json" 
                            onChange={(e) => setProdFile(e.target.files?.[0] || null)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="img-file">Archivo Imágenes de Productos (`product_images.json`)</Label>
                        <Input 
                            id="img-file" 
                            type="file" 
                            accept=".json" 
                            onChange={(e) => setImgFile(e.target.files?.[0] || null)}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button 
                        onClick={handleSeed} 
                        disabled={(!catFile && !prodFile && !imgFile) || isSeeding}
                        className="w-full sm:w-auto font-bold bg-emerald-600 hover:bg-emerald-700"
                    >
                        {isSeeding ? "Inyectando Catálogo..." : "Ejecutar Seeder"}
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>

        {/* TAB SEEDERS ESPECIALES */}
        <TabsContent value="nosotros-seed" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileJson className="w-5 h-5 text-indigo-600" />
                        Semilla de Nosotros (Perfil & Secciones)
                    </CardTitle>
                    <CardDescription>
                        Carga información del perfil del negocio y secciones personalizables.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="nosotros-file">Archivo Nosotros (`nosotros.json`)</Label>
                        <Input 
                            id="nosotros-file" 
                            type="file" 
                            accept=".json" 
                            onChange={(e) => setNosotrosFile(e.target.files?.[0] || null)}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button 
                        onClick={handleSeedNosotros} 
                        disabled={!nosotrosFile || isSeeding}
                        className="w-full sm:w-auto font-bold bg-indigo-600 hover:bg-indigo-700"
                    >
                        {isSeeding ? "Inyectando Nosotros..." : "Ejecutar Seeder Nosotros"}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileJson className="w-5 h-5 text-amber-600" />
                        Semilla de Product Prompts
                    </CardTitle>
                    <CardDescription>
                        Carga prompts personalizados para el generador de descripciones IA.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="prompts-file">Archivo Prompts (`prompts.json`)</Label>
                        <Input 
                            id="prompts-file" 
                            type="file" 
                            accept=".json" 
                            onChange={(e) => setPromptsFile(e.target.files?.[0] || null)}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button 
                        onClick={handleSeedPrompts} 
                        disabled={!promptsFile || isSeeding}
                        className="w-full sm:w-auto font-bold bg-amber-600 hover:bg-amber-700"
                    >
                        {isSeeding ? "Inyectando Prompts..." : "Ejecutar Seeder Prompts"}
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
