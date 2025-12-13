"use client";

import { Post } from "@/lib/types";
import PostCard from "./PostCard";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { postsAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Filter,
  Tag,
} from "lucide-react";

type PostListProps = {
  posts?: Post[];
  initialPosts?: Post[];
};

// Danh sách tags phổ biến (có thể fetch từ API sau)
const POPULAR_TAGS = [
  "Technology",
  "Lifestyle",
  "Travel",
  "Food",
  "Health",
  "Business",
  "Education",
  "Entertainment",
];

export default function PostList({ posts: initialPosts = [] }: PostListProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const LIMIT = 10;

  // Lấy search query từ URL params (từ Navbar)
  const searchQuery = searchParams.get("search") || "";

  // Filter states
  const [selectedTag, setSelectedTag] = useState("");
  const [tagInput, setTagInput] = useState(""); // Input cho tag tùy chỉnh
  const [showFilters, setShowFilters] = useState(false);

  // Fetch posts khi các filter thay đổi
  useEffect(() => {
    loadPosts();
  }, [currentPage, searchQuery, selectedTag]);

  // Reset về trang 1 khi search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getPosts({
        page: currentPage,
        limit: LIMIT,
        search: searchQuery || undefined,
        tag: selectedTag || undefined,
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

  const handleTagSelect = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(""); // Bỏ chọn nếu click lại
    } else {
      setSelectedTag(tag);
    }
    setCurrentPage(1); // Reset về trang 1
  };

  const clearAllFilters = () => {
    setSelectedTag("");
    setCurrentPage(1);
    // Clear search từ URL
    if (searchQuery) {
      window.location.href = "/";
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

  // Kiểm tra có filter nào đang active không
  const hasActiveFilters = searchQuery || selectedTag;

  if (!posts) {
    return (
      <div className="text-red-500 p-4 border border-red-300 rounded">
        ⚠️ Lỗi dữ liệu: Backend không trả về danh sách bài viết hợp lệ.
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl">
      {/* Filter Section */}
      <div className="mb-6 space-y-4">
        {/* Filter Toggle Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 ${
              showFilters ? "bg-indigo-50 border-indigo-300" : ""
            }`}
          >
            <Filter className="w-4 h-4" />
            Bộ lọc
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-indigo-600 text-white rounded-full">
                {(searchQuery ? 1 : 0) + (selectedTag ? 1 : 0)}
              </span>
            )}
          </Button>

          {/* Clear All Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Tags Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
                <Tag className="w-4 h-4" />
                Lọc theo Tag
              </div>

              {/* Custom Tag Input */}
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Nhập tag muốn tìm..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tagInput.trim()) {
                        handleTagSelect(tagInput.trim());
                        setTagInput("");
                      }
                    }}
                    className="pl-9 pr-4 py-2 w-full text-sm rounded-lg border-gray-200"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (tagInput.trim()) {
                      handleTagSelect(tagInput.trim());
                      setTagInput("");
                    }
                  }}
                  disabled={!tagInput.trim()}
                  className="px-4"
                >
                  Tìm
                </Button>
              </div>

              {/* Popular Tags */}
              <div className="text-xs text-gray-500 mb-2">Tags phổ biến:</div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagSelect(tag)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200
                      ${
                        selectedTag === tag
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">Đang lọc:</span>
            {searchQuery && (
              <span
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 
                rounded-full text-sm"
              >
                <Search className="w-3 h-3" />"{searchQuery}"
                <button
                  onClick={() => (window.location.href = "/")}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedTag && (
              <span
                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 
                rounded-full text-sm"
              >
                <Tag className="w-3 h-3" />#{selectedTag}
                <button
                  onClick={() => setSelectedTag("")}
                  className="ml-1 hover:text-indigo-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      {!loading && (
        <div className="mb-4 text-sm text-gray-600">
          {hasActiveFilters ? (
            <span>
              Tìm thấy <strong>{totalRows}</strong> bài viết
            </span>
          ) : (
            <span>
              Tổng cộng <strong>{totalRows}</strong> bài viết
            </span>
          )}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="text-gray-400 mb-3">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-600 font-medium">
            {hasActiveFilters
              ? "Không tìm thấy bài viết phù hợp"
              : "Chưa có bài viết nào"}
          </p>
          {hasActiveFilters && (
            <Button
              variant="link"
              onClick={clearAllFilters}
              className="mt-2 text-indigo-600"
            >
              Xóa bộ lọc và xem tất cả
            </Button>
          )}
        </div>
      )}

      {!loading && posts.length > 0 && (
        <>
          <div className="space-y-6 mb-8">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user?._id || null}
              />
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
