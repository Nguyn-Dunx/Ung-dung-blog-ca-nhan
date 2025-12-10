"use client";

import { useState, useEffect } from "react";
import { Post, Comment } from "@/lib/types";
import { commentsAPI, postsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  MessageCircle,
  Eye,
  Calendar,
  User,
  Loader2,
  Trash2,
  Edit2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PostDetailClient({
  post: initialPost,
  currentUserId,
}: {
  post: Post;
  currentUserId: string | null;
}) {
  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadComments();
    // Check if current user has liked this post
    if (currentUserId && initialPost.likes) {
      setLiked(initialPost.likes.includes(currentUserId));
    }
  }, [post._id, currentUserId, initialPost.likes]);

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      const data = await commentsAPI.getComments(post._id);
      setComments(data);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!currentUserId) {
      router.push("/auth/login");
      return;
    }

    try {
      // Optimistic update
      const newLiked = !liked;
      setLiked(newLiked);

      // Update likes count immediately
      setPost((prev) => ({
        ...prev,
        likes: newLiked
          ? [...(prev.likes || []), currentUserId]
          : (prev.likes || []).filter((id) => id !== currentUserId),
      }));

      // Call API
      await postsAPI.likePost(post._id);
    } catch (error: any) {
      // Revert on error
      setLiked(!liked);
      setPost((prev) => ({
        ...prev,
        likes: initialPost.likes,
      }));
      console.error("Error liking post:", error);
      if (error.response?.status === 401) {
        router.push("/auth/login");
      }
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      const comment = await commentsAPI.addComment(post._id, newComment);
      setComments([comment, ...comments]);
      setNewComment("");
    } catch (error: any) {
      console.error("Error adding comment:", error);
      if (error.response?.status === 401) {
        router.push("/auth/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editingContent.trim()) return;

    try {
      setLoading(true);
      const updatedComment = await commentsAPI.updateComment(
        post._id,
        commentId,
        editingContent
      );
      setComments(
        comments.map((c) => (c._id === commentId ? updatedComment : c))
      );
      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      console.error("Error editing comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await commentsAPI.deleteComment(post._id, commentId);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const startEditComment = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditingContent(comment.content);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Post Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            {/* Author Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                {post.author.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.fullName || post.author.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex w-full h-full items-center justify-center text-lg font-semibold text-gray-600">
                    {(post.author.fullName || post.author.username)
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {post.author.fullName || post.author.username}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDateTime(post.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Featured Image */}
            {post.image && (
              <div className="relative w-full h-96 mb-6 rounded-lg overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={liked ? "text-red-500" : "text-gray-600"}
              >
                <Heart
                  className={`w-5 h-5 mr-2 ${liked ? "fill-current" : ""}`}
                />
                {post.likes?.length || 0} Likes
              </Button>
              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle className="w-5 h-5" />
                <span>{comments.length} Comments</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Eye className="w-5 h-5" />
                <span>{post.views} Views</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Comments ({comments.length})
            </h2>

            {/* Add Comment Form */}
            <div className="mb-6">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-3"
                rows={3}
              />
              <Button
                onClick={handleAddComment}
                disabled={loading || !newComment.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post Comment"
                )}
              </Button>
            </div>

            {/* Comments List */}
            {commentsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="border-b border-gray-200 pb-4 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                        {comment.user.avatar ? (
                          <Image
                            src={comment.user.avatar}
                            alt={comment.user.fullName || comment.user.username}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex w-full h-full items-center justify-center text-sm font-semibold text-gray-600">
                            {(comment.user.fullName || comment.user.username)
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <span className="font-semibold text-gray-900">
                              {comment.user.fullName || comment.user.username}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">
                              {formatDateTime(comment.createdAt)}
                              {comment.isEdited && " (edited)"}
                            </span>
                          </div>
                          {currentUserId &&
                            currentUserId === comment.user._id && (
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditComment(comment)}
                                  className="h-8 px-2"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteComment(comment._id)
                                  }
                                  className="h-8 px-2 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                        </div>
                        {editingCommentId === comment._id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingContent}
                              onChange={(e) =>
                                setEditingContent(e.target.value)
                              }
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEditComment(comment._id)}
                                disabled={loading}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditingContent("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700">{comment.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
