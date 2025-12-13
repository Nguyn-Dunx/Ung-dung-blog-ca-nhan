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
};

// Comment types
export type Comment = {
  _id: string;
  post: string;
  user: Author;
  content: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
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
