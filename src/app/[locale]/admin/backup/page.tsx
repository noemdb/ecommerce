"use client";

import { useState } from "react";
import { Download, Upload, Server, FileJson, AlertTriangle } from "lucide-react";
import { exportDatabase, importDatabase, seedCatalogFromJSON } from "@/actions/database-manager";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";

export default function BackupPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const [importFile, setImportFile] = useState<File | null>(null);

  const [catFile, setCatFile] = useState<File | null>(null);
  const [prodFile, setProdFile] = useState<File | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);

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
        </TabsContent>

        {/* TAB SEEDER */}
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

      </Tabs>
    </div>
  );
}
