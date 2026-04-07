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
    update: {},
    create: {
      slug: "home",
      title: "Home",
      body: "Placeholder hero copy for development. Replace via admin before production.",
      locale: "en",
      published: true,
    },
  });

  await prisma.product.upsert({
    where: { slug_locale: { slug: "sample-sofa", locale: "en" } },
    update: {},
    create: {
      slug: "sample-sofa",
      title: "Sample Sofa",
      summary: "Placeholder product for layout testing.",
      description: "Replace images and copy in admin.",
      imageUrl: "",
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
