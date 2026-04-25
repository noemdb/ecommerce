"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import { updateBusinessProfileAction } from "@/actions/nosotros";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { User, Save, Loader2 } from "lucide-react";
import type { BusinessProfile } from "@prisma/client";

interface Props {
  profile: BusinessProfile | null;
}

export function BusinessProfileForm({ profile }: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateBusinessProfileAction({
        fullName: fd.get("fullName") as string,
        tagline: (fd.get("tagline") as string) || undefined,
        bio: (fd.get("bio") as string) || undefined,
        avatarUrl: avatarUrl || undefined,
        resumeUrl: (fd.get("resumeUrl") as string) || undefined,
      });
      setMessage({ type: result.success ? "ok" : "error", text: result.success ? result.message! : result.error! });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Avatar */}
      <div className="flex flex-col gap-3">
        <Label>Foto de perfil</Label>
        <div className="flex items-center gap-6">
          {avatarUrl ? (
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 shrink-0">
              <Image src={avatarUrl} alt="Avatar" fill className="object-cover" sizes="80px" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
              <User className="w-8 h-8 text-neutral-400" />
            </div>
          )}
          <UploadButton<OurFileRouter, "profileImage">
            endpoint="profileImage"
            onClientUploadComplete={(res) => {
              if (res?.[0]?.url) setAvatarUrl(res[0].url);
            }}
            onUploadError={(err) => setMessage({ type: "error", text: err.message })}
            appearance={{
              button: "bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg",
              allowedContent: "text-xs text-neutral-400",
            }}
          />
        </div>
      </div>

      {/* Nombre completo */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="fullName">Nombre completo *</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={profile?.fullName ?? ""}
          required
          placeholder="Ej: María González"
        />
      </div>

      {/* Tagline */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="tagline">Tagline <span className="text-neutral-400">(frase corta)</span></Label>
        <Input
          id="tagline"
          name="tagline"
          defaultValue={profile?.tagline ?? ""}
          placeholder="Ej: Desarrolladora Full Stack | 10 años de experiencia"
        />
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="bio">Biografía</Label>
        <Textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={profile?.bio ?? ""}
          placeholder="Escribe una breve descripción sobre ti..."
        />
      </div>

      {/* URL del CV */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="resumeUrl">URL del CV <span className="text-neutral-400">(PDF)</span></Label>
        <Input
          id="resumeUrl"
          name="resumeUrl"
          type="url"
          defaultValue={profile?.resumeUrl ?? ""}
          placeholder="https://drive.google.com/..."
        />
      </div>

      {/* Feedback */}
      {message && (
        <p className={`text-sm font-medium ${message.type === "ok" ? "text-emerald-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Guardar cambios
      </Button>
    </form>
  );
}
