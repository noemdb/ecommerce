import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

export default function RootPage() {
  // Redirect strictly to the default locale (es)
  redirect(`/${routing.defaultLocale}`);
}
