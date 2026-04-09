"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import {
  createCategoryAction,
  updateCategoryAction,
  toggleCategoryActiveAction,
  deleteCategoryAction,
  reorderCategoriesAction,
} from "@/actions/category";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Tag,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronDown,
  FolderTree,
  Layers,
  Hash,
  GripVertical,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  order: number;
  isActive: boolean;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  _count: { products: number; children: number };
  createdAt: Date;
};

interface CategoriesManagerProps {
  categories: Category[];
}

type FormState = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  order: string;
  parentId: string;
};

const emptyForm = (): FormState => ({
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  order: "0",
  parentId: "",
});

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

export function CategoriesManager({ categories }: CategoriesManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [autoSlug, setAutoSlug] = useState(true);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const confirm = useConfirm();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);

      const newOrder = arrayMove(categories, oldIndex, newIndex);
      
      // Optimizamos: solo enviamos los que cambiaron de orden
      const updates = newOrder.map((cat, index) => ({
        id: cat.id,
        order: index,
      }));

      startTransition(async () => {
        const result = await reorderCategoriesAction(updates);
        if (!result.success) {
          toast.error(result.error || "Error al reordenar");
        }
      });
    }
  }

  // Auto-focus when modal opens
  useEffect(() => {
    if (mode !== null && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [mode]);

  function openCreate() {
    setForm(emptyForm());
    setFieldErrors({});
    setAutoSlug(true);
    setEditingId(null);
    setMode("create");
  }

  function openEdit(cat: Category) {
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
      imageUrl: cat.imageUrl ?? "",
      order: String(cat.order),
      parentId: cat.parentId ?? "",
    });
    setFieldErrors({});
    setAutoSlug(false);
    setEditingId(cat.id);
    setMode("edit");
  }

  function closeModal() {
    setMode(null);
    setEditingId(null);
  }

  function handleNameChange(value: string) {
    setForm((f) => ({
      ...f,
      name: value,
      slug: autoSlug ? slugify(value) : f.slug,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      imageUrl: form.imageUrl || undefined,
      order: parseInt(form.order) || 0,
      parentId: form.parentId || null,
    };

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createCategoryAction(data)
          : await updateCategoryAction(editingId!, data);

      if (result.success) {
        toast.success(result.message!);
        closeModal();
      } else {
        setFieldErrors(result.fieldErrors ?? {});
        if (!result.fieldErrors) {
          toast.error(result.error!);
        }
      }
    });
  }

  function handleToggleActive(cat: Category) {
    startTransition(async () => {
      const result = await toggleCategoryActiveAction(cat.id, !cat.isActive);
      if (result.success) {
        toast.success(result.message!);
      } else {
        toast.error(result.error!);
      }
    });
  }

  async function handleDelete(id: string) {
    const isConfirmed = await confirm({
      title: "¿Eliminar categoría?",
      description: "Esta acción no se puede deshacer. Los productos en esta categoría no podrán ser eliminados si la categoría desaparece.",
      confirmText: "Eliminar ahora",
      cancelText: "Cancelar",
      variant: "danger"
    });

    if (!isConfirmed) return;

    startTransition(async () => {
      const result = await deleteCategoryAction(id);
      if (result.success) {
        toast.success(result.message!);
      } else {
        toast.error(result.error!);
      }
    });
  }

  // Root categories (no parent)
  const roots = categories.filter((c) => !c.parentId);
  const children = categories.filter((c) => c.parentId);

  return (
    <div className="flex flex-col gap-8">

      {/* ── Header ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            Categorías
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {categories.length} categoría{categories.length !== 1 ? "s" : ""} ·{" "}
            {categories.filter((c) => c.isActive).length} activa
            {categories.filter((c) => c.isActive).length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="h-11 rounded-md gap-2"
          id="btn-create-category"
        >
          <Plus className="w-4 h-4" />
          Nueva Categoría
        </Button>
      </div>

      {/* ── Stats row ──────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: categories.length, icon: Tag, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Activas", value: categories.filter((c) => c.isActive).length, icon: ToggleRight, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Inactivas", value: categories.filter((c) => !c.isActive).length, icon: ToggleLeft, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Con hijos", value: roots.filter((r) => r._count.children > 0).length, icon: FolderTree, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md p-5 flex items-center gap-4"
          >
            <div className={cn("w-10 h-10 rounded-md flex items-center justify-center shrink-0", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ──────────────────────────────── */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-neutral-400">
            <Layers className="w-12 h-12" />
            <p className="font-medium">No hay categorías. Crea la primera.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  {["Nombre", "Slug", "Padre", "Orden", "Productos", "Estado", "Acciones"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left text-xs font-black uppercase tracking-widest text-neutral-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={categories.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {/* Renderizamos raíces e hijos en un solo flujo para que el drag & drop funcione en la lista plana visualmente */}
                    {categories.map((cat) => (
                      <CategoryRow
                        key={cat.id}
                        cat={cat}
                        depth={cat.parentId ? 1 : 0}
                        isPending={isPending}
                        onEdit={openEdit}
                        onToggle={handleToggleActive}
                        onDeleteRequest={handleDelete}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ─────────────────── */}
      {mode !== null && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-2xl w-full max-w-lg animate-in zoom-in-95 fade-in duration-200 overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-7 py-6 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-lg font-bold">
                {mode === "create" ? "Nueva Categoría" : "Editar Categoría"}
              </h2>
              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-7 py-6 flex flex-col gap-5">
              <Input
                ref={nameInputRef}
                label="Nombre *"
                id="field-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej: Electrónica"
                error={fieldErrors.name?.[0]}
              />

              <div className="flex flex-col gap-2">
                <Input
                  label="Slug *"
                  id="field-slug"
                  value={form.slug}
                  onChange={(e) => {
                    setAutoSlug(false);
                    setForm((f) => ({ ...f, slug: e.target.value }));
                  }}
                  placeholder="electronica"
                  error={fieldErrors.slug?.[0]}
                />
                {autoSlug && form.slug && (
                  <p className="text-[10px] text-blue-500 font-medium ml-1 flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Auto-generado desde el nombre
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">
                  Descripción
                </label>
                <textarea
                  id="field-description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Descripción breve de la categoría..."
                  rows={3}
                  className="flex w-full rounded-md border-2 border-neutral-100 bg-white px-4 py-3 text-sm font-medium transition-all duration-300 placeholder:text-neutral-300 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white dark:placeholder:text-neutral-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="URL de imagen"
                  id="field-imageUrl"
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://..."
                  error={fieldErrors.imageUrl?.[0]}
                />
                <Input
                  label="Orden"
                  id="field-order"
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                />
              </div>

              {/* Parent category select */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">
                  Categoría padre
                </label>
                <div className="relative">
                  <select
                    id="field-parentId"
                    value={form.parentId}
                    onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                    className="flex h-14 w-full rounded-md border-2 border-neutral-100 bg-white px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white appearance-none pr-10"
                  >
                    <option value="">— Sin padre (raíz) —</option>
                    {categories
                      .filter((c) => !c.parentId && c.id !== editingId)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              {/* Form actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={closeModal}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={isPending}
                  id="btn-submit-category"
                >
                  {mode === "create" ? "Crear" : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// ── Row ──────────────────────────────────────────────────────────────────────

function CategoryRow({
  cat,
  depth,
  isPending,
  onEdit,
  onToggle,
  onDeleteRequest,
}: {
  cat: Category;
  depth: number;
  isPending: boolean;
  onEdit: (cat: Category) => void;
  onToggle: (cat: Category) => void;
  onDeleteRequest: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "group hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors",
        isDragging && "bg-neutral-100 dark:bg-neutral-800 shadow-lg"
      )}
    >
      {/* Drag Handle */}
      <td className="px-5 py-4 w-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-600 transition-colors"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>

      {/* Name */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2" style={{ paddingLeft: depth * 20 }}>
          {depth > 0 && (
            <span className="text-neutral-300 dark:text-neutral-600 select-none">└</span>
          )}
          <span className="font-semibold">{cat.name}</span>
        </div>
      </td>

      {/* Slug */}
      <td className="px-5 py-4">
        <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-lg text-neutral-600 dark:text-neutral-400">
          {cat.slug}
        </code>
      </td>

      {/* Parent */}
      <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400 text-xs">
        {cat.parent?.name ?? (
          <span className="italic text-neutral-300 dark:text-neutral-600">—</span>
        )}
      </td>

      {/* Order */}
      <td className="px-5 py-4 text-neutral-500 tabular-nums">{cat.order}</td>

      {/* Products count */}
      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg px-2.5 py-1">
          {cat._count.products}
        </span>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <button
          onClick={() => onToggle(cat)}
          disabled={isPending}
          title={cat.isActive ? "Desactivar" : "Activar"}
          className="inline-flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 disabled:opacity-50"
        >
          {cat.isActive ? (
            <>
              <span className="w-2 h-2 rounded-lg bg-emerald-500 animate-pulse" />
              <span className="text-emerald-600 dark:text-emerald-400">Activa</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-lg bg-neutral-300 dark:bg-neutral-600" />
              <span className="text-neutral-400">Inactiva</span>
            </>
          )}
        </button>
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(cat)}
            disabled={isPending}
            title="Editar"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors disabled:opacity-40"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Pencil className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onDeleteRequest(cat.id)}
            disabled={isPending}
            title="Eliminar"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
