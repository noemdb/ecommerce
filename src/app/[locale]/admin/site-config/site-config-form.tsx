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
  { name: "showFooter", label: "Pie de página (Footer)", description: "Mostrar sección de enlaces, legal y copyright" },
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
            <Input id="appName" name="appName" defaultValue={initialData.appName} maxLength={120} placeholder="Ecommerce Premium" error={fieldErrors.appName?.[0]} />
            
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="metadataTitle" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Título del Sitio (SEO)
            </label>
            <Input id="metadataTitle" name="metadataTitle" defaultValue={initialData.metadataTitle} maxLength={160} placeholder="Mi Tienda Online" error={fieldErrors.metadataTitle?.[0]} />
            
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
            {fieldErrors.metadataDescription && <p className="text-xs text-red-500 mt-1">{fieldErrors.metadataDescription[0]}</p>}
            
          </div>
        </div>
      </Section>

      {/* ── Branding ───────────────────────────────────────────── */}
      <Section
        title="Branding (Identidad)"
        description="Logotipo, favicon, tema visual y analíticas."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="logoUrl" className="text-sm font-medium">URL del Logotipo</label>
            <Input id="logoUrl" name="logoUrl" defaultValue={initialData.logoUrl} placeholder="https://..." error={fieldErrors.logoUrl?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="faviconUrl" className="text-sm font-medium">URL del Favicon</label>
            <Input id="faviconUrl" name="faviconUrl" defaultValue={initialData.faviconUrl} placeholder="https://..." error={fieldErrors.faviconUrl?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="defaultTheme" className="text-sm font-medium">Tema por defecto</label>
            <select id="defaultTheme" name="defaultTheme" defaultValue={initialData.defaultTheme} className="w-full px-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 h-10">
              <option value="system">Sistema</option>
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="googleAnalyticsId" className="text-sm font-medium">Google Analytics ID</label>
            <Input id="googleAnalyticsId" name="googleAnalyticsId" defaultValue={initialData.googleAnalyticsId} placeholder="G-XXXX..." error={fieldErrors.googleAnalyticsId?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label htmlFor="metaOgImageUrl" className="text-sm font-medium">OG Image URL (Redes Sociales)</label>
            <Input id="metaOgImageUrl" name="metaOgImageUrl" defaultValue={initialData.metaOgImageUrl} placeholder="https://..." error={fieldErrors.metaOgImageUrl?.[0]} />
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

      {/* ── Configuración de Secciones (Textos e Imágenes) ─────── */}
      <Section title="Hero Banner" description="Ajustes de texto y rotación del encabezado principal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 md:col-span-2 text-sm font-medium">
             <ToggleField label="Mostrar panel flotante del producto" name="heroShowProductCard" defaultChecked={initialData.heroShowProductCard as boolean} />
             <ToggleField label="Mostrar etiqueta (badge) de promo" name="heroShowUrgencyBar" defaultChecked={initialData.heroShowUrgencyBar as boolean} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="heroRotationIntervalMs" className="text-sm font-medium">Intervalo de rotación (ms)</label>
            <Input type="number" id="heroRotationIntervalMs" name="heroRotationIntervalMs" defaultValue={initialData.heroRotationIntervalMs} error={fieldErrors.heroRotationIntervalMs?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="heroMaxProducts" className="text-sm font-medium">Máx. productos en carrusel</label>
            <Input type="number" id="heroMaxProducts" name="heroMaxProducts" defaultValue={initialData.heroMaxProducts} error={fieldErrors.heroMaxProducts?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="heroCtaPrimaryLabel" className="text-sm font-medium">Botón Primario</label>
            <Input id="heroCtaPrimaryLabel" name="heroCtaPrimaryLabel" defaultValue={initialData.heroCtaPrimaryLabel} error={fieldErrors.heroCtaPrimaryLabel?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="heroCtaSecondaryLabel" className="text-sm font-medium">Botón Secundario</label>
            <Input id="heroCtaSecondaryLabel" name="heroCtaSecondaryLabel" defaultValue={initialData.heroCtaSecondaryLabel} error={fieldErrors.heroCtaSecondaryLabel?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label htmlFor="heroSubtitle" className="text-sm font-medium">Subtítulo (General)</label>
            <textarea id="heroSubtitle" name="heroSubtitle" defaultValue={initialData.heroSubtitle} rows={2} className="w-full px-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 resize-none" />
            {fieldErrors.heroSubtitle && <p className="text-xs text-red-500 mt-1">{fieldErrors.heroSubtitle[0]}</p>}
          </div>
        </div>
      </Section>

      <Section title="Contacto y WhatsApp" description="Ajustes del botón flotante y medios de contacto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="whatsappNumber" className="text-sm font-medium">Número telefónico (ej. 58414...)</label>
            <Input id="whatsappNumber" name="whatsappNumber" defaultValue={initialData.whatsappNumber} error={fieldErrors.whatsappNumber?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="whatsappFabPosition" className="text-sm font-medium">Posición en pantalla</label>
            <select id="whatsappFabPosition" name="whatsappFabPosition" defaultValue={initialData.whatsappFabPosition} className="w-full px-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 h-10">
              <option value="bottom-right">Abajo a la derecha</option>
              <option value="bottom-left">Abajo a la izquierda</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label htmlFor="whatsappMessage" className="text-sm font-medium">Mensaje por defecto</label>
            <textarea id="whatsappMessage" name="whatsappMessage" defaultValue={initialData.whatsappMessage} rows={2} className="w-full px-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 resize-none" />
            {fieldErrors.whatsappMessage && <p className="text-xs text-red-500 mt-1">{fieldErrors.whatsappMessage[0]}</p>}
          </div>
        </div>
      </Section>

      <Section title="Secciones Destacadas" description="Ajustes de portadas (Más vendidas, Novedades, Tendencias)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 md:col-span-2 text-sm font-medium mb-2">
             <ToggleField label="Mostrar botón 'Ver todo' en estas secciones" name="featuredShowViewAllLink" defaultChecked={initialData.featuredShowViewAllLink as boolean} />
          </div>
          
          {/* Best Sellers */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="featuredBestSellersTitle" className="text-sm font-medium">Título: Más Vendidos</label>
            <Input id="featuredBestSellersTitle" name="featuredBestSellersTitle" defaultValue={initialData.featuredBestSellersTitle} error={fieldErrors.featuredBestSellersTitle?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="featuredBestSellersLimit" className="text-sm font-medium">Límite: Más Vendidos</label>
            <Input type="number" id="featuredBestSellersLimit" name="featuredBestSellersLimit" defaultValue={initialData.featuredBestSellersLimit} error={fieldErrors.featuredBestSellersLimit?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2 mb-4">
            <label htmlFor="featuredBestSellersSubtitle" className="text-sm font-medium">Subtítulo: Más Vendidos</label>
            <Input id="featuredBestSellersSubtitle" name="featuredBestSellersSubtitle" defaultValue={initialData.featuredBestSellersSubtitle} error={fieldErrors.featuredBestSellersSubtitle?.[0]} />
          </div>
          
          {/* New Arrivals */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="featuredNewArrivalsTitle" className="text-sm font-medium">Título: Novedades</label>
            <Input id="featuredNewArrivalsTitle" name="featuredNewArrivalsTitle" defaultValue={initialData.featuredNewArrivalsTitle} error={fieldErrors.featuredNewArrivalsTitle?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5 mb-4">
            <label htmlFor="featuredNewArrivalsLimit" className="text-sm font-medium">Límite: Novedades</label>
            <Input type="number" id="featuredNewArrivalsLimit" name="featuredNewArrivalsLimit" defaultValue={initialData.featuredNewArrivalsLimit} error={fieldErrors.featuredNewArrivalsLimit?.[0]} />
          </div>
          
          {/* Trending */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="featuredTrendingTitle" className="text-sm font-medium">Título: Tendencias</label>
            <Input id="featuredTrendingTitle" name="featuredTrendingTitle" defaultValue={initialData.featuredTrendingTitle} error={fieldErrors.featuredTrendingTitle?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="featuredTrendingLimit" className="text-sm font-medium">Límite: Tendencias</label>
            <Input type="number" id="featuredTrendingLimit" name="featuredTrendingLimit" defaultValue={initialData.featuredTrendingLimit} error={fieldErrors.featuredTrendingLimit?.[0]} />
          </div>
        </div>
      </Section>

      <Section title="Catálogo Completo" description="Visualización y paginación">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 md:col-span-2 text-sm font-medium mb-2">
             <ToggleField label="Mostrar filtros" name="catalogShowFilters" defaultChecked={initialData.catalogShowFilters as boolean} />
             <ToggleField label="Usar paginación" name="catalogShowPagination" defaultChecked={initialData.catalogShowPagination as boolean} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="catalogTitle" className="text-sm font-medium">Título</label>
            <Input id="catalogTitle" name="catalogTitle" defaultValue={initialData.catalogTitle} error={fieldErrors.catalogTitle?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="catalogPageSize" className="text-sm font-medium">Productos por página</label>
            <Input type="number" id="catalogPageSize" name="catalogPageSize" defaultValue={initialData.catalogPageSize} error={fieldErrors.catalogPageSize?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="catalogDefaultSort" className="text-sm font-medium">Ordenamiento inicial</label>
            <select id="catalogDefaultSort" name="catalogDefaultSort" defaultValue={initialData.catalogDefaultSort} className="w-full px-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 h-10">
              <option value="newest">Nuevos</option>
              <option value="featured">Destacados</option>
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label htmlFor="catalogSubtitle" className="text-sm font-medium">Subtítulo</label>
            <Input id="catalogSubtitle" name="catalogSubtitle" defaultValue={initialData.catalogSubtitle} error={fieldErrors.catalogSubtitle?.[0]} />
          </div>
        </div>
      </Section>

      <Section title="Social Proof (Banner de Estadísticas)" description="Tres contadores de confianza">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="socialProofCustomerLabel" className="text-sm font-medium">Etiqueta 1</label>
            <Input id="socialProofCustomerLabel" name="socialProofCustomerLabel" defaultValue={initialData.socialProofCustomerLabel} placeholder="Clientes" error={fieldErrors.socialProofCustomerLabel?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="socialProofProductLabel" className="text-sm font-medium">Etiqueta 2</label>
            <Input id="socialProofProductLabel" name="socialProofProductLabel" defaultValue={initialData.socialProofProductLabel} placeholder="Productos" error={fieldErrors.socialProofProductLabel?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="socialProofThirdStatLabel" className="text-sm font-medium">Etiqueta 3</label>
            <Input id="socialProofThirdStatLabel" name="socialProofThirdStatLabel" defaultValue={initialData.socialProofThirdStatLabel} error={fieldErrors.socialProofThirdStatLabel?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5 md:col-start-3">
             <label htmlFor="socialProofThirdStatValue" className="text-sm font-medium">Valor Estático 3</label>
             <Input id="socialProofThirdStatValue" name="socialProofThirdStatValue" defaultValue={initialData.socialProofThirdStatValue} error={fieldErrors.socialProofThirdStatValue?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-3">
             <ColorField label="Color de fondo del Banner" name="socialProofBgColor" defaultValue={initialData.socialProofBgColor as string} error={fieldErrors.socialProofBgColor?.[0]} />
          </div>
        </div>
      </Section>

      <Section title="Trust Badges (Garantías)" description="4 íconos en la parte inferior para transmitir seguridad.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 p-3 border rounded">
            <label htmlFor="trustBadge1Title" className="text-xs font-semibold">Badge 1: Título</label>
            <Input id="trustBadge1Title" name="trustBadge1Title" defaultValue={initialData.trustBadge1Title} error={fieldErrors.trustBadge1Title?.[0]} />
            <label htmlFor="trustBadge1Description" className="text-xs font-semibold mt-1">Descripción</label>
            <Input id="trustBadge1Description" name="trustBadge1Description" defaultValue={initialData.trustBadge1Description} error={fieldErrors.trustBadge1Description?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5 p-3 border rounded">
            <label htmlFor="trustBadge2Title" className="text-xs font-semibold">Badge 2: Título</label>
            <Input id="trustBadge2Title" name="trustBadge2Title" defaultValue={initialData.trustBadge2Title} error={fieldErrors.trustBadge2Title?.[0]} />
            <label htmlFor="trustBadge2Description" className="text-xs font-semibold mt-1">Descripción</label>
            <Input id="trustBadge2Description" name="trustBadge2Description" defaultValue={initialData.trustBadge2Description} error={fieldErrors.trustBadge2Description?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5 p-3 border rounded">
            <label htmlFor="trustBadge3Title" className="text-xs font-semibold">Badge 3: Título</label>
            <Input id="trustBadge3Title" name="trustBadge3Title" defaultValue={initialData.trustBadge3Title} error={fieldErrors.trustBadge3Title?.[0]} />
            <label htmlFor="trustBadge3Description" className="text-xs font-semibold mt-1">Descripción</label>
            <Input id="trustBadge3Description" name="trustBadge3Description" defaultValue={initialData.trustBadge3Description} error={fieldErrors.trustBadge3Description?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5 p-3 border rounded">
            <label htmlFor="trustBadge4Title" className="text-xs font-semibold">Badge 4: Título</label>
            <Input id="trustBadge4Title" name="trustBadge4Title" defaultValue={initialData.trustBadge4Title} error={fieldErrors.trustBadge4Title?.[0]} />
            <label htmlFor="trustBadge4Description" className="text-xs font-semibold mt-1">Descripción</label>
            <Input id="trustBadge4Description" name="trustBadge4Description" defaultValue={initialData.trustBadge4Description} error={fieldErrors.trustBadge4Description?.[0]} />
          </div>
        </div>
      </Section>

      <Section title="CTA Registro (Footer)" description="Banner intermedio para invitados que no tienen cuenta.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ctaBannerPrimaryLabel" className="text-sm font-medium">Boton Primario</label>
            <Input id="ctaBannerPrimaryLabel" name="ctaBannerPrimaryLabel" defaultValue={initialData.ctaBannerPrimaryLabel} error={fieldErrors.ctaBannerPrimaryLabel?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ctaBannerSecondaryLabel" className="text-sm font-medium">Boton Secundario</label>
            <Input id="ctaBannerSecondaryLabel" name="ctaBannerSecondaryLabel" defaultValue={initialData.ctaBannerSecondaryLabel} error={fieldErrors.ctaBannerSecondaryLabel?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label htmlFor="ctaBannerTitle" className="text-sm font-medium">Título Principal</label>
            <Input id="ctaBannerTitle" name="ctaBannerTitle" defaultValue={initialData.ctaBannerTitle} error={fieldErrors.ctaBannerTitle?.[0]} />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label htmlFor="ctaBannerDescription" className="text-sm font-medium">Descripción</label>
            <textarea id="ctaBannerDescription" name="ctaBannerDescription" defaultValue={initialData.ctaBannerDescription} rows={2} className="w-full px-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 resize-none" />
            {fieldErrors.ctaBannerDescription && <p className="text-xs text-red-500 mt-1">{fieldErrors.ctaBannerDescription[0]}</p>}
          </div>
        </div>
      </Section>

      <Section title="Footer (Pie de página)" description="Enlaces y Copyright">
         <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 md:col-span-2">
               <ToggleField label="Mostrar redes sociales" name="footerShowSocialLinks" defaultChecked={initialData.footerShowSocialLinks as boolean} />
            </div>
            <div className="flex flex-col gap-1.5">
               <label htmlFor="footerInstagramUrl" className="text-sm font-medium">Instagram URL</label>
               <Input id="footerInstagramUrl" name="footerInstagramUrl" defaultValue={initialData.footerInstagramUrl} error={fieldErrors.footerInstagramUrl?.[0]} />
            </div>
            <div className="flex flex-col gap-1.5">
               <label htmlFor="footerFacebookUrl" className="text-sm font-medium">Facebook URL</label>
               <Input id="footerFacebookUrl" name="footerFacebookUrl" defaultValue={initialData.footerFacebookUrl} error={fieldErrors.footerFacebookUrl?.[0]} />
            </div>
            <div className="flex flex-col gap-1.5">
               <label htmlFor="footerTiktokUrl" className="text-sm font-medium">TikTok URL</label>
               <Input id="footerTiktokUrl" name="footerTiktokUrl" defaultValue={initialData.footerTiktokUrl} error={fieldErrors.footerTiktokUrl?.[0]} />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2 mt-4">
               <label htmlFor="footerCopyright" className="text-sm font-medium">Texto de Copyright</label>
               <Input id="footerCopyright" name="footerCopyright" defaultValue={initialData.footerCopyright} error={fieldErrors.footerCopyright?.[0]} />
            </div>
         </div>
      </Section>

      {/* ── Visibilidad de Bloques (Toggle general) ─────────────────────────────── */}
      <Section
        title="Visibilidad de Secciones del Homepage"
        description="Ocultar bloques completos del diseño principal."
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
