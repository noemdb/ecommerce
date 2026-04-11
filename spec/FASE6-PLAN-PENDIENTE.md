# 🚀 Plan de Ejecución — Fase 6 (v2.1) — Pendientes

**Fecha:** 2026-04-11
**Versión base:** Ecommerce Premium v2.0 (producción)
**Spec de referencia:** `spec_ecommerceV2.0.md` + `spec_ecommerceV2.1.md`

---

## Estado General del Proyecto

### ✅ Completado (Fases 0–5 + parcial Fase 6)

| Área | Estado |
|---|---|
| Setup, Prisma, Auth.js v5, RBAC | ✅ Completo |
| Catálogo público, Hero, filtros, catálogo por slug | ✅ Completo |
| Auth de cliente (`/login`, `/registro`, verificación email) | ✅ Completo |
| Portal `/cuenta` (dashboard, pedidos, perfil, bitácora, zona-riesgo) | ✅ Completo |
| Checkout + VoucherUpload + createOrderAction | ✅ Completo |
| Dashboard Admin (órdenes, clientes, productos, categorías, proveedores, inventario, reseñas, usuarios, métricas) | ✅ Completo |
| QA / Deploy (Vercel + Neon + Upstash) | ✅ Completo |
| **[v2.1] CSV Export** — `/api/admin/export/[type]` + botones en Órdenes, Clientes, Productos | ✅ Completo |
| **[v2.1] Ratings desnormalizados** — `averageRating` / `totalReviews` en Product, `addReviewAction`, `moderateReviewAction` con recálculo | ✅ Completo |
| **[v2.1] GDPR Purge** — `purgeCustomerAction` + `PurgeCustomerButton` + UI en `/admin/clientes` | ✅ Completo |
| **[v2.1] WhatsApp OTP — Schema Prisma** — `Customer.phoneVerified`, modelo `OTPToken` | ✅ Completo |
| **[v2.1] WhatsApp OTP — Endpoint `send-otp`** — `/api/auth/whatsapp/send-otp/route.ts` | ✅ Completo |
| **[v2.1] i18n — Infraestructura base** — `[locale]` routing, `next-intl`, `messages/es.json` + `en.json`, `useTranslations` en Navbar | ✅ Parcial |

---

## 🔴 Pendientes — Fase 6 (v2.1)

### BLOQUE A — WhatsApp OTP (Gaps G-16 / G-17) [PRIORIDAD ALTA]

Los pendientes están acotados al lado **frontend y de Auth.js** — el endpoint `send-otp` existe pero el flujo completo no está cerrado.

#### A1. Endpoint `verify-otp` — `/api/auth/whatsapp/verify-otp/route.ts`
**Estado:** ❌ No existe.
**Qué hace:** Recibe `{ phone, pin }`, valida el pin contra `OTPToken` (bcrypt + expiración), devuelve `{ valid: true }` o error 401. Si válido, marca `OTPToken.used = true`.
**Archivo a crear:** `src/app/api/auth/whatsapp/verify-otp/route.ts`

```typescript
// Firma esperada
POST /api/auth/whatsapp/verify-otp
Body: { phone: string; pin: string }
Response 200: { valid: true }
Response 401: { error: "PIN inválido o expirado" }
```

#### A2. Provider `whatsapp` en `src/auth.ts`
**Estado:** ❌ No implementado — solo existen `staff-credentials` y `customer-credentials`.
**Qué hace:** Tercer `CredentialsProvider(id: "whatsapp-otp")` que llama internamente al endpoint `verify-otp` y si es válido, busca el `Customer` por `phone` y lo retorna con `role: "CUSTOMER"`.
**Archivo a modificar:** `src/auth.ts`

```typescript
// Estructura del nuevo provider
Credentials({
  id: "whatsapp-otp",
  name: "WhatsApp OTP",
  async authorize(credentials) {
    // 1. Validar pin contra OTPToken en DB
    // 2. Si válido → buscar Customer por phone
    // 3. Marcar OTPToken como usado
    // 4. Retornar { id, email, name, role: "CUSTOMER" }
  }
})
```

#### A3. Webhook Meta WhatsApp — `/api/webhooks/whatsapp/route.ts`
**Estado:** ❌ No existe (`/api/webhooks/whatsapp/` directorio existe pero vacío o no tiene `route.ts`).
**Qué hace:**
- `GET`: Verifica el "challenge" de Meta (`hub.challenge`, `hub.verify_token`) para activar el webhook.
- `POST`: Recibe eventos de Meta (delivery receipts). Por ahora solo loguear y responder `200 OK`.

```typescript
// Firma esperada
GET  /api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=XXX&hub.challenge=YYY
POST /api/webhooks/whatsapp
Body: { object: "whatsapp_business_account", entry: [...] }
```
**Variable de entorno nueva requerida:** `WHATSAPP_VERIFY_TOKEN`

#### A4. UI — Formulario de Login por WhatsApp OTP
**Estado:** ❌ No existe — la UI de `/login` solo tiene el form de email/password.
**Qué hacer:** Agregar en `/login/page.tsx` (o en `CustomerLoginForm.tsx`) una segunda pestaña o sección "Entrar con WhatsApp":
1. Campo de teléfono → botón "Enviar código" → llama a `/api/auth/whatsapp/send-otp`.
2. Campo de PIN → botón "Verificar" → llama a `signIn("whatsapp-otp", { phone, pin })`.
**Archivo a modificar:** `src/app/[locale]/(public)/login/page.tsx` y/o `src/components/auth/CustomerLoginForm.tsx`.

---

### BLOQUE B — i18n Completo (Gap G-09) [PRIORIDAD MEDIA]

La infraestructura de `next-intl` está parcialmente montada (`[locale]` routing + 2 mensajes en Navbar), pero la internacionalización real del resto de la aplicación NO está hecha.

#### B1. Expansión de `messages/es.json` y `messages/en.json`
**Estado:** ❌ Solo tiene namespace `Header` con 4 claves.
**Qué hacer:** Completar con todos los namespaces necesarios para toda la aplicación. Orden de prioridad:
1. Páginas públicas: Home, Catálogo, Producto, Checkout, Confirmación.
2. Portal Cliente: Cuenta, Pedidos, Perfil, Bitácora, Zona de Riesgo.
3. Auth: Login, Registro, Verificar, Reset Password.

**Estructura objetivo mínima para producción:**
```json
{
  "Header": { ... },
  "Home": { "hero": {...}, "sections": {...} },
  "Catalog": { "filters": {...}, "product": {...} },
  "Checkout": { "form": {...}, "steps": {...} },
  "Account": { "sidebar": {...}, "orders": {...}, "profile": {...} },
  "Auth": { "login": {...}, "register": {...} },
  "Common": { "loading": "...", "error": "...", "save": "..." }
}
```

#### B2. Instrumentar componentes con `useTranslations` / `getTranslations`
**Estado:** ❌ Solo el `Navbar` usa `useTranslations`. El resto de componentes usa strings literales en español.
**Qué hacer:** Reemplazar strings hardcodeados en los componentes de mayor visibilidad pública primero:
- `HeroBanner.tsx` — texto del hero, CTAs
- `ProductCard.tsx` — badges (Agotado, Promo, Nuevo, Más Vendido)
- `CheckoutForm` — labels, placeholders, errores
- `login/page.tsx`, `registro/page.tsx` — formularios de auth

**Patrón correcto (RSC):**
```typescript
import { getTranslations } from "next-intl/server";
const t = await getTranslations("Catalog");
```
**Patrón correcto (CC):**
```typescript
import { useTranslations } from "next-intl";
const t = useTranslations("Catalog");
```

#### B3. `LanguageSelector` — Componente de cambio de idioma
**Estado:** ❌ No existe ningún componente de UI para cambiar el idioma.
**Qué hacer:** Crear `src/components/layout/LanguageSelector.tsx` (Client Component) que:
1. Lee el locale actual con `useLocale()`.
2. Al hacer click, redirige al mismo path pero con el otro locale usando `useRouter` + `usePathname` de `next-intl/navigation`.
3. Integrarlo en `Navbar.tsx` (público) y en `AdminSidebar.tsx`.

```typescript
// src/components/layout/LanguageSelector.tsx
"use client";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing"; // next-intl navigation
```

> [!IMPORTANT]
> Verificar si `src/i18n/routing.ts` exporta `{ Link, useRouter, usePathname, redirect }` siguiendo el patrón navigation de `next-intl`. Si no, agregarlo.

---

### BLOQUE C — Correcciones y Cierre de Gaps Menores [PRIORIDAD BAJA]

#### C1. Webhook WhatsApp sin `WHATSAPP_VERIFY_TOKEN` en `.env.example`
**Estado:** ❌ La variable de entorno necesaria para el webhook de Meta no está documentada en `.env.example`.
**Qué hacer:** Agregar la variable en `src/lib/env.ts` (opcional, solo si `NODE_ENV === production`) y en `.env.example`.

#### C2. OTPToken — Campo `used` faltante en Schema
**Estado:** ⚠️ Verificar — el schema agrega `OTPToken` pero posiblemente le falta el campo `used: Boolean @default(false)` para marcar tokens consumidos y evitar replay attacks.
**Qué hacer:** Si falta, agregar en `prisma/schema.prisma` y ejecutar `prisma db push`.

#### C3. Rate Limiting en endpoints WhatsApp OTP
**Estado:** ❌ No implementado.
**Qué hacer:** Agregar rate limiting (máx. 5 intentos/hora/IP) en `/api/auth/whatsapp/send-otp` usando Upstash Redis (ya configurado en producción desde Fase 5). Misma estrategia que el rate limiter de `/api/auth`.

---

## 📋 Checklist de Ejecución (Orden Recomendado)

### Sprint 1 — WhatsApp OTP completo (~ 1 día)
```
[ ] A1: Crear /api/auth/whatsapp/verify-otp/route.ts
[ ] A2: Agregar CredentialsProvider "whatsapp-otp" en src/auth.ts
[ ] A3: Crear /api/webhooks/whatsapp/route.ts (GET challenge + POST log)
[ ] A4: UI de Login por WhatsApp en página /login
[ ] C1: Agregar WHATSAPP_VERIFY_TOKEN a .env.example y env.ts
[ ] C2: Verificar/agregar campo `used` en OTPToken schema + migrate
[ ] C3: Rate limiting en send-otp con Upstash Redis
```

### Sprint 2 — i18n completo (~ 1–2 días)
```
[ ] B1: Expandir messages/es.json + en.json con todos los namespaces
[ ] B2: Instrumentar HeroBanner con getTranslations
[ ] B2: Instrumentar ProductCard con getTranslations  
[ ] B2: Instrumentar CheckoutForm con useTranslations
[ ] B2: Instrumentar login/page + registro/page con getTranslations
[ ] B3: Crear src/components/layout/LanguageSelector.tsx
[ ] B3: Integrar LanguageSelector en Navbar.tsx
[ ] B3: Integrar LanguageSelector en AdminSidebar.tsx (si aplica)
[ ] B1: Verificar que i18n/routing.ts exporta navigation helpers de next-intl
```

### Sprint 3 — QA Fase 6 (~ 0.5 días)
```
[ ] Probar flujo completo WhatsApp OTP: enviar pin → verificar → acceder a /cuenta
[ ] Verificar webhook Meta: GET challenge response correcto
[ ] Probar LanguageSelector: cambio es↔en en rutas públicas y /cuenta
[ ] Verificar que strings hardcodeados en inglés/español sean correctamente traducidos
[ ] npx prisma migrate deploy (si hubo cambios de schema)
[ ] Deploy Vercel + agregar WHATSAPP_VERIFY_TOKEN en env vars
```

---

## Variables de Entorno Nuevas Requeridas

| Variable | Descripción | Dónde |
|---|---|---|
| `WHATSAPP_VERIFY_TOKEN` | Token secreto para verificar webhook Meta | `.env.local`, Vercel |
| `WHATSAPP_API_TOKEN` | Token de acceso a Meta Graph API (ya debería existir en send-otp) | `.env.local`, Vercel |
| `WHATSAPP_PHONE_NUMBER_ID` | ID del número registrado en Meta Business | `.env.local`, Vercel |

---

## Notas de Arquitectura

> [!NOTE]
> El endpoint `send-otp` tiene un modo **DEV** que loguea el PIN en consola sin llamar a Meta. Esto es correcto. Asegurarse de que `NODE_ENV === "production"` antes del deploy para que llame a la Graph API real.

> [!WARNING]
> El `LanguageSelector` **no debe usar `window.location.href`** para cambiar de idioma. Debe usar el `useRouter` de `next-intl/navigation` para mantener el estado de la app y no perder el scroll position ni los searchParams.

> [!CAUTION]
> La integración WhatsApp OTP con Meta Graph API **requiere pre-requisitos del lado del dueño**: aplicación Meta aprobada, número verificado, y templates aprobados. Sin eso, el `send-otp` fallará en producción con HTTP 400 incluso con código correcto. Documentar esto en ENTREGA.md.

---

*Generado automáticamente como parte del análisis de implementación — Ecommerce Premium v2.1*
*Referencia: `spec/spec_ecommerceV2.0.md` §19 + `spec/spec_ecommerceV2.1.md`*
