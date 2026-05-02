"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { markLessonComplete } from "@/actions/lms/progress.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface MarkCompleteButtonProps {
  lessonId: string;
  isCompleted: boolean;
}

export function MarkCompleteButton({ lessonId, isCompleted }: MarkCompleteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (isCompleted) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 font-medium bg-emerald-500/10 px-4 py-3 rounded-lg w-fit border border-emerald-200">
        <CheckCircle className="w-5 h-5" />
        <span>Lección completada</span>
      </div>
    );
  }

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const result = await markLessonComplete({ lessonId, watchedSec: 0 });
      if (result.ok) {
        toast.success("¡Lección completada!");
        router.refresh();
      } else {
        toast.error(result.error || "Error al guardar el progreso");
      }
    } catch (err) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleComplete}
      isLoading={isLoading}
      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
      size="lg"
    >
      <CheckCircle className="w-5 h-5" />
      Marcar como Completada
    </Button>
  );
}
