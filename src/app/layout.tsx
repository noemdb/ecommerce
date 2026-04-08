import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Toaster } from "sonner";
import { ConfirmProvider } from "@/components/providers/ConfirmProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getSiteConfig();

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
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={cssVars}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConfirmProvider>
            {children}
          </ConfirmProvider>
        </ThemeProvider>
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            },
          }}
          style={{
            "--width": "420px",
          } as any}
          closeButton 
        />
      </body>
    </html>
  );
}
