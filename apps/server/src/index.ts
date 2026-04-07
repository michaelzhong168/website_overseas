import { serve } from "@hono/node-server";
import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { prisma } from "@repo/database";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signToken, verifyToken } from "./jwt.js";

type Variables = { userId: string; role: string };
const app = new Hono<{ Variables: Variables }>();

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.get("/health", (c) => c.json({ ok: true }));

app.post("/auth/login", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = z
    .object({ email: z.string().email(), password: z.string().min(1) })
    .safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user) return c.json({ error: "Invalid credentials" }, 401);
  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return c.json({ error: "Invalid credentials" }, 401);
  const token = await signToken({ sub: user.id, role: user.role });
  return c.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

const requireAuth: MiddlewareHandler<{ Variables: Variables }> = async (c, next) => {
  const header = c.req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return c.json({ error: "Unauthorized" }, 401);
  const session = await verifyToken(token);
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  c.set("userId", session.sub);
  c.set("role", session.role);
  await next();
};

app.get("/admin/me", requireAuth, async (c) => {
  const userId = c.get("userId") as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });
  if (!user) return c.json({ error: "Not found" }, 404);
  return c.json(user);
});

const pageCreate = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  body: z.string().optional(),
  heroImageUrl: z.string().optional(),
  locale: z.string().optional(),
  published: z.boolean().optional(),
});

app.get("/admin/pages", requireAuth, async (c) => {
  const locale = c.req.query("locale") ?? "en";
  const rows = await prisma.page.findMany({
    where: { locale },
    orderBy: { updatedAt: "desc" },
  });
  return c.json(rows);
});

app.post("/admin/pages", requireAuth, async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = pageCreate.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  const row = await prisma.page.create({
    data: {
      slug: parsed.data.slug,
      title: parsed.data.title,
      body: parsed.data.body ?? "",
      heroImageUrl: parsed.data.heroImageUrl ?? "",
      locale: parsed.data.locale ?? "en",
      published: parsed.data.published ?? false,
    },
  });
  return c.json(row);
});

app.patch("/admin/pages/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = pageCreate.partial().safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  try {
    const row = await prisma.page.update({ where: { id }, data: parsed.data });
    return c.json(row);
  } catch {
    return c.json({ error: "Not found" }, 404);
  }
});

app.delete("/admin/pages/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  try {
    await prisma.page.delete({ where: { id } });
    return c.json({ ok: true });
  } catch {
    return c.json({ error: "Not found" }, 404);
  }
});

const productSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  locale: z.string().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

app.get("/admin/products", requireAuth, async (c) => {
  const locale = c.req.query("locale") ?? "en";
  const rows = await prisma.product.findMany({
    where: { locale },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });
  return c.json(rows);
});

app.post("/admin/products", requireAuth, async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  const row = await prisma.product.create({
    data: {
      slug: parsed.data.slug,
      title: parsed.data.title,
      summary: parsed.data.summary ?? "",
      description: parsed.data.description ?? "",
      imageUrl: parsed.data.imageUrl ?? "",
      locale: parsed.data.locale ?? "en",
      published: parsed.data.published ?? false,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  });
  return c.json(row);
});

app.patch("/admin/products/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  try {
    const row = await prisma.product.update({ where: { id }, data: parsed.data });
    return c.json(row);
  } catch {
    return c.json({ error: "Not found" }, 404);
  }
});

app.delete("/admin/products/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  try {
    await prisma.product.delete({ where: { id } });
    return c.json({ ok: true });
  } catch {
    return c.json({ error: "Not found" }, 404);
  }
});

const newsSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().optional(),
  body: z.string().optional(),
  coverUrl: z.string().optional(),
  locale: z.string().optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
});

app.get("/admin/news", requireAuth, async (c) => {
  const locale = c.req.query("locale") ?? "en";
  const rows = await prisma.newsPost.findMany({
    where: { locale },
    orderBy: { updatedAt: "desc" },
  });
  return c.json(rows);
});

app.post("/admin/news", requireAuth, async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = newsSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  const row = await prisma.newsPost.create({
    data: {
      slug: parsed.data.slug,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt ?? "",
      body: parsed.data.body ?? "",
      coverUrl: parsed.data.coverUrl ?? "",
      locale: parsed.data.locale ?? "en",
      published: parsed.data.published ?? false,
      publishedAt: parsed.data.publishedAt
        ? new Date(parsed.data.publishedAt)
        : parsed.data.published
          ? new Date()
          : null,
    },
  });
  return c.json(row);
});

app.patch("/admin/news/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = newsSchema.partial().safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.publishedAt !== undefined) {
    data.publishedAt = parsed.data.publishedAt
      ? new Date(parsed.data.publishedAt)
      : null;
  }
  try {
    const row = await prisma.newsPost.update({ where: { id }, data });
    return c.json(row);
  } catch {
    return c.json({ error: "Not found" }, 404);
  }
});

app.delete("/admin/news/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  try {
    await prisma.newsPost.delete({ where: { id } });
    return c.json({ ok: true });
  } catch {
    return c.json({ error: "Not found" }, 404);
  }
});

app.get("/admin/submissions", requireAuth, async (c) => {
  const rows = await prisma.formSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return c.json(rows);
});

const projectSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  location: z.string().optional(),
  coverUrl: z.string().optional(),
  body: z.string().optional(),
  locale: z.string().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

app.get("/admin/projects", requireAuth, async (c) => {
  const locale = c.req.query("locale") ?? "en";
  const rows = await prisma.project.findMany({
    where: { locale },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });
  return c.json(rows);
});

app.post("/admin/projects", requireAuth, async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  const row = await prisma.project.create({
    data: {
      slug: parsed.data.slug,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle ?? "",
      location: parsed.data.location ?? "",
      coverUrl: parsed.data.coverUrl ?? "",
      body: parsed.data.body ?? "",
      locale: parsed.data.locale ?? "en",
      published: parsed.data.published ?? false,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  });
  return c.json(row);
});

app.patch("/admin/projects/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = projectSchema.partial().safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  try {
    const row = await prisma.project.update({ where: { id }, data: parsed.data });
    return c.json(row);
  } catch {
    return c.json({ error: "Not found" }, 404);
  }
});

app.delete("/admin/projects/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  try {
    await prisma.project.delete({ where: { id } });
    return c.json({ ok: true });
  } catch {
    return c.json({ error: "Not found" }, 404);
  }
});

const storeSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  city: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  hoursNote: z.string().optional(),
  mapUrl: z.string().optional(),
  locale: z.string().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

app.get("/admin/stores", requireAuth, async (c) => {
  const locale = c.req.query("locale") ?? "en";
  const rows = await prisma.storeLocation.findMany({
    where: { locale },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });
  return c.json(rows);
});

app.post("/admin/stores", requireAuth, async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = storeSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  const row = await prisma.storeLocation.create({
    data: {
      slug: parsed.data.slug,
      name: parsed.data.name,
      city: parsed.data.city ?? "",
      country: parsed.data.country ?? "",
      address: parsed.data.address ?? "",
      phone: parsed.data.phone ?? "",
      hoursNote: parsed.data.hoursNote ?? "",
      mapUrl: parsed.data.mapUrl ?? "",
      locale: parsed.data.locale ?? "en",
      published: parsed.data.published ?? false,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  });
  return c.json(row);
});

app.patch("/admin/stores/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = storeSchema.partial().safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  try {
    const row = await prisma.storeLocation.update({ where: { id }, data: parsed.data });
    return c.json(row);
  } catch {
    return c.json({ error: "Not found" }, 404);
  }
});

app.delete("/admin/stores/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  try {
    await prisma.storeLocation.delete({ where: { id } });
    return c.json({ ok: true });
  } catch {
    return c.json({ error: "Not found" }, 404);
  }
});

app.get("/public/pages/:slug", async (c) => {
  const slug = c.req.param("slug");
  const locale = c.req.query("locale") ?? "en";
  const row = await prisma.page.findFirst({
    where: { slug, locale, published: true },
  });
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

app.get("/public/products", async (c) => {
  const locale = c.req.query("locale") ?? "en";
  const rows = await prisma.product.findMany({
    where: { locale, published: true },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      imageUrl: true,
    },
  });
  return c.json(rows);
});

app.get("/public/products/:slug", async (c) => {
  const slug = c.req.param("slug");
  const locale = c.req.query("locale") ?? "en";
  const row = await prisma.product.findFirst({
    where: { slug, locale, published: true },
  });
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

app.get("/public/news", async (c) => {
  const locale = c.req.query("locale") ?? "en";
  const rows = await prisma.newsPost.findMany({
    where: { locale, published: true },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverUrl: true,
      publishedAt: true,
    },
  });
  return c.json(rows);
});

app.get("/public/news/:slug", async (c) => {
  const slug = c.req.param("slug");
  const locale = c.req.query("locale") ?? "en";
  const row = await prisma.newsPost.findFirst({
    where: { slug, locale, published: true },
  });
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

app.get("/public/projects", async (c) => {
  const locale = c.req.query("locale") ?? "en";
  const rows = await prisma.project.findMany({
    where: { locale, published: true },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      location: true,
      coverUrl: true,
    },
  });
  return c.json(rows);
});

app.get("/public/projects/:slug", async (c) => {
  const slug = c.req.param("slug");
  const locale = c.req.query("locale") ?? "en";
  const row = await prisma.project.findFirst({
    where: { slug, locale, published: true },
  });
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

app.get("/public/stores", async (c) => {
  const locale = c.req.query("locale") ?? "en";
  const rows = await prisma.storeLocation.findMany({
    where: { locale, published: true },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });
  return c.json(rows);
});

app.get("/public/stores/:slug", async (c) => {
  const slug = c.req.param("slug");
  const locale = c.req.query("locale") ?? "en";
  const row = await prisma.storeLocation.findFirst({
    where: { slug, locale, published: true },
  });
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

app.post("/public/contact", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  await prisma.formSubmission.create({
    data: {
      formType: "contact",
      payload: parsed.data,
    },
  });
  return c.json({ ok: true });
});

const port = Number(process.env.API_PORT ?? 4000);
serve({ fetch: app.fetch, port });
console.log(`API listening on http://localhost:${port}`);
