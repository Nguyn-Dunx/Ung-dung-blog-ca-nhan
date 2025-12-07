// app/page.tsx
import { Post } from "@/lib/types";
import PostList from "@/components/common/posts/PostList";

// Server Component – gọi API backend
async function fetchPosts(): Promise<Post[]> {
  const res = await fetch("http://localhost:5000/api/posts", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }

  return res.json();
}

export default async function Home() {
  const posts = await fetchPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        {/* Navbar đã được render trong RootLayout, không cần gọi lại ở đây */}

        {/* Cột post – căn giữa, ~80% chiều ngang (max-w-3xl tương đương ~768px) */}
        <main className="flex justify-center mt-8 pb-12">
          <PostList posts={posts} />
        </main>
      </div>
    </div>
  );
}
