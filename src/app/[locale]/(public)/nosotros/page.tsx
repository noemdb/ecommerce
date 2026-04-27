import type { Metadata } from "next";
import Image from "next/image";
import { getAboutPageData } from "@/lib/nosotros/get-nosotros";
import { SectionRenderer } from "@/components/nosotros/SectionRenderer";
import { getSiteConfig } from "@/lib/site-config/get-site-config";
import { FileDown } from "lucide-react";


// ─── SEO Metadata ──────────────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getAboutPageData();
  const config = await getSiteConfig();

  const title = profile?.fullName
    ? `Acerca de ${profile.fullName} — ${config.appName}`
    : `Nosotros — ${config.appName}`;

  const description = profile?.bio
    ? profile.bio.slice(0, 160)
    : config.metadataDescription;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(profile?.avatarUrl && { images: [{ url: profile.avatarUrl }] }),
    },
  };
}

// ─── JSON-LD Schema.org Person ─────────────────────────────────────────────

function PersonJsonLd({
  name,
  description,
  image,
}: {
  name: string;
  description?: string | null;
  image?: string | null;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    ...(description && { description }),
    ...(image && { image }),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function NosotrosPage() {
  const { profile, sections } = await getAboutPageData();

  const hasProfile = profile && (profile.fullName || profile.bio || profile.avatarUrl);
  const hasSections = sections.length > 0;

  return (
    <>
      {/* JSON-LD */}
      {hasProfile && (
        <PersonJsonLd
          name={profile.fullName}
          description={profile.bio}
          image={profile.avatarUrl}
        />
      )}

      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="w-full max-w-7xl mx-auto px-4 py-12 md:py-20 flex flex-col gap-12">

          {/* ── Hero del perfil ─────────────────────────────────── */}
          {hasProfile && (
            <header className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              {/* Avatar */}
              {profile.avatarUrl ? (
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white dark:border-neutral-800 shadow-xl shrink-0">
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.fullName || "Avatar"}
                    fill
                    className="object-cover"
                    priority
                    sizes="160px"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shrink-0 shadow-xl">
                  {profile.fullName?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
              )}

              {/* Info */}
              <div className="flex flex-col gap-3 text-center sm:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white leading-tight">
                  {profile.fullName || "Mi Perfil"}
                </h1>
                {profile.tagline && (
                  <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">
                    {profile.tagline}
                  </p>
                )}
                {profile.bio && (
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl">
                    {profile.bio}
                  </p>
                )}

                {profile.resumeUrl && (
                  <div className="pt-2 flex justify-center sm:justify-start">
                    <a
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                      <FileDown className="w-4 h-4" />
                      Descargar CV
                    </a>
                  </div>
                )}

              </div>
            </header>
          )}

          {/* ── Secciones ───────────────────────────────────────── */}
          {hasSections ? (
            <div className="flex flex-col gap-6">
              {sections.map((section) => (
                <SectionRenderer key={section.id} section={section} />
              ))}
            </div>
          ) : (
            !hasProfile && (
              <div className="text-center py-20 text-neutral-400 dark:text-neutral-600">
                <p className="text-lg">Esta página está siendo configurada.</p>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
