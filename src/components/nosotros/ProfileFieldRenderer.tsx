"use client";

import Image from "next/image";
import type { ProfileField } from "@prisma/client";

interface Props {
  field: ProfileField;
}

export function ProfileFieldRenderer({ field }: Props) {
  if (!field.value || !field.isVisible) return null;

  switch (field.fieldType) {
    case "TEXT":
      return (
        <div className="flex flex-col gap-1">
          {field.label && (
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              {field.label}
            </span>
          )}
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {field.value}
          </p>
        </div>
      );

    case "HTML":
      return (
        <div className="flex flex-col gap-1">
          {field.label && (
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              {field.label}
            </span>
          )}
          {/* El HTML ya viene sanitizado desde el Server Action */}
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300"
            dangerouslySetInnerHTML={{ __html: field.value }}
          />
        </div>
      );

    case "IMAGE_URL":
      return (
        <div className="flex flex-col gap-2">
          {field.label && (
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              {field.label}
            </span>
          )}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
            <Image
              src={field.value}
              alt={field.label || "Imagen del perfil"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      );

    case "LINK":
      return (
        <div className="flex flex-col gap-1">
          {field.label && (
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              {field.label}
            </span>
          )}
          <a
            href={field.value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline break-all text-sm font-medium"
          >
            {field.value}
          </a>
        </div>
      );

    case "DATE":
      return (
        <div className="flex flex-col gap-1">
          {field.label && (
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              {field.label}
            </span>
          )}
          <p className="text-neutral-700 dark:text-neutral-300">
            {new Intl.DateTimeFormat("es-VE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }).format(new Date(field.value))}
          </p>
        </div>
      );

    case "NUMBER":
      return (
        <div className="flex flex-col gap-1">
          {field.label && (
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              {field.label}
            </span>
          )}
          <p className="text-neutral-700 dark:text-neutral-300 font-medium">
            {Number(field.value).toLocaleString("es-VE")}
          </p>
        </div>
      );

    default:
      return null;
  }
}
