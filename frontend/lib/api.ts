import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL}`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies
});

// IMPORTANT: Add interceptor to handle FormData correctly
// When sending FormData, axios should NOT set Content-Type header
// so browser can set it with proper boundary
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    // Remove Content-Type header for FormData - let browser set it
    delete config.headers["Content-Type"];
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    avatar?: string;
  }) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  login: async (data: { emailOrUsername: string; password: string }) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.post("/auth/change-password", data);
    return response.data;
  },
};

// Posts API
export const postsAPI = {
  getPosts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tag?: string;
  }) => {
    const response = await api.get("/posts", { params });
    return response.data;
  },

  getPost: async (id: string) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  createPost: async (formData: FormData) => {
    // IMPORTANT: Do NOT set Content-Type header for FormData
    // axios will automatically detect FormData and let browser set multipart/form-data with proper boundary
    const response = await api.post("/posts", formData);
    return response.data;
  },

  updatePost: async (id: string, formData: FormData) => {
    // IMPORTANT: Do NOT set Content-Type header for FormData
    // axios will automatically detect FormData and let browser set multipart/form-data with proper boundary
    const response = await api.put(`/posts/${id}`, formData);
    return response.data;
  },

  deletePost: async (id: string) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  likePost: async (id: string) => {
    const response = await api.put(`/posts/${id}/like`);
    return response.data;
  },
};

// Comments API
export const commentsAPI = {
  getComments: async (postId: string) => {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  },

  addComment: async (postId: string, content: string) => {
    const response = await api.post(`/posts/${postId}/comments`, { content });
    return response.data;
  },

  updateComment: async (postId: string, commentId: string, content: string) => {
    const response = await api.put(`/posts/${postId}/comments/${commentId}`, {
      content,
    });
    return response.data;
  },

  deleteComment: async (postId: string, commentId: string) => {
    const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getUsers: async () => {
    const response = await api.get("/auth/users");
    return response.data;
  },

  setUserRole: async (userId: string, role: string) => {
    const response = await api.put(`/auth/users/${userId}/role`, { role });
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await api.delete(`/auth/users/${userId}`);
    return response.data;
  },
};

export default api;
