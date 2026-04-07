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
    <div className="bg-blue-600 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
          <div className="flex flex-col items-center justify-center p-4">
            <Users className="w-8 h-8 opacity-80 mb-3" />
            <div className="text-3xl font-bold mb-1">{roundNumber(totalCustomers)}+</div>
            <div className="text-sm font-medium text-white/80 uppercase tracking-wider">
              Clientes Satisfechos
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-4">
            <Package className="w-8 h-8 opacity-80 mb-3" />
            <div className="text-3xl font-bold mb-1">{roundNumber(totalProducts)}+</div>
            <div className="text-sm font-medium text-white/80 uppercase tracking-wider">
              Productos Disponibles
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-4">
            <ShieldCheck className="w-8 h-8 opacity-80 mb-3" />
            <div className="text-3xl font-bold mb-1">100%</div>
            <div className="text-sm font-medium text-white/80 uppercase tracking-wider">
              Envío Seguro Garantizado
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
