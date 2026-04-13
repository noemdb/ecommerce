# Análisis: Settings Propuestos para `SiteConfig`

Basado en el análisis completo de `page.tsx` y todos sus componentes.

---

## Estado Actual del Modelo

El modelo `SiteConfig` ya controla:
- **Identidad**: `appName`, `metadataTitle`, `metadataDescription`
- **Colores CSS** (8 variables): `colorBg*`, `colorText*`, `colorAccent*`, `colorButtonPrimary`, `colorBorder`
- **Visibilidad de secciones** (10 booleans): `showHeroBanner`, `showCategoryBar`, etc.

---

## Settings Propuestos (por sección)

### 🦸 HERO BANNER

| Campo | Tipo | Descripción | Default |
|---|---|---|---|
| `heroRotationIntervalMs` | `Int` | Tiempo en ms entre rotaciones del carrusel | `5000` |
| `heroMaxProducts` | `Int` | Máx. productos destacados que carga el hero | `5` |
| `heroShowProductCard` | `Boolean` | Muestra la tarjeta de producto flotante (lado derecho) | `true` |
| `heroShowUrgencyBar` | `Boolean` | Barra de stock/urgencia en la tarjeta del hero | `true` |
| `heroCtaPrimaryLabel` | `String` | Texto del botón CTA principal | `"Ver producto"` |
| `heroCtaSecondaryLabel` | `String` | Texto del botón CTA secundario | `"Ver catálogo"` |
| `heroSubtitle` | `String` | Subtítulo/descripción debajo del título | *(i18n)* |

> **Impacto**: Alto. El hero es el primer elemento visual del page. Personalizar el CTA y el carrusel es crítico para conversión.

---

### 📦 SECCIONES FEATURED (Más Vendidos / Novedades / Tendencias)

| Campo | Tipo | Descripción | Default |
|---|---|---|---|
| `featuredBestSellersTitle` | `String` | Título de la sección Más Vendidos | `"Más Vendidos"` |
| `featuredBestSellersSubtitle` | `String` | Subtítulo de Más Vendidos | `"Lo que nuestros clientes eligen"` |
| `featuredBestSellersLimit` | `Int` | Cantidad máx. de productos en Más Vendidos | `8` |
| `featuredNewArrivalsTitle` | `String` | Título de sección Novedades | `"Novedades"` |
| `featuredNewArrivalsLimit` | `Int` | Cantidad máx. de productos en Novedades | `8` |
| `featuredTrendingTitle` | `String` | Título de sección Tendencias | `"Tendencias"` |
| `featuredTrendingLimit` | `Int` | Cantidad máx. de productos en Tendencias | `8` |
| `featuredShowViewAllLink` | `Boolean` | Muestra el link "Ver catálogo completo" en secciones featured | `true` |

> **Impacto**: Medio. Permite localizar los títulos por negocio y ajustar cuántos productos mostrar.

---

### 🏷️ CATALOG SECTION

| Campo | Tipo | Descripción | Default |
|---|---|---|---|
| `catalogTitle` | `String` | Título de la sección del catálogo | `"Nuestro Catálogo"` |
| `catalogSubtitle` | `String` | Subtítulo descriptivo del catálogo | `"Encuentra exactamente lo que buscas..."` |
| `catalogPageSize` | `Int` | Productos por página (actualmente hardcoded en 24) | `24` |
| `catalogDefaultSort` | `String` | Ordenamiento por defecto (`newest`, `featured`, etc.) | `"newest"` |
| `catalogShowFilters` | `Boolean` | Mostrar/ocultar el panel de filtros | `true` |
| `catalogShowPagination` | `Boolean` | Mostrar paginación del catálogo | `true` |

> **Impacto**: Alto. `catalogPageSize` y `catalogDefaultSort` están hardcodeados en `page.tsx` y no son configurables hoy.

---

### 📊 SOCIAL PROOF BANNER

| Campo | Tipo | Descripción | Default |
|---|---|---|---|
| `socialProofCustomerLabel` | `String` | Etiqueta del contador de clientes | `"Clientes"` |
| `socialProofProductLabel` | `String` | Etiqueta del contador de productos | `"Productos"` |
| `socialProofThirdStatLabel` | `String` | Etiqueta del tercer stat (actualmente "100% Seguro") | `"Seguro"` |
| `socialProofThirdStatValue` | `String` | Valor del tercer stat estático | `"100%"` |
| `socialProofBgColor` | `String` | Color de fondo del banner (actualmente hardcoded `bg-blue-600`) | `"#2563EB"` |

> **Impacto**: Medio. La tercera columna siempre muestra "100% Seguro" hardcodeado — debería ser configurable (ej. "Envíos", "Años de experiencia", etc.).

---

### 🛡️ TRUST BADGES

| Campo | Tipo | Descripción | Default |
|---|---|---|---|
| `trustBadge1Title` | `String` | Título del badge 1 | `"Pago seguro"` |
| `trustBadge1Description` | `String` | Descripción del badge 1 | `"Transferencia bancaria protegida"` |
| `trustBadge2Title` | `String` | Título del badge 2 | `"Verificación manual"` |
| `trustBadge2Description` | `String` | Descripción del badge 2 | `"Validamos cada comprobante"` |
| `trustBadge3Title` | `String` | Título del badge 3 | `"Soporte por WhatsApp"` |
| `trustBadge3Description` | `String` | Descripción del badge 3 | `"Atención personalizada inmediata"` |
| `trustBadge4Title` | `String` | Título del badge 4 | `"Productos garantizados"` |
| `trustBadge4Description` | `String` | Descripción del badge 4 | `"Calidad premium asegurada"` |

> **Impacto**: Medio-alto. Los trust badges son clave para la confianza del usuario y hoy están completamente hardcodeados.

---

### 📱 WHATSAPP FAB

| Campo | Tipo | Descripción | Default |
|---|---|---|---|
| `whatsappNumber` | `String` | Número de WhatsApp (actualmente solo en `.env`) | `""` |
| `whatsappMessage` | `String` | Mensaje predeterminado al abrir chat | `"¡Hola! Necesito ayuda con una compra."` |
| `whatsappFabPosition` | `String` | Posición del botón: `bottom-right` / `bottom-left` | `"bottom-right"` |

> **Impacto**: Alto. El número está actualmente en variable de entorno — moverlo a DB permite cambiarlo sin redeploy.

---

### 📣 CUSTOMER CTA BANNER

| Campo | Tipo | Descripción | Default |
|---|---|---|---|
| `ctaBannerTitle` | `String` | Título del banner de registro | `"Crea tu cuenta y mejora tu experiencia"` |
| `ctaBannerDescription` | `String` | Descripción del banner | `"Lleva un historial de todos tus pedidos..."` |
| `ctaBannerPrimaryLabel` | `String` | Texto botón primario | `"Registrarme"` |
| `ctaBannerSecondaryLabel` | `String` | Texto botón secundario | `"Ya tengo cuenta"` |

> **Impacto**: Medio. Permite ajustar el copy del banner de conversión de usuarios.

---

### 🎨 BRANDING / IDENTIDAD (extensiones)

| Campo | Tipo | Descripción | Default |
|---|---|---|---|
| `logoUrl` | `String` | URL de logo personalizado (reemplaza texto "ECOMMERCEPREMIUM") | `""` |
| `faviconUrl` | `String` | URL del favicon | `""` |
| `defaultTheme` | `String` | Tema por defecto: `"system"` / `"light"` / `"dark"` | `"system"` |
| `googleAnalyticsId` | `String` | ID de GA4 para tracking | `""` |
| `metaOgImageUrl` | `String` | Imagen OG para redes sociales | `""` |

> **Impacto**: Alto. El logo hoy está hardcodeado como texto en `Navbar.tsx`.

---

### 📄 FOOTER (sección no implementada aún)

| Campo | Tipo | Descripción | Default |
|---|---|---|---|
| `showFooter` | `Boolean` | Mostrar footer | `true` |
| `footerCopyright` | `String` | Texto de copyright | `"© 2025 Ecommerce Premium"` |
| `footerShowSocialLinks` | `Boolean` | Mostrar iconos de redes sociales | `false` |
| `footerInstagramUrl` | `String` | URL Instagram | `""` |
| `footerFacebookUrl` | `String` | URL Facebook | `""` |
| `footerTiktokUrl` | `String` | URL TikTok | `""` |

---

## Resumen por Prioridad

| Prioridad | Settings | Razón |
|---|---|---|
| 🔴 **Alta** | `whatsappNumber`, `catalogPageSize`, `logoUrl`, `heroCtaPrimaryLabel` | Actualmente hardcodeados en código o `.env` — requieren redeploy para cambiarse |
| 🟠 **Media-alta** | `trustBadge*`, `socialProofThirdStat*`, `defaultTheme`, `metaOgImageUrl` | Afectan la confianza del usuario y el SEO directamente |
| 🟡 **Media** | `featured*Title/Limit`, `catalogTitle`, `ctaBanner*` | Copy personalizable, bajo riesgo |
| 🟢 **Baja** | `footerCopyright`, `heroShowUrgencyBar`, `catalogShowFilters` | Mejoras de UX opcionales |

---

## Campos con Mayor Deuda Técnica (hardcodeados hoy)

```
page.tsx          → PAGE_SIZE = 24  (devería ser catalogPageSize)
WhatsAppFAB.tsx   → process.env.NEXT_PUBLIC_WHATSAPP_NUMBER (debería ser whatsappNumber en DB)
Navbar.tsx        → "ECOMMERCEPREMIUM" texto fijo (debería ser logoUrl / appName)
TrustBadges.tsx   → 4 badges completamente hardcodeados
SocialProofBanner → tercer stat "100% Seguro" hardcodeado
CustomerCTABanner → título, descripción, botones hardcodeados
```
