"use client";
// src/app/admin/site-config/site-config-form.tsx

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { updateSiteConfig } from "./actions";
import type { SiteConfigActionState } from "@/lib/site-config/site-config-schema";
import type { SiteConfigData } from "@/lib/site-config/default-site-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showPremiumToast } from "@/components/ui/PremiumToast";
import { Save, Loader2 } from "lucide-react";

// ─── Submit button with pending state ────────────────────────────────────────

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="h-11 rounded-md min-w-[160px]">
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Guardando…
        </>
      ) : (
        <>
          <Save className="w-4 h-4 mr-2" />
          Guardar Cambios
        </>
      )}
    </Button>
  );
}

// ─── Color field: native color picker + hex text input kept in sync ───────────

function ColorField({
  label,
  name,
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  defaultValue: string;
  error?: string;
}) {
  const colorRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLInputElement>(null);

  function syncColorToText(e: React.ChangeEvent<HTMLInputElement>) {
    if (textRef.current) textRef.current.value = e.target.value.toUpperCase();
  }

  function syncTextToColor(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (/^#([0-9A-Fa-f]{6})$/.test(val) && colorRef.current) {
      colorRef.current.value = val;
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {/* Hidden native color picker — drives the swatch */}
        <input
          ref={colorRef}
          type="color"
          defaultValue={defaultValue}
          onChange={syncColorToText}
          className="w-10 h-10 rounded-md border border-neutral-200 dark:border-neutral-700 cursor-pointer p-0.5 bg-white dark:bg-neutral-900"
          aria-label={`Color picker para ${label}`}
        />
        {/* Visible hex text input — this is the actual form field */}
        <Input
          ref={textRef}
          type="text"
          name={name}
          id={name}
          defaultValue={defaultValue.toUpperCase()}
          onChange={syncTextToColor}
          maxLength={7}
          className="font-mono uppercase w-32"
          placeholder="#000000"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function ToggleField({
  label,
  name,
  defaultChecked,
  description,
}: {
  label: string;
  name: string;
  defaultChecked: boolean;
  description?: string;
}) {
  return (
    <label
      htmlFor={name}
      className="flex items-center justify-between gap-4 p-4 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
    >
      <div>
        <span className="font-medium text-sm">{label}</span>
        {description && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{description}</p>
        )}
      </div>
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          id={name}
          name={name}
          defaultChecked={defaultChecked}
          className="sr-only peer"
        />
        {/* Custom toggle track */}
        <div className="w-11 h-6 bg-neutral-300 dark:bg-neutral-700 peer-checked:bg-indigo-500 rounded-full transition-colors" />
        {/* Toggle knob */}
        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5" />
      </div>
    </label>
  );
}

// ─── Section card wrapper ──────────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden shadow-sm">
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
        <h2 className="font-bold text-base">{title}</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

const INITIAL_STATE: SiteConfigActionState = { status: "idle" };

const COLOR_FIELDS: Array<{ name: Extract<keyof SiteConfigData, string>; label: string }> = [
  { name: "colorBgPrimary", label: "Fondo Principal" },
  { name: "colorBgSecondary", label: "Fondo Secundario" },
  { name: "colorTextPrimary", label: "Texto Principal" },
  { name: "colorTextSecondary", label: "Texto Secundario" },
  { name: "colorAccentPrimary", label: "Acento Principal" },
  { name: "colorAccentSecondary", label: "Acento Secundario" },
  { name: "colorButtonPrimary", label: "Botón Principal" },
  { name: "colorBorder", label: "Bordes" },
];

const SECTION_FLAGS: Array<{ name: Extract<keyof SiteConfigData, string>; label: string; description: string }> = [
  { name: "showHeroBanner", label: "Hero Banner", description: "Slider de productos destacados en la parte superior" },
  { name: "showCategoryBar", label: "Barra de Categorías", description: "Filtro rápido por categoría" },
  { name: "showSocialProofBanner", label: "Banner de Confianza", description: "Métricas de clientes y productos" },
  { name: "showFeaturedBestSellers", label: "Más Vendidos", description: "Sección de productos más vendidos" },
  { name: "showFeaturedNewArrivals", label: "Novedades", description: "Sección de productos nuevos" },
  { name: "showCustomerCTABanner", label: "CTA de Registro", description: "Invitación a crear cuenta (solo si no está logueado)" },
  { name: "showFeaturedTrending", label: "Tendencias", description: "Sección de productos más buscados" },
  { name: "showCatalogSection", label: "Catálogo Completo", description: "Grid de todos los productos con filtros" },
  { name: "showTrustBadges", label: "Badges de Confianza", description: "Íconos de garantía, envío, seguridad" },
  { name: "showWhatsAppFAB", label: "Botón WhatsApp", description: "Botón flotante de contacto por WhatsApp" },
];

export function SiteConfigForm({ initialData }: { initialData: SiteConfigData }) {
  const [state, action] = useActionState(updateSiteConfig, INITIAL_STATE);

  // Show toast on status change
  useEffect(() => {
    if (state.status === "success") {
      showPremiumToast.success("✅ Guardado", state.message);
    } else if (state.status === "error") {
      showPremiumToast.error("Error", state.message);
    }
  }, [state]);

  const fieldErrors =
    state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={action} className="flex flex-col gap-6">
      {/* ── General ────────────────────────────────────────────── */}
      <Section
        title="General"
        description="Nombre de la app y metadata para motores de búsqueda."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="appName" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Nombre de la App
            </label>
            <Input
              id="appName"
              name="appName"
              defaultValue={initialData.appName}
              maxLength={120}
              placeholder="Ecommerce Premium"
            />
            {fieldErrors.appName && (
              <p className="text-xs text-red-500">{fieldErrors.appName[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="metadataTitle" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Título del Sitio (SEO)
            </label>
            <Input
              id="metadataTitle"
              name="metadataTitle"
              defaultValue={initialData.metadataTitle}
              maxLength={160}
              placeholder="Mi Tienda Online"
            />
            {fieldErrors.metadataTitle && (
              <p className="text-xs text-red-500">{fieldErrors.metadataTitle[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="metadataDescription" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Descripción del Sitio (SEO)
            </label>
            <textarea
              id="metadataDescription"
              name="metadataDescription"
              defaultValue={initialData.metadataDescription}
              maxLength={300}
              rows={3}
              placeholder="Breve descripción de tu tienda para buscadores..."
              className="w-full px-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 resize-none"
            />
            {fieldErrors.metadataDescription && (
              <p className="text-xs text-red-500">{fieldErrors.metadataDescription[0]}</p>
            )}
          </div>
        </div>
      </Section>

      {/* ── Tema ───────────────────────────────────────────────── */}
      <Section
        title="Paleta de Colores"
        description="Colores globales del sitio. Se aplican como CSS custom properties. Los cambios se reflejan sin redeploy."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {COLOR_FIELDS.map(({ name, label }) => (
            <ColorField
              key={name}
              label={label}
              name={name}
              defaultValue={initialData[name] as string}
              error={fieldErrors[name]?.[0]}
            />
          ))}
        </div>
      </Section>

      {/* ── Secciones del Homepage ─────────────────────────────── */}
      <Section
        title="Secciones del Homepage"
        description="Activa o desactiva secciones visibles en la página principal pública."
      >
        <div className="flex flex-col gap-3">
          {SECTION_FLAGS.map(({ name, label, description }) => (
            <ToggleField
              key={name}
              label={label}
              name={name}
              defaultChecked={initialData[name] as boolean}
              description={description}
            />
          ))}
        </div>
      </Section>

      {/* ── Submit ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Los cambios se aplican inmediatamente en el frontend sin necesidad de redeploy.
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
