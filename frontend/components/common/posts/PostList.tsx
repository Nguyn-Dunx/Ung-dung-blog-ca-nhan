"use client";

import { Post } from "@/lib/types";
import PostCard from "./PostCard";
import { useEffect, useState } from "react";
import { postsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

type PostListProps = {
  posts?: Post[];
  initialPosts?: Post[];
};

export default function PostList({ posts: initialPosts = [] }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const LIMIT = 10;

  // Fetch posts khi page thay đổi
  useEffect(() => {
    loadPosts();
  }, [currentPage]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getPosts({
        page: currentPage,
        limit: LIMIT,
      });

      // Xử lý response format từ backend
      const postsData = response.data || response.posts || [];
      const pagination = response.pagination || {};

      setPosts(Array.isArray(postsData) ? postsData : []);
      setTotalPages(pagination.totalPages || 1);
      setTotalRows(pagination.totalRows || 0);
    } catch (err: any) {
      console.error("Error loading posts:", err);
      setPosts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!posts) {
    return (
      <div className="text-red-500 p-4 border border-red-300 rounded">
        ⚠️ Lỗi dữ liệu: Backend không trả về danh sách bài viết hợp lệ.
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl">
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center text-sm text-gray-500 py-12">
          Chưa có bài viết nào.
        </div>
      )}

      {!loading && posts.length > 0 && (
        <>
          <div className="space-y-4 mb-8">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between py-8 border-t">
            <div className="text-sm text-gray-600">
              Trang {currentPage} của {totalPages} ({totalRows} bài viết)
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Trước
              </Button>

              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded ${
                        isActive
                          ? "bg-indigo-600 text-white font-semibold"
                          : "bg-white text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && <span className="text-gray-500">...</span>}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2"
              >
                Sau
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
