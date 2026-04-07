import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import bcrypt from "bcryptjs";
import "dotenv/config";

// Set the WebSocket constructor for Neon serverless
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seeding...");

  // 1. Admin User
  const adminPassword = await bcrypt.hash("Admin1234!", 12);
  const admin = await prisma.user.upsert({
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
  console.log(`✅ Admin user created: ${admin.email}`);

  // 2. Demo Customer
  const customerPassword = await bcrypt.hash("Cliente1234!", 12);
  const customer = await prisma.customer.upsert({
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
  console.log(`✅ Demo customer created: ${customer.email}`);

  // 3. Categories
  const categories = [
    { name: "Electrónica", slug: "electronica", order: 1 },
    { name: "Ropa y Accesorios", slug: "ropa-accesorios", order: 2 },
    { name: "Hogar y Jardín", slug: "hogar-jardin", order: 3 },
    { name: "Deportes", slug: "deportes", order: 4 },
    { name: "Libros", slug: "libros", order: 5 },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of categories) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { order: cat.order },
      create: { ...cat, isActive: true },
    });
    categoryMap[cat.slug] = createdCat.id;
  }
  console.log("✅ Categories created/updated.");

  // 4. Products
  const products = [
    {
      name: "Reloj Inteligente Transparente",
      slug: "smart-watch-translucent",
      description: "Reloj con interfaz holográfica y cristal de zafiro altamente resistente.",
      price: 299.99,
      promoPrice: 249.99,
      sku: "SW-001",
      stock: 25,
      categoryId: categoryMap["electronica"],
      isFeatured: true,
      isBestSeller: true,
      imageUrl: "/images/smartwatch.png",
      isNew: true,
    },
    {
      name: "Cascos Neurales Hi-Fi",
      slug: "neural-headphones-hifi",
      description: "Sonido envolvente con cancelación de ruido neural adaptativa.",
      price: 449.99,
      sku: "NH-002",
      stock: 50,
      categoryId: categoryMap["electronica"],
      isMostSearched: true,
      isFeatured: true,
      imageUrl: "/images/headphones.png",
    },
    {
      name: "Proyector Holográfico Aether",
      slug: "holographic-projector-aether",
      description: "Proyecta imágenes 4K en el aire con tecnología de difracción láser.",
      price: 899.99,
      promoPrice: 799.99,
      sku: "HP-003",
      stock: 10,
      categoryId: categoryMap["electronica"],
      isFeatured: true,
      imageUrl: "/images/projector.png",
    },
    {
      name: "Chaqueta Deportiva Premium",
      slug: "chaqueta-deportiva-premium",
      description: "Chaqueta impermeable con tecnología DryFit, perfecta para actividades al aire libre.",
      price: 89.99,
      promoPrice: 69.99,
      sku: "CHA-003",
      stock: 5,
      categoryId: categoryMap["ropa-accesorios"],
      isNew: true,
    },
    {
      name: "Zapatillas Running Ultra",
      slug: "zapatillas-running-ultra",
      description: "Zapatillas de running con tecnología de amortiguación avanzada, suela de goma antideslizante.",
      price: 119.99,
      sku: "ZAP-005",
      stock: 30,
      categoryId: categoryMap["deportes"],
      isBestSeller: true,
      isMostSearched: true,
    },
  ];

  for (const productData of products) {
    const { imageUrl, ...product } = productData;
    const createdProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...product, isActive: true },
      create: { ...product, isActive: true },
    });

    if (imageUrl) {
      await prisma.productImage.deleteMany({ where: { productId: createdProduct.id } });
      await prisma.productImage.create({
        data: {
          url: imageUrl,
          alt: product.name,
          productId: createdProduct.id,
          isPrimary: true,
        },
      });
    }
  }
  console.log("✅ Products and images created/updated.");

  console.log("🌟 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
