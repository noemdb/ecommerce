"use client";

import { useState, useId, useEffect } from "react";
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
import { GripVertical } from "lucide-react";
import { reorderModules } from "@/actions/lms/course.actions";
import { toast } from "sonner";
import type { CourseModule } from "@prisma/client";

interface ModuleManagerProps {
  courseId: string;
  modules: CourseModule[];
}

function SortableItem({ module }: { module: CourseModule }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-card border rounded-md mb-2 shadow-sm"
    >
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="font-medium">{module.title}</span>
      {module.isPublished ? (
        <span className="ml-auto text-[10px] uppercase font-black px-2.5 py-0.5 rounded-md flex items-center text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800/30">
          Publicado
        </span>
      ) : (
        <span className="ml-auto text-[10px] uppercase font-black px-2.5 py-0.5 rounded-md flex items-center text-neutral-500 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          Borrador
        </span>
      )}
    </div>
  );
}

export function ModuleManager({ courseId, modules: initialModules }: ModuleManagerProps) {
  const dndId = useId();
  const [modules, setModules] = useState(initialModules);

  // Sincronizar estado local cuando las props del servidor cambian (ej. tras guardar un módulo)
  useEffect(() => {
    setModules(initialModules);
  }, [initialModules]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over.id);
      
      const newModules = arrayMove(modules, oldIndex, newIndex);
      setModules(newModules);

      const orderPayload = newModules.map((m, index) => ({
        id: m.id,
        position: index,
      }));

      const result = await reorderModules({ courseId, order: orderPayload });
      if (!result.ok) {
        toast.error(result.error || "Error al reordenar los módulos");
        // Revert to original order
        setModules(initialModules);
      } else {
        toast.success("Módulos reordenados");
      }
    }
  }

  if (modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/50 text-center gap-3">
        <div className="bg-white dark:bg-neutral-800 p-3 rounded-full shadow-sm">
          <GripVertical className="h-6 w-6 text-neutral-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Sin módulos creados</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto mt-1">
            Los módulos son las secciones principales de tu curso. Crea el primero abajo para empezar a organizar tu contenido.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={modules.map((m) => m.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1">
          {modules.map((module) => (
            <SortableItem key={module.id} module={module} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
