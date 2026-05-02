"use client";

import { useEffect, useState } from "react";
import { useProtectedResource } from "@/hooks/lms/use-protected-resource";
import { LessonFileType } from "@prisma/client";
import type { ProtectedResourceResponse } from "@/lib/lms/schemas/lms.schemas";

import { ProtectedVideo } from "./ProtectedVideo";
import { ProtectedPdf } from "./ProtectedPdf";
import { ProtectedImage } from "./ProtectedImage";
import { ProtectedDownload } from "./ProtectedDownload";

export function LessonResourceViewer({ resourceId }: { resourceId: string }) {
  const { requestUrl, loading, error } = useProtectedResource(resourceId);
  const [resource, setResource] = useState<ProtectedResourceResponse | null>(null);

  useEffect(() => {
    requestUrl().then((r) => {
      if (r) setResource(r);
    });
  }, [resourceId, requestUrl]);

  if (loading && !resource) return <ResourceSkeleton />;
  if (error) return <ResourceError message={error} />;
  if (!resource) return null;

  switch (resource.fileType) {
    case LessonFileType.VIDEO:
      return (
        <ProtectedVideo
          src={resource.signedUrl}
          title={resource.title}
          resourceId={resourceId}
        />
      );
    case LessonFileType.PDF:
      return <ProtectedPdf src={resource.signedUrl} title={resource.title} />;
    case LessonFileType.IMAGE:
      return <ProtectedImage src={resource.signedUrl} title={resource.title} />;
    case LessonFileType.DOWNLOAD:
      return <ProtectedDownload src={resource.signedUrl} title={resource.title} />;
    default:
      return null;
  }
}

function ResourceSkeleton() {
  return <div className="h-48 w-full animate-pulse rounded-lg bg-muted" />;
}

function ResourceError({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
      {message}
    </div>
  );
}
