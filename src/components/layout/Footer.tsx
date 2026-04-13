import { Instagram, Facebook, Link as LinkIcon, Mail, Phone, MapPin } from "lucide-react";
import type { SiteConfigData } from "@/lib/site-config/default-site-config";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

interface FooterProps {
  config: SiteConfigData;
}

export function Footer({ config }: FooterProps) {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 mt-auto pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & Identity */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              {config.logoUrl ? (
                <Image src={config.logoUrl} alt={config.appName} width={120} height={40} className="object-contain" />
              ) : (
                <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  {config.appName}
                </span>
              )}
            </Link>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              {config.metadataDescription || "Tu tienda preferida en línea. Nos enfocamos en dar la mejor calidad."}
            </p>
            
            {/* Contact quick links */}
            <div className="flex flex-col gap-3 mt-4 text-sm text-neutral-600 dark:text-neutral-300">
              {config.whatsappNumber && (
                <a 
                  href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(config.whatsappMessage || '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-green-600 dark:hover:text-green-500 transition-colors"
                >
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <span>{config.whatsappNumber}</span>
                </a>
              )}
            </div>
          </div>

          {/* Categorías */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-neutral-900 dark:text-white">Categorías</h3>
            <ul className="flex flex-col gap-3 text-sm text-neutral-500 dark:text-neutral-400">
              <li><Link href="/?sort=newest#catalogo" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Novedades</Link></li>
              <li><Link href="/?sort=featured#catalogo" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Tendencias</Link></li>
              <li><Link href="/#catalogo" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Ver Todo</Link></li>
            </ul>
          </div>

          {/* Soporte */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-neutral-900 dark:text-white">Soporte</h3>
            <ul className="flex flex-col gap-3 text-sm text-neutral-500 dark:text-neutral-400">
              <li><Link href="/faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Preguntas Frecuentes</Link></li>
              <li><Link href="/cuenta/pedidos" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Rastrear Pedido</Link></li>
              <li><Link href="/envios" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Envíos y Entregas</Link></li>
              {/* <li><Link href="/contacto" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contáctanos</Link></li> */}
            </ul>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-neutral-900 dark:text-white">Legal</h3>
            <ul className="flex flex-col gap-3 text-sm text-neutral-500 dark:text-neutral-400">
              <li><Link href="/terminos" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Términos de Servicio</Link></li>
              <li><Link href="/privacidad" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Política de Privacidad</Link></li>
              <li><Link href="/devoluciones" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Políticas de Devolución</Link></li>
              <li><Link href="/cookies" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Protección de Datos</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Social + Copyright */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1 text-sm text-neutral-500 dark:text-neutral-400">
            <p>{config.footerCopyright || `© ${new Date().getFullYear()} Ecommerce Premium. Todos los derechos reservados.`}</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-neutral-400 dark:text-neutral-500 mt-1 pb-1">
              <span>Desarrollador: <span className="font-medium text-neutral-500 dark:text-neutral-400">{process.env.WEB_MASTER || '@noemdb'}</span></span>
              <span className="hidden sm:inline-block text-neutral-300 dark:text-neutral-700">•</span>
              <span>Soporte Técnico: <span className="font-medium text-neutral-500 dark:text-neutral-400">{process.env.WEB_MASTER || '@noemdb'}</span></span>
            </div>
          </div>

          {config.footerShowSocialLinks && (
            <div className="flex items-center gap-5">
              {config.footerInstagramUrl && (
                <a href={config.footerInstagramUrl} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-pink-600 transition-colors">
                  <Instagram className="w-5 h-5" />
                  <span className="sr-only">Instagram</span>
                </a>
              )}
              {config.footerFacebookUrl && (
                <a href={config.footerFacebookUrl} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-blue-600 transition-colors">
                  <Facebook className="w-5 h-5" />
                  <span className="sr-only">Facebook</span>
                </a>
              )}
              {config.footerTiktokUrl && (
                <a href={config.footerTiktokUrl} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                  <LinkIcon className="w-5 h-5" />
                  <span className="sr-only">TikTok</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
