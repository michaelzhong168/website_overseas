import Link from "next/link";
import { fetchJson } from "@/lib/api";

type Post = { title: string; excerpt: string; body: string; publishedAt: string | null };

export default async function NewsDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post: Post | null = null;
  try {
    post = await fetchJson<Post>(`/public/news/${slug}?locale=en`);
  } catch {
    post = null;
  }

  if (!post) {
    return (
      <>
        <p className="muted">Article not found.</p>
        <p>
          <Link href="/news">Back to news</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <p className="muted">
        <Link href="/news">← News</Link>
      </p>
      <article>
        <h1 style={{ fontWeight: 400, fontSize: "2rem", marginBottom: "0.5rem" }}>
          {post.title}
        </h1>
        {post.excerpt && <p className="muted">{post.excerpt}</p>}
        <div style={{ marginTop: "1.5rem", maxWidth: "40rem" }}>
          <p style={{ whiteSpace: "pre-wrap" }}>{post.body}</p>
        </div>
      </article>
    </>
  );
}
