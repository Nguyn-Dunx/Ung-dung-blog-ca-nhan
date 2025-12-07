import { Post } from "@/lib/types";
import PostCard from "./PostCard";

type PostListProps = {
  posts: Post[];
};

export default function PostList({ posts }: PostListProps) {
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
