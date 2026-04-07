"use client";

import { useTransition } from "react";
import Link from "next/link";
import { moderateReviewAction } from "@/actions/review";
import { cn } from "@/lib/utils";
import type { ReviewStatus } from "@prisma/client";
import { Star, CheckCircle2, XCircle, MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type Review = {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  adminResponse: string | null;
  status: ReviewStatus;
  createdAt: Date;
  product: { id: string; name: string; slug: string };
  customer: { id: string; name: string } | null;
};

interface ReviewsModeratorProps {
  reviews: Review[];
  counts: Record<string, number>;
  currentStatus: ReviewStatus;
}

const TABS: Array<{ status: ReviewStatus; label: string }> = [
  { status: "PENDING", label: "Pendientes" },
  { status: "APPROVED", label: "Aprobadas" },
  { status: "REJECTED", label: "Rechazadas" },
];

export function ReviewsModerator({
  reviews,
  counts,
  currentStatus,
}: ReviewsModeratorProps) {
  const [isPending, startTransition] = useTransition();

  function moderate(reviewId: string, status: ReviewStatus) {
    startTransition(async () => {
      const res = await moderateReviewAction(reviewId, status);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Reseñas</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Modera las opiniones de los clientes
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1">
        {TABS.map((tab) => (
          <Link
            key={tab.status}
            href={`?status=${tab.status}`}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              currentStatus === tab.status
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center",
                currentStatus === tab.status
                  ? "bg-white/20 dark:bg-black/20"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
              )}
            >
              {counts[tab.status] ?? 0}
            </span>
          </Link>
        ))}
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-4 text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
          <MessageSquare className="w-12 h-12" />
          <p className="font-medium">No hay reseñas en este estado.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={cn(
                "bg-white dark:bg-neutral-900 border rounded-2xl p-6 flex flex-col gap-4 transition-opacity",
                isPending && "opacity-60",
                "border-neutral-200 dark:border-neutral-800"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{review.reviewerName}</p>
                  <Link
                    href={`/admin/productos/${review.product.id}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {review.product.name}
                  </Link>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < review.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-neutral-200 dark:text-neutral-700"
                      )}
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {review.comment}
              </p>

              {review.adminResponse && (
                <div className="flex gap-2 p-3 bg-blue-50 dark:bg-blue-500/5 rounded-xl border border-blue-100 dark:border-blue-500/20">
                  <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    {review.adminResponse}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-400">
                  {new Date(review.createdAt).toLocaleDateString("es-VE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                {currentStatus === "PENDING" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => moderate(review.id, "REJECTED")}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Rechazar
                    </button>
                    <button
                      onClick={() => moderate(review.id, "APPROVED")}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Aprobar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
