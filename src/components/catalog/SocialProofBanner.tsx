import { Users, Package, ShieldCheck } from "lucide-react";

interface SocialProofBannerProps {
  totalCustomers: number;
  totalProducts: number;
}

export function SocialProofBanner({ totalCustomers, totalProducts }: SocialProofBannerProps) {
  // Función para redondear a un número amigable (ej. 1243 -> 1200)
  const roundNumber = (num: number) => {
    if (num > 1000) return (Math.floor(num / 100) * 100).toLocaleString("es-VE");
    return num.toLocaleString("es-VE");
  };

  return (
    <div className="bg-blue-600 text-white py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-6 text-center divide-x divide-white/20">
          <div className="flex flex-col items-center justify-center p-4">
            <Users className="w-5 h-5 md:w-8 md:h-8 opacity-80 mb-2 md:mb-3" />
            <div className="text-xl md:text-3xl font-bold mb-0.5 md:mb-1">{roundNumber(totalCustomers)}+</div>
            <div className="text-[10px] md:text-sm font-medium text-white/80 uppercase tracking-tighter md:tracking-wider">
              Clientes
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-4">
            <Package className="w-5 h-5 md:w-8 md:h-8 opacity-80 mb-2 md:mb-3" />
            <div className="text-xl md:text-3xl font-bold mb-0.5 md:mb-1">{roundNumber(totalProducts)}+</div>
            <div className="text-[10px] md:text-sm font-medium text-white/80 uppercase tracking-tighter md:tracking-wider">
              Productos
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-4">
            <ShieldCheck className="w-5 h-5 md:w-8 md:h-8 opacity-80 mb-2 md:mb-3" />
            <div className="text-xl md:text-3xl font-bold mb-0.5 md:mb-1">100%</div>
            <div className="text-[10px] md:text-sm font-medium text-white/80 uppercase tracking-tighter md:tracking-wider">
              Seguro
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
