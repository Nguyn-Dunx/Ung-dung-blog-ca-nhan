"use client";

import { useState, useEffect } from "react";
import { Post } from "@/lib/types";
import { postsAPI, adminAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Edit2,
  Trash2,
  Undo2,
  Eye,
  Heart,
  Users,
  FileText,
  AlertCircle,
  Shield,
  UserX,
} from "lucide-react";
import Link from "next/link";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "response" in err) {
    const e = err as { response?: { data?: { message?: string } } };
    return e.response?.data?.message || "Request failed";
  }
  return "Request failed";
}

interface User {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  avatar?: string;
  role: "guest" | "user" | "admin";
  createdAt: string;
}

type TabType = "posts" | "users";
type PostsScope = "all" | "admin" | "trash";

function formatDateTime(dateStr?: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export default function AdminDashboardClient({
  userId,
}: {
  userId: string | null;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [postsScope, setPostsScope] = useState<PostsScope>("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [forceDeletingId, setForceDeletingId] = useState<string | null>(null);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "posts") {
      loadPosts(postsScope);
    } else {
      loadUsers();
    }
  }, [activeTab, postsScope]);

  const loadPosts = async (scope: PostsScope) => {
    try {
      setLoading(true);
      setError(null);

      // Admin dashboard always uses admin endpoint so we can support Trash.
      const response = await postsAPI.getAdminPosts({ scope });
      const postsData = response.data || response.posts || response;
      setPosts(Array.isArray(postsData) ? postsData : []);
    } catch (err: unknown) {
      console.error("Error loading posts:", err);
      setError(getErrorMessage(err) || "Failed to load posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminAPI.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error("Error loading users:", err);
      setError(getErrorMessage(err) || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi role
  const handleChangeRole = async (targetUserId: string, newRole: string) => {
    if (targetUserId === userId) {
      alert("Không thể thay đổi role của chính mình!");
      return;
    }

    try {
      setChangingRoleId(targetUserId);
      await adminAPI.setUserRole(targetUserId, newRole);
      // Cập nhật local state
      setUsers(
        users.map((u) =>
          u._id === targetUserId
            ? { ...u, role: newRole as "guest" | "user" | "admin" }
            : u
        )
      );
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err) || "Failed to change role";
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setChangingRoleId(null);
    }
  };

  // Xử lý xóa user
  const handleDeleteUser = async (targetUserId: string, username: string) => {
    if (targetUserId === userId) {
      alert("Không thể xóa tài khoản của chính mình!");
      return;
    }

    if (
      !confirm(
        `Bạn có chắc muốn xóa tài khoản "${username}"? Hành động này sẽ xóa toàn bộ bài viết và bình luận của người dùng này.`
      )
    ) {
      return;
    }

    try {
      setDeletingUserId(targetUserId);
      await adminAPI.deleteUser(targetUserId);
      setUsers(users.filter((u) => u._id !== targetUserId));
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err) || "Failed to delete user";
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      setDeletingId(id);
      await postsAPI.deletePost(id);
      setPosts(posts.filter((p) => p._id !== id));
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err) || "Failed to delete post";
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestorePost = async (id: string) => {
    if (!confirm("Khôi phục bài viết này?")) return;

    try {
      setRestoringId(id);
      await postsAPI.restorePost(id);
      // Remove from trash list
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err) || "Failed to restore post";
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setRestoringId(null);
    }
  };

  const handleForceDeletePost = async (id: string) => {
    if (!confirm("Xóa vĩnh viễn bài viết này? Hành động không thể hoàn tác.")) {
      return;
    }

    try {
      setForceDeletingId(id);
      await postsAPI.forceDeletePost(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err: unknown) {
      const errorMsg =
        getErrorMessage(err) || "Failed to permanently delete post";
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setForceDeletingId(null);
    }
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
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage all posts and users</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === "posts" ? "default" : "outline"}
            onClick={() => setActiveTab("posts")}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Posts ({posts.length})
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Users ({users.length})
          </Button>
        </div>

        {/* Error Alert */}
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

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div>
            <div className="mb-6">
              <Button asChild>
                <Link href="/posts/create">Create New Post</Link>
              </Button>
            </div>

            {/* Posts scopes */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={postsScope === "all" ? "default" : "outline"}
                onClick={() => setPostsScope("all")}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Tất cả
              </Button>
              <Button
                variant={postsScope === "admin" ? "default" : "outline"}
                onClick={() => setPostsScope("admin")}
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Bài viết của Admin
              </Button>
              <Button
                variant={postsScope === "trash" ? "default" : "outline"}
                onClick={() => setPostsScope("trash")}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Thùng rác
              </Button>
            </div>

            {posts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500 mb-4">
                    {postsScope === "trash"
                      ? "Thùng rác trống"
                      : "Không có bài viết"}
                  </p>
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
                                alt={
                                  post.author.fullName || post.author.username
                                }
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

                      {postsScope === "trash" ? (
                        <div className="space-y-3">
                          <div className="rounded-md border bg-gray-50 p-3 text-xs text-gray-700">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">Ngày xoá</span>
                              <span>
                                {formatDateTime(post.deletedAt ?? null) || "-"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-1">
                              <span className="font-medium">Người xoá</span>
                              <span>
                                {typeof post.deletedBy === "object" &&
                                post.deletedBy
                                  ? post.deletedBy.fullName ||
                                    post.deletedBy.username
                                  : "-"}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRestorePost(post._id)}
                              disabled={
                                restoringId === post._id ||
                                forceDeletingId === post._id
                              }
                              className="flex-1"
                            >
                              {restoringId === post._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Undo2 className="w-4 h-4" />
                              )}
                              Khôi phục
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleForceDeletePost(post._id)}
                              disabled={
                                forceDeletingId === post._id ||
                                restoringId === post._id
                              }
                            >
                              {forceDeletingId === post._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
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
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/posts/${post._id}/edit`}>
                              <Edit2 className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePost(post._id)}
                            disabled={deletingId === post._id}
                          >
                            {deletingId === post._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            {users.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No users found</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Username
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Full Name
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Joined
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr
                            key={user._id}
                            className={`border-b hover:bg-gray-50 ${
                              user._id === userId ? "bg-indigo-50" : ""
                            }`}
                          >
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                              <div className="flex items-center gap-2">
                                {user.username}
                                {user._id === userId && (
                                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                                    Bạn
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {user.fullName || "-"}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {user._id === userId ? (
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800`}
                                >
                                  {user.role}
                                </span>
                              ) : (
                                <select
                                  value={user.role}
                                  onChange={(e) =>
                                    handleChangeRole(user._id, e.target.value)
                                  }
                                  disabled={changingRoleId === user._id}
                                  className={`px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer
                                    ${
                                      user.role === "admin"
                                        ? "bg-purple-100 text-purple-800 border-purple-300"
                                        : user.role === "guest"
                                        ? "bg-gray-100 text-gray-800 border-gray-300"
                                        : "bg-blue-100 text-blue-800 border-blue-300"
                                    }
                                    ${
                                      changingRoleId === user._id
                                        ? "opacity-50"
                                        : "hover:opacity-80"
                                    }
                                  `}
                                >
                                  <option value="guest">Guest</option>
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                                </select>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {user._id !== userId && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    handleDeleteUser(user._id, user.username)
                                  }
                                  disabled={deletingUserId === user._id}
                                  className="h-8"
                                >
                                  {deletingUserId === user._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <UserX className="w-4 h-4" />
                                  )}
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
