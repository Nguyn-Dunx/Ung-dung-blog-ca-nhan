import Image from "next/image";
import { Post } from "@/lib/types";

type PostCardProps = {
  post: Post;
};

// Format timestamp
function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";

  const time = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const date = d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${time} • ${date}`;
}

export default function PostCard({ post }: PostCardProps) {
  const authorName = post.author.fullName || post.author.username;
  const timeLabel = formatDateTime(post.createdAt);

  return (
    <article className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow duration-150">
      {/* Header: avatar + author + timestamp */}
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar (Next Image) */}
        <div className="relative w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
          {post.author.avatar ? (
            <Image
              src={post.author.avatar}
              alt={authorName}
              fill
              className="object-cover"
            />
          ) : (
            <span className="flex w-full h-full items-center justify-center text-sm font-semibold text-gray-600">
              {authorName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">
            {authorName}
          </span>
          <span className="text-xs text-gray-500">{timeLabel}</span>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-900 leading-snug">
        {post.title}
      </h2>
    </article>
  );
}
