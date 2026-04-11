"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // ThemeProvider from next-themes renders a script tag to prevent FOUC.
  // In React 19 / Next.js 16, this might trigger a console warning 
  // during hydration which can be safely ignored as it is intentional.
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
