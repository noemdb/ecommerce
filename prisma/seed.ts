import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { DEFAULT_SITE_CONFIG } from "../src/lib/site-config/default-site-config";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding PRO iniciado...");

  // ─────────────────────────────────────────────
  // 1. ADMIN
  // ─────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin1234!", 12);

  await prisma.user.upsert({
    where: { email: "admin@mitienda.com" },
    update: { password: adminPassword },
    create: {
      name: "Administrador Premium",
      email: "admin@mitienda.com",
      password: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
  });

  // ─────────────────────────────────────────────
  // 2. CUSTOMER DEMO
  // ─────────────────────────────────────────────
  const customerPassword = await bcrypt.hash("Cliente1234!", 12);

  await prisma.customer.upsert({
    where: { email: "cliente@demo.com" },
    update: { password: customerPassword },
    create: {
      name: "Juan Pérez Demo",
      email: "cliente@demo.com",
      password: customerPassword,
      phone: "584120000000",
      isEmailVerified: true,
    },
  });

  // ─────────────────────────────────────────────
  // 3. CATEGORÍAS
  // ─────────────────────────────────────────────
  const categories = [
    { name: "Electrónica", slug: "electronica", order: 1 },
    { name: "Ropa y Accesorios", slug: "ropa-accesorios", order: 2 },
    { name: "Hogar y Jardín", slug: "hogar-jardin", order: 3 },
    { name: "Deportes", slug: "deportes", order: 4 },
    { name: "Libros", slug: "libros", order: 5 },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { order: cat.order },
      create: { ...cat, isActive: true },
    });
    categoryMap[cat.slug] = created.id;
  }

  // ─────────────────────────────────────────────
  // 4. PRODUCTOS PREMIUM (15+)
  // ─────────────────────────────────────────────
  const products = [
    {
      name: "Smartwatch Quantum X",
      slug: "smartwatch-quantum-x",
      description:
        "Experimenta el futuro en tu muñeca con el Quantum X. Este smartwatch combina un diseño elegante con tecnología de monitoreo biométrico avanzado, seguimiento de actividad en tiempo real y una batería optimizada para durar días sin interrupciones. Ideal para quienes buscan rendimiento, estilo y control total de su día.",
      price: 349.99,
      promoPrice: 299.99,
      sku: "SW-100",
      stock: 40,
      categoryId: categoryMap["electronica"],
      isFeatured: true,
      isBestSeller: true,
      isNew: true,
      imageUrl: "/images/smartwatch.png",
    },
    {
      name: "Auriculares NeuralSound Pro",
      slug: "auriculares-neuralsound-pro",
      description:
        "Sumérgete en una experiencia auditiva envolvente con cancelación de ruido inteligente. Los NeuralSound Pro se adaptan automáticamente a tu entorno, ofreciendo una calidad de sonido impecable tanto para música como para llamadas profesionales.",
      price: 199.99,
      sku: "AUD-101",
      stock: 60,
      categoryId: categoryMap["electronica"],
      isFeatured: true,
      isMostSearched: true,
      imageUrl: "/images/headphones.png",
    },
    {
      name: "Laptop Ultraligera NovaBook Air",
      slug: "laptop-novabook-air",
      description:
        "Potencia y portabilidad en un solo dispositivo. La NovaBook Air redefine la productividad con su diseño ultraligero, procesador de última generación y autonomía extendida. Perfecta para profesionales exigentes y creadores digitales.",
      price: 1299.99,
      sku: "LAP-102",
      stock: 15,
      categoryId: categoryMap["electronica"],
      isFeatured: true,
    },
    {
      name: "Cámara 4K Vision Pro",
      slug: "camara-4k-vision-pro",
      description:
        "Captura cada momento con calidad cinematográfica. La Vision Pro ofrece grabación en 4K, estabilización inteligente y un sistema óptico de alta precisión que garantiza imágenes nítidas en cualquier condición.",
      price: 599.99,
      sku: "CAM-103",
      stock: 20,
      categoryId: categoryMap["electronica"],
    },
    {
      name: "Chaqueta Impermeable StormTech",
      slug: "chaqueta-stormtech",
      description:
        "Diseñada para resistir las condiciones más exigentes. Esta chaqueta combina tecnología impermeable avanzada con transpirabilidad superior, manteniéndote cómodo y protegido en cualquier clima.",
      price: 99.99,
      promoPrice: 79.99,
      sku: "ROP-200",
      stock: 25,
      categoryId: categoryMap["ropa-accesorios"],
      isNew: true,
    },
    {
      name: "Zapatillas Running Velocity Max",
      slug: "zapatillas-velocity-max",
      description:
        "Alcanza tu máximo rendimiento con las Velocity Max. Incorporan amortiguación reactiva, suela antideslizante y un diseño ergonómico que reduce el impacto en cada paso.",
      price: 129.99,
      sku: "DEP-201",
      stock: 50,
      categoryId: categoryMap["deportes"],
      isBestSeller: true,
    },
    {
      name: "Mochila Urbana Antirrobo",
      slug: "mochila-antirrobo",
      description:
        "Seguridad y estilo en movimiento. Esta mochila incorpora compartimentos ocultos, materiales resistentes al corte y puerto USB integrado para mantenerte conectado mientras te desplazas.",
      price: 59.99,
      sku: "ACC-202",
      stock: 80,
      categoryId: categoryMap["ropa-accesorios"],
      isMostSearched: true,
    },
    {
      name: "Silla Ergonómica ProComfort",
      slug: "silla-ergonomica-procomfort",
      description:
        "Optimiza tu postura y productividad. Diseñada con soporte lumbar inteligente, materiales premium y ajustes personalizados para largas jornadas de trabajo.",
      price: 249.99,
      sku: "HOG-300",
      stock: 18,
      categoryId: categoryMap["hogar-jardin"],
      isFeatured: true,
    },
    {
      name: "Lámpara LED Inteligente Aura",
      slug: "lampara-led-aura",
      description:
        "Transforma cualquier espacio con iluminación inteligente. Controla intensidad, color y ambiente desde tu smartphone o asistente de voz.",
      price: 49.99,
      sku: "HOG-301",
      stock: 70,
      categoryId: categoryMap["hogar-jardin"],
    },
    {
      name: "Set de Pesas Ajustables Elite",
      slug: "pesas-ajustables-elite",
      description:
        "Entrena en casa con versatilidad total. Ajusta el peso según tu rutina y alcanza tus objetivos sin necesidad de un gimnasio.",
      price: 199.99,
      sku: "DEP-302",
      stock: 22,
      categoryId: categoryMap["deportes"],
    },
    {
      name: "Libro: Mentalidad de Alto Rendimiento",
      slug: "libro-mentalidad-alto-rendimiento",
      description:
        "Descubre las claves psicológicas y estratégicas para alcanzar el éxito personal y profesional. Un imprescindible para quienes buscan superarse constantemente.",
      price: 19.99,
      sku: "LIB-400",
      stock: 100,
      categoryId: categoryMap["libros"],
    },
    {
      name: "Monitor Curvo UltraWide 34”",
      slug: "monitor-curvo-ultrawide",
      description:
        "Amplía tu visión y productividad con este monitor curvo UltraWide. Ideal para multitarea, gaming y diseño profesional.",
      price: 499.99,
      sku: "MON-500",
      stock: 12,
      categoryId: categoryMap["electronica"],
    },
    {
      name: "Teclado Mecánico RGB Pro",
      slug: "teclado-mecanico-rgb-pro",
      description:
        "Precisión y velocidad para gamers y profesionales. Switches mecánicos de alta durabilidad y retroiluminación RGB personalizable.",
      price: 149.99,
      sku: "TEC-501",
      stock: 35,
      categoryId: categoryMap["electronica"],
    },
    {
      name: "Mouse Gamer Precision X",
      slug: "mouse-gamer-precision-x",
      description:
        "Control absoluto con sensor de alta precisión, diseño ergonómico y botones configurables para maximizar tu rendimiento.",
      price: 79.99,
      sku: "MOU-502",
      stock: 60,
      categoryId: categoryMap["electronica"],
    },
    {
      name: "Cafetera Automática Barista Pro",
      slug: "cafetera-barista-pro",
      description:
        "Disfruta café de calidad profesional en casa. Sistema automático con control de temperatura y molienda integrada.",
      price: 299.99,
      sku: "HOG-503",
      stock: 14,
      categoryId: categoryMap["hogar-jardin"],
      isFeatured: true,
    },
  ];

  for (const p of products) {
    const { imageUrl, ...data } = p;

    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: data,
      create: data,
    });

    // Use provided imageUrl or a high-quality placeholder (using .png to avoid SVG security restrictions in Next.js)
    const finalImageUrl = imageUrl || `https://placehold.co/800x800/0a0a0a/525252.png?text=${encodeURIComponent(data.name)}`;

    await prisma.productImage.deleteMany({
      where: { productId: product.id },
    });

    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: finalImageUrl,
        alt: data.name,
        isPrimary: true,
      },
    });
  }

  console.log("✅ Productos creados (15+)");

  // ─────────────────────────────────────────────
  // 5. SITE CONFIG
  // ─────────────────────────────────────────────
  await prisma.siteConfig.upsert({
    where: { id: 1 },
    update: DEFAULT_SITE_CONFIG,
    create: { id: 1, ...DEFAULT_SITE_CONFIG },
  });

  console.log("🌟 Seed completado correctamente");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });