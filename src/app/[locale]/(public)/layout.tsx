import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFAB } from "@/components/catalog/WhatsAppFAB";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { getSiteConfig } from "@/lib/site-config/get-site-config";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSiteConfig();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar logoUrl={config.logoUrl} appName={config.appName} />
      <main className="flex-1 flex flex-col">{children}</main>
      {config.showFooter && <Footer config={config} />}
      {config.showWhatsAppFAB && <WhatsAppFAB config={config} />}
      <CartDrawer />
    </div>
  );
}
