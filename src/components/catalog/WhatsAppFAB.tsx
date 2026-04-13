"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { SiteConfigData } from "@/lib/site-config/default-site-config";
import { cn } from "@/lib/utils";

interface WhatsAppFABProps {
  config: SiteConfigData;
}

export function WhatsAppFAB({ config }: WhatsAppFABProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleWhatsApp = () => {
    const phoneNumber = config.whatsappNumber;
    if (!phoneNumber) return;
    const message = encodeURIComponent(config.whatsappMessage);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  if (!config.whatsappNumber) return null;

  const isLeft = config.whatsappFabPosition === "bottom-left";

  return (
    <button
      onClick={handleWhatsApp}
      className={cn(
        "fixed bottom-6 z-50 p-4 bg-green-500 text-white rounded-lg shadow-xl hover:bg-green-600 hover:scale-110 active:scale-95 transition-all duration-300",
        isLeft ? "left-6" : "right-6"
      )}
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
