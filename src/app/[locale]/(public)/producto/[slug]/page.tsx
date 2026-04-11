import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/catalog/ProductDetailView";
import { ReviewForm } from "@/components/catalog/ReviewForm";
import { Link } from "@/i18n/navigation";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const session = await auth();
  const isCustomer = session?.user?.role === "CUSTOMER";

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { order: "asc" } },
      category: true,
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 lg:px-8">
      <ProductDetailView product={product} />

      {/* Adding ReviewForm separately if it needs specific server-side logic or context */}
      <section className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-start-3">
           {isCustomer ? (
             <ReviewForm productId={product.id} />
           ) : (
             <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-[2.5rem] p-10 border border-neutral-100 dark:border-neutral-800 text-center space-y-4 shadow-xl shadow-blue-500/5">
                <h3 className="text-xl font-black tracking-tight">Comparte tu opinión</h3>
                <p className="text-sm text-neutral-500 italic">Inicia sesión con tu cuenta premium para dejar una reseña sobre este producto.</p>
                <Link href="/login" className="inline-block mt-4 text-blue-600 font-bold underline underline-offset-4">
                  Ir a Iniciar Sesión
                </Link>
             </div>
           )}
        </div>
      </section>
    </div>
  );
}
