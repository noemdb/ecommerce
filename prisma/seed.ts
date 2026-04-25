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

  console.log(`✅ Productos (${productsJson.length}) e Imágenes (${productImagesJson.length}) creados.`);

  // ─────────────────────────────────────────────
  // 5. SITE CONFIG
  // ─────────────────────────────────────────────
  await prisma.siteConfig.upsert({
    where: { id: 1 },
    update: DEFAULT_SITE_CONFIG,
    create: { id: 1, ...DEFAULT_SITE_CONFIG },
  });

  // ─────────────────────────────────────────────
  // 6. BUSINESS PROFILE + SECTIONS
  // ─────────────────────────────────────────────
  await prisma.businessProfile.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, fullName: "", tagline: "", bio: "", avatarUrl: "", resumeUrl: "" },
  });

  const defaultSections = [
    { slug: "introduction", title: "Presentación", subtitle: "Quién soy", icon: "User", order: 0 },
    { slug: "basic-info", title: "Información Básica", subtitle: "Datos de contacto y personales", icon: "Info", order: 1 },
    { slug: "academic-formation", title: "Formación Académica", subtitle: "Estudios y titulaciones", icon: "GraduationCap", order: 2 },
    { slug: "skills", title: "Habilidades", subtitle: "Competencias técnicas y blandas", icon: "Zap", order: 3 },
    { slug: "work-experience", title: "Experiencia Laboral", subtitle: "Trayectoria profesional", icon: "Briefcase", order: 4 },
    { slug: "certifications", title: "Certificaciones", subtitle: "Cursos y certificados obtenidos", icon: "Award", order: 5 },
    { slug: "languages", title: "Idiomas", subtitle: "Lenguas que domino", icon: "Globe", order: 6 },
    { slug: "contact", title: "Contacto", subtitle: "¿Cómo puedes comunicarte conmigo?", icon: "Mail", order: 7 },
  ];
  for (const section of defaultSections) {
    await prisma.profileSection.upsert({
      where: { slug: section.slug },
      update: {},
      create: { ...section, isVisible: true, isPublished: false },
    });
  }

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
