import PostList from "@/components/common/posts/PostList";
import { Post } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch(`${API_BASE}/api/posts`, { cache: "no-store" });

  if (!res.ok) {
    return [];
  }

  const json = await res.json();
  return Array.isArray(json.data) ? (json.data as Post[]) : [];
}

export default async function Home() {
  const posts = await fetchPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <main className="flex justify-center mt-8 pb-12">
          <PostList posts={posts} />
        </main>
      </div>
    </div>
  );
}
