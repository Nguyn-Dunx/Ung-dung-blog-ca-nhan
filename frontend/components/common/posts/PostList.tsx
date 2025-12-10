// import { Post } from "@/lib/types";
// import PostCard from "./PostCard";

// type PostListProps = {
//   posts: Post[];
// };

// export default function PostList({ posts }: PostListProps) {
//   return (
//     <div className="w-full max-w-3xl space-y-4">
//       {posts.length === 0 && (
//         <div className="text-center text-sm text-gray-500">
//           Chưa có bài viết nào.
//         </div>
//       )}

//       {posts.map((post) => (
//         <PostCard key={post._id} post={post} />
//       ))}
//     </div>
//   );
// }
import { Post } from "@/lib/types";
import PostCard from "./PostCard";

type PostListProps = {
  posts: Post[];
};

export default function PostList({ posts }: PostListProps) {
  // --- ĐOẠN CODE THÊM MỚI ĐỂ SỬA LỖI ---
  console.log("Dữ liệu posts nhận được:", posts); // Xem log này ở Terminal hoặc F12

  // Nếu posts bị null, undefined, hoặc KHÔNG PHẢI MẢNG -> Return null hoặc thông báo lỗi nhẹ
  if (!posts || !Array.isArray(posts)) {
    return (
      <div className="text-red-500 p-4 border border-red-300 rounded">
        ⚠️ Lỗi dữ liệu: Backend không trả về danh sách bài viết hợp lệ.
        <br />
        (Kiểu dữ liệu nhận được: {typeof posts})
      </div>
    );
  }
  // ---------------------------------------

  return (
    <div className="w-full max-w-3xl space-y-4">
      {posts.length === 0 && (
        <div className="text-center text-sm text-gray-500">
          Chưa có bài viết nào.
        </div>
      )}

      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
}
