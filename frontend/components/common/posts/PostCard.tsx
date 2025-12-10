"use client";

import Image from "next/image";
import Link from "next/link";
import { Post } from "@/lib/types";
import { Heart, Eye } from "lucide-react";

type PostCardProps = {
  post: Post;
};

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
  const excerpt = post.content?.substring(0, 150) + (post.content?.length > 150 ? '...' : '');

  return (
    <Link href={`/posts/${post._id}`}>
      <article className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer">
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
        <h2 className="text-lg font-semibold text-gray-900 leading-snug mb-2">
          {post.title}
        </h2>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{post.likes?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{post.views || 0}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
