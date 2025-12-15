// // app/page.tsx
// import { Post } from "@/lib/types";
// import PostList from "@/components/common/posts/PostList";

// // Server Component – gọi API backend
// async function fetchPosts(): Promise<Post[]> {
//   const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/posts", {
//     cache: "no-store",
//   });

//   if (!res.ok) {
//     throw new Error("Failed to fetch posts");
//   }

//   return res.json();
// }

// export default async function Home() {
//   const posts = await fetchPosts();

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="container mx-auto px-4">
//         {/* Hero Section */}
//         <div className="py-12 text-center">
//           <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
//             Welcome to Personal Blog
//           </h1>
//           <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//             Discover stories, thinking, and expertise from writers on any topic.
//           </p>
//         </div>

//         {/* Posts Section */}
//         <main className="flex justify-center pb-12">
//           <PostList posts={posts} />
//         </main>
//       </div>
//     </div>
//   );
// }
// app/page.tsx
import { Post } from "@/lib/types";
import PostList from "@/components/common/posts/PostList";
import { cookies } from "next/headers";

// Server Component – gọi API backend
async function fetchPosts(): Promise<Post[]> {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
      cache: "no-store",
      headers: {
        //  Backend dùng Cookie
        Cookie: cookieStore.toString(),
      },
    });

    if (!res.ok) {
      console.error("❌ Fetch posts failed:", res.status, res.statusText);
      return [];
    }

    const data = await res.json();

    // DEBUG: Log response để kiểm tra format
    console.log("📦 Data từ Backend gửi về:", data);

    // Kiểm tra xem backend trả về dạng nào
    if (data.data && Array.isArray(data.data)) {
      console.log("✅ Response format: { data: [...] }");
      return data.data;
    }

    if (data.posts && Array.isArray(data.posts)) {
      console.log("✅ Response format: { posts: [...] }");
      return data.posts;
    }

    if (Array.isArray(data)) {
      console.log("✅ Response format: [...]");
      return data;
    }

    console.warn("⚠️ Unexpected response format:", data);
    return [];
  } catch (error) {
    console.error("❌ Lỗi khi fetch posts:", error);
    return [];
  }
}

export default async function Home() {
  const posts = await fetchPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to Personal Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover stories, thinking, and expertise from writers on any topic.
          </p>
        </div>

        {/* Posts Section */}
        <main className="flex justify-center pb-12">
          {/* Bây giờ posts chắc chắn là mảng, không bị lỗi nữa */}
          <PostList posts={posts} />
        </main>
      </div>
    </div>
  );
}
