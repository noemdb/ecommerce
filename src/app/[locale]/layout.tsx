import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getSiteConfig } from "@/lib/site-config/get-site-config";

// Dynamic metadata — reads from DB via getSiteConfig().
// Cached with "site-config" tag and revalidated after admin saves.
export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: config.metadataTitle,
    description: config.metadataDescription,
  };
}

// Informa a Next.js qué segmentos de [locale] son válidos
export function generateStaticParams() {
  return [{ locale: 'es' }, { locale: 'en' }];
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;
  
  // Prevent missing locale files like favicon.ico crashing server
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const config = await getSiteConfig();
  const messages = (await import(`../../../messages/${locale}.json`)).default;

  // CSS custom properties injected at the root so all pages can consume them.
  // These are additive and do not override existing Tailwind or dark-mode styles.
  const cssVars = {
    "--color-bg-primary": config.colorBgPrimary,
    "--color-bg-secondary": config.colorBgSecondary,
    "--color-text-primary": config.colorTextPrimary,
    "--color-text-secondary": config.colorTextSecondary,
    "--color-accent-primary": config.colorAccentPrimary,
    "--color-accent-secondary": config.colorAccentSecondary,
    "--color-button-primary": config.colorButtonPrimary,
    "--color-border": config.colorBorder,
  } as React.CSSProperties;

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="flex flex-col min-h-screen" style={cssVars}>
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
