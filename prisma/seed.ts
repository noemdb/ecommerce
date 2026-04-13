import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { DEFAULT_SITE_CONFIG } from "../src/lib/site-config/default-site-config";
import fs from "fs";
import path from "path";

const productsJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "json", "products.json"), "utf8")
);
const productImagesJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "json", "product_images.json"), "utf8")
);

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
    {
      id: "cmnwi6b74000210bdliq2u59x",
      name: "Electrónica",
      slug: "electronica",
      order: 1,
    },
    {
      id: "cmnwi6b9g000310bdb2edb10u",
      name: "Ropa y Accesorios",
      slug: "ropa-accesorios",
      order: 2,
    },
    {
      id: "cmnwi6bbs000410bd96n7imld",
      name: "Hogar y Jardín",
      slug: "hogar-jardin",
      order: 3,
    },
    {
      id: "cmnwi6bdy000510bdchaz5f4d",
      name: "Deportes",
      slug: "deportes",
      order: 4,
    },
    {
      id: "cmnwi6bg6000610bdabjk2b7r",
      name: "Libros",
      slug: "libros",
      order: 5,
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { order: cat.order, name: cat.name, slug: cat.slug },
      create: { ...cat, isActive: true },
    });
  }

  // ─────────────────────────────────────────────
  // 4. PRODUCTOS DESDE JSON
  // ─────────────────────────────────────────────
  for (const p of productsJson) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, updatedAt, ...data } = p;

    await prisma.product.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
  }

  // ─────────────────────────────────────────────
  // 4.1 IMÁGENES DESDE JSON
  // ─────────────────────────────────────────────
  for (const img of productImagesJson) {
    await prisma.productImage.upsert({
      where: { id: img.id },
      update: img,
      create: img,
    });
  }

  console.log(`✅ Productos (${productsJson.length}) e Imágenes (${productImagesJson.length}) creados.`);

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