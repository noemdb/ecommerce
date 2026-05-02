"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSectionWithFieldsAction } from "@/actions/nosotros";
import { SectionRenderer } from "@/components/nosotros/SectionRenderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ChevronRight, ChevronLeft, Plus, Trash2, LayoutList, 
  Settings, Type, FileText, Image as ImageIcon, Link2, 
  Calendar, Hash, CheckCircle2, Loader2, Eye
} from "lucide-react";
import type { ProfileFieldType } from "@prisma/client";

// Define un mock del tipo devuelto por prisma para usar en el Preview
type MockSection = {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  icon: string | null;
  order: number;
  isVisible: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  fields: MockField[];
};

type MockField = {
  id: string;
  sectionId: string;
  fieldKey: string;
  label: string;
  fieldType: ProfileFieldType;
  value: string;
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const FIELD_TYPES: { value: ProfileFieldType; label: string; icon: any }[] = [
  { value: "TEXT", label: "Texto Plano", icon: Type },
  { value: "HTML", label: "Contenido Rico (HTML)", icon: FileText },
  { value: "IMAGE_URL", label: "Imagen (URL)", icon: ImageIcon },
  { value: "LINK", label: "Enlace web", icon: Link2 },
  { value: "DATE", label: "Fecha", icon: Calendar },
  { value: "NUMBER", label: "Número", icon: Hash },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function SectionWizard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Paso 1: Estado de la sección
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [icon, setIcon] = useState("");
  const slug = title ? slugify(title) : "nueva-seccion";

  // Paso 2: Estado de los campos
  const [fields, setFields] = useState<Omit<MockField, "id" | "sectionId" | "createdAt" | "updatedAt" | "order">[]>([]);

  // Paso 3: Estado de publicación
  const [isPublished, setIsPublished] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleAddField = () => {
    setFields([
      ...fields,
      {
        fieldKey: `campo-${fields.length + 1}`,
        label: "",
        fieldType: "TEXT",
        value: "",
        isVisible: true,
      },
    ]);
  };

  const updateField = (index: number, key: keyof typeof fields[0], val: any) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: val };
    setFields(updated);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError(null);
    startTransition(async () => {
      const result = await createSectionWithFieldsAction({
        section: {
          title,
          subtitle: subtitle || undefined,
          slug,
          icon: icon || undefined,
          isPublished,
          isVisible,
        },
        fields: fields.map(f => ({ ...f })),
      });

      if (result.success) {
        router.push("/admin/nosotros/secciones");
      } else {
        setError(result.error ?? "Error al crear la sección");
      }
    });
  };

  // Objeto en forma de base de datos para pasar al componente SectionRenderer
  const previewData: MockSection = {
    id: "preview-id",
    title: title || "Título de la Sección",
    subtitle: subtitle || "Subtítulo descriptivo",
    slug,
    icon: icon || null,
    order: 0,
    isVisible: true, // Forzamos visibilidad para el preview
    isPublished: true, // Forzamos publicación para el preview
    createdAt: new Date(),
    updatedAt: new Date(),
    fields: fields.map((f, i) => ({
      id: `preview-field-${i}`,
      sectionId: "preview-id",
      order: i,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...f,
    })),
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:h-[calc(100vh-140px)]">
      {/* Columna Izquierda: Formulario Wizard */}
      <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-neutral-50 dark:bg-neutral-950 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <div className="flex gap-2 items-center text-sm font-medium">
            <span className={`w-8 h-8 flex items-center justify-center rounded-full ${step >= 1 ? "bg-blue-600 text-white" : "bg-neutral-200 text-neutral-500"}`}>1</span>
            <span className="hidden sm:inline text-neutral-600 dark:text-neutral-400">Estructura</span>
            <div className={`w-4 h-[2px] ${step >= 2 ? "bg-blue-600" : "bg-neutral-200"}`}></div>
            <span className={`w-8 h-8 flex items-center justify-center rounded-full ${step >= 2 ? "bg-blue-600 text-white" : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"}`}>2</span>
            <span className="hidden sm:inline text-neutral-600 dark:text-neutral-400">Campos</span>
            <div className={`w-4 h-[2px] ${step >= 3 ? "bg-blue-600" : "bg-neutral-200"}`}></div>
            <span className={`w-8 h-8 flex items-center justify-center rounded-full ${step >= 3 ? "bg-blue-600 text-white" : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"}`}>3</span>
            <span className="hidden sm:inline text-neutral-600 dark:text-neutral-400">Publicar</span>
          </div>
        </div>

        {/* Pasos */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <LayoutList className="text-blue-500 w-6 h-6" />
                  Estructura de la Sección
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
                  Las secciones son contenedores lógicos en tu página "Nosotros". Por ejemplo: "Mi Experiencia", "Premios y Reconocimientos" o "Galería". Define el título principal de este contenedor.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título de la Sección *</Label>
                  <Input 
                    id="title" 
                    placeholder="Ej: Educación Académica" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtítulo (Opcional)</Label>
                  <Input 
                    id="subtitle" 
                    placeholder="Ej: Universidades y Cursos realizados" 
                    value={subtitle} 
                    onChange={(e) => setSubtitle(e.target.value)} 
                  />
                  <p className="text-xs text-neutral-500">Un pequeño texto debajo del título principal para dar contexto extra.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Ícono (Opcional)</Label>
                  <Input 
                    id="icon" 
                    placeholder="Ej: GraduationCap, Star, Book" 
                    value={icon} 
                    onChange={(e) => setIcon(e.target.value)} 
                  />
                  <p className="text-xs text-neutral-500">Nombre de ícono válido de Lucide Icons. Si lo dejas en blanco, no mostrará ícono.</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Settings className="text-emerald-500 w-6 h-6" />
                  Campos de Contenido
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
                  Añade los datos específicos que deseas mostrar dentro de esta sección. Puedes combinar diferentes tipos de campos (texto, HTML, imágenes).
                </p>
              </div>

              <div className="space-y-6">
                {fields.length === 0 ? (
                  <div className="text-center py-10 px-4 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                    <LayoutList className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white">Sin campos configurados</h3>
                    <p className="text-xs text-neutral-500 mt-1 mb-4">Empieza agregando un campo para construir el contenido.</p>
                    <Button type="button" onClick={handleAddField} size="sm" variant="secondary" className="gap-2">
                      <Plus className="w-4 h-4" /> Agregar primer campo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {fields.map((field, idx) => (
                      <div key={idx} className="relative bg-neutral-50 dark:bg-neutral-900/50 p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4 shadow-sm group">
                        <button 
                          onClick={() => removeField(idx)}
                          className="absolute -top-3 -right-3 w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          title="Eliminar campo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Etiqueta visible (Label)</Label>
                            <Input 
                              placeholder="Ej: Empresa" 
                              value={field.label}
                              onChange={(e) => updateField(idx, "label", e.target.value)}
                              className="bg-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Tipo de Campo</Label>
                            <select 
                              className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                              value={field.fieldType}
                              onChange={(e) => updateField(idx, "fieldType", e.target.value as ProfileFieldType)}
                            >
                              {FIELD_TYPES.map(ft => (
                                <option key={ft.value} value={ft.value}>{ft.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Contenido</Label>
                          {field.fieldType === "HTML" ? (
                            <textarea
                              className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300 min-h-[100px]"
                              placeholder="<p>Escribe tu contenido en HTML aquí...</p>"
                              value={field.value}
                              onChange={(e) => updateField(idx, "value", e.target.value)}
                            />
                          ) : (
                            <Input 
                              placeholder="Valor del campo..." 
                              value={field.value}
                              onChange={(e) => updateField(idx, "value", e.target.value)}
                              className="bg-white"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <Button type="button" onClick={handleAddField} variant="outline" className="w-full gap-2 border-dashed border-2">
                      <Plus className="w-4 h-4 text-blue-600" /> Agregar otro campo
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="text-purple-500 w-6 h-6" />
                  Revisión Final
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
                  La sección está lista para ser creada. Revisa la vista previa en el panel derecho. Si estás satisfecho, decide si quieres publicarla de inmediato o guardarla como borrador.
                </p>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">Publicar en la web</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm">
                      Si está activo, esta sección será visible inmediatamente en tu página pública de /nosotros.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-200">
                    {error}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-between bg-white dark:bg-neutral-900">
          <Button 
            variant="ghost" 
            onClick={() => step > 1 ? setStep(step - 1) : router.push("/admin/nosotros/secciones")}
          >
            {step === 1 ? "Cancelar" : "Atrás"}
          </Button>
          
          <Button 
            onClick={() => {
              if (step < 3) {
                if (step === 1 && !title.trim()) {
                  alert("El título es obligatorio");
                  return;
                }
                setStep(step + 1);
              } else {
                handleSubmit();
              }
            }}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <>Guardando <Loader2 className="w-4 h-4 animate-spin" /></>
            ) : step === 3 ? (
              <>Crear Sección <CheckCircle2 className="w-4 h-4" /></>
            ) : (
              <>Siguiente <ChevronRight className="w-4 h-4" /></>
            )}
          </Button>
        </div>
      </div>

      {/* Columna Derecha: Live Preview */}
      <div className="hidden lg:flex flex-col h-full bg-slate-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden relative">
        <div className="absolute top-4 right-4 bg-white/80 dark:bg-black/50 backdrop-blur text-xs font-mono px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-500 shadow-sm flex items-center gap-2 z-10">
          <Eye className="w-3.5 h-3.5" /> Live Preview
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-2xl mx-auto opacity-50 text-xs text-center mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800 text-neutral-400">
            — Otras secciones anteriores —
          </div>
          
          <div className="max-w-2xl mx-auto shadow-2xl rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800 transition-all duration-300">
            {title ? (
              <SectionRenderer section={previewData as any} />
            ) : (
              <div className="p-12 text-center text-neutral-400 dark:text-neutral-600 flex flex-col items-center justify-center min-h-[300px]">
                <LayoutList className="w-12 h-12 mb-4 opacity-50" />
                <p>La vista previa aparecerá aquí<br/>al escribir un título.</p>
              </div>
            )}
          </div>
          
          <div className="max-w-2xl mx-auto opacity-50 text-xs text-center mt-8 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-neutral-400">
            — Otras secciones siguientes —
          </div>
        </div>
      </div>
    </div>
  );
}
