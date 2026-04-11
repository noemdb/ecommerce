import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ['en', 'es'] as const,
  defaultLocale: 'es' as const,
});
