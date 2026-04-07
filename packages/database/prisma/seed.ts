import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash, role: "ADMIN" },
    create: {
      email: "admin@example.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  await prisma.page.upsert({
    where: { slug: "home" },
    update: {
      heroImageUrl:
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80",
    },
    create: {
      slug: "home",
      title: "Quiet rooms, lasting forms",
      body: "Furniture and spaces for contemporary living. Replace copy and imagery in admin before production.",
      heroImageUrl:
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80",
      locale: "en",
      published: true,
    },
  });

  await prisma.page.upsert({
    where: { slug: "legal" },
    update: {},
    create: {
      slug: "legal",
      title: "Legal",
      body: "Placeholder legal notice. Replace via admin.",
      locale: "en",
      published: true,
    },
  });

  await prisma.project.upsert({
    where: { slug_locale: { slug: "lakeside-residence", locale: "en" } },
    update: {},
    create: {
      slug: "lakeside-residence",
      title: "Lakeside residence",
      subtitle: "Living room composition",
      location: "Northern Europe",
      coverUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80",
      body: "Placeholder project story. Replace in admin.",
      locale: "en",
      published: true,
      sortOrder: 0,
    },
  });

  await prisma.project.upsert({
    where: { slug_locale: { slug: "urban-penthouse", locale: "en" } },
    update: {},
    create: {
      slug: "urban-penthouse",
      title: "Urban penthouse",
      subtitle: "Dining and lounge",
      location: "Pacific coast",
      coverUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      body: "Placeholder project story.",
      locale: "en",
      published: true,
      sortOrder: 1,
    },
  });

  await prisma.storeLocation.upsert({
    where: { slug_locale: { slug: "flagship-north", locale: "en" } },
    update: {},
    create: {
      slug: "flagship-north",
      name: "North flagship",
      city: "Berlin",
      country: "Germany",
      address: "Sample street 1",
      phone: "+00 000 000 0000",
      hoursNote: "By appointment",
      mapUrl: "",
      locale: "en",
      published: true,
      sortOrder: 0,
    },
  });

  await prisma.product.upsert({
    where: { slug_locale: { slug: "sample-sofa", locale: "en" } },
    update: {
      imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80",
    },
    create: {
      slug: "sample-sofa",
      title: "Sample Sofa",
      summary: "Placeholder product for layout testing.",
      description: "Replace images and copy in admin.",
      imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80",
      locale: "en",
      published: true,
      sortOrder: 0,
    },
  });

  await prisma.newsPost.upsert({
    where: { slug_locale: { slug: "welcome", locale: "en" } },
    update: {},
    create: {
      slug: "welcome",
      title: "Welcome",
      excerpt: "Placeholder news item.",
      body: "Replace via admin before launch.",
      locale: "en",
      published: true,
      publishedAt: new Date(),
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
