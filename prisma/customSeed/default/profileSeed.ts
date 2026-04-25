import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedProfile() {
  console.log("🌱 Seeding BusinessProfile and ProfileSections...");

  // BusinessProfile singleton — vacío para que el cliente lo rellene
  await prisma.businessProfile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      fullName: "",
      tagline: "",
      bio: "",
      avatarUrl: "",
      resumeUrl: "",
    },
  });

  const sections = [
    {
      slug: "introduction",
      title: "Presentación",
      subtitle: "Quién soy",
      icon: "User",
      order: 0,
    },
    {
      slug: "basic-info",
      title: "Información Básica",
      subtitle: "Datos de contacto y personales",
      icon: "Info",
      order: 1,
    },
    {
      slug: "academic-formation",
      title: "Formación Académica",
      subtitle: "Estudios y titulaciones",
      icon: "GraduationCap",
      order: 2,
    },
    {
      slug: "skills",
      title: "Habilidades",
      subtitle: "Competencias técnicas y blandas",
      icon: "Zap",
      order: 3,
    },
    {
      slug: "work-experience",
      title: "Experiencia Laboral",
      subtitle: "Trayectoria profesional",
      icon: "Briefcase",
      order: 4,
    },
    {
      slug: "certifications",
      title: "Certificaciones",
      subtitle: "Cursos y certificados obtenidos",
      icon: "Award",
      order: 5,
    },
    {
      slug: "languages",
      title: "Idiomas",
      subtitle: "Lenguas que domino",
      icon: "Globe",
      order: 6,
    },
    {
      slug: "contact",
      title: "Contacto",
      subtitle: "¿Cómo puedes comunicarte conmigo?",
      icon: "Mail",
      order: 7,
    },
  ];

  for (const section of sections) {
    await prisma.profileSection.upsert({
      where: { slug: section.slug },
      update: {},
      create: {
        ...section,
        isVisible: true,
        isPublished: false,
      },
    });
  }

  console.log("✅ Profile seed complete.");
}
