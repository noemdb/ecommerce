# 📐 SPEC TÉCNICO v2.0 — Plataforma Ecommerce Premium

## Sistema Full-Stack · Entorno de Desarrollo Dirigido por Agentes IA

**Versión:** 2.0 _(actualización sobre v1.0)_
**Fecha:** 2026
**Clasificación:** Staff Engineer — Listo para consumo por agente de IA
**Stack canónico:** Next.js 16.2 (App Router) · TypeScript 5.x (strict) · Tailwind CSS 4.x · Prisma 7.x · PostgreSQL (Neon.tech) · Auth.js v5 · Zod 3.x · shadcn/ui · Zustand · React Hook Form 7.x · Resend · Recharts

> **⚠️ Nota de versión:** Este spec usa **Next.js 16.2.0** (latest, marzo 2026). Contiene breaking changes respecto a Next.js 15 documentados en ADR-008. El agente debe aplicar los patrones de esta versión y no mezclar con patrones de versiones anteriores.

> **📋 Changelog v2.0 sobre v1.0:**
>
> - **[NUEVO] ADR-010:** Sistema de templates — protocolo de uso, extensión y creación de componentes
> - **[NUEVO] ADR-011:** Autenticación opcional de clientes (Auth.js con dos providers separados)
> - **[NUEVO] Sección 11:** Dashboard de Cliente — KPIs, historial, bitácora, zona de riesgo
> - **[MODIFICADO] Sección 12:** Catálogo / Home reescrito con arquitectura de conversión
> - **[MODIFICADO] Sección 13:** HeroBanner — especificación del efecto visual premium
> - **[MODIFICADO] Prisma Schema:** modelo `Customer` extendido con campos de auth
> - **[MODIFICADO] Zod Schemas:** nuevos validators para auth de cliente
> - **[MODIFICADO] RBAC:** incorpora rol `CUSTOMER`
> - **[MODIFICADO] Rutas:** nuevas rutas `/cuenta/*` + proxy actualizado
> - **[MODIFICADO] Emails:** nuevos templates para cliente auth
> - **[MODIFICADO] Checklist:** Fase 1.5 nueva — auth de cliente + dashboard
> - **[MODIFICADO] Gaps:** G-03 reemplazado, G-14 a G-17 nuevos

---

## ÍNDICE

1. [Visión General y Objetivos](#1-visión-general-y-objetivos)
2. [Decisiones Arquitectónicas (ADRs)](#2-decisiones-arquitectónicas-adrs)
3. [Dependencias Exactas y package.json](#3-dependencias-exactas-y-packagejson)
4. [Variables de Entorno](#4-variables-de-entorno)
5. [Modelo de Datos Completo (Prisma Schema)](#5-modelo-de-datos-completo-prisma-schema)
6. [Zod Schemas — Contratos de Validación](#6-zod-schemas--contratos-de-validación)
7. [Roles, Permisos y RBAC](#7-roles-permisos-y-rbac)
8. [Estructura de Directorios Canónica](#8-estructura-de-directorios-canónica)
9. [Rutas y Contratos de Página](#9-rutas-y-contratos-de-página)
10. [Server Actions — Firmas Tipadas](#10-server-actions--firmas-tipadas)
11. [Dashboard de Cliente `/cuenta`](#11-dashboard-de-cliente-cuenta)
12. [Arquitectura del Catálogo / Home (Ruta `/`)](#12-arquitectura-del-catálogo--home-ruta-)
13. [HeroBanner — Efecto Visual Premium](#13-herobanner--efecto-visual-premium)
14. [Carrito y Checkout — Especificación Completa](#14-carrito-y-checkout--especificación-completa)
15. [Dashboard Admin `/admin`](#15-dashboard-admin-admin)
16. [Emails Transaccionales](#16-emails-transaccionales)
17. [Configuración de Infraestructura](#17-configuración-de-infraestructura)
18. [Criterios de Aceptación Verificables](#18-criterios-de-aceptación-verificables)
19. [Checklist de Implementación por Fases](#19-checklist-de-implementación-por-fases)
20. [Gaps Resueltos y Supuestos Contractuales](#20-gaps-resueltos-y-supuestos-contractuales)

---

## 1. Visión General y Objetivos

### 1.1 Descripción del Producto

Plataforma ecommerce premium completa: catálogo de productos/servicios diseñado estratégicamente para la conversión, carrito persistente, flujo de checkout con pago bancario offline (transferencia/referencia bancaria), portal de cliente autenticado con historial completo, y dashboard de administración multi-módulo con gestión de inventario. El sistema **no incluye pasarela de pago en línea** — todos los pagos se verifican manualmente por el administrador.

### 1.2 Objetivos de Negocio Medibles

| Objetivo                        | Métrica                                       | Target           |
| ------------------------------- | --------------------------------------------- | ---------------- |
| Centralizar ventas online       | % de ventas canalizadas vía plataforma        | 100% en 3 meses  |
| Reducir tiempo de procesamiento | Minutos/orden gestionada por admin            | De 20min → 5min  |
| Reducir stock desconocido       | % de productos con inventario registrado      | 100%             |
| Aumentar conversión             | Tasa visitante → checkout completado          | > 30%            |
| Fidelización                    | % de clientes con cuenta activa que recompran | > 50% en 6 meses |

### 1.3 Alcance — Incluye / Excluye

| Módulo                   | Incluye                                                                                        | Excluye                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Catálogo / Home          | Landing de conversión estratégica, hero con efecto visual, filtros URL, secciones especiales   | Búsqueda full-text (Algolia/ElasticSearch)       |
| Auth Cliente             | Registro voluntario email/password o verificación WhatsApp, proceso de compra independiente    | OAuth social, biometría                          |
| Portal Cliente `/cuenta` | KPIs, compras recientes, estados, historial completo, bitácora, zona de riesgo                 | Chat en vivo, lista de deseos (v2.1)             |
| Carrito                  | Zustand + localStorage, drawer lateral, persistencia anónima y autenticada                     | Carrito multi-sesión sincronizado en tiempo real |
| Checkout                 | Formulario bancario, upload comprobante, ciclo de vida de orden, vinculación opcional a cuenta | Pasarelas de pago (Stripe, MercadoPago)          |
| Dashboard Admin          | CRUD categorías, productos, clientes, proveedores, inventario, órdenes, reseñas, métricas      | App móvil nativa                                 |
| Comunicaciones           | Emails transaccionales vía Resend, WhatsApp contact link                                       | WhatsApp Business API programática, SMS          |
| Inventario               | Control de stock, movimientos, alertas                                                         | Integración ERP externa                          |

---

## 2. Decisiones Arquitectónicas (ADRs)

Cada ADR documenta una decisión irrevocable. El agente **NO debe cuestionarlas** ni proponer alternativas salvo que se indique explícitamente.

---

### ADR-001: RSC por defecto, `"use client"` solo donde es necesario

**Estado:** Aceptada
**Contexto:** El catálogo debe ser indexable, performante y servido con datos frescos sin round-trips cliente→servidor innecesarios.
**Decisión:** Todos los componentes son Server Components por defecto. `"use client"` se aplica exclusivamente donde existe interactividad real: carrito (Zustand), filtros de catálogo (URLSearchParams), formularios controlados (React Hook Form), drawer de carrito, wizard de checkout, efecto visual del hero.
**Consecuencias:** No usar `useState`, `useEffect`, ni hooks de React fuera de Client Components. Las mutaciones van en Server Actions. Los gráficos del dashboard (Recharts) son Client Components con `dynamic import`.

---

### ADR-002: Auth.js v5 — Dos Dominios de Autenticación Separados

**Estado:** Aceptada _(actualizada en v2.0)_
**Contexto:** El sistema tiene dos tipos de usuarios autenticables completamente separados: staff interno (ADMIN/STAFF) y clientes (CUSTOMER). Sus flujos, tokens, rutas de login y permisos no se mezclan.
**Decisión:** Un único `NextAuth` en `src/auth.ts` con **dos CredentialsProviders** diferenciados por `id`. El token JWT incluye `id`, `role`, `name`, `email`. El campo `role` distingue entre `"ADMIN"`, `"STAFF"` y `"CUSTOMER"`.

```typescript
// src/auth.ts — estructura canónica v2.0 (dos providers)
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { loginSchema, customerLoginSchema } from "@/lib/validators/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // Provider 1: Staff interno (ADMIN / STAFF)
    Credentials({
      id: "staff-credentials",
      name: "Staff Login",
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            password: true,
            isActive: true,
          },
        });
        if (!user || !user.isActive) return null;
        const valid = await bcrypt.compare(parsed.data.password, user.password);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    // Provider 2: Clientes (CUSTOMER)
    Credentials({
      id: "customer-credentials",
      name: "Customer Login",
      async authorize(credentials) {
        const parsed = customerLoginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const customer = await prisma.customer.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            isBlocked: true,
            isEmailVerified: true,
          },
        });
        if (!customer || !customer.password || customer.isBlocked) return null;
        if (!customer.isEmailVerified) return null; // cuenta no verificada
        const valid = await bcrypt.compare(
          parsed.data.password,
          customer.password,
        );
        if (!valid) return null;
        return {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          role: "CUSTOMER",
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
  pages: {
    signIn: "/login", // página unificada que redirige según tipo de usuario
  },
});
```

**Consecuencias:**

- Staff usa `/admin/login` con `signIn("staff-credentials", ...)`.
- Clientes usan `/login` con `signIn("customer-credentials", ...)`.
- `proxy.ts` protege `/admin/*` solo para roles `ADMIN`/`STAFF`, y `/cuenta/*` solo para rol `CUSTOMER`.
- El proceso de compra (checkout) es **completamente independiente** de la autenticación del cliente.

---

### ADR-003: Server Actions para todas las mutaciones

**Estado:** Aceptada
**Contexto:** Las mutaciones deben ejecutarse en el servidor con validación Zod y verificación de rol.
**Decisión:** Todas las mutaciones usan Server Actions en archivos `src/actions/` con directiva `"use server"` al tope. No se crean API Routes para mutaciones (solo para webhooks futuros y UploadThing).
**Consecuencias:** Los errores se retornan como `ActionResult<T>` tipado. Las revalidaciones usan `revalidatePath`.

```typescript
// src/types/actions.ts — tipo canónico de retorno
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
```

---

### ADR-004: Prisma 7.x con Neon.tech Serverless Driver

**Estado:** Aceptada
**Contexto:** Neon.tech usa conexiones serverless que requieren el driver adaptado.
**Decisión:** Usar `@prisma/adapter-neon` con `neon()` de `@neondatabase/serverless`. Singleton en `src/lib/prisma.ts`.
**Consecuencias:** `DATABASE_URL` debe incluir `?sslmode=require`. Nunca importar `PrismaClient` directamente.

```typescript
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neon } from "@neondatabase/serverless";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const sql = neon(process.env.DATABASE_URL!);
  const adapter = new PrismaNeon(sql);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

### ADR-005: Zustand para estado del carrito + localStorage

**Estado:** Aceptada
**Contexto:** El carrito debe persistir entre navegaciones sin backend involucrado en cada interacción. La autenticación del cliente es opcional y no debe bloquear el carrito.
**Decisión:** Zustand con middleware `persist` usando `localStorage`. El carrito persiste tanto para usuarios anónimos como autenticados. Al completar checkout exitoso se vacía. Si el cliente inicia sesión durante una compra, el carrito se mantiene (no se pierde).
**Consecuencias:** El carrito es 100% client-side hasta el momento del checkout. `useCartStore` exporta también `customerId` nullable para vincular la orden al cliente autenticado si existe.

```typescript
// src/store/cart.ts — estructura canónica v2.0
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  sku: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (
    productId: string,
    variantId: string | undefined,
    quantity: number,
  ) => void;
  clearCart: () => void;
  toggleCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.productId === item.productId && i.variantId === item.variantId,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId),
          ),
        })),
      updateQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity }
              : i,
          ),
        })),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      total: () =>
        get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    }),
    { name: "ecommerce-cart" },
  ),
);
```

---

### ADR-006: Filtros del catálogo via URLSearchParams (SSR-compatible)

**Estado:** Aceptada
**Contexto:** Los filtros deben soportar deep linking, SEO y correcta revalidación del caché de RSC.
**Decisión:** Los filtros se modelan como `searchParams` de la URL. El catálogo es RSC. Los controles de filtro son Client Components con `useRouter` + `useSearchParams`.
**Consecuencias:** No usar `useState` para los valores de filtro. Los filtros son bookmarkeables y compartibles.

---

### ADR-007: shadcn/ui — solo componentes instalados, sin modificar fuente

**Estado:** Aceptada
**Decisión:** shadcn/ui con estilo `new-york`. Componentes en `src/components/ui/`. Se **extienden** (wrappers) pero **nunca se modifica** el archivo copiado de shadcn.
**Consecuencias:** Las extensiones van en `src/components/ui/extended/`.

---

### ADR-008: Next.js 16 — Breaking Changes Aplicados

**Estado:** Aceptada

| #   | Cambio                              | Patrón v15 (obsoleto)             | Patrón v16 (correcto)                                        |
| --- | ----------------------------------- | --------------------------------- | ------------------------------------------------------------ |
| 1   | `middleware.ts` → `proxy.ts`        | `export function middleware(req)` | `export function proxy(req)` en `proxy.ts` — runtime Node.js |
| 2   | `params` y `searchParams` son async | `const { slug } = params`         | `const { slug } = await params`                              |
| 3   | `generateMetadata` params async     | `const { slug } = params`         | `const { slug } = await params`                              |
| 4   | Turbopack por defecto               | `"dev": "next dev --turbopack"`   | `"dev": "next dev"`                                          |
| 5   | `experimental.ppr` eliminado        | `experimental: { ppr: true }`     | Usar directiva `"use cache"`                                 |
| 6   | `cacheLife`/`cacheTag` sin prefijo  | `unstable_cacheLife(...)`         | `cacheLife(...)` directo                                     |
| 7   | Node.js mínimo 20.9.0               | Node 18.x                         | **Node.js >= 20.9.0 requerido**                              |
| 8   | React 19.2 incluido                 | `react: "19.0.0"`                 | `react: "19.2.0"`                                            |
| 9   | `next lint` eliminado               | `"lint": "next lint"`             | `"lint": "eslint src/"`                                      |

---

### ADR-009: Resend para emails transaccionales

**Estado:** Aceptada
**Decisión:** Resend con React Email. Templates en `src/lib/email/templates/`. Errores de envío son silenciosos (log sin re-throw).
**Consecuencias:** Fallo de email ≠ fallo de acción.

---

### ADR-010: Sistema de Templates — Protocolo de Uso _(NUEVO en v2.0)_

**Estado:** Aceptada
**Contexto:** El proyecto incluye una carpeta `template/` en la raíz que contiene un proyecto Next.js completo (páginas, componentes, libs, estilos) que define el sistema de diseño visual: paleta, tipografía, espaciado, patrones de layout, patrones de componentes. Este template es la fuente de verdad visual del proyecto.
**Decisión:** El agente debe seguir este protocolo estrictamente, en este orden:

1. **Inventariar `template/`** al inicio de cada sesión de implementación:
   - Leer `template/components/` y catalogar todos los componentes disponibles por categoría.
   - Leer `template/app/` para entender los patrones de página existentes.
   - Leer `template/lib/` y `template/styles/` para entender utilities y tokens de diseño.

2. **Usar primero lo que existe:** Para construir cualquier `page.tsx` o componente nuevo, buscar primero en `template/` un componente equivalente o análogo. Si existe → importarlo / copiarlo y adaptarlo.

3. **Crear lo que no existe, siguiendo el patrón:** Si el componente necesario NO existe en `template/`, crearlo en `src/components/` siguiendo **exactamente** el mismo estilo visual y de código del template: misma convención de naming, mismas clases Tailwind, misma estructura de props tipadas, mismo patrón de composición (si el template usa `children` + `className` forwarding, hacerlo igual).

4. **Refactorizar solo cuando sea necesario:** Si un componente del template debe modificarse para funcionar en el contexto del ecommerce (ej.: el template tiene un hero estático pero se necesita uno dinámico), el agente debe documentarlo con un comentario `// REFACTORED: [razón]` en la primera línea del componente y mantener la misma firma visual.

5. **Nunca mezclar estilos:** No combinar estilos del template con estilos inventados. Si el template usa colores del design system (`primary`, `muted`, `accent`), el ecommerce usa los mismos tokens. No hardcodear colores nuevos.

**Consecuencias:**

- La carpeta `template/` es **de solo lectura** — nunca modificarla directamente.
- Los componentes de ecommerce que derivan del template van en `src/components/` con la misma estructura de subdirectorios que en `template/components/`.
- Al inicio del `README.md` del proyecto se debe incluir una sección "Componentes del Template" con el inventario.

---

### ADR-011: Autenticación Opcional de Clientes _(NUEVO en v2.0)_

**Estado:** Aceptada
**Contexto:** Los clientes deben poder comprar sin crear cuenta (flujo anónimo, solo email/WhatsApp en checkout). La creación de cuenta es voluntaria y ofrece beneficios (historial, seguimiento de estado en tiempo real). Estas dos realidades no deben colisionar.
**Decisión:**

```
FLUJO ANÓNIMO (siempre disponible):
  → Cliente llena carrito
  → En checkout: provee nombre, email, teléfono/WhatsApp
  → Se crea/upsert Customer (sin password, sin cuenta)
  → Orden queda vinculada a ese Customer por email
  → Recibe email de confirmación con link de seguimiento

FLUJO AUTENTICADO (opcional):
  → Cliente se registra en /registro con email + password
  → Verifica email (token de 24h)
  → Al hacer checkout: si está logueado, sus datos se pre-rellenan
  → La orden queda vinculada a su Customer autenticado
  → Puede ver estado en tiempo real desde /cuenta/pedidos
```

**Reglas de coexistencia:**

- El campo `password` en `Customer` es nullable — si es null, es un cliente anónimo/invitado.
- Al registrarse, si ya existe un `Customer` con ese email (por compras previas anónimas), se **vincula la cuenta** a ese Customer existente y se establece el password. Las órdenes previas quedan en su historial automáticamente.
- El carrito (Zustand) NO requiere autenticación. La sesión del cliente solo afecta el pre-llenado del formulario de checkout y el acceso a `/cuenta`.
- Un cliente bloqueado (`isBlocked = true`) sigue pudiendo comprar como anónimo pero no puede iniciar sesión.

**Consecuencias:**

- `Customer.password` es `String?` (nullable) en el schema.
- `Customer.isEmailVerified` es `Boolean @default(false)`.
- `Customer.emailVerifyToken` y `Customer.emailVerifyExpires` para el flujo de verificación.
- El checkout siempre usa `upsert` por email — nunca crea un Customer duplicado.

---

## 3. Dependencias Exactas y package.json

```json
{
  "name": "ecommerce-premium",
  "version": "2.0.0",
  "private": true,
  "engines": {
    "node": ">=20.9.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint src/",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "next": "16.2.0",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "typescript": "5.7.2",
    "@prisma/client": "5.22.0",
    "@prisma/adapter-neon": "5.22.0",
    "@neondatabase/serverless": "0.10.4",
    "next-auth": "5.0.0-beta.25",
    "bcryptjs": "2.4.3",
    "@types/bcryptjs": "2.4.6",
    "zod": "3.23.8",
    "zustand": "5.0.3",
    "react-hook-form": "7.54.2",
    "@hookform/resolvers": "3.9.1",
    "resend": "4.0.1",
    "@react-email/components": "0.0.31",
    "recharts": "2.13.3",
    "tailwindcss": "4.0.6",
    "@tailwindcss/vite": "4.0.6",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "tailwind-merge": "2.6.0",
    "lucide-react": "0.469.0",
    "@radix-ui/react-dialog": "1.1.4",
    "@radix-ui/react-dropdown-menu": "2.1.4",
    "@radix-ui/react-select": "2.1.4",
    "@radix-ui/react-tabs": "1.1.2",
    "@radix-ui/react-toast": "1.2.4",
    "@radix-ui/react-slider": "1.2.2",
    "@radix-ui/react-checkbox": "1.1.3",
    "@radix-ui/react-avatar": "1.1.2",
    "@radix-ui/react-alert-dialog": "1.1.4",
    "sonner": "1.7.1",
    "date-fns": "4.1.0",
    "slugify": "1.6.6",
    "sharp": "0.33.5",
    "uploadthing": "7.4.4",
    "@uploadthing/react": "7.1.5",
    "framer-motion": "11.18.2",
    "nanoid": "5.0.9"
  },
  "devDependencies": {
    "prisma": "5.22.0",
    "tsx": "4.19.2",
    "@types/node": "22.10.5",
    "@types/react": "19.2.0",
    "@types/react-dom": "19.2.0",
    "eslint": "9.17.0",
    "eslint-config-next": "16.2.0",
    "autoprefixer": "10.4.20",
    "postcss": "8.4.49"
  }
}
```

> **Nota sobre `framer-motion`:** Añadida en v2.0 exclusivamente para el efecto visual del HeroBanner (ADR-001 compatible: se usa en un Client Component específico). No usar en Server Components.
> **Nota sobre `nanoid`:** Para generar tokens de verificación de email de cliente (seguros, URL-safe).

---

## 4. Variables de Entorno

### 4.1 `.env.example` — Completo y Documentado

```bash
# ═══════════════════════════════════════════════════════════════
# DATABASE — Neon.tech PostgreSQL Serverless
# ═══════════════════════════════════════════════════════════════
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# ═══════════════════════════════════════════════════════════════
# AUTH — Auth.js v5
# ═══════════════════════════════════════════════════════════════
# Generar con: openssl rand -base64 32
AUTH_SECRET="your-generated-secret-here"
AUTH_URL="https://mitienda.com"

# ═══════════════════════════════════════════════════════════════
# EMAIL — Resend
# ═══════════════════════════════════════════════════════════════
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="Mi Tienda <noreply@mitienda.com>"
EMAIL_ADMIN="admin@mitienda.com"

# ═══════════════════════════════════════════════════════════════
# UPLOADTHING — Upload de comprobantes e imágenes de productos
# ═══════════════════════════════════════════════════════════════
UPLOADTHING_SECRET="sk_live_xxxxxxxxxxxx"
UPLOADTHING_APP_ID="xxxxxxxxxxxx"

# ═══════════════════════════════════════════════════════════════
# APPLICATION
# ═══════════════════════════════════════════════════════════════
NEXT_PUBLIC_APP_URL="https://mitienda.com"
NEXT_PUBLIC_APP_NAME="Mi Tienda"
# Número de WhatsApp para contacto/soporte (con código de país, sin +)
NEXT_PUBLIC_WHATSAPP_NUMBER="58412XXXXXXX"

# ═══════════════════════════════════════════════════════════════
# RATE LIMITING — Upstash Redis (activar en producción)
# ═══════════════════════════════════════════════════════════════
# UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
# UPSTASH_REDIS_REST_TOKEN="xxx"
```

### 4.2 Validación de Variables en Startup

```typescript
// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  RESEND_API_KEY: z.string().startsWith("re_"),
  EMAIL_FROM: z.string().min(5),
  EMAIL_ADMIN: z.string().email(),
  UPLOADTHING_SECRET: z.string().startsWith("sk_"),
  UPLOADTHING_APP_ID: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().min(10),
});

export const env = envSchema.parse(process.env);
```

---

## 5. Modelo de Datos Completo (Prisma Schema)

```prisma
// prisma/schema.prisma
// VERSIÓN CANÓNICA v2.0 — No modificar sin actualizar este spec

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

enum UserRole {
  ADMIN
  STAFF
}

enum OrderStatus {
  PENDIENTE
  VERIFICANDO
  CONFIRMADA
  EN_PROCESO
  COMPLETADA
  CANCELADA
  RECHAZADA
}

enum ReviewStatus {
  PENDING
  APPROVED
  REJECTED
}

enum InventoryMovementType {
  ENTRADA
  SALIDA
  AJUSTE
}

enum CustomerActionType {
  LOGIN
  LOGOUT
  REGISTER
  UPDATE_PROFILE
  CHANGE_PASSWORD
  DELETE_ACCOUNT_REQUEST
  VIEWED_ORDER
}

// ═══════════════════════════════════════════════════════════════
// USUARIOS INTERNOS (solo admin/staff)
// ═══════════════════════════════════════════════════════════════

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String   // bcrypt hash
  role      UserRole @default(STAFF)
  isActive  Boolean  @default(true)

  ordersConfirmed Order[]    @relation("ConfirmedByUser")
  auditLogs       AuditLog[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@index([role])
  @@map("users")
}

// ═══════════════════════════════════════════════════════════════
// CLIENTES — autenticación opcional (v2.0)
// ═══════════════════════════════════════════════════════════════

model Customer {
  id       String  @id @default(cuid())
  name     String
  email    String  @unique
  phone    String? // teléfono / WhatsApp — requerido en checkout
  idDoc    String? // cédula / RIF
  address  String? @db.Text

  // Auth opcional — null = cliente invitado/anónimo
  password           String?  // bcrypt hash, null si nunca se registró
  isEmailVerified    Boolean  @default(false)
  emailVerifyToken   String?  // token nanoid, null tras verificación
  emailVerifyExpires DateTime? // expiración del token (24h)

  // Recuperación de password
  resetPasswordToken   String?
  resetPasswordExpires DateTime?

  // Estado
  isBlocked Boolean @default(false)
  notes     String? @db.Text // solo visible para admin

  orders          Order[]
  reviews         Review[]
  customerActions CustomerAction[] // bitácora de acciones

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@index([isBlocked])
  @@index([isEmailVerified])
  @@map("customers")
}

// Bitácora de acciones del cliente (para su dashboard)
model CustomerAction {
  id          String             @id @default(cuid())
  customerId  String
  customer    Customer           @relation(fields: [customerId], references: [id], onDelete: Cascade)
  action      CustomerActionType
  description String?            // descripción legible
  ip          String?
  userAgent   String?

  createdAt   DateTime           @default(now())

  @@index([customerId])
  @@index([createdAt])
  @@map("customer_actions")
}

// ═══════════════════════════════════════════════════════════════
// CATEGORÍAS (árbol recursivo infinito)
// ═══════════════════════════════════════════════════════════════

model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?    @db.Text
  imageUrl    String?
  order       Int        @default(0)
  isActive    Boolean    @default(true)

  parentId    String?
  parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id], onDelete: SetNull)
  children    Category[] @relation("CategoryTree")

  products    Product[]

  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([slug])
  @@index([parentId])
  @@index([isActive])
  @@map("categories")
}

// ═══════════════════════════════════════════════════════════════
// PROVEEDORES
// ═══════════════════════════════════════════════════════════════

model Supplier {
  id              String    @id @default(cuid())
  name            String
  rif             String?   @unique
  contactName     String?
  phone           String?
  email           String?
  address         String?   @db.Text
  commercialTerms String?   @db.Text
  isActive        Boolean   @default(true)

  products        Product[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([rif])
  @@index([isActive])
  @@map("suppliers")
}

// ═══════════════════════════════════════════════════════════════
// PRODUCTOS
// ═══════════════════════════════════════════════════════════════

model Product {
  id                String           @id @default(cuid())
  name              String
  slug              String           @unique
  description       String           @db.Text
  price             Float
  promoPrice        Float?
  sku               String           @unique
  isActive          Boolean          @default(true)
  isFeatured        Boolean          @default(false) // hero + sección "Mejores Referencias"
  isBestSeller      Boolean          @default(false) // sección "Más Vendidos"
  isMostSearched    Boolean          @default(false) // sección "Tendencias"
  isNew             Boolean          @default(false) // sección "Novedades" (nuevo en v2.0)
  stock             Int              @default(0)
  lowStockThreshold Int              @default(5)

  // SEO
  metaTitle       String?
  metaDescription String?

  // Relaciones
  categoryId         String
  category           Category            @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  supplierId         String?
  supplier           Supplier?           @relation(fields: [supplierId], references: [id], onDelete: SetNull)
  images             ProductImage[]
  variants           ProductVariant[]
  prompts            ProductPrompt[]
  orderItems         OrderItem[]
  reviews            Review[]
  inventoryMovements InventoryMovement[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([slug])
  @@index([categoryId])
  @@index([isActive])
  @@index([isFeatured])
  @@index([isBestSeller])
  @@index([isNew])
  @@index([stock])
  @@map("products")
}

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  alt       String?
  order     Int     @default(0)
  isPrimary Boolean @default(false)

  @@index([productId])
  @@map("product_images")
}

model ProductVariant {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  name      String
  value     String
  sku       String  @unique
  price     Float?
  stock     Int     @default(0)

  orderItems OrderItem[]

  @@index([productId])
  @@map("product_variants")
}

model ProductPrompt {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  version   Int      @default(1)
  prompt    String   @db.Text
  isActive  Boolean  @default(true)
  notes     String?

  createdAt DateTime @default(now())

  @@index([productId])
  @@index([isActive])
  @@map("product_prompts")
}

// ═══════════════════════════════════════════════════════════════
// ÓRDENES
// ═══════════════════════════════════════════════════════════════

model Order {
  id           String      @id @default(cuid())

  customerId   String
  customer     Customer    @relation(fields: [customerId], references: [id], onDelete: Restrict)

  items        OrderItem[]

  // Pago bancario offline
  bankName        String
  accountHolder   String
  referenceNumber String
  transferAmount  Float
  transferDate    DateTime
  voucherUrl      String?

  // Totales
  subtotal Float
  total    Float

  // Estado
  status        OrderStatus @default(PENDIENTE)
  internalNotes String?     @db.Text

  // Staff que confirmó
  confirmedById String?
  confirmedBy   User?   @relation("ConfirmedByUser", fields: [confirmedById], references: [id])

  statusHistory OrderStatusHistory[]
  auditLogs     AuditLog[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([customerId])
  @@index([status])
  @@index([createdAt])
  @@map("orders")
}

model OrderItem {
  id        String          @id @default(cuid())
  orderId   String
  order     Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product         @relation(fields: [productId], references: [id], onDelete: Restrict)
  variantId String?
  variant   ProductVariant? @relation(fields: [variantId], references: [id])

  // Snapshot al momento de la compra
  name     String
  sku      String
  price    Float
  quantity Int

  @@index([orderId])
  @@index([productId])
  @@map("order_items")
}

model OrderStatusHistory {
  id        String      @id @default(cuid())
  orderId   String
  order     Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)
  status    OrderStatus
  note      String?
  changedAt DateTime    @default(now())

  @@index([orderId])
  @@map("order_status_history")
}

// ═══════════════════════════════════════════════════════════════
// INVENTARIO
// ═══════════════════════════════════════════════════════════════

model InventoryMovement {
  id          String                @id @default(cuid())
  productId   String
  product     Product               @relation(fields: [productId], references: [id], onDelete: Restrict)
  type        InventoryMovementType
  quantity    Int
  stockBefore Int
  stockAfter  Int
  reason      String?
  reference   String?

  createdAt   DateTime              @default(now())

  @@index([productId])
  @@index([type])
  @@index([createdAt])
  @@map("inventory_movements")
}

// ═══════════════════════════════════════════════════════════════
// RESEÑAS
// ═══════════════════════════════════════════════════════════════

model Review {
  id          String       @id @default(cuid())
  productId   String
  product     Product      @relation(fields: [productId], references: [id], onDelete: Cascade)
  customerId  String?
  customer    Customer?    @relation(fields: [customerId], references: [id], onDelete: SetNull)

  reviewerName  String
  rating        Int
  comment       String      @db.Text
  adminResponse String?     @db.Text
  status        ReviewStatus @default(PENDING)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([productId])
  @@index([status])
  @@index([rating])
  @@map("reviews")
}

// ═══════════════════════════════════════════════════════════════
// AUDITORÍA (acciones de staff sobre entidades)
// ═══════════════════════════════════════════════════════════════

model AuditLog {
  id            String   @id @default(cuid())
  entity        String
  entityId      String
  action        String
  changes       Json
  performedById String?
  performedBy   User?    @relation(fields: [performedById], references: [id])
  ip            String?

  orderId String?
  order   Order?  @relation(fields: [orderId], references: [id])

  createdAt DateTime @default(now())

  @@index([entity, entityId])
  @@index([performedById])
  @@index([createdAt])
  @@map("audit_logs")
}
```

---

## 6. Zod Schemas — Contratos de Validación

```typescript
// src/lib/validators/auth.ts
import { z } from "zod";

// Staff interno
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});
export type LoginInput = z.infer<typeof loginSchema>;

// Cliente — login
export const customerLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});
export type CustomerLoginInput = z.infer<typeof customerLoginSchema>;

// Cliente — registro
export const customerRegisterSchema = z
  .object({
    name: z.string().min(2, "Nombre requerido").max(100),
    email: z.string().email("Email inválido"),
    phone: z.string().min(7, "Teléfono requerido").max(20),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;

// Cliente — recuperación de password
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// Cliente — actualizar perfil
export const updateCustomerProfileSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(7).max(20).optional(),
  idDoc: z.string().max(20).optional().nullable(),
  address: z.string().max(300).optional().nullable(),
});
export type UpdateCustomerProfileInput = z.infer<
  typeof updateCustomerProfileSchema
>;

// Cliente — cambio de password desde perfil
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
```

```typescript
// src/lib/validators/product.ts
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Nombre requerido").max(200),
  description: z.string().min(10, "Descripción requerida"),
  price: z.number().positive("Precio debe ser positivo"),
  promoPrice: z.number().positive().optional().nullable(),
  sku: z.string().min(1, "SKU requerido").max(50),
  categoryId: z.string().cuid("Categoría inválida"),
  supplierId: z.string().cuid().optional().nullable(),
  stock: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isMostSearched: z.boolean().default(false),
  isNew: z.boolean().default(false),
  metaTitle: z.string().max(60).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const productVariantSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0),
});
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
```

```typescript
// src/lib/validators/checkout.ts
import { z } from "zod";

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Nombre requerido").max(100),
  customerEmail: z.string().email("Email inválido"),
  customerPhone: z.string().min(7, "Teléfono/WhatsApp requerido").max(20),
  bankName: z.string().min(2, "Banco requerido").max(100),
  accountHolder: z.string().min(2, "Titular requerido").max(100),
  referenceNumber: z.string().min(4, "Referencia requerida").max(50),
  transferAmount: z.number().positive("Monto debe ser positivo"),
  transferDate: z.coerce.date({
    errorMap: () => ({ message: "Fecha inválida" }),
  }),
  voucherUrl: z.string().url("URL del comprobante inválida").optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
```

```typescript
// src/lib/validators/category.ts
import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
export type CategoryInput = z.infer<typeof categorySchema>;
```

```typescript
// src/lib/validators/review.ts
import { z } from "zod";

export const reviewSchema = z.object({
  productId: z.string().cuid(),
  reviewerName: z.string().min(2).max(100),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "Mínimo 10 caracteres").max(1000),
});
export type ReviewInput = z.infer<typeof reviewSchema>;
```

```typescript
// src/lib/validators/filters.ts
import { z } from "zod";

export const catalogFiltersSchema = z.object({
  categoryId: z.string().cuid().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.enum(["true", "false"]).optional(),
  minRating: z.coerce.number().int().min(1).max(5).optional(),
  sort: z
    .enum(["price_asc", "price_desc", "newest", "rating", "featured"])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
});
export type CatalogFilters = z.infer<typeof catalogFiltersSchema>;
```

---

## 7. Roles, Permisos y RBAC

### 7.1 Roles del Sistema

| Rol         | Tipo de usuario               | Acceso                                       |
| ----------- | ----------------------------- | -------------------------------------------- |
| `ADMIN`     | Staff interno — control total | Todo `/admin/*`                              |
| `STAFF`     | Staff interno — operaciones   | Órdenes, Inventario, Reseñas (en `/admin/*`) |
| `CUSTOMER`  | Cliente registrado            | Solo `/cuenta/*`                             |
| _(anónimo)_ | Visitante / cliente invitado  | Catálogo, Checkout                           |

### 7.2 Matriz de Permisos

| Módulo                   | ADMIN | STAFF | CUSTOMER                | Anónimo |
| ------------------------ | ----- | ----- | ----------------------- | ------- |
| Catálogo (`/`)           | ✅    | ✅    | ✅                      | ✅      |
| Checkout                 | ✅    | ✅    | ✅ (datos pre-rellenos) | ✅      |
| Portal cliente `/cuenta` | ❌    | ❌    | ✅                      | ❌      |
| Dashboard KPIs `/admin`  | ✅    | ✅    | ❌                      | ❌      |
| Órdenes admin            | ✅    | ✅    | ❌                      | ❌      |
| Productos CRUD           | ✅    | ❌    | ❌                      | ❌      |
| Categorías CRUD          | ✅    | ❌    | ❌                      | ❌      |
| Proveedores CRUD         | ✅    | ❌    | ❌                      | ❌      |
| Inventario               | ✅    | ✅    | ❌                      | ❌      |
| Reseñas (moderar)        | ✅    | ✅    | ❌                      | ❌      |
| Usuarios admin           | ✅    | ❌    | ❌                      | ❌      |

### 7.3 Implementación RBAC

```typescript
// src/lib/rbac.ts
import { auth } from "@/auth";
import { redirect } from "next/navigation";

type Permission =
  | "orders:read"
  | "orders:write"
  | "products:read"
  | "products:write"
  | "categories:write"
  | "suppliers:write"
  | "inventory:write"
  | "reviews:moderate"
  | "customers:write"
  | "users:manage"
  | "settings:write"
  | "account:read"; // solo para CUSTOMER

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: [
    "orders:read",
    "orders:write",
    "products:read",
    "products:write",
    "categories:write",
    "suppliers:write",
    "inventory:write",
    "reviews:moderate",
    "customers:write",
    "users:manage",
    "settings:write",
  ],
  STAFF: [
    "orders:read",
    "orders:write",
    "products:read",
    "inventory:write",
    "reviews:moderate",
  ],
  CUSTOMER: ["account:read"],
};

export async function requirePermission(permission: Permission): Promise<void> {
  const session = await auth();
  if (!session?.user) {
    // Si es ruta de cuenta de cliente, redirigir a login de cliente
    if (permission === "account:read") redirect("/login");
    redirect("/admin/login");
  }
  const role = session.user.role as string;
  const perms = ROLE_PERMISSIONS[role] ?? [];
  if (!perms.includes(permission)) {
    if (role === "CUSTOMER") redirect("/cuenta");
    redirect("/admin");
  }
}

// Helper específico para clientes autenticados
export async function requireCustomerSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CUSTOMER") {
    redirect("/login");
  }
  return session;
}

// Helper específico para staff
export async function requireStaffSession() {
  const session = await auth();
  if (!session?.user || session.user.role === "CUSTOMER") {
    redirect("/admin/login");
  }
  return session;
}
```

---

## 8. Estructura de Directorios Canónica

```
ecommerce-premium/
├── template/                       # ⚠️ SOLO LECTURA — fuente de verdad visual
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── ...
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (public)/               # Grupo: rutas públicas sin auth requerida
│   │   │   ├── layout.tsx          # Layout con Header + CartDrawer + Footer
│   │   │   ├── page.tsx            # Home / Catálogo (/)
│   │   │   ├── loading.tsx
│   │   │   ├── error.tsx
│   │   │   ├── producto/
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── loading.tsx
│   │   │   ├── checkout/
│   │   │   │   ├── page.tsx
│   │   │   │   └── confirmado/
│   │   │   │       └── page.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx        # Login de cliente
│   │   │   └── registro/
│   │   │       ├── page.tsx        # Registro de cliente
│   │   │       └── verificar/
│   │   │           └── page.tsx    # Verificación de email
│   │   ├── cuenta/                 # Portal de cliente autenticado
│   │   │   ├── layout.tsx          # Layout con sidebar de cuenta
│   │   │   ├── page.tsx            # Dashboard KPIs del cliente
│   │   │   ├── pedidos/
│   │   │   │   ├── page.tsx        # Historial de pedidos
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # Detalle de pedido
│   │   │   ├── perfil/
│   │   │   │   └── page.tsx        # Editar perfil
│   │   │   ├── bitacora/
│   │   │   │   └── page.tsx        # Acciones del cliente
│   │   │   └── zona-riesgo/
│   │   │       └── page.tsx        # Eliminar datos / cuenta
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   ├── ordenes/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── productos/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── nuevo/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── categorias/
│   │   │   │   └── page.tsx
│   │   │   ├── proveedores/
│   │   │   │   └── page.tsx
│   │   │   ├── inventario/
│   │   │   │   └── page.tsx
│   │   │   ├── clientes/
│   │   │   │   └── page.tsx
│   │   │   ├── resenas/
│   │   │   │   └── page.tsx
│   │   │   ├── usuarios/
│   │   │   │   └── page.tsx
│   │   │   └── metricas/
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts
│   │       └── uploadthing/
│   │           └── route.ts
│   ├── actions/
│   │   ├── auth.ts                 # signIn/signOut helpers
│   │   ├── customer-auth.ts        # registro, verificación, reset password
│   │   ├── customer-account.ts     # updateProfile, changePassword, deleteAccount
│   │   ├── checkout.ts
│   │   ├── orders.ts
│   │   ├── products.ts
│   │   ├── categories.ts
│   │   ├── suppliers.ts
│   │   ├── inventory.ts
│   │   ├── customers.ts
│   │   ├── reviews.ts
│   │   └── users.ts
│   ├── components/
│   │   ├── ui/                     # shadcn/ui instalados
│   │   │   └── extended/           # wrappers sobre shadcn
│   │   ├── catalog/
│   │   │   ├── HeroBanner.tsx      # CC — efecto visual premium (Sección 13)
│   │   │   ├── HeroParticles.tsx   # CC — partículas/efecto del hero
│   │   │   ├── CategoryBar.tsx     # RSC — barra de categorías sticky
│   │   │   ├── SocialProofBanner.tsx # RSC — "X clientes satisfechos"
│   │   │   ├── FeaturedSection.tsx # RSC — secciones especiales
│   │   │   ├── NewArrivalsSection.tsx # RSC — Novedades
│   │   │   ├── ProductGrid.tsx     # RSC
│   │   │   ├── ProductCard.tsx     # RSC (AddToCartButton es CC)
│   │   │   ├── AddToCartButton.tsx # CC
│   │   │   ├── CatalogFilters.tsx  # CC — URLSearchParams
│   │   │   ├── RatingStars.tsx     # RSC
│   │   │   ├── WhatsAppFAB.tsx     # CC — botón flotante de WhatsApp
│   │   │   └── TrustBadges.tsx     # RSC — íconos de confianza
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx      # CC
│   │   │   ├── CartItem.tsx        # CC
│   │   │   └── CartButton.tsx      # CC
│   │   ├── checkout/
│   │   │   ├── CheckoutForm.tsx    # CC — RHF + Zod
│   │   │   └── VoucherUpload.tsx   # CC — UploadThing
│   │   ├── cuenta/                 # Componentes del portal de cliente
│   │   │   ├── AccountSidebar.tsx  # CC
│   │   │   ├── CustomerKpiCard.tsx # RSC
│   │   │   ├── RecentOrdersList.tsx# RSC
│   │   │   ├── OrderStatusBadge.tsx# RSC
│   │   │   ├── OrderTimeline.tsx   # RSC
│   │   │   ├── CustomerActionLog.tsx # RSC
│   │   │   ├── ProfileForm.tsx     # CC — RHF
│   │   │   ├── ChangePasswordForm.tsx # CC — RHF
│   │   │   └── DangerZone.tsx      # CC — confirmación con AlertDialog
│   │   ├── auth/
│   │   │   ├── CustomerLoginForm.tsx  # CC — RHF
│   │   │   └── CustomerRegisterForm.tsx # CC — RHF
│   │   ├── admin/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── KpiCard.tsx
│   │   │   ├── OrdersTable.tsx
│   │   │   ├── ProductForm.tsx     # CC
│   │   │   ├── CategoryTree.tsx    # CC — drag & drop
│   │   │   ├── InventoryTable.tsx
│   │   │   ├── SalesChart.tsx      # CC — Recharts dynamic
│   │   │   └── ReviewModerator.tsx # CC
│   │   └── shared/
│   │       ├── PageHeader.tsx
│   │       ├── EmptyState.tsx
│   │       └── StatusBadge.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── env.ts
│   │   ├── rbac.ts
│   │   ├── slug.ts
│   │   ├── utils.ts
│   │   ├── tokens.ts               # generateVerifyToken, generateResetToken (nanoid)
│   │   └── email/
│   │       ├── index.ts
│   │       └── templates/
│   │           ├── OrderPending.tsx
│   │           ├── OrderConfirmed.tsx
│   │           ├── OrderRejected.tsx
│   │           ├── CustomerVerifyEmail.tsx  # NUEVO
│   │           └── CustomerPasswordReset.tsx # NUEVO
│   ├── store/
│   │   └── cart.ts
│   ├── types/
│   │   ├── actions.ts
│   │   └── next-auth.d.ts
│   ├── lib/validators/
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   ├── category.ts
│   │   ├── checkout.ts
│   │   ├── review.ts
│   │   └── filters.ts
│   ├── auth.ts
│   └── proxy.ts
├── public/
│   └── images/
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 9. Rutas y Contratos de Página

### 9.1 Rutas Públicas (sin auth requerida)

| Ruta                   | Tipo | Descripción                                    | searchParams                                                                 |
| ---------------------- | ---- | ---------------------------------------------- | ---------------------------------------------------------------------------- |
| `/`                    | RSC  | Home / Catálogo con arquitectura de conversión | `categoryId`, `minPrice`, `maxPrice`, `inStock`, `minRating`, `sort`, `page` |
| `/producto/[slug]`     | RSC  | Detalle de producto + reseñas                  | —                                                                            |
| `/checkout`            | CC   | Formulario de checkout (anónimo u autenticado) | —                                                                            |
| `/checkout/confirmado` | RSC  | Confirmación post-orden                        | `orderId`                                                                    |
| `/login`               | CC   | Login de cliente                               | `redirect` (URL a la que volver)                                             |
| `/registro`            | CC   | Registro de cliente                            | —                                                                            |
| `/registro/verificar`  | RSC  | Verificación de email con token                | `token`                                                                      |

### 9.2 Rutas de Cliente Autenticado `/cuenta`

| Ruta                   | Descripción                             |
| ---------------------- | --------------------------------------- |
| `/cuenta`              | Dashboard — KPIs del cliente            |
| `/cuenta/pedidos`      | Historial completo de órdenes           |
| `/cuenta/pedidos/[id]` | Detalle de orden + timeline de estados  |
| `/cuenta/perfil`       | Editar datos personales                 |
| `/cuenta/bitacora`     | Log de acciones del cliente             |
| `/cuenta/zona-riesgo`  | Solicitar eliminación de datos / cuenta |

### 9.3 Rutas Admin (sin cambios respecto a v1.0)

| Ruta                     | Permiso requerido  | Descripción          |
| ------------------------ | ------------------ | -------------------- |
| `/admin`                 | Autenticado staff  | Dashboard KPIs       |
| `/admin/login`           | Público            | Login de staff       |
| `/admin/ordenes`         | `orders:read`      | Listado de órdenes   |
| `/admin/ordenes/[id]`    | `orders:read`      | Detalle de orden     |
| `/admin/productos`       | `products:read`    | Listado de productos |
| `/admin/productos/nuevo` | `products:write`   | Crear producto       |
| `/admin/productos/[id]`  | `products:write`   | Editar producto      |
| `/admin/categorias`      | `categories:write` | Árbol de categorías  |
| `/admin/proveedores`     | `suppliers:write`  | Listado y CRUD       |
| `/admin/inventario`      | `inventory:write`  | Movimientos de stock |
| `/admin/clientes`        | `orders:read`      | Listado de clientes  |
| `/admin/resenas`         | `reviews:moderate` | Moderación           |
| `/admin/usuarios`        | `users:manage`     | CRUD usuarios        |
| `/admin/metricas`        | `orders:read`      | Gráficas y KPIs      |

### 9.4 proxy.ts — Protección de Rutas (actualizado v2.0)

```typescript
// src/proxy.ts — Next.js 16
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isAdminRoute =
    pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isCuentaRoute = pathname.startsWith("/cuenta");
  const isAdminLogin = pathname === "/admin/login";

  const role = session?.user?.role;

  // Protección de /admin/* — solo ADMIN y STAFF
  if (isAdminLogin && session && role !== "CUSTOMER") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  if (isAdminRoute && (!session || role === "CUSTOMER")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Protección de /cuenta/* — solo CUSTOMER
  if (isCuentaRoute && role !== "CUSTOMER") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/cuenta/:path*"],
};
```

---

## 10. Server Actions — Firmas Tipadas

### 10.1 Actions de Auth de Cliente (nuevas en v2.0)

```typescript
// src/actions/customer-auth.ts
"use server";

import { prisma } from "@/lib/prisma";
import {
  customerRegisterSchema,
  resetPasswordSchema,
} from "@/lib/validators/auth";
import { generateVerifyToken } from "@/lib/tokens";
import {
  sendCustomerVerifyEmail,
  sendCustomerPasswordResetEmail,
} from "@/lib/email";
import bcrypt from "bcryptjs";
import type { ActionResult } from "@/types/actions";

// Registro de nuevo cliente
export async function registerCustomerAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = customerRegisterSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const { name, email, phone, password } = parsed.data;
  const existingCustomer = await prisma.customer.findUnique({
    where: { email },
  });

  const hashedPassword = await bcrypt.hash(password, 12);
  const { token, expires } = generateVerifyToken();

  if (existingCustomer) {
    if (existingCustomer.password) {
      return { success: false, error: "Ya existe una cuenta con este email" };
    }
    // Vincular cuenta a cliente invitado existente (G-14 decision)
    await prisma.customer.update({
      where: { email },
      data: {
        name,
        phone,
        password: hashedPassword,
        isEmailVerified: false,
        emailVerifyToken: token,
        emailVerifyExpires: expires,
      },
    });
  } else {
    await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        emailVerifyToken: token,
        emailVerifyExpires: expires,
        customerActions: {
          create: { action: "REGISTER", description: "Cuenta creada" },
        },
      },
    });
  }

  // Email silencioso
  try {
    await sendCustomerVerifyEmail({ email, name, token });
  } catch (e) {
    console.error("[email] registerCustomerAction:", e);
  }

  return { success: true, data: undefined };
}

// Verificación de email con token
export async function verifyCustomerEmailAction(
  token: string,
): Promise<ActionResult> {
  const customer = await prisma.customer.findFirst({
    where: {
      emailVerifyToken: token,
      emailVerifyExpires: { gt: new Date() },
    },
  });

  if (!customer) {
    return { success: false, error: "Token inválido o expirado" };
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      isEmailVerified: true,
      emailVerifyToken: null,
      emailVerifyExpires: null,
    },
  });

  return { success: true, data: undefined };
}

// Solicitar reset de password
export async function requestPasswordResetAction(
  email: string,
): Promise<ActionResult> {
  const customer = await prisma.customer.findUnique({
    where: { email },
    select: { id: true, name: true, password: true },
  });

  // Siempre responder OK (no revelar si el email existe)
  if (!customer || !customer.password)
    return { success: true, data: undefined };

  const { token, expires } = generateVerifyToken();
  await prisma.customer.update({
    where: { email },
    data: { resetPasswordToken: token, resetPasswordExpires: expires },
  });

  try {
    await sendCustomerPasswordResetEmail({ email, name: customer.name, token });
  } catch (e) {
    console.error("[email] requestPasswordResetAction:", e);
  }

  return { success: true, data: undefined };
}

// Confirmar nuevo password con token
export async function resetPasswordAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const customer = await prisma.customer.findFirst({
    where: {
      resetPasswordToken: parsed.data.token,
      resetPasswordExpires: { gt: new Date() },
    },
  });

  if (!customer) return { success: false, error: "Token inválido o expirado" };

  const hashed = await bcrypt.hash(parsed.data.password, 12);
  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      password: hashed,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return { success: true, data: undefined };
}
```

### 10.2 Actions de Cuenta de Cliente (nuevas en v2.0)

```typescript
// src/actions/customer-account.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireCustomerSession } from "@/lib/rbac";
import {
  updateCustomerProfileSchema,
  changePasswordSchema,
} from "@/lib/validators/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import type { ActionResult } from "@/types/actions";

export async function updateCustomerProfileAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireCustomerSession();
  const parsed = updateCustomerProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  await prisma.$transaction([
    prisma.customer.update({
      where: { id: session.user.id },
      data: parsed.data,
    }),
    prisma.customerAction.create({
      data: {
        customerId: session.user.id,
        action: "UPDATE_PROFILE",
        description: "Perfil actualizado",
      },
    }),
  ]);

  revalidatePath("/cuenta/perfil");
  return { success: true, data: undefined };
}

export async function changeCustomerPasswordAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireCustomerSession();
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const customer = await prisma.customer.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!customer?.password)
    return { success: false, error: "Sin contraseña establecida" };

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    customer.password,
  );
  if (!valid) return { success: false, error: "Contraseña actual incorrecta" };

  const hashed = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.$transaction([
    prisma.customer.update({
      where: { id: session.user.id },
      data: { password: hashed },
    }),
    prisma.customerAction.create({
      data: {
        customerId: session.user.id,
        action: "CHANGE_PASSWORD",
        description: "Contraseña actualizada",
      },
    }),
  ]);

  return { success: true, data: undefined };
}

// Solicitar eliminación de cuenta (soft: marcar isBlocked, no borrar datos)
export async function requestAccountDeletionAction(): Promise<ActionResult> {
  const session = await requireCustomerSession();

  // Nota: no se eliminan los datos en v1.0. Se bloquea la cuenta y se notifica al admin.
  // La eliminación real de datos queda para v2.1 (cumplimiento GDPR/local).
  await prisma.$transaction([
    prisma.customer.update({
      where: { id: session.user.id },
      data: {
        isBlocked: true,
        notes: `Solicitud de eliminación de cuenta: ${new Date().toISOString()}`,
      },
    }),
    prisma.customerAction.create({
      data: {
        customerId: session.user.id,
        action: "DELETE_ACCOUNT_REQUEST",
        description: "Solicitud de eliminación de cuenta enviada",
      },
    }),
  ]);

  return { success: true, data: undefined };
}
```

### 10.3 Actions de Checkout (actualizado v2.0 — soporta cliente autenticado)

```typescript
// src/actions/checkout.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { checkoutSchema } from "@/lib/validators/checkout";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/actions";

interface CartItemPayload {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  name: string;
  sku: string;
}

export async function createOrderAction(
  input: unknown,
  cartItems: CartItemPayload[],
): Promise<ActionResult<{ orderId: string }>> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }
  if (!cartItems.length)
    return { success: false, error: "El carrito está vacío" };

  const session = await auth();
  const data = parsed.data;

  // Si el cliente está autenticado, se usa su Customer ID directamente.
  // Si es anónimo, upsert por email.
  let customerId: string;

  if (session?.user?.role === "CUSTOMER") {
    customerId = session.user.id;
    // Actualizar teléfono si cambió
    await prisma.customer.update({
      where: { id: customerId },
      data: { phone: data.customerPhone },
    });
  } else {
    const customer = await prisma.customer.upsert({
      where: { email: data.customerEmail },
      create: {
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
      },
      update: {
        name: data.customerName,
        phone: data.customerPhone,
      },
    });
    customerId = customer.id;
  }

  const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const order = await prisma.order.create({
    data: {
      customerId,
      bankName: data.bankName,
      accountHolder: data.accountHolder,
      referenceNumber: data.referenceNumber,
      transferAmount: data.transferAmount,
      transferDate: data.transferDate,
      voucherUrl: data.voucherUrl,
      subtotal,
      total: subtotal,
      status: "PENDIENTE",
      items: {
        create: cartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          sku: item.sku,
          price: item.price,
          quantity: item.quantity,
        })),
      },
      statusHistory: {
        create: { status: "PENDIENTE", note: "Orden creada" },
      },
    },
    select: { id: true },
  });

  // Descontar stock
  for (const item of cartItems) {
    const current = await prisma.product.findUnique({
      where: { id: item.productId },
      select: { stock: true },
    });
    if (current) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
      await prisma.inventoryMovement.create({
        data: {
          productId: item.productId,
          type: "SALIDA",
          quantity: -item.quantity,
          stockBefore: current.stock,
          stockAfter: current.stock - item.quantity,
          reason: "Venta",
          reference: order.id,
        },
      });
    }
  }

  try {
    const { sendOrderPendingEmail } = await import("@/lib/email");
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { email: true, name: true },
    });
    if (customer) {
      await sendOrderPendingEmail({
        orderId: order.id,
        customerEmail: customer.email,
        customerName: customer.name,
      });
    }
  } catch (e) {
    console.error("[email] createOrderAction:", e);
  }

  revalidatePath("/admin/ordenes");
  revalidatePath("/cuenta/pedidos");
  return { success: true, data: { orderId: order.id } };
}
```

---

## 11. Dashboard de Cliente `/cuenta` _(NUEVO en v2.0)_

### 11.1 Layout `/cuenta/layout.tsx`

- Requiere `CUSTOMER` role — llama `requireCustomerSession()`.
- Sidebar izquierdo con links a las secciones de cuenta.
- Header con nombre del cliente y botón de cerrar sesión.
- Patrón visual: derivado del template de admin pero simplificado — usar el mismo `Sidebar` pattern del template adaptado para cliente.

### 11.2 Dashboard Principal `/cuenta/page.tsx`

**KPIs del cliente (4 cards):**

| KPI              | Query                                                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Total de pedidos | `order.count({ where: { customerId } })`                                                                               |
| Gasto total      | `order.aggregate({ where: { customerId, status: "COMPLETADA" }, _sum: { total: true } })`                              |
| Pedidos activos  | `order.count({ where: { customerId, status: { in: ["PENDIENTE","VERIFICANDO","CONFIRMADA","EN_PROCESO"] } } })`        |
| Última compra    | `order.findFirst({ where: { customerId }, orderBy: { createdAt: "desc" }, select: { createdAt: true, total: true } })` |

**Compras recientes (últimas 3 órdenes):**

- Lista compacta con: ID corto, fecha, total, estado (badge de color).
- Link "Ver todas" → `/cuenta/pedidos`.

**Mensaje de bienvenida personalizado:** `"Hola, {nombre}"` + fecha del día.

### 11.3 Historial de Pedidos `/cuenta/pedidos`

- Tabla paginada (10 por página): ID corto, fecha, ítems (resumen), total, estado.
- Filtro por estado (Select).
- Click en fila → `/cuenta/pedidos/[id]`.

### 11.4 Detalle de Pedido `/cuenta/pedidos/[id]`

- Verificar que la orden pertenece al cliente autenticado (`order.customerId === session.user.id`). Si no → 404.
- Datos: número de orden, fecha, ítems con imagen/nombre/precio/cantidad.
- Datos de pago: banco, referencia, monto, fecha, link al comprobante.
- **Timeline de estados** (`OrderTimeline`): lista vertical con cada estado en `statusHistory`, fecha y nota. El estado actual destacado.
- Badge de estado actual prominente.
- Botón "Necesito ayuda" → abre WhatsApp con mensaje pre-llenado: `"Hola, tengo una consulta sobre mi pedido #[ID]"`.

### 11.5 Perfil `/cuenta/perfil`

- Formulario (`ProfileForm`) con RHF + Zod (`updateCustomerProfileSchema`): nombre, teléfono, cédula/RIF, dirección.
- Sección separada: `ChangePasswordForm` — solo visible si `customer.password !== null`.
- Email no editable (identificador único) — mostrado como campo deshabilitado.

### 11.6 Bitácora `/cuenta/bitacora`

- Tabla de `CustomerAction` del cliente: fecha, acción (badge), descripción.
- Paginación: 20 por página.
- Ordenado por `createdAt DESC`.
- El cliente solo ve sus propias acciones.

**Acciones que se registran automáticamente:**

| Trigger               | `CustomerActionType`     | Descripción                        |
| --------------------- | ------------------------ | ---------------------------------- |
| Login exitoso         | `LOGIN`                  | "Sesión iniciada"                  |
| Logout                | `LOGOUT`                 | "Sesión cerrada"                   |
| Registro              | `REGISTER`               | "Cuenta creada"                    |
| Actualizar perfil     | `UPDATE_PROFILE`         | "Datos de perfil actualizados"     |
| Cambiar password      | `CHANGE_PASSWORD`        | "Contraseña actualizada"           |
| Ver pedido            | `VIEWED_ORDER`           | "Pedido #[ID] consultado"          |
| Solicitar eliminación | `DELETE_ACCOUNT_REQUEST` | "Solicitud de eliminación enviada" |

> El registro de `LOGIN` y `LOGOUT` se hace mediante callbacks de Auth.js en `src/auth.ts` (`events.signIn` y `events.signOut`).

### 11.7 Zona de Riesgo `/cuenta/zona-riesgo`

- Sección con advertencias claras en rojo/destructive.
- **Acción 1 — Eliminar mis datos:** Modal de confirmación (`AlertDialog` de shadcn) que requiere que el usuario escriba `"CONFIRMAR"` antes de poder continuar. Llama `requestAccountDeletionAction()`. Resultado: cuenta bloqueada + notificación al admin. El cliente ve un mensaje de confirmación de que su solicitud fue recibida.
- **Acción 2 — Cerrar sesión en todos los dispositivos:** Llama `signOut()` con `redirect: "/login"`.
- Textos claros sobre qué implica cada acción y los tiempos de procesamiento.

> **Nota de implementación:** La eliminación real de datos (borrar registros de DB) está fuera del alcance v1.0. La acción marca la cuenta como bloqueada y registra la solicitud. El admin debe procesarla manualmente. Documentado en G-15.

---

## 12. Arquitectura del Catálogo / Home (Ruta `/`) _(MODIFICADO en v2.0)_

### 12.1 Principio de Diseño: Conversión Estratégica

La página principal **no es un listado de productos**. Es una **landing page de conversión** que usa el catálogo como herramienta de venta. El orden de las secciones no es arbitrario — sigue la psicología de compra: captar atención → generar deseo → construir confianza → facilitar la acción.

**Orden canónico de secciones (de arriba a abajo):**

```
1. HeroBanner              ← Impacto visual inmediato + CTA primario
2. CategoryBar             ← Navegación rápida por categorías (sticky)
3. SocialProofBanner       ← Número de clientes / productos / ventas
4. FeaturedSection         ← "Más Vendidos" (prueba social)
5. FeaturedSection         ← "Novedades" (urgencia)
6. [CTA de registro]       ← Invitación a crear cuenta (si no está logueado)
7. FeaturedSection         ← "Tendencias" (FOMO)
8. [Separador visual]
9. CatalogFilters          ← Filtros del catálogo completo
10. ProductGrid            ← Todos los productos con paginación
11. TrustBadges            ← Íconos de garantía/seguridad
12. WhatsAppFAB            ← Botón flotante de contacto
```

### 12.2 Implementación del Catálogo RSC

```typescript
// app/(public)/page.tsx — estructura canónica v2.0
import { catalogFiltersSchema } from "@/lib/validators/filters";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { HeroBanner } from "@/components/catalog/HeroBanner";
import { CategoryBar } from "@/components/catalog/CategoryBar";
import { SocialProofBanner } from "@/components/catalog/SocialProofBanner";
import { FeaturedSection } from "@/components/catalog/FeaturedSection";
import { CustomerCTABanner } from "@/components/catalog/CustomerCTABanner";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { TrustBadges } from "@/components/catalog/TrustBadges";
import { WhatsAppFAB } from "@/components/catalog/WhatsAppFAB";

const PAGE_SIZE = 24;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const filters = catalogFiltersSchema.parse(params);
  const session = await auth();
  const isCustomerLoggedIn = session?.user?.role === "CUSTOMER";

  const where = {
    isActive: true,
    ...(filters.categoryId && { categoryId: filters.categoryId }),
    ...(filters.minPrice !== undefined && { price: { gte: filters.minPrice } }),
    ...(filters.maxPrice !== undefined && { price: { lte: filters.maxPrice } }),
    ...(filters.inStock === "true" && { stock: { gt: 0 } }),
  };

  const orderBy = {
    price_asc: { price: "asc" as const },
    price_desc: { price: "desc" as const },
    newest: { createdAt: "desc" as const },
    featured: { isFeatured: "desc" as const },
  }[filters.sort ?? "newest"] ?? { createdAt: "desc" as const };

  const productSelect = {
    id: true, name: true, slug: true, price: true, promoPrice: true,
    stock: true, isFeatured: true, isNew: true,
    images: { where: { isPrimary: true }, select: { url: true, alt: true }, take: 1 },
    reviews: { where: { status: "APPROVED" }, select: { rating: true } },
  };

  const [
    products, total, heroProducts,
    bestSellers, newArrivals, trending,
    categories, totalCustomers, totalProductsCount,
  ] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip: (filters.page - 1) * PAGE_SIZE, take: PAGE_SIZE, select: productSelect }),
    prisma.product.count({ where }),
    // Hero: máx 5 productos destacados con imagen
    prisma.product.findMany({ where: { isActive: true, isFeatured: true }, select: productSelect, take: 5 }),
    // Más vendidos
    prisma.product.findMany({ where: { isActive: true, isBestSeller: true }, select: productSelect, take: 8 }),
    // Novedades
    prisma.product.findMany({ where: { isActive: true, isNew: true }, select: productSelect, take: 8, orderBy: { createdAt: "desc" } }),
    // Tendencias
    prisma.product.findMany({ where: { isActive: true, isMostSearched: true }, select: productSelect, take: 8 }),
    // Categorías para el CategoryBar
    prisma.category.findMany({ where: { isActive: true, parentId: null }, orderBy: { order: "asc" }, select: { id: true, name: true, slug: true, imageUrl: true } }),
    // Métricas para SocialProofBanner
    prisma.customer.count(),
    prisma.product.count({ where: { isActive: true } }),
  ]);

  return (
    <>
      <HeroBanner products={heroProducts} />
      <CategoryBar categories={categories} activeCategoryId={filters.categoryId} />
      <SocialProofBanner totalCustomers={totalCustomers} totalProducts={totalProductsCount} />
      <FeaturedSection title="Más Vendidos" subtitle="Lo que nuestros clientes eligen" products={bestSellers} />
      <FeaturedSection title="Novedades" subtitle="Recién llegados" products={newArrivals} badge="NUEVO" />
      {!isCustomerLoggedIn && <CustomerCTABanner />}
      <FeaturedSection title="Tendencias" subtitle="Lo más buscado ahora" products={trending} />
      <section id="catalogo" className="container mx-auto px-4 py-12">
        <CatalogFilters categories={categories} currentFilters={filters} />
        <ProductGrid products={products} total={total} page={filters.page} pageSize={PAGE_SIZE} />
      </section>
      <TrustBadges />
      <WhatsAppFAB />
    </>
  );
}
```

### 12.3 Componentes Clave de la Arquitectura de Conversión

**`CategoryBar`** — Barra horizontal sticky debajo del hero. Chips/pills clicables por categoría raíz. Click actualiza `?categoryId=xxx` en la URL y hace scroll a `#catalogo`. Diseño: fondo blanco, borde inferior suave, z-index sobre el contenido.

**`SocialProofBanner`** — Banda horizontal con 3 métricas: `{totalCustomers}+ clientes satisfechos`, `{totalProducts}+ productos disponibles`, `Envío seguro garantizado`. Fondo `primary` o `accent`. Componente RSC, sin interactividad.

**`CustomerCTABanner`** — Banner intermedio visible solo para visitantes no autenticados. Texto: "Crea tu cuenta y lleva un historial de todos tus pedidos". Dos CTAs: "Registrarme" → `/registro` y "Ya tengo cuenta" → `/login`. Diseño: fondo suave (`muted`), no intrusivo.

**`TrustBadges`** — Sección al final con 4 íconos (lucide-react) + texto: `Pago seguro`, `Verificación manual`, `Soporte por WhatsApp`, `Productos garantizados`.

**`WhatsAppFAB`** — Botón flotante circular, esquina inferior derecha. Ícono de WhatsApp. Link: `https://wa.me/{NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%2C+necesito+ayuda+con+mi+pedido`. Z-index alto. CC con posición fixed.

---

## 13. HeroBanner — Efecto Visual Premium _(MODIFICADO en v2.0)_

### 13.1 Descripción del Efecto

El HeroBanner es un Client Component que implementa un **efecto de partículas/gradiente animado** de alto impacto visual, similar al hero del template pero adaptado a la identidad de un ecommerce premium. El efecto debe:

1. **Captar la atención en los primeros 2 segundos** sin sacrificar el rendimiento (no bloquea el hilo principal).
2. **Comunicar premiumness** — no debe verse como una landing genérica.
3. **Ser SSR-friendly** — el servidor renderiza el fallback, el efecto se activa en el cliente.

### 13.2 Implementación Técnica del Efecto

**Técnica: Gradient Mesh Animado + Floating Particles (CSS + Framer Motion)**

El efecto combina tres capas:

- **Capa 1 (fondo):** Gradiente radial animado en CSS puro con `@keyframes` que rota lentamente entre colores del design system (`primary`, `accent`, un tono oscuro). Cero JS para esta capa.
- **Capa 2 (partículas):** 12-20 círculos pequeños (`div` con `border-radius: 50%`) posicionados aleatoriamente con `framer-motion`, animados con `motion` values usando `animate` + `repeat: Infinity` y fases distintas para crear sensación orgánica. Opacidad baja (0.1 – 0.3) para no distraer del contenido.
- **Capa 3 (contenido):** Texto del hero sobre las capas anteriores, con entrada animada via `framer-motion` (`initial: { opacity: 0, y: 20 }` → `animate: { opacity: 1, y: 0 }`).

```typescript
// src/components/catalog/HeroBanner.tsx
"use client";
// REFACTORED: Hero estático del template → Hero animado con partículas para ecommerce premium

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HeroProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  promoPrice: number | null;
  images: { url: string; alt: string | null }[];
}

interface HeroBannerProps {
  products: HeroProduct[];
}

// Partículas generadas en el cliente (evita hidratación mismatch)
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function HeroBanner({ products }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);

  // Generar partículas solo en cliente para evitar hidratación mismatch
  useEffect(() => {
    setMounted(true);
    setParticles(
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 80 + 20,    // 20px – 100px
        duration: Math.random() * 8 + 6,  // 6s – 14s
        delay: Math.random() * 4,          // 0s – 4s
      }))
    );
  }, []);

  // Auto-avance del carrusel cada 5s
  useEffect(() => {
    if (!products.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products.length]);

  const current = products[currentIndex];

  return (
    <section
      className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden flex items-center"
      aria-label="Productos destacados"
    >
      {/* Capa 1: Gradient mesh animado (CSS puro) */}
      <div className="hero-gradient-bg absolute inset-0 z-0" />

      {/* Capa 2: Partículas flotantes (Framer Motion, solo cliente) */}
      {mounted && particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/10 backdrop-blur-sm pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            opacity: [0.05, 0.2, 0.05],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Overlay oscuro sobre gradiente para legibilidad del texto */}
      <div className="absolute inset-0 z-10 bg-black/40" />

      {/* Capa 3: Imagen del producto actual (transición fade) */}
      {current?.images[0] && (
        <motion.div
          key={currentIndex}
          className="absolute right-0 top-0 h-full w-1/2 z-10"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Image
            src={current.images[0].url}
            alt={current.images[0].alt ?? current.name}
            fill
            className="object-cover object-center"
            priority
          />
          {/* Degradado para fusionar imagen con el fondo */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        </motion.div>
      )}

      {/* Capa 4: Contenido del hero */}
      <div className="relative z-20 container mx-auto px-4 lg:px-8 max-w-2xl">
        <motion.div
          key={`content-${currentIndex}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        >
          {/* Badge de promo si aplica */}
          {current?.promoPrice && (
            <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-widest mb-4">
              Oferta especial
            </span>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            {current?.name ?? "Descubre nuestra colección"}
          </h1>

          <p className="text-white/80 text-lg mb-8 max-w-md">
            Productos de calidad premium con entrega garantizada.
          </p>

          <div className="flex flex-wrap gap-3">
            {current && (
              <Link
                href={`/producto/${current.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-colors"
              >
                Ver producto
                <span aria-hidden>→</span>
              </Link>
            )}
            <a
              href="#catalogo"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
            >
              Ver catálogo
            </a>
          </div>

          {/* Precio del producto actual */}
          {current && (
            <div className="mt-6 flex items-baseline gap-3">
              {current.promoPrice ? (
                <>
                  <span className="text-3xl font-bold text-white">${current.promoPrice}</span>
                  <span className="text-white/50 line-through text-lg">${current.price}</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-white">${current.price}</span>
              )}
            </div>
          )}
        </motion.div>

        {/* Dots de navegación */}
        {products.length > 1 && (
          <div className="flex gap-2 mt-8">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Ir al producto ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex ? "w-8 bg-white" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

### 13.3 CSS del Gradient Mesh (en `globals.css`)

```css
/* globals.css — hero gradient animado */
.hero-gradient-bg {
  background: linear-gradient(
    135deg,
    hsl(var(--primary)) 0%,
    hsl(var(--primary) / 0.7) 30%,
    #0f0f1a 60%,
    hsl(var(--accent)) 100%
  );
  background-size: 400% 400%;
  animation: heroGradientShift 12s ease-in-out infinite;
}

@keyframes heroGradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
```

### 13.4 Requisitos de Rendimiento del Hero

- **LCP (Largest Contentful Paint):** La imagen del primer producto debe tener `priority` en `next/image`. Target: LCP < 2.5s.
- **No layout shift:** Las partículas solo se montan en el cliente (`mounted` state), el servidor renderiza el gradiente puro.
- **Accesibilidad:** La sección tiene `aria-label`. Los botones de dots tienen `aria-label`. El texto del hero tiene contraste ≥ 4.5:1 sobre el overlay.
- **Reduce motion:** Respetar `prefers-reduced-motion`. Envolver animaciones de partículas en `@media (prefers-reduced-motion: no-preference)`.

---

## 14. Carrito y Checkout — Especificación Completa

_(Sin cambios sustanciales respecto a v1.0, excepto el soporte de cliente autenticado ya documentado en la action de checkout — Sección 10.3)_

### 14.1 CartDrawer

- Drawer lateral (shadcn/ui `Sheet`) anclado a la derecha.
- Muestra: lista de ítems, cantidades (+ / −), subtotal.
- Si el cliente está autenticado: mostrar `"Hola, {nombre}"` en el header del drawer.
- Botón "Ir al checkout" → navega a `/checkout`.
- Si carrito vacío: estado empty con CTA para explorar.

### 14.2 Página `/checkout`

- Requiere carrito no vacío (redirect a `/` si está vacío).
- Si el cliente está autenticado (`CUSTOMER`): pre-rellenar nombre, email, teléfono desde la sesión. Campos editables.
- Si es anónimo: mostrar banner sutil "¿Tienes cuenta? [Inicia sesión] para pre-rellenar tus datos y guardar el historial".
- Formulario RHF + Zod con secciones: datos personales, datos bancarios, upload de comprobante.
- Al submit: `createOrderAction` → si éxito → limpiar carrito + redirect a `/checkout/confirmado?orderId=xxx`.

### 14.3 Página `/checkout/confirmado`

- Carga la orden desde DB con el `orderId`.
- Muestra resumen de confirmación con estado `PENDIENTE`.
- Si cliente autenticado: CTA "Ver en mis pedidos" → `/cuenta/pedidos/[orderId]`.
- Si anónimo: CTA "Volver al catálogo" y mensaje con el email donde recibirá actualizaciones.

### 14.4 Ciclo de Vida de la Orden

```
PENDIENTE → VERIFICANDO → CONFIRMADA → EN_PROCESO → COMPLETADA
                        ↘ RECHAZADA
PENDIENTE / VERIFICANDO → CANCELADA
```

| Desde                      | Hacia         | Quién puede  |
| -------------------------- | ------------- | ------------ |
| `PENDIENTE`                | `VERIFICANDO` | STAFF, ADMIN |
| `VERIFICANDO`              | `CONFIRMADA`  | STAFF, ADMIN |
| `VERIFICANDO`              | `RECHAZADA`   | STAFF, ADMIN |
| `CONFIRMADA`               | `EN_PROCESO`  | STAFF, ADMIN |
| `EN_PROCESO`               | `COMPLETADA`  | STAFF, ADMIN |
| `PENDIENTE`, `VERIFICANDO` | `CANCELADA`   | STAFF, ADMIN |

---

## 15. Dashboard Admin `/admin`

_(Sin cambios respecto a v1.0 excepto lo señalado)_

### 15.1 KPIs del Dashboard Principal

| KPI                                      | Query Prisma                                                             |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| Ventas del día                           | `order.aggregate` con `status: "COMPLETADA"` y `createdAt >= startOfDay` |
| Órdenes pendientes                       | `order.count` con `status: in ["PENDIENTE","VERIFICANDO"]`               |
| Productos con bajo stock                 | `product.count` donde `stock <= lowStockThreshold`                       |
| Clientes nuevos hoy                      | `customer.count` con `createdAt >= startOfDay`                           |
| **Nuevas cuentas registradas** _(nuevo)_ | `customer.count` donde `password !== null` y `createdAt >= startOfDay`   |

### 15.2 Módulo de Clientes — Vista Ampliada (v2.0)

La tabla de clientes ahora incluye:

- Columna "Tipo": badge `Registrado` (si `password !== null` y `isEmailVerified`) o `Invitado`.
- Columna "Verificado": ✅ / ❌.
- Acción: Ver bitácora de acciones del cliente (botón → modal con `CustomerAction` del cliente).

---

## 16. Emails Transaccionales

### 16.1 Templates Requeridos

| Template                          | Trigger                                | Destinatario    |
| --------------------------------- | -------------------------------------- | --------------- |
| `OrderPending`                    | `createOrderAction` exitoso            | Cliente + Admin |
| `OrderConfirmed`                  | `updateOrderStatusAction → CONFIRMADA` | Cliente         |
| `OrderRejected`                   | `updateOrderStatusAction → RECHAZADA`  | Cliente         |
| `CustomerVerifyEmail` _(nuevo)_   | `registerCustomerAction`               | Cliente         |
| `CustomerPasswordReset` _(nuevo)_ | `requestPasswordResetAction`           | Cliente         |

### 16.2 Estructura de `CustomerVerifyEmail`

```typescript
// src/lib/email/templates/CustomerVerifyEmail.tsx
import { Html, Heading, Text, Button, Section } from "@react-email/components";

interface Props {
  name: string;
  verifyUrl: string; // process.env.NEXT_PUBLIC_APP_URL + /registro/verificar?token=xxx
}

export function CustomerVerifyEmail({ name, verifyUrl }: Props) {
  return (
    <Html>
      <Section>
        <Heading>Verifica tu email, {name}</Heading>
        <Text>Haz clic en el botón para activar tu cuenta. Este link expira en 24 horas.</Text>
        <Button href={verifyUrl}>Verificar mi cuenta</Button>
        <Text>Si no creaste esta cuenta, ignora este email.</Text>
      </Section>
    </Html>
  );
}
```

### 16.3 `src/lib/email/index.ts` (actualizado v2.0)

```typescript
import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendOrderPendingEmail(params: {
  orderId: string;
  customerEmail: string;
  customerName: string;
}) {
  const shortId = params.orderId.slice(-8).toUpperCase();
  const { OrderPendingTemplate } = await import("./templates/OrderPending");
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [params.customerEmail, env.EMAIL_ADMIN],
    subject: `Orden #${shortId} recibida — pendiente de verificación`,
    react: OrderPendingTemplate({ ...params, shortId }),
  });
}

export async function sendOrderConfirmedEmail(params: {
  orderId: string;
  customerEmail: string;
  customerName: string;
}) {
  const shortId = params.orderId.slice(-8).toUpperCase();
  const { OrderConfirmedTemplate } = await import("./templates/OrderConfirmed");
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [params.customerEmail],
    subject: `Orden #${shortId} confirmada ✓`,
    react: OrderConfirmedTemplate({ ...params, shortId }),
  });
}

export async function sendOrderRejectedEmail(params: {
  orderId: string;
  customerEmail: string;
  customerName: string;
  reason?: string;
}) {
  const shortId = params.orderId.slice(-8).toUpperCase();
  const { OrderRejectedTemplate } = await import("./templates/OrderRejected");
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [params.customerEmail],
    subject: `Orden #${shortId} — acción requerida`,
    react: OrderRejectedTemplate({ ...params, shortId }),
  });
}

export async function sendCustomerVerifyEmail(params: {
  email: string;
  name: string;
  token: string;
}) {
  const verifyUrl = `${env.NEXT_PUBLIC_APP_URL}/registro/verificar?token=${params.token}`;
  const { CustomerVerifyEmail } =
    await import("./templates/CustomerVerifyEmail");
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [params.email],
    subject: "Verifica tu cuenta",
    react: CustomerVerifyEmail({ name: params.name, verifyUrl }),
  });
}

export async function sendCustomerPasswordResetEmail(params: {
  email: string;
  name: string;
  token: string;
}) {
  const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/login?reset=true&token=${params.token}`;
  const { CustomerPasswordResetTemplate } =
    await import("./templates/CustomerPasswordReset");
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [params.email],
    subject: "Restablecer contraseña",
    react: CustomerPasswordResetTemplate({ name: params.name, resetUrl }),
  });
}
```

---

## 17. Configuración de Infraestructura

### 17.1 `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.uploadthing.com" },
    ],
  },
};

export default nextConfig;
```

### 17.2 `src/lib/tokens.ts`

```typescript
import { nanoid } from "nanoid";

export function generateVerifyToken(): { token: string; expires: Date } {
  const token = nanoid(32); // token URL-safe de 32 chars
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
  return { token, expires };
}

export function generateResetToken(): { token: string; expires: Date } {
  const token = nanoid(32);
  const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hora
  return { token, expires };
}
```

### 17.3 `src/types/next-auth.d.ts`

```typescript
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string; // "ADMIN" | "STAFF" | "CUSTOMER"
    } & DefaultSession["user"];
  }
}
```

---

## 18. Criterios de Aceptación Verificables

### 18.1 Catálogo y Home

| ID     | Criterio                                                              | Verificación                                            |
| ------ | --------------------------------------------------------------------- | ------------------------------------------------------- |
| CAT-01 | Filtro por categoría actualiza URL y resultados                       | `?categoryId=xxx` → solo productos de esa categoría     |
| CAT-02 | Filtro `inStock=true` excluye `stock = 0`                             | Ninguna card con badge "Agotado" visible                |
| CAT-03 | Badge "Agotado" cuando `stock === 0`                                  | `product.stock = 0` → badge rojo en card                |
| CAT-04 | Badge "Promo" cuando `promoPrice !== null`                            | Precio tachado + badge verde                            |
| CAT-05 | Secciones especiales solo muestran productos con flag correspondiente | `isBestSeller=false` → no aparece en "Más Vendidos"     |
| CAT-06 | Paginación correcta                                                   | `?page=2` → resultados 25-48                            |
| CAT-07 | `CustomerCTABanner` visible solo para visitantes no autenticados      | Si `session.user.role === "CUSTOMER"` → no se renderiza |
| CAT-08 | `WhatsAppFAB` abre WhatsApp con número correcto                       | Link contiene `NEXT_PUBLIC_WHATSAPP_NUMBER`             |
| CAT-09 | Hero auto-avanza cada 5s y es controlable por dots                    | Click en dot 2 → muestra producto 2                     |
| CAT-10 | Secciones aparecen en el orden canónico definido en 12.1              | Inspección visual del DOM                               |

### 18.2 Carrito

| ID      | Criterio                               | Verificación                             |
| ------- | -------------------------------------- | ---------------------------------------- |
| CART-01 | Carrito persiste al recargar           | Añadir ítem → recargar → ítem presente   |
| CART-02 | Mismo producto suma cantidad           | `addItem` × 2 → `quantity = 2`           |
| CART-03 | Total recalcula al cambiar cantidades  | Qty 1→2 → total ×2                       |
| CART-04 | Carrito se vacía tras checkout exitoso | `clearCart()` llamado en éxito           |
| CART-05 | Carrito NO se pierde al iniciar sesión | Login → carrito del localStorage intacto |

### 18.3 Auth de Cliente

| ID      | Criterio                                                  | Verificación                                                              |
| ------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| AUTH-01 | Registro crea Customer con `password !== null`            | `customer.password !== null` en DB                                        |
| AUTH-02 | Registro con email existente (invitado) vincula cuenta    | Email de compra previa → registro exitoso + órdenes visibles en `/cuenta` |
| AUTH-03 | Login falla sin verificar email                           | `customer.isEmailVerified = false` → error en login                       |
| AUTH-04 | Token de verificación expira en 24h                       | `emailVerifyExpires < now` → error en `/registro/verificar`               |
| AUTH-05 | Cliente autenticado ve sus datos pre-rellenos en checkout | Campo nombre/email/teléfono rellenos desde sesión                         |
| AUTH-06 | Cliente bloqueado no puede iniciar sesión                 | `customer.isBlocked = true` → `authorize()` retorna null                  |
| AUTH-07 | Token de reset de password expira en 1h                   | `resetPasswordExpires < now` → error                                      |

### 18.4 Portal de Cliente `/cuenta`

| ID     | Criterio                                               | Verificación                                                |
| ------ | ------------------------------------------------------ | ----------------------------------------------------------- |
| CTA-01 | `/cuenta` requiere rol CUSTOMER                        | Anónimo → redirect `/login`                                 |
| CTA-02 | KPIs del dashboard muestran datos correctos            | Comparar con queries directas a DB                          |
| CTA-03 | Historial muestra solo órdenes del cliente autenticado | `order.customerId === session.user.id`                      |
| CTA-04 | Detalle de orden rechaza acceso a orden ajena          | `orderId` de otro cliente → 404                             |
| CTA-05 | Timeline de estados refleja `OrderStatusHistory`       | Cambiar estado en admin → visible en `/cuenta/pedidos/[id]` |
| CTA-06 | `CustomerAction` se registra en cada acción            | Login → `customerAction.action === "LOGIN"` en DB           |
| CTA-07 | Zona de riesgo requiere escribir "CONFIRMAR"           | Sin texto correcto → botón deshabilitado                    |
| CTA-08 | Solicitud de eliminación bloquea cuenta                | `customer.isBlocked = true` tras acción                     |

### 18.5 Checkout y Órdenes

| ID     | Criterio                                                | Verificación                                          |
| ------ | ------------------------------------------------------- | ----------------------------------------------------- |
| CHK-01 | Formulario valida todos los campos requeridos           | Zod schema completo                                   |
| CHK-02 | Orden se crea en estado `PENDIENTE`                     | `order.status === "PENDIENTE"` en DB                  |
| CHK-03 | Stock decrementado al crear orden                       | `inventoryMovement` creado + `product.stock` reducido |
| CHK-04 | Email enviado a cliente y admin                         | `sendOrderPendingEmail` called                        |
| CHK-05 | Cliente autenticado: orden vinculada a su ID, no upsert | `order.customerId === session.user.id`                |
| ORD-01 | Cambio de estado crea `OrderStatusHistory`              | `count({ where: { orderId } }) > 0`                   |
| ORD-02 | Cambio de estado crea `AuditLog`                        | Log presente en DB                                    |

### 18.6 RBAC

| ID      | Criterio                                              | Verificación                                     |
| ------- | ----------------------------------------------------- | ------------------------------------------------ |
| RBAC-01 | Anónimo → redirect `/admin/login` al acceder `/admin` | 302 a `/admin/login`                             |
| RBAC-02 | CUSTOMER → redirect `/login` al acceder `/admin`      | 302 a `/login`                                   |
| RBAC-03 | STAFF no puede acceder a `/admin/productos/nuevo`     | `requirePermission("products:write")` → redirect |
| RBAC-04 | ADMIN no puede acceder a `/cuenta`                    | Solo CUSTOMER puede                              |
| RBAC-05 | Token JWT incluye `role`                              | `session.user.role !== undefined`                |

### 18.7 Hero Visual

| ID      | Criterio                              | Verificación                                     |
| ------- | ------------------------------------- | ------------------------------------------------ |
| HERO-01 | Gradiente animado visible en CSS      | `.hero-gradient-bg` tiene `animation` activa     |
| HERO-02 | Partículas solo aparecen en cliente   | SSR HTML no contiene `.motion-div` de partículas |
| HERO-03 | LCP < 2.5s                            | Lighthouse en producción                         |
| HERO-04 | Sin layout shift al montar partículas | CLS = 0 en Lighthouse                            |
| HERO-05 | `prefers-reduced-motion` respetado    | Con media query activa → partículas estáticas    |

---

## 19. Checklist de Implementación por Fases

### Fase 0 — Setup (Día 1)

- [ ] Verificar Node.js >= 20.9.0 (`node --version`)
- [ ] `npx create-next-app@latest ecommerce-premium --typescript --tailwind --app --src-dir --import-alias "@/*"`
- [ ] Verificar scripts: NO `--turbopack`, NO `next lint`
- [ ] Instalar dependencias del `package.json` canónico (Sección 3)
- [ ] `npx shadcn@latest init` (style: new-york, base color: neutral)
- [ ] Instalar componentes shadcn: `button dialog sheet select tabs toast dropdown-menu slider checkbox avatar alert-dialog`
- [ ] **Inventariar `template/`** — leer todos los componentes y documentar en `README.md` sección "Componentes del Template" (ADR-010)
- [ ] Copiar `prisma/schema.prisma` v2.0 (Sección 5)
- [ ] Configurar `.env.local` con variables de Sección 4
- [ ] `npx prisma db push` — verificar conexión a Neon.tech
- [ ] Crear `src/auth.ts` con dos providers (ADR-002)
- [ ] Crear `src/proxy.ts` — export `proxy` con lógica dual admin/cuenta (ADR-008)
- [ ] Crear `src/lib/prisma.ts`, `src/lib/rbac.ts`, `src/lib/env.ts`, `src/lib/tokens.ts`
- [ ] Crear `src/types/actions.ts`, `src/types/next-auth.d.ts`
- [ ] Crear `src/store/cart.ts` (ADR-005)
- [ ] Agregar `.hero-gradient-bg` y `@keyframes heroGradientShift` a `globals.css` (Sección 13.3)
- [ ] Ejecutar seed inicial: 1 usuario ADMIN, categorías base, 5 productos demo con `isNew=true`

### Fase 1 — Catálogo y Hero (Días 2–6)

- [ ] **Mapear componentes del template → identificar cuáles usar para Layout, Header, Footer, Cards**
- [ ] Layout público `(public)/layout.tsx` — derivado del template
- [ ] `HeroBanner.tsx` — gradiente + partículas + carrusel (Sección 13)
- [ ] `CategoryBar.tsx` — barra sticky de categorías
- [ ] `SocialProofBanner.tsx` — métricas de confianza
- [ ] `FeaturedSection.tsx` — genérico (Más Vendidos, Novedades, Tendencias)
- [ ] `ProductGrid.tsx` + `ProductCard.tsx` con badges + paginación
- [ ] `AddToCartButton.tsx` CC conectado a Zustand
- [ ] `CatalogFilters.tsx` CC con URLSearchParams
- [ ] `TrustBadges.tsx` — íconos de garantía
- [ ] `WhatsAppFAB.tsx` — botón flotante
- [ ] `CustomerCTABanner.tsx` — visible solo para anónimos
- [ ] `RatingStars.tsx`
- [ ] Página `/producto/[slug]` — galería + reseñas + form de reseña
- [ ] Verificar orden de secciones según Sección 12.1
- [ ] Verificar criterios CAT-01 a CAT-10, HERO-01 a HERO-05

### Fase 1.5 — Auth de Cliente y Portal `/cuenta` (Días 7–11) _(NUEVA)_

- [ ] **Mapear template: ¿existe algún componente de form/auth? → adaptar**
- [ ] `CustomerLoginForm.tsx` + página `/login`
- [ ] `CustomerRegisterForm.tsx` + página `/registro`
- [ ] `registerCustomerAction` + `verifyCustomerEmailAction`
- [ ] Página `/registro/verificar` — consume token de URL
- [ ] `requestPasswordResetAction` + `resetPasswordAction`
- [ ] Setup emails `CustomerVerifyEmail` + `CustomerPasswordReset`
- [ ] Layout `/cuenta/layout.tsx` con `AccountSidebar`
- [ ] Dashboard `/cuenta/page.tsx` — 4 KPI cards + compras recientes
- [ ] Página `/cuenta/pedidos` — historial con filtro de estado
- [ ] Página `/cuenta/pedidos/[id]` — detalle + `OrderTimeline` + botón WhatsApp
- [ ] Página `/cuenta/perfil` — `ProfileForm` + `ChangePasswordForm`
- [ ] Página `/cuenta/bitacora` — tabla `CustomerAction`
- [ ] Página `/cuenta/zona-riesgo` — `DangerZone` con AlertDialog
- [ ] Registrar `CustomerAction` en: login, logout (via Auth.js events), register, updateProfile, changePassword, viewedOrder, deleteRequest
- [ ] Verificar criterios AUTH-01 a AUTH-07 y CTA-01 a CTA-08

### Fase 2 — Checkout (Días 12–14)

- [ ] CartDrawer con estado condicional (cliente auth vs anónimo)
- [ ] Página `/checkout` — pre-relleno si autenticado + banner de login sugerido
- [ ] `CheckoutForm` RHF + Zod
- [ ] `VoucherUpload` UploadThing
- [ ] `createOrderAction` v2.0 (Sección 10.3)
- [ ] Página `/checkout/confirmado` con CTA condicional (cuenta vs anónimo)
- [ ] Verificar criterios CART-01 a CART-05, CHK-01 a CHK-05

### Fase 3 — Dashboard Admin Base (Días 15–19)

- [ ] Layout admin con Sidebar + DashboardHeader — derivado del template
- [ ] Login `/admin/login`
- [ ] Dashboard `/admin` — 5 KPIs (incluyendo cuentas registradas)
- [ ] Módulo `/admin/ordenes` — tabla + filtros + detalle
- [ ] `updateOrderStatusAction` con historial + audit log + email
- [ ] Módulo `/admin/clientes` — tabla ampliada con tipo y verificación
- [ ] Verificar criterios ORD-01, ORD-02, RBAC-01 a RBAC-05

### Fase 4 — Dashboard Admin Completo (Días 20–25)

- [ ] Módulo `/admin/productos` — CRUD completo
- [ ] Módulo `/admin/categorias` — árbol drag & drop
- [ ] Módulo `/admin/proveedores` — tabla + modal
- [ ] Módulo `/admin/inventario` — movimientos + modal
- [ ] Módulo `/admin/resenas` — tabs + moderar + responder
- [ ] Módulo `/admin/usuarios` — CRUD (solo ADMIN)
- [ ] Módulo `/admin/metricas` — Recharts (dynamic import)
- [ ] Verificar criterios INV-01 a INV-03

### Fase 5 — QA y Deploy (Días 26–28)

- [ ] Test completo de criterios Sección 18
- [ ] Lighthouse: performance > 90, SEO > 95, LCP < 2.5s, CLS = 0
- [ ] Verificar `prefers-reduced-motion` en el hero
- [ ] Configurar Vercel: env vars de producción, dominio
- [ ] `npx prisma migrate deploy` en producción
- [ ] Seed en producción (admin + datos base)
- [ ] Configurar Upstash Redis para rate limiting en `/api/auth`
- [ ] Documentación de entrega: credenciales admin, instrucciones de uso

---

## 20. Gaps Resueltos y Supuestos Contractuales

| #    | Gap                                        | Decisión Tomada                                                                                                                                                                                    | Justificación                                                                  |
| ---- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| G-01 | Moneda de precios                          | USD como moneda base. Sin conversión automática en v1.0.                                                                                                                                           | Contexto latinoamericano donde USD es referencia                               |
| G-02 | Pasarela de pago                           | Sin pasarela online. Pago 100% offline (transferencia bancaria). Verificación manual.                                                                                                              | Restricciones bancarias regionales                                             |
| G-03 | Login de clientes _(reemplazado en v2.0)_  | Auth opcional. Clientes pueden comprar como invitados (solo email/teléfono). El registro es voluntario y da acceso al portal `/cuenta`.                                                            | Máxima reducción de fricción de compra + beneficio real para quien se registra |
| G-04 | Soft delete de productos                   | `deleteProductAction` hace `isActive = false`, no `delete`.                                                                                                                                        | Integridad referencial de `OrderItem.productId`                                |
| G-05 | Slug de productos y categorías             | Generado en creación con `slugify`. No se regenera en edición para no romper SEO. Editable manualmente.                                                                                            | URLs indexadas                                                                 |
| G-06 | Stock en variantes                         | `Product.stock` es el stock base. Las variantes tienen su propio `stock`. El frontend suma ambos.                                                                                                  | Flexibilidad para productos sin variantes                                      |
| G-07 | Exportación de reportes                    | Excluida del alcance v1.0. Futuro.                                                                                                                                                                 | No prioritaria                                                                 |
| G-08 | Upload de imágenes                         | UploadThing. Max 5MB por archivo. Max 10 imágenes por producto.                                                                                                                                    | Sin S3 propio                                                                  |
| G-09 | i18n                                       | Excluido v1.0. Sistema 100% en español. Marcado para v2.1.                                                                                                                                         | Mercado objetivo hispanohablante                                               |
| G-10 | Rating promedio                            | Calculado en memoria desde `reviews` con `select { rating: true }`. No desnormalizado.                                                                                                             | Volumen bajo; v2.1 puede desnormalizar                                         |
| G-11 | Drag & drop categorías                     | `@dnd-kit/core` + `@dnd-kit/sortable`. No usar `react-beautiful-dnd` (deprecado).                                                                                                                  | Activamente mantenida, React 19 compatible                                     |
| G-12 | Versión de Next.js                         | **Next.js 16.2.0**. Breaking changes en ADR-008.                                                                                                                                                   | Versión más reciente estable (marzo 2026)                                      |
| G-13 | Alertas de bajo stock                      | Badges visuales en admin. No emails/push. Lógica: `stock <= lowStockThreshold`.                                                                                                                    | Sin infraestructura de cron en v1.0                                            |
| G-14 | Registro con email de compra previa        | Al registrarse con un email ya existente como cliente invitado, se **vincula la cuenta** (se establece el password) sin duplicar el Customer. Las órdenes previas quedan en su historial.          | Evitar fragmentación de datos del cliente                                      |
| G-15 | Eliminación real de datos (GDPR)           | **Fuera del alcance v1.0.** `requestAccountDeletionAction` bloquea la cuenta y registra la solicitud. El admin procesa manualmente. La eliminación definitiva de datos es v2.1.                    | Cumplimiento legal requiere análisis específico del contexto jurídico          |
| G-16 | WhatsApp Business API programática         | **Fuera del alcance v1.0.** Solo se incluye un link `wa.me` estático (FAB y botón en detalle de pedido). La API programática (envío de mensajes desde el servidor) es v2.1.                        | Costo y complejidad desproporcionados para v1.0                                |
| G-17 | Autenticación del cliente con WhatsApp OTP | **Fuera del alcance v1.0.** El campo `phone` en checkout es solo de contacto. La verificación de identidad es únicamente por email. En v2.1 se puede agregar OTP por WhatsApp como segundo factor. | Requiere WhatsApp Business API (ver G-16)                                      |

---

_Documento generado para consumo directo por agentes de IA de generación de código._
_Versión: 2.0 · Stack canónico: Next.js 16.2.0 + Auth.js v5 + Prisma 7 + Zustand + UploadThing + Resend + Framer Motion_
_Cada sección es accionable. No existen TODOs ni placeholders sin decisión tomada._
_Changelog completo respecto a v1.0 documentado en el encabezado de este documento._
