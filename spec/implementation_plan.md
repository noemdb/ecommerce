# Plan de Implementación: Página `/nosotros` — Perfil Dinámico Multi-Tenant

## Estado: ✅ Aprobado — Listo para ejecutar

## Contexto

Cada cliente recibe su propia instancia del ecommerce con su propia base de datos Neon configurada en variables de entorno. No hay DB compartida. La página pública del perfil profesional se publica en `/nosotros`. El seed provee secciones por defecto, pero el cliente puede crear secciones adicionales y reorganizar el orden de aparición desde el panel de administración.

**Decisiones confirmadas:**
| Decisión | Respuesta |
|---|---|
| Multi-tenancy | ✅ Una DB Neon por cliente (variables de entorno) — `BusinessProfile` singleton |
| Idioma | ✅ Solo español |
| Editor HTML | ✅ `<textarea>` plano, sin WYSIWYG |
| Imágenes | ✅ UploadThing — mismo patrón que `productImage` |
| URL pública | ✅ `/nosotros` |
| Secciones iniciales | ✅ Seed provee defaults; cliente puede crear más y reordenarlas |

---

## Decisiones de Arquitectura

### 1. Modelo de Datos: Schema Completo Propuesto

El modelo tiene tres capas:

```
BusinessProfile  (Singleton — el propietario del sitio)
    └── ProfileSection[]  (secciones del About: Intro, Formación, Skills...)
            └── ProfileField[]  (campos individuales de cada sección)
```

**`BusinessProfile`** — Raíz del perfil, análogo a `SiteConfig`:
```
id              Int      @id @default(1)   ← singleton
fullName        String
tagline         String?                    ← frase corta debajo del nombre
avatarUrl       String?                    ← subida por UploadThing
bio             String?                    ← texto plano, sin WYSIWYG
resumeUrl       String?                    ← URL a PDF del CV
createdAt       DateTime
updatedAt       DateTime
```

**`ProfileSection`** — Secciones del perfil:
```
id              String   @id @default(cuid())
title           String
subtitle        String?
slug            String   @unique
icon            String?  ← nombre de ícono (ej. "graduation-cap")
order           Int      @default(0)
isVisible       Boolean  @default(true)
isPublished     Boolean  @default(false)
createdAt/updatedAt
```

**`ProfileField`** — Campos de cada sección:
```
id              String          @id @default(cuid())
sectionId       String          → ProfileSection
fieldKey        String          ← identificador interno (ej. "university_name")
label           String          ← etiqueta visible (ej. "Universidad")
fieldType       ProfileFieldType  ← TEXT | HTML | IMAGE_URL | LINK | DATE | NUMBER
value           String          ← SIEMPRE String, el tipo controla el render
order           Int             @default(0)
isVisible       Boolean         @default(true)
createdAt/updatedAt
```

**Enum:**
```prisma
enum ProfileFieldType {
  TEXT       // <p> texto plano
  HTML       // <div dangerouslySetInnerHTML> — se escribe en <textarea> plano en admin
  IMAGE_URL  // <Image> de next/image — URL de UploadThing
  LINK       // <a href> enlace externo
  DATE       // fecha formateada con Intl.DateTimeFormat
  NUMBER     // número con formato
}
```

> **¿Por qué `BusinessProfile` es singleton?** Igual que `SiteConfig` con `id = 1`, cada instancia del ecommerce tiene exactamente un propietario. Si en el futuro se necesita multi-perfil (ej. sección "Nuestro Equipo"), se agrega un `TeamMember` separado — sin cambiar este modelo.

---

### 2. Configuración de Secciones — Enfoque Híbrido

**Slugs predefinidos en TypeScript** para tipado seguro, pero **creados y administrados 100% desde la DB**:

```typescript
type KnownSectionSlug =
  | 'introduction'        // Presentación personal
  | 'basic-info'          // Datos personales / de contacto
  | 'academic-formation'  // Formación académica
  | 'skills'              // Habilidades técnicas y blandas
  | 'work-experience'     // Experiencia laboral
  | 'certifications'      // Certificaciones y cursos
  | 'languages'           // Idiomas
  | 'contact'             // Información de contacto
```

El renderer en React hace un `switch(section.slug)` para aplicar layout especial a los conocidos, y usa un renderer genérico como fallback para slugs personalizados que el usuario cree.

---

### 3. Campo HTML sin WYSIWYG + Seguridad

En el panel de administración, el campo de tipo `HTML` se editará con un `<textarea>` plano. El usuario escribe HTML a mano o lo pega.

**Sanitización es obligatoria:** usar `sanitize-html` (server-side, en el Server Action de guardado) antes de persistir en DB. No delegar la sanitización al frontend.

```typescript
// En el Server Action de guardado
import sanitizeHtml from 'sanitize-html'

const safeValue = field.fieldType === 'HTML'
  ? sanitizeHtml(field.value, { allowedTags: sanitizeHtml.defaults.allowedTags })
  : field.value
```

**¿Por qué server-side?** El panel admin requiere autenticación, pero sanitizar solo en cliente es bypasseable. La sanitización en el Server Action garantiza que nunca llegue HTML malicioso a la DB.

---

### 4. Gestión de Contenido e Imágenes con UploadThing

**Subida de imágenes:** Agregar un nuevo endpoint en `src/lib/uploadthing.ts`:

```typescript
profileImage: f({ image: { maxFileSize: "4MB" } })
  .middleware(async ({ req }) => {
    // Misma protección que productImage
    return { uploadedBy: "admin" }
  })
  .onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl }
  }),
```

Este endpoint se usa tanto para el `avatarUrl` de `BusinessProfile` como para los `ProfileField` de tipo `IMAGE_URL`.

**Sin versioning en MVP:** El flag `isPublished` en `ProfileSection` es suficiente para ocultar/publicar secciones sin borrarlas. No se implementan drafts en esta fase.

**Panel de admin:** Rutas bajo `/admin/about` con dos vistas:
1. **Editor de perfil base** — formulario para `BusinessProfile` (nombre, bio, avatar)
2. **Gestor de secciones** — CRUD de `ProfileSection` y sus `ProfileField` anidados

---

### 5. Performance y Estrategia de Fetching

Tu proyecto usa **Next.js con App Router y Server Components**. Esto define la estrategia óptima:

**Estrategia recomendada: Una sola query con `include` anidado, en un Server Component**

```
GET /about
  └── Server Component (RSC)
        └── prisma.profileSection.findMany({
              where: { isPublished: true, isVisible: true },
              include: { fields: { where: { isVisible: true }, orderBy: { order: 'asc' } } },
              orderBy: { order: 'asc' }
            })
```

**Por qué una sola query:** La página "Acerca de" es esencialmente estática desde la perspectiva del usuario público. Una sola query con `include` es más eficiente que múltiples queries en paralelo (aunque `Promise.all` sea una alternativa válida para secciones con data independiente). Con los índices correctos en `sectionId` y `order`, esta query es O(n) y extremadamente rápida.

**Caching:** En Next.js 15+, usar `'use cache'` en la función de fetch de datos para que la página se sirva desde cache y solo se revalide cuando el admin actualice contenido (usando `cacheTag` + `revalidateTag`).

```
[DB] → [Función de servicio cacheada] → [RSC] → [HTML estático por defecto]
                                                      ↑ revalidado por admin action
```

**¿Queries separadas por sección?** Solo tiene sentido si alguna sección tiene una carga de datos muy diferente o se actualiza con frecuencia independiente. Para este caso de uso, no aplica.

---

### 6. Reusabilidad: ¿Patrón específico o genérico?

> **Sí, este patrón es altamente reutilizable.**

El modelo `ProfileSection` + `ProfileField` es en esencia un sistema de **bloques de contenido dinámico**. Podría usarse directamente (o con pequeñas modificaciones) para:

- Páginas de contenido estático (FAQ, Términos y Condiciones)
- Secciones de landing pages configurables
- Fichas de perfil de empleados o proveedores

La clave de reusabilidad es mantener los nombres genéricos (`ProfileSection` y no `AboutSection`) y el sistema de slugs. Si en el futuro se requiere para otro contexto, se agrega un campo `context: String` (ej. `'about'`, `'team'`, `'faq'`) y se filtra por él.

---

## Secuencia de Implementación

### Fase 1 — Schema y Migración
1. Agregar `enum ProfileFieldType` al `schema.prisma`
2. Agregar modelo `BusinessProfile` (singleton, `@id @default(1)`)
3. Agregar modelo `ProfileSection` con FK implícita (sin FK explícita al BusinessProfile — singleton no la necesita)
4. Agregar modelo `ProfileField` con FK a `ProfileSection`
5. Añadir índices: `@@index([isPublished, isVisible, order])` en Section; `@@index([sectionId, isVisible, order])` en Field
6. Ejecutar `prisma migrate dev --name add_profile_models`
7. Crear `prisma/customSeed/profileSeed.ts` con el perfil inicial y las secciones predefinidas

### Fase 2 — UploadThing
8. Agregar endpoint `profileImage` en `src/lib/uploadthing.ts` (mismo patrón que `productImage`)
9. Instalar `sanitize-html` y su tipo: `npm install sanitize-html @types/sanitize-html`

### Fase 3 — Capa de Servicio
10. Crear `src/services/about.service.ts`:
    - `getBusinessProfile()` — fetch del singleton con `'use cache'`
    - `getPublishedSections()` — query con include de fields, filtrada por `isPublished`
    - `getAboutPageData()` — combina ambas en `Promise.all`
11. Tipados con `Prisma.BusinessProfileGetPayload` y `Prisma.ProfileSectionGetPayload<{ include: { fields: true } }>`

### Fase 4 — UI Pública
12. Crear `src/app/(public)/about/page.tsx` como RSC que llama a `getAboutPageData()`
13. Crear `ProfileFieldRenderer` — switch por `fieldType`
14. Crear `SectionRenderer` — switch por `slug` (renderers especializados) + fallback genérico
15. Crear layout visual de la página About con header del perfil (avatar, nombre, tagline, bio)

### Fase 5 — Panel de Administración
16. Crear `src/app/admin/nosotros/page.tsx` — editor del `BusinessProfile` base con UploadThing para avatar
17. Crear `src/app/admin/nosotros/secciones/page.tsx` — listado de secciones con:
    - Toggle `isPublished` / `isVisible` por sección
    - **Control de orden numérico** (campo `order` editable, con botones ↑↓ o input directo)
    - Botón para crear nueva sección personalizada
18. Crear `src/app/admin/nosotros/secciones/[id]/page.tsx` — CRUD de `ProfileField` dentro de una sección, con orden de campos
19. Crear Server Actions en `src/actions/nosotros.actions.ts`:
    - `updateBusinessProfile(data)` → `revalidateTag('nosotros')`
    - `upsertProfileSection(data)` → `revalidateTag('nosotros')`
    - `updateSectionOrder(sections: { id, order }[])` → actualiza orden en batch → `revalidateTag('nosotros')`
    - `upsertProfileField(data, type)` → sanitiza HTML si aplica → `revalidateTag('nosotros')`
    - `updateFieldOrder(fields: { id, order }[])` → actualiza orden de campos en batch
    - `deleteProfileSection(id)` / `deleteProfileField(id)`

### Fase 6 — SEO
20. `generateMetadata` en `nosotros/page.tsx` usando `fullName`, `tagline` y `bio` del `BusinessProfile`
21. JSON-LD Schema.org tipo `Person` con datos del perfil

---

## Todas las Decisiones Resueltas ✅

No quedan preguntas abiertas. El plan está listo para ejecutar.

---

## Resumen de Archivos a Crear/Modificar

### Nuevos archivos
| Archivo | Descripción |
|---|---|
| `prisma/schema.prisma` | + enum `ProfileFieldType`, modelos `BusinessProfile`, `ProfileSection`, `ProfileField` |
| `prisma/customSeed/profileSeed.ts` | Seed con `BusinessProfile` vacío + 8 secciones por defecto |
| `src/lib/uploadthing.ts` | + endpoint `profileImage` |
| `src/services/about.service.ts` | `getAboutPageData()`, `getBusinessProfile()`, `getPublishedSections()` con `'use cache'` |
| `src/actions/nosotros.actions.ts` | Server Actions CRUD + revalidación |
| `src/app/(public)/nosotros/page.tsx` | Página pública RSC |
| `src/components/nosotros/ProfileFieldRenderer.tsx` | Renderiza campo según `fieldType` |
| `src/components/nosotros/SectionRenderer.tsx` | Renderiza sección según `slug` |
| `src/app/admin/nosotros/page.tsx` | Editor de `BusinessProfile` |
| `src/app/admin/nosotros/secciones/page.tsx` | Listado + orden de secciones |
| `src/app/admin/nosotros/secciones/[id]/page.tsx` | Editor de `ProfileField` de una sección |

### Archivos modificados
| Archivo | Cambio |
|---|---|
| `prisma/schema.prisma` | Agregar modelos y enum |
| `src/lib/uploadthing.ts` | Agregar endpoint `profileImage` |
| `src/lib/env.ts` | Sin cambios (UploadThing ya está) |
| Nav / Sidebar admin | Agregar enlace a `/admin/nosotros` |

---

## Índices de Base de Datos Recomendados

```
ProfileSection:  @@index([isPublished, isVisible, order])
ProfileField:    @@index([sectionId, isVisible, order])
```

Estos índices cubren exactamente la consulta de fetching público (filtrar publicadas/visibles, ordenar), garantizando performance incluso con decenas de secciones y cientos de campos.
