import { Link } from "@/i18n/navigation";
import { UserPlus, LogIn } from "lucide-react";
import type { SiteConfigData } from "@/lib/site-config/default-site-config";

interface CustomerCTABannerProps {
  config: SiteConfigData;
}

export function CustomerCTABanner({ config }: CustomerCTABannerProps) {
  return (
    <section className="py-12 bg-neutral-50 dark:bg-neutral-900/50 border-y border-neutral-200 dark:border-neutral-800 my-16">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
          {config.ctaBannerTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8 md:text-lg whitespace-pre-wrap">
          {config.ctaBannerDescription}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/registro"
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {config.ctaBannerPrimaryLabel}
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-medium rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            {config.ctaBannerSecondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
