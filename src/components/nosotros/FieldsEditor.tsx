"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import type { ProfileField, ProfileFieldType } from "@prisma/client";
import {
  createFieldAction,
  updateFieldAction,
  deleteFieldAction,
  toggleFieldVisibleAction,
  updateFieldOrderAction,
} from "@/actions/nosotros";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import {
  Eye, EyeOff, Trash2, Plus, Save, Loader2, ArrowUp, ArrowDown, X, Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";

const FIELD_TYPE_LABELS: Record<ProfileFieldType, string> = {
  TEXT: "Texto plano",
  HTML: "HTML",
  IMAGE_URL: "Imagen (URL)",
  LINK: "Enlace",
  DATE: "Fecha",
  NUMBER: "Número",
};

const FIELD_TYPES: ProfileFieldType[] = ["TEXT", "HTML", "IMAGE_URL", "LINK", "DATE", "NUMBER"];

interface FieldFormData {
  label: string;
  fieldKey: string;
  fieldType: ProfileFieldType;
  value: string;
}

function FieldValueInput({
  fieldType,
  value,
  onChange,
}: {
  fieldType: ProfileFieldType;
  value: string;
  onChange: (v: string) => void;
}) {
  switch (fieldType) {
    case "HTML":
      return (
        <Textarea
          rows={6}
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
          placeholder="<p>Escribe HTML aquí...</p>"
          className="font-mono text-sm"
        />
      );
    case "IMAGE_URL":
      return (
        <div className="flex flex-col gap-3">
          <Input
            value={value}
            onChange={(e: any) => onChange(e.target.value)}
            placeholder="https://utfs.io/..."
          />
          {value && (
            <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
              <Image src={value} alt="Preview" fill className="object-cover" sizes="160px" />
            </div>
          )}
          <UploadButton<OurFileRouter, "profileImage">
            endpoint="profileImage"
            onClientUploadComplete={(res) => { if (res?.[0]?.url) onChange(res[0].url); }}
            appearance={{
              button: "bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-md",
            }}
          />
        </div>
      );
    case "DATE":
      return (
        <Input
          type="date"
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
        />
      );
    default:
      return (
        <Input
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
          placeholder={fieldType === "LINK" ? "https://..." : fieldType === "NUMBER" ? "0" : "Valor..."}
        />
      );
  }
}

interface AddFieldFormProps {
  sectionId: string;
  onAdded: (field: ProfileField) => void;
}

function AddFieldForm({ sectionId, onAdded }: AddFieldFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FieldFormData>({ label: "", fieldKey: "", fieldType: "TEXT", value: "" });
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createFieldAction({ sectionId, ...form });
      if (result.success) {
        setForm({ label: "", fieldKey: "", fieldType: "TEXT", value: "" });
        setOpen(false);
        // Recargar la página para obtener el campo creado con su id real
        window.location.reload();
      } else {
        setError(result.error ?? "Error");
      }
    });
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-2 self-start">
        <Plus className="w-3.5 h-3.5" />
        Agregar campo
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-blue-200 dark:border-blue-900 rounded-xl p-5 bg-blue-50/30 dark:bg-blue-950/20 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-neutral-900 dark:text-white">Nuevo campo</h4>
        <button type="button" onClick={() => setOpen(false)}>
          <X className="w-4 h-4 text-neutral-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Etiqueta *</Label>
          <Input
            required
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="Ej: Universidad"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Clave interna *</Label>
          <Input
            required
            value={form.fieldKey}
            onChange={(e) => setForm((f) => ({ ...f, fieldKey: e.target.value }))}
            placeholder="Ej: university_name"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Tipo *</Label>
          <select
            value={form.fieldType}
            onChange={(e) => setForm((f) => ({ ...f, fieldType: e.target.value as ProfileFieldType }))}
            className="h-10 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 text-sm"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t} value={t}>{FIELD_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Valor *</Label>
        <FieldValueInput
          fieldType={form.fieldType}
          value={form.value}
          onChange={(v) => setForm((f) => ({ ...f, value: v }))}
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending} className="gap-2">
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Agregar
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
      </div>
    </form>
  );
}

interface FieldRowProps {
  field: ProfileField;
  isFirst: boolean;
  isLast: boolean;
  onMove: (id: string, dir: "up" | "down") => void;
  onDelete: (id: string) => void;
  onToggleVisible: (id: string, current: boolean) => void;
  onSave: (id: string, data: FieldFormData) => void;
}

function FieldRow({ field, isFirst, isLast, onMove, onDelete, onToggleVisible, onSave }: FieldRowProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FieldFormData>({
    label: field.label,
    fieldKey: field.fieldKey,
    fieldType: field.fieldType,
    value: field.value,
  });

  if (editing) {
    return (
      <div className="border border-blue-200 dark:border-blue-900 rounded-xl p-4 bg-blue-50/20 dark:bg-blue-950/10 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Etiqueta</Label>
            <Input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Clave interna</Label>
            <Input value={form.fieldKey} onChange={(e) => setForm((f) => ({ ...f, fieldKey: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Tipo</Label>
            <select
              value={form.fieldType}
              onChange={(e) => setForm((f) => ({ ...f, fieldType: e.target.value as ProfileFieldType, value: "" }))}
              className="h-10 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 text-sm"
            >
              {FIELD_TYPES.map((t) => (
                <option key={t} value={t}>{FIELD_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Valor</Label>
          <FieldValueInput
            fieldType={form.fieldType}
            value={form.value}
            onChange={(v) => setForm((f) => ({ ...f, value: v }))}
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => { onSave(field.id, form); setEditing(false); }} className="gap-2">
            <Save className="w-3.5 h-3.5" /> Guardar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl border bg-white dark:bg-neutral-900",
      !field.isVisible && "opacity-50",
      "border-neutral-200 dark:border-neutral-800"
    )}>
      {/* Mover */}
      <div className="flex flex-col gap-0.5">
        <button onClick={() => onMove(field.id, "up")} disabled={isFirst} className="p-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-20">
          <ArrowUp className="w-3 h-3 text-neutral-400" />
        </button>
        <button onClick={() => onMove(field.id, "down")} disabled={isLast} className="p-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-20">
          <ArrowDown className="w-3 h-3 text-neutral-400" />
        </button>
      </div>

      {/* Tipo badge */}
      <span className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-2 py-0.5 rounded shrink-0">
        {field.fieldType}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{field.label}</p>
        <p className="text-xs text-neutral-400 truncate">{field.value}</p>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onToggleVisible(field.id, field.isVisible)}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title={field.isVisible ? "Ocultar" : "Mostrar"}
        >
          {field.isVisible ? <Eye className="w-3.5 h-3.5 text-neutral-500" /> : <EyeOff className="w-3.5 h-3.5 text-neutral-400" />}
        </button>
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Editar"
        >
          <Pencil className="w-3.5 h-3.5 text-blue-500" />
        </button>
        <button
          onClick={() => onDelete(field.id)}
          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Eliminar"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
        </button>
      </div>
    </div>
  );
}

interface Props {
  sectionId: string;
  initialFields: ProfileField[];
}

export function FieldsEditor({ sectionId, initialFields }: Props) {
  const [fields, setFields] = useState(initialFields);
  const [isPending, startTransition] = useTransition();

  function move(id: string, dir: "up" | "down") {
    const idx = fields.findIndex((f) => f.id === id);
    if (dir === "up" && idx === 0) return;
    if (dir === "down" && idx === fields.length - 1) return;
    const next = [...fields];
    const swap = dir === "up" ? idx - 1 : idx + 1;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    const withOrder = next.map((f, i) => ({ ...f, order: i }));
    setFields(withOrder);
    startTransition(async () => {
      await updateFieldOrderAction(withOrder.map((f) => ({ id: f.id, order: f.order })));
    });
  }

  function handleDelete(id: string) {
    if (!confirm("¿Eliminar este campo?")) return;
    startTransition(async () => {
      await deleteFieldAction(id);
      setFields((prev) => prev.filter((f) => f.id !== id));
    });
  }

  function handleToggleVisible(id: string, current: boolean) {
    startTransition(async () => {
      await toggleFieldVisibleAction(id, !current);
      setFields((prev) => prev.map((f) => (f.id === id ? { ...f, isVisible: !current } : f)));
    });
  }

  function handleSave(id: string, data: FieldFormData) {
    startTransition(async () => {
      await updateFieldAction(id, data);
      setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {fields.map((field, idx) => (
          <FieldRow
            key={field.id}
            field={field}
            isFirst={idx === 0}
            isLast={idx === fields.length - 1}
            onMove={move}
            onDelete={handleDelete}
            onToggleVisible={handleToggleVisible}
            onSave={handleSave}
          />
        ))}
      </div>
      {isPending && (
        <p className="text-xs text-neutral-400 flex items-center gap-1.5">
          <Loader2 className="w-3 h-3 animate-spin" /> Guardando...
        </p>
      )}
      <AddFieldForm sectionId={sectionId} onAdded={(f) => setFields((prev) => [...prev, f])} />
    </div>
  );
}
