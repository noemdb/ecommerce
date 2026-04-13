import { Users, Package, ShieldCheck } from "lucide-react";
import type { SiteConfigData } from "@/lib/site-config/default-site-config";

interface SocialProofBannerProps {
  totalCustomers: number;
  totalProducts: number;
  config: SiteConfigData;
}

export function SocialProofBanner({ totalCustomers, totalProducts, config }: SocialProofBannerProps) {
  // Función para redondear a un número amigable (ej. 1243 -> 1200)
  const roundNumber = (num: number) => {
    if (num > 1000) return (Math.floor(num / 100) * 100).toLocaleString("es-VE");
    return num.toLocaleString("es-VE");
  };

  return (
    <div className="text-white py-6 md:py-8" style={{ backgroundColor: config.socialProofBgColor || "#2563EB" }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-6 text-center divide-x divide-white/20">
          <div className="flex flex-col items-center justify-center p-4">
            <Users className="w-5 h-5 md:w-8 md:h-8 opacity-80 mb-2 md:mb-3" />
            <div className="text-xl md:text-3xl font-bold mb-0.5 md:mb-1">{roundNumber(totalCustomers)}+</div>
            <div className="text-[10px] md:text-sm font-medium text-white/80 uppercase tracking-tighter md:tracking-wider">
              {config.socialProofCustomerLabel}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-4">
            <Package className="w-5 h-5 md:w-8 md:h-8 opacity-80 mb-2 md:mb-3" />
            <div className="text-xl md:text-3xl font-bold mb-0.5 md:mb-1">{roundNumber(totalProducts)}+</div>
            <div className="text-[10px] md:text-sm font-medium text-white/80 uppercase tracking-tighter md:tracking-wider">
              {config.socialProofProductLabel}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-4">
            <ShieldCheck className="w-5 h-5 md:w-8 md:h-8 opacity-80 mb-2 md:mb-3" />
            <div className="text-xl md:text-3xl font-bold mb-0.5 md:mb-1">{config.socialProofThirdStatValue}</div>
            <div className="text-[10px] md:text-sm font-medium text-white/80 uppercase tracking-tighter md:tracking-wider">
              {config.socialProofThirdStatLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
