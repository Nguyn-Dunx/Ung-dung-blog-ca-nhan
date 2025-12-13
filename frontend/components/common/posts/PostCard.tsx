"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Post } from "@/lib/types";
import { postsAPI } from "@/lib/api";
import { Heart, Eye, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";

type PostCardProps = {
  post: Post;
  currentUserId?: string | null;
  onLikeUpdate?: (postId: string, likes: string[], isLiked: boolean) => void;
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

export default function PostCard({
  post,
  currentUserId,
  onLikeUpdate,
}: PostCardProps) {
  const [commentCount, setCommentCount] = useState<number>(
    post.commentCount || 0
  );
  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const router = useRouter();

  // Comment count được truyền từ backend, không cần fetch riêng
  useEffect(() => {
    setCommentCount(post.commentCount || 0);
  }, [post.commentCount]);

  // Check if current user has liked this post
  useEffect(() => {
    if (currentUserId && post.likes) {
      setIsLiked(post.likes.includes(currentUserId));
      setLikes(post.likes);
    }
  }, [currentUserId, post.likes]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn Link navigate
    e.stopPropagation(); // Ngăn event bubble up

    if (!currentUserId) {
      router.push("/auth/login");
      return;
    }

    try {
      setLikeLoading(true);
      // Optimistic update
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      const newLikes = newIsLiked
        ? [...likes, currentUserId]
        : likes.filter((id) => id !== currentUserId);
      setLikes(newLikes);

      // Call API
      const response = await postsAPI.likePost(post._id);

      // Update với data từ server
      setLikes(response.likes || newLikes);
      setIsLiked(response.isLiked);

      // Callback để parent component cập nhật nếu cần
      if (onLikeUpdate) {
        onLikeUpdate(post._id, response.likes, response.isLiked);
      }
    } catch (error: any) {
      // Revert on error
      setIsLiked(!isLiked);
      setLikes(post.likes || []);
      console.error("Error liking post:", error);
      if (error.response?.status === 401) {
        router.push("/auth/login");
      }
    } finally {
      setLikeLoading(false);
    }
  };

  const authorName = post.author.fullName || post.author.username;
  const timeLabel = formatDateTime(post.createdAt);
  const excerpt =
    post.content?.substring(0, 150) + (post.content?.length > 150 ? "..." : "");

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

        {/* Featured Image */}
        {post.image && (
          <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900 leading-snug mb-2">
          {post.title}
        </h2>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{excerpt}</p>
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
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200
              hover:bg-red-50 active:scale-95
              ${isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"}
              ${likeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            <span>{likes.length}</span>
          </button>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{post.views || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{commentCount}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
