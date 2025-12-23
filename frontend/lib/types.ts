// User types
export type Author = {
  _id: string;
  username: string;
  fullName?: string;
  email?: string;
  avatar?: string;
  role?: "guest" | "user" | "admin";
};

export type User = Author;

// Post types
export type Post = {
  _id: string;
  title: string;
  content: string;
  image?: string;
  imageId?: string;
  author: Author;
  likes: string[];
  tags: string[];
  views: number;
  commentCount?: number;
  createdAt: string;
  updatedAt: string;

  // Soft delete
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: Author | string | null;
};

// Comment types
export type CommentEditHistoryEntry = {
  content: string;
  editedAt: string;
  editedBy?: Author | string | null;
};

export type Comment = {
  _id: string;
  post: string;
  user: Author;
  content: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;

  // Not included in list responses by default; fetched via dedicated endpoint
  editHistory?: CommentEditHistoryEntry[];

  // Soft delete
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: Author | string | null;
};

// API Response types
export type PostsResponse = {
  success: boolean;
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    totalRows: number;
    totalPages: number;
  };
};

export type AuthResponse = {
  message: string;
  user: User;
  token?: string;
};
