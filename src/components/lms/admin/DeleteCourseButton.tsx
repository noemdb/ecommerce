"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteCourse } from "@/actions/lms/course.actions";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface DeleteCourseButtonProps {
  courseId: string;
  courseTitle: string;
}

export function DeleteCourseButton({ courseId, courseTitle }: DeleteCourseButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteCourse(courseId);
      if (result.ok) {
        toast.success("Curso eliminado correctamente");
      } else {
        toast.error(result.error || "Error al eliminar el curso");
      }
    } catch (error) {
      toast.error("Error interno al eliminar");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
        title="Eliminar curso"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <ConfirmationDialog
        isOpen={isOpen}
        onConfirm={handleDelete}
        onCancel={() => setIsOpen(false)}
        variant="danger"
        title="¿Eliminar curso?"
        description={`Esta acción eliminará permanentemente el curso "${courseTitle}" y todo su contenido (módulos, lecciones y recursos). Esta operación no se puede deshacer.`}
        confirmText={isDeleting ? "Eliminando..." : "Sí, Eliminar Todo"}
        cancelText="Cancelar"
      />
    </>
  );
}
