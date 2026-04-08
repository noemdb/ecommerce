# Tasks — Dynamic Site Config for Ecommerce Admin

## Goal

Migrar configuraciones actualmente hardcodeadas del ecommerce a una configuración global persistida en base de datos, editable desde el panel administrativo y reflejada en el frontend sin necesidad de redeploy.

La solución debe ser compatible con:

- Next.js 16.2 App Router
- TypeScript strict
- Prisma 7.x
- PostgreSQL
- Auth.js v5
- Tailwind CSS 4.x

---

## Scope

Se debe implementar una solución para administrar dinámicamente:

1. Nombre de la app
2. Metadata principal del sitio
3. Paleta global de colores
4. Visibilidad de secciones de la homepage pública

---

## Hardcoded values to migrate

### App name

- `Ecommerce Premium`

### Layout metadata

````ts
export const metadata: Metadata = {
  title: "Ecommerce NoDoz",
  description: "Ecommerce Premium",
};
```

### Homepage sections to control
```tsx
<HeroBanner products={heroProducts as any} />
<CategoryBar categories={categories} activeCategoryId={filters.categoryId} />
<SocialProofBanner totalCustomers={totalCustomers} totalProducts={totalProductsCount} />
<FeaturedSection title="Más Vendidos" ... />
<FeaturedSection title="Novedades" ... badge="NUEVO" />
{!isCustomerLoggedIn && <CustomerCTABanner />}
<FeaturedSection title="Tendencias" ... />
<section id="catalogo"> ... <ProductGrid ... /> </section>
<TrustBadges />
<WhatsAppFAB />
```

---

# Global implementation rules

## Architecture rules
- Use a singleton Prisma model named `SiteConfig`
- Use a fixed `id = 1`
- Read config from server-side
- Updates must be admin-only
- Prefer Server Actions for admin form submission
- Use Zod for validation
- Use CSS custom properties for theme application
- Use revalidation so changes appear without redeploy

## Code quality rules
- No pseudocode if real code can be written
- Keep naming consistent across Prisma, Zod, actions, form, layout, homepage
- Must work in TypeScript strict mode
- Keep server/client boundaries clear
- Avoid fragile hacks
- Make the solution easy to extend later

## Security rules
- Only authenticated admins can update config
- Do not expose write access publicly
- Validate all user input server-side

## Important assumptions
If the codebase already has existing utilities for:
- Prisma client
- Auth.js session retrieval
- role checking
- toast or form feedback
- UI components

reuse them instead of duplicating infrastructure.

If assumptions are needed, state them clearly in comments.

---

# Phase 0 — Discovery and alignment

## Objective
Understand the existing project structure and adapt the implementation to the current codebase rather than forcing a new structure.

## Tasks
- Inspect existing Prisma schema
- Inspect auth/session utilities
- Inspect user role model
- Inspect admin route protection patterns
- Inspect current `src/app/layout.tsx`
- Inspect current `src/app/(public)/page.tsx`
- Inspect current Prisma seed strategy
- Inspect whether a shared `prisma` client already exists
- Inspect whether there is an existing pattern for Server Actions
- Inspect whether there are existing reusable form/input/switch components

## Deliverable
A short implementation note in comments or summary explaining:
- where the `SiteConfig` model will be added
- how admin auth will be checked
- what existing utilities/components will be reused

## Acceptance criteria
- The implementation plan matches the current repository structure
- No duplicate infrastructure is created unnecessarily

---

# Phase 1 — Prisma data model

## Objective
Create the `SiteConfig` singleton model to persist global site configuration.

## Tasks
- Add a new Prisma model `SiteConfig`
- Use `id Int @id @default(1)` to support singleton access
- Add fields for:
  - `appName`
  - `metadataTitle`
  - `metadataDescription`
- Add color fields:
  - `colorBgPrimary`
  - `colorBgSecondary`
  - `colorTextPrimary`
  - `colorTextSecondary`
  - `colorAccentPrimary`
  - `colorAccentSecondary`
  - `colorButtonPrimary`
  - `colorBorder`
- Add homepage visibility flags:
  - `showHeroBanner`
  - `showCategoryBar`
  - `showSocialProofBanner`
  - `showFeaturedBestSellers`
  - `showFeaturedNewArrivals`
  - `showCustomerCTABanner`
  - `showFeaturedTrending`
  - `showCatalogSection`
  - `showTrustBadges`
  - `showWhatsAppFAB`
- Add timestamps:
  - `createdAt`
  - `updatedAt`

## Required output
- Updated `prisma/schema.prisma`

## Suggested model
```prisma
model SiteConfig {
  id                        Int      @id @default(1)

  appName                   String
  metadataTitle             String
  metadataDescription       String

  colorBgPrimary            String
  colorBgSecondary          String
  colorTextPrimary          String
  colorTextSecondary        String
  colorAccentPrimary        String
  colorAccentSecondary      String
  colorButtonPrimary        String
  colorBorder               String

  showHeroBanner            Boolean  @default(true)
  showCategoryBar           Boolean  @default(true)
  showSocialProofBanner     Boolean  @default(true)
  showFeaturedBestSellers   Boolean  @default(true)
  showFeaturedNewArrivals   Boolean  @default(true)
  showCustomerCTABanner     Boolean  @default(true)
  showFeaturedTrending      Boolean  @default(true)
  showCatalogSection        Boolean  @default(true)
  showTrustBadges           Boolean  @default(true)
  showWhatsAppFAB           Boolean  @default(true)

  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt
}
```

## Acceptance criteria
- Prisma schema validates successfully
- Model is strongly typed and explicit
- No JSON blob is used for known fields

---

# Phase 2 — Migration and seed

## Objective
Create the database migration and seed the initial singleton config using current hardcoded values.

## Tasks
- Generate Prisma migration for `SiteConfig`
- Update `prisma/seed.ts`
- Seed the singleton record with `upsert`
- Use `id: 1`
- Seed these initial values:
  - `appName = "Ecommerce Premium"`
  - `metadataTitle = "Ecommerce NoDoz"`
  - `metadataDescription = "Ecommerce Premium"`
- Seed coherent default colors
- Seed all homepage visibility flags as `true`

## Suggested seed defaults
```ts
{
  id: 1,
  appName: "Ecommerce Premium",
  metadataTitle: "Ecommerce NoDoz",
  metadataDescription: "Ecommerce Premium",
  colorBgPrimary: "#FFFFFF",
  colorBgSecondary: "#F8FAFC",
  colorTextPrimary: "#0F172A",
  colorTextSecondary: "#475569",
  colorAccentPrimary: "#111827",
  colorAccentSecondary: "#6366F1",
  colorButtonPrimary: "#111827",
  colorBorder: "#E2E8F0",
  showHeroBanner: true,
  showCategoryBar: true,
  showSocialProofBanner: true,
  showFeaturedBestSellers: true,
  showFeaturedNewArrivals: true,
  showCustomerCTABanner: true,
  showFeaturedTrending: true,
  showCatalogSection: true,
  showTrustBadges: true,
  showWhatsAppFAB: true,
}
```

## Deliverables
- Migration files
- `prisma/seed.ts`

## Commands
Use the appropriate commands for the repo, typically:
```bash
pnpm prisma migrate dev --name add-site-config
pnpm prisma db seed
```

## Acceptance criteria
- Migration runs successfully
- Seed runs successfully
- `SiteConfig` record exists with `id = 1`

---

# Phase 3 — Validation schema and shared types

## Objective
Create a strict validation layer for updates to `SiteConfig`.

## Tasks
- Create a Zod schema for updating site config
- Validate:
  - non-empty app name
  - non-empty metadata title
  - metadata description with reasonable max length
  - all color fields as valid hex colors
  - all section visibility fields as booleans
- Export inferred TypeScript types from Zod
- Keep schema colocated in a reusable server-safe file

## Suggested files
- `src/lib/site-config/site-config-schema.ts`

## Validation rules
- `appName`: string, min 1, max ~120
- `metadataTitle`: string, min 1, max ~160
- `metadataDescription`: string, min 1, max ~300
- colors: regex like `^#([0-9A-Fa-f]{6})Perfecto. Te dejo un **`tasks.md`** pensado para usar directamente con **Cursor / Claude Code / GPT**, dividido por fases, con tareas concretas, criterios de aceptación, orden recomendado, restricciones y notas para que un agente pueda implementarlo sin desviarse.

---

# `tasks.md`

```md
# Tasks — Dynamic Site Config for Ecommerce Admin

## Goal

Migrar configuraciones actualmente hardcodeadas del ecommerce a una configuración global persistida en base de datos, editable desde el panel administrativo y reflejada en el frontend sin necesidad de redeploy.

La solución debe ser compatible con:

- Next.js 16.2 App Router
- TypeScript strict
- Prisma 7.x
- PostgreSQL
- Auth.js v5
- Tailwind CSS 4.x

---

## Scope

Se debe implementar una solución para administrar dinámicamente:

1. Nombre de la app
2. Metadata principal del sitio
3. Paleta global de colores
4. Visibilidad de secciones de la homepage pública

---

## Hardcoded values to migrate

### App name
- `Ecommerce Premium`

### Layout metadata
```ts
export const metadata: Metadata = {
  title: "Ecommerce NoDoz",
  description: "Ecommerce Premium",
};
```

### Homepage sections to control
```tsx
<HeroBanner products={heroProducts as any} />
<CategoryBar categories={categories} activeCategoryId={filters.categoryId} />
<SocialProofBanner totalCustomers={totalCustomers} totalProducts={totalProductsCount} />
<FeaturedSection title="Más Vendidos" ... />
<FeaturedSection title="Novedades" ... badge="NUEVO" />
{!isCustomerLoggedIn && <CustomerCTABanner />}
<FeaturedSection title="Tendencias" ... />
<section id="catalogo"> ... <ProductGrid ... /> </section>
<TrustBadges />
<WhatsAppFAB />
```

---

# Global implementation rules

## Architecture rules
- Use a singleton Prisma model named `SiteConfig`
- Use a fixed `id = 1`
- Read config from server-side
- Updates must be admin-only
- Prefer Server Actions for admin form submission
- Use Zod for validation
- Use CSS custom properties for theme application
- Use revalidation so changes appear without redeploy

## Code quality rules
- No pseudocode if real code can be written
- Keep naming consistent across Prisma, Zod, actions, form, layout, homepage
- Must work in TypeScript strict mode
- Keep server/client boundaries clear
- Avoid fragile hacks
- Make the solution easy to extend later

## Security rules
- Only authenticated admins can update config
- Do not expose write access publicly
- Validate all user input server-side

## Important assumptions
If the codebase already has existing utilities for:
- Prisma client
- Auth.js session retrieval
- role checking
- toast or form feedback
- UI components

reuse them instead of duplicating infrastructure.

If assumptions are needed, state them clearly in comments.

---

# Phase 0 — Discovery and alignment

## Objective
Understand the existing project structure and adapt the implementation to the current codebase rather than forcing a new structure.

## Tasks
- Inspect existing Prisma schema
- Inspect auth/session utilities
- Inspect user role model
- Inspect admin route protection patterns
- Inspect current `src/app/layout.tsx`
- Inspect current `src/app/(public)/page.tsx`
- Inspect current Prisma seed strategy
- Inspect whether a shared `prisma` client already exists
- Inspect whether there is an existing pattern for Server Actions
- Inspect whether there are existing reusable form/input/switch components

## Deliverable
A short implementation note in comments or summary explaining:
- where the `SiteConfig` model will be added
- how admin auth will be checked
- what existing utilities/components will be reused

## Acceptance criteria
- The implementation plan matches the current repository structure
- No duplicate infrastructure is created unnecessarily

---

# Phase 1 — Prisma data model

## Objective
Create the `SiteConfig` singleton model to persist global site configuration.

## Tasks
- Add a new Prisma model `SiteConfig`
- Use `id Int @id @default(1)` to support singleton access
- Add fields for:
  - `appName`
  - `metadataTitle`
  - `metadataDescription`
- Add color fields:
  - `colorBgPrimary`
  - `colorBgSecondary`
  - `colorTextPrimary`
  - `colorTextSecondary`
  - `colorAccentPrimary`
  - `colorAccentSecondary`
  - `colorButtonPrimary`
  - `colorBorder`
- Add homepage visibility flags:
  - `showHeroBanner`
  - `showCategoryBar`
  - `showSocialProofBanner`
  - `showFeaturedBestSellers`
  - `showFeaturedNewArrivals`
  - `showCustomerCTABanner`
  - `showFeaturedTrending`
  - `showCatalogSection`
  - `showTrustBadges`
  - `showWhatsAppFAB`
- Add timestamps:
  - `createdAt`
  - `updatedAt`

## Required output
- Updated `prisma/schema.prisma`

## Suggested model
```prisma
model SiteConfig {
  id                        Int      @id @default(1)

  appName                   String
  metadataTitle             String
  metadataDescription       String

  colorBgPrimary            String
  colorBgSecondary          String
  colorTextPrimary          String
  colorTextSecondary        String
  colorAccentPrimary        String
  colorAccentSecondary      String
  colorButtonPrimary        String
  colorBorder               String

  showHeroBanner            Boolean  @default(true)
  showCategoryBar           Boolean  @default(true)
  showSocialProofBanner     Boolean  @default(true)
  showFeaturedBestSellers   Boolean  @default(true)
  showFeaturedNewArrivals   Boolean  @default(true)
  showCustomerCTABanner     Boolean  @default(true)
  showFeaturedTrending      Boolean  @default(true)
  showCatalogSection        Boolean  @default(true)
  showTrustBadges           Boolean  @default(true)
  showWhatsAppFAB           Boolean  @default(true)

  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt
}
```

## Acceptance criteria
- Prisma schema validates successfully
- Model is strongly typed and explicit
- No JSON blob is used for known fields

---

# Phase 2 — Migration and seed

## Objective
Create the database migration and seed the initial singleton config using current hardcoded values.

## Tasks
- Generate Prisma migration for `SiteConfig`
- Update `prisma/seed.ts`
- Seed the singleton record with `upsert`
- Use `id: 1`
- Seed these initial values:
  - `appName = "Ecommerce Premium"`
  - `metadataTitle = "Ecommerce NoDoz"`
  - `metadataDescription = "Ecommerce Premium"`
- Seed coherent default colors
- Seed all homepage visibility flags as `true`

## Suggested seed defaults
```ts
{
  id: 1,
  appName: "Ecommerce Premium",
  metadataTitle: "Ecommerce NoDoz",
  metadataDescription: "Ecommerce Premium",
  colorBgPrimary: "#FFFFFF",
  colorBgSecondary: "#F8FAFC",
  colorTextPrimary: "#0F172A",
  colorTextSecondary: "#475569",
  colorAccentPrimary: "#111827",
  colorAccentSecondary: "#6366F1",
  colorButtonPrimary: "#111827",
  colorBorder: "#E2E8F0",
  showHeroBanner: true,
  showCategoryBar: true,
  showSocialProofBanner: true,
  showFeaturedBestSellers: true,
  showFeaturedNewArrivals: true,
  showCustomerCTABanner: true,
  showFeaturedTrending: true,
  showCatalogSection: true,
  showTrustBadges: true,
  showWhatsAppFAB: true,
}
```

## Deliverables
- Migration files
- `prisma/seed.ts`

## Commands
Use the appropriate commands for the repo, typically:
```bash
pnpm prisma migrate dev --name add-site-config
pnpm prisma db seed

- booleans for all visibility flags

## Acceptance criteria
- Schema compiles in strict mode
- Inferred type is reusable in actions/forms
- Invalid color values are rejected

---

# Phase 4 — Server read layer

## Objective
Implement a reusable server-side helper to read the singleton site config safely.

## Tasks
- Create a `getSiteConfig()` function
- Read `SiteConfig` by `id = 1`
- If the record does not exist, recover safely:
  - either create via `upsert`
  - or return a fallback object consistent with seed values
- Keep it usable by:
  - `layout.tsx`
  - `generateMetadata()`
  - public homepage
  - admin page
- Add caching strategy compatible with revalidation

## Suggested files
- `src/lib/site-config/get-site-config.ts`
- optionally `src/lib/site-config/default-site-config.ts`

## Recommendation
Use a single source of truth for defaults so seed and fallback do not diverge.

## Acceptance criteria
- `getSiteConfig()` always returns a valid config shape
- No page crashes if the singleton row is missing
- Helper is reusable across app layers

---

# Phase 5 — Admin authorization guard

## Objective
Ensure only admins can update site config.

## Tasks
- Identify the existing Auth.js v5 session retrieval pattern
- Implement a helper to require admin permissions
- Verify the role source, for example:
  - `session.user.role`
  - or equivalent if the project uses a different shape
- Throw or return a typed error if not admin

## Suggested files
- `src/lib/auth/require-admin.ts`

## Requirements
- Must work server-side
- Must be reusable by server actions
- Must not depend on client checks

## Acceptance criteria
- Non-authenticated users cannot update
- Authenticated non-admin users cannot update
- Admin users can proceed

---

# Phase 6 — Server Action for update

## Objective
Create the write operation to update `SiteConfig` from the admin UI.

## Tasks
- Create a Server Action for saving site config
- Parse `FormData`
- Convert booleans safely
- Validate against Zod schema
- Check admin permissions
- Persist via Prisma `upsert` or `update`
- Revalidate cache/tags/paths after save
- Return a typed action result with success/error states

## Suggested files
- `src/app/admin/site-config/actions.ts`

## Preferred action result shape
Use a typed result like:
```ts
type SiteConfigActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
```

## Requirements
- Must be compatible with `useActionState`
- Must handle validation errors gracefully
- Must not trust client data
- Must compile in strict mode

## Acceptance criteria
- Valid admin submission updates DB
- Invalid submission returns actionable errors
- Unauthorized submission is rejected
- Revalidation is triggered after successful save

---

# Phase 7 — Admin page server component

## Objective
Create the admin route that loads current config and renders the form.

## Tasks
- Add route:
  - `src/app/admin/site-config/page.tsx`
- Protect the route at server level if consistent with current admin area pattern
- Load config via `getSiteConfig()`
- Render heading and helper copy
- Pass initial values to form component

## Requirements
- Use a Server Component
- Keep data loading out of the client form
- Match existing admin layout if one exists

## Acceptance criteria
- Admin page loads current values from DB
- Non-admin access is blocked according to project conventions
- Data loading is cleanly separated from form interactivity

---

# Phase 8 — Admin form client component

## Objective
Build the interactive UI for editing site config.

## Tasks
- Create a Client Component form
- Use `useActionState` with the Server Action
- Render fields for:
  - app name
  - metadata title
  - metadata description
- Render theme controls:
  - one field per color token
  - ideally color input + text hex input if feasible
- Render homepage visibility controls:
  - one toggle per section
- Add submit button with pending state
- Show success and error feedback
- Surface field errors if available

## Suggested files
- `src/app/admin/site-config/site-config-form.tsx`

## UX requirements
- Accessible labels
- Clear grouping:
  - General
  - Theme
  - Homepage visibility
- Save button disabled while pending
- Feedback visible after submit

## Acceptance criteria
- Form is interactive and usable
- Form submits to server action
- Pending and success/error states render correctly
- Values reflect current persisted config

---

# Phase 9 — Public layout integration

## Objective
Replace static site metadata/theme usage with dynamic DB-driven config.

## Tasks
- Update root `layout.tsx`
- Replace hardcoded app/site values
- Use `generateMetadata()` instead of static metadata export
- Load config server-side
- Inject CSS custom properties using current theme values
- Apply variables at root level without breaking App Router

## Requirements
- Metadata title and description come from DB
- Theme variables must be applied globally
- Avoid duplicate DB calls if possible, but prioritize correctness and clarity

## Suggested CSS variables
```css
--color-bg-primary
--color-bg-secondary
--color-text-primary
--color-text-secondary
--color-accent-primary
--color-accent-secondary
--color-button-primary
--color-border
```

## Acceptance criteria
- Layout uses dynamic config
- Metadata updates come from DB
- Theme changes affect frontend without redeploy

---

# Phase 10 — Public homepage integration

## Objective
Use `SiteConfig` flags to conditionally render homepage sections.

## Tasks
- Update `src/app/(public)/page.tsx`
- Load site config server-side
- Replace unconditional rendering with section flags
- Keep code readable by grouping section rendering clearly
- Preserve existing business logic like:
  - customer CTA depending on authentication state
- Combine both conditions correctly where needed

## Example logic rule
For CTA:
- render only if `showCustomerCTABanner === true`
- and current user is not logged in as customer

## Acceptance criteria
- Each section is controlled by its corresponding boolean
- The page remains readable and maintainable
- Existing non-config business conditions still work correctly

---

# Phase 11 — Caching and revalidation

## Objective
Ensure changes appear without redeploy and without stale frontend behavior.

## Tasks
- Add cache strategy for `getSiteConfig()`
- Choose a simple and robust approach:
  - tag-based invalidation and/or path invalidation
- After successful admin update:
  - revalidate config cache tag
  - revalidate homepage path
  - revalidate admin page path
  - revalidate layout path if needed

## Recommendation
Prefer a simple shared config tag such as:
- `site-config`

Possible revalidation calls:
```ts
revalidateTag("site-config")
revalidatePath("/")
revalidatePath("/admin/site-config")
```

If needed for layout-driven values:
```ts
revalidatePath("/", "layout")
```

## Acceptance criteria
- Homepage visibility updates after save
- Metadata/theme changes update after save
- No redeploy required
- Caching logic is understandable and not overengineered

---

# Phase 12 — Cleanup and hardcoded value removal

## Objective
Remove obsolete hardcoded values and leave the codebase in a consistent state.

## Tasks
- Remove old hardcoded app name usages where replaced
- Remove static metadata export if superseded by `generateMetadata()`
- Remove any obsolete constants for homepage section visibility
- Ensure there is no duplicated source of truth for theme or metadata
- Add comments only where they clarify non-obvious design decisions

## Acceptance criteria
- DB-backed config is the single source of truth
- No stale hardcoded values remain in the integrated flows

---

# Phase 13 — Manual QA

## Objective
Verify the feature end-to-end before considering it done.

## Test checklist

### Admin flows
- [ ] Admin can open `/admin/site-config`
- [ ] Current values load correctly
- [ ] Admin can update app name
- [ ] Admin can update metadata title
- [ ] Admin can update metadata description
- [ ] Admin can update theme colors
- [ ] Admin can toggle each homepage section
- [ ] Success feedback appears after save
- [ ] Validation errors appear for invalid inputs

### Security
- [ ] Unauthenticated user cannot update config
- [ ] Non-admin user cannot update config
- [ ] Admin-only protection works server-side

### Public frontend
- [ ] Layout uses dynamic app/site config
- [ ] Metadata updates reflect saved values
- [ ] Theme colors change globally
- [ ] Homepage sections appear/disappear according to flags
- [ ] CTA still respects login condition in addition to config

### Resilience
- [ ] App does not crash if `SiteConfig` row is missing
- [ ] Seed can recreate a valid singleton
- [ ] Invalid hex values are rejected safely

---

# Phase 14 — Optional enhancements if time permits

## Optional tasks
- Add preview swatches next to color inputs
- Add reset-to-defaults action
- Add audit metadata such as `updatedBy`
- Add structured section labels/constants to avoid duplicated strings
- Add tests for Zod schema and action behavior
- Add optimistic UI only if it does not complicate reliability

---

# Expected file changes

The exact paths may vary based on the repository, but implementation will likely touch:

```bash
prisma/schema.prisma
prisma/seed.ts

src/lib/site-config/site-config-schema.ts
src/lib/site-config/get-site-config.ts
src/lib/site-config/default-site-config.ts

src/lib/auth/require-admin.ts

src/app/admin/site-config/page.tsx
src/app/admin/site-config/actions.ts
src/app/admin/site-config/site-config-form.tsx

src/app/layout.tsx
src/app/(public)/page.tsx
```

---

# Final implementation checklist

- [ ] `SiteConfig` Prisma model created
- [ ] Migration generated and applied
- [ ] Seed implemented with singleton upsert
- [ ] Zod schema created
- [ ] `getSiteConfig()` helper created
- [ ] Admin guard implemented
- [ ] Server Action implemented
- [ ] Admin page created
- [ ] Admin form created
- [ ] `layout.tsx` integrated with dynamic config
- [ ] `generateMetadata()` implemented
- [ ] Homepage uses visibility flags
- [ ] Cache invalidation implemented
- [ ] Manual QA completed

---

# Instructions for the coding agent

## Implementation behavior
- Make incremental changes phase by phase
- Reuse existing project patterns whenever available
- Prefer minimal, clean abstractions over overengineering
- Preserve current behavior unless explicitly replaced by dynamic config
- If the auth role shape differs from assumptions, adapt to the real project and document the change in code comments

## Before finishing
Provide a summary including:
1. files changed
2. key architectural decisions
3. assumptions made
4. follow-up improvements recommended

````
