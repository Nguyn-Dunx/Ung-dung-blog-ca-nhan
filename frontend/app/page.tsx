// // app/page.tsx
// import { Post } from "@/lib/types";
// import PostList from "@/components/common/posts/PostList";

// // Server Component – gọi API backend
// async function fetchPosts(): Promise<Post[]> {
//   const res = await fetch("http://localhost:5000/api/posts", {
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

// Server Component – gọi API backend
async function fetchPosts(): Promise<Post[]> {
  try {
    const res = await fetch("http://localhost:5000/api/posts", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch posts");
    }

    const data = await res.json();

    // --- QUAN TRỌNG: LOG ĐỂ KIỂM TRA ---
    // Bạn hãy nhìn vào Terminal (nơi chạy npm run dev) để xem dòng này in ra gì
    console.log("📦 Data từ Backend gửi về:", data);

    // --- SỬA LỖI Ở ĐÂY ---
    // Kiểm tra xem backend trả về dạng { posts: [...] } hay { data: [...] }
    if (data.posts) return data.posts;
    if (data.data) return data.data;
    if (Array.isArray(data)) return data; // Trường hợp backend trả thẳng mảng

    return []; // Trả về mảng rỗng nếu không tìm thấy dữ liệu để tránh lỗi
  } catch (error) {
    console.error("Lỗi khi fetch posts:", error);
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
