"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/lib/types"; // Đảm bảo đường dẫn import đúng
import { authAPI } from "@/lib/api"; // Đảm bảo đường dẫn import đúng
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hàm helper để lấy thông báo lỗi sạch đẹp
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "response" in err) {
    const e = err as { response?: { data?: { message?: string } } };
    return e.response?.data?.message || "Request failed";
  }
  return "Request failed";
}

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Đồng bộ State Client với Server
  // Khi reload trang, initialUser sẽ có dữ liệu mới, cập nhật vào state
  useEffect(() => {
    setUser(initialUser ?? null);
  }, [initialUser]);

  const login = async (emailOrUsername: string, password: string) => {
    setLoading(true);
    try {
      // 1. Gọi API Login (Backend set cookie vào trình duyệt)
      await authAPI.login({ emailOrUsername, password });

      // 2. QUAN TRỌNG: Sử dụng window.location.href thay vì router.push
      // Lý do: Ép trình duyệt tải lại trang hoàn toàn để gửi Cookie mới lên Next.js Server
      // Khắc phục triệt để lỗi "đăng nhập xong phải F5 mới nhận"
      window.location.href = "/";
    } catch (err: unknown) {
      // Nếu lỗi thì tắt loading để user thử lại
      setLoading(false);
      throw new Error(getErrorMessage(err) || "Login failed");
    }
    // Không cần finally setLoading(false) ở đây vì trang sẽ reload ngay
  };

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) => {
    setLoading(true);
    try {
      await authAPI.register(data);
      // Tương tự login: Reload để nhận diện user mới
      window.location.href = "/";
    } catch (err: unknown) {
      setLoading(false);
      throw new Error(getErrorMessage(err) || "Registration failed");
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authAPI.logout();
      // Reload để xóa sạch trạng thái và cookie cũ
      window.location.href = "/auth/login";
    } catch (err: unknown) {
      console.error("Logout error:", err);
      setLoading(false);
    }
  };

  const refreshUser = () => {
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
