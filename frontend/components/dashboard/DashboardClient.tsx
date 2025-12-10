"use client";

import { useState, useEffect } from "react";
import { Post } from "@/lib/types";
import { postsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Edit2, Trash2, Eye, Heart, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardClient({
  userId,
  userRole,
}: {
  userId: string | null;
  userRole: string;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadPosts();
  }, [userId, userRole]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await postsAPI.getPosts();
      const postsData = response.data || response.posts || response;
      const allPosts = Array.isArray(postsData) ? postsData : [];

      // Filter posts based on user role
      if (userRole === "admin") {
        // Admin can see all posts
        setPosts(allPosts);
      } else {
        // Regular users only see their own posts
        const filteredPosts = allPosts.filter(
          (post) => post.author && post.author._id === userId
        );
        setPosts(filteredPosts);
      }
    } catch (err: any) {
      console.error("Error loading posts:", err);
      setError("Failed to load posts. Please try again.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      setDeletingId(id);
      await postsAPI.deletePost(id);
      setPosts(posts.filter((p) => p._id !== id));
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to delete post";
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setDeletingId(null);
    }
  };

  const canEdit = (post: Post): boolean => {
    return userRole === "admin" || (post.author && post.author._id === userId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {userRole === "admin" ? "All Posts (Admin)" : "My Posts"}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {userRole === "admin"
                ? "Manage all posts in the system"
                : "Manage your published posts"}
            </p>
          </div>
          <Button asChild>
            <Link href="/posts/create">Create New Post</Link>
          </Button>
        </div>

        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </CardContent>
          </Card>
        )}

        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">
                You haven't created any posts yet.
              </p>
              <Button asChild>
                <Link href="/posts/create">Create Your First Post</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card
                key={post._id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                {post.image && (
                  <div className="relative h-48 w-full bg-gray-200">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {post.content}
                  </p>

                  {post.author && (
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                      <div className="h-6 w-6 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center shrink-0">
                        {post.author.avatar ? (
                          <img
                            src={post.author.avatar}
                            alt={post.author.fullName || post.author.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-gray-600">
                            {(post.author.fullName || post.author.username)
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="text-xs">
                        <p className="font-medium text-gray-800">
                          {post.author.fullName || post.author.username}
                        </p>
                        {post.createdAt && (
                          <p className="text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.views || 0}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="flex-1"
                    >
                      <Link href={`/posts/${post._id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    {canEdit(post) && (
                      <>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/posts/${post._id}/edit`}>
                            <Edit2 className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(post._id)}
                          disabled={deletingId === post._id}
                        >
                          {deletingId === post._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
