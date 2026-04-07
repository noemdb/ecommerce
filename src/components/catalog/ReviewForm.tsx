"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RatingStars } from "@/components/catalog/RatingStars";
import { Star, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  productId: string;
}

export function ReviewForm({ productId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Por favor, selecciona una calificación");
      return;
    }
    if (comment.length < 10) {
      toast.error("Tu comentario debe tener al menos 10 caracteres");
      return;
    }

    setIsSubmitting(true);
    // Mock server action call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("¡Reseña enviada! Estará visible tras la moderación.");
      setRating(0);
      setComment("");
    } catch (error) {
      toast.error("Error al enviar la reseña");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 md:p-10 border border-neutral-100 dark:border-neutral-800 shadow-xl shadow-blue-500/5">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-black tracking-tight">Compartir Experiencia</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-neutral-400 block ml-1">
            Calificación del Producto
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform active:scale-90"
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={cn(
                    "w-8 h-8 transition-colors duration-200",
                    (hover || rating) >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-neutral-200 dark:text-neutral-700"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-neutral-400 block ml-1">
            Tu Opinión Detallada
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full min-h-[120px] rounded-2xl border-2 border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
            placeholder="¿Qué te pareció la calidad? ¿Superó tus expectativas?"
          />
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest ml-1 text-right">
            {comment.length} / 500 caracteres
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full h-14" 
          isLoading={isSubmitting}
        >
          Enviar Reseña Premium
          <Send className="ml-2 w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
