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
      <div className="lux-main">
        <div className="lux-page">
          <p className="muted">Article not found.</p>
          <Link href="/news">← Journal</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lux-main">
      <article className="lux-page">
        <p className="muted">
          <Link href="/news">← Journal</Link>
        </p>
        <time
          dateTime={post.publishedAt ?? undefined}
          className="lux-tile-label"
          style={{ display: "block", marginBottom: "0.75rem" }}
        >
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : ""}
        </time>
        <h1>{post.title}</h1>
        {post.excerpt && <p className="lux-lead">{post.excerpt}</p>}
        <div className="lux-prose">{post.body}</div>
      </article>
    </div>
  );
}
