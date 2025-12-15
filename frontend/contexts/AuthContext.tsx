"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/lib/types";
import { authAPI } from "@/lib/api";
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

  // ✅ IMPORTANT: keep client state in sync with server-provided user (cookie-based auth)
  // Without this, after login + router.refresh(), components may still see user=null until full reload.
  useEffect(() => {
    setUser(initialUser ?? null);
  }, [initialUser]);

  const login = async (emailOrUsername: string, password: string) => {
    setLoading(true);
    try {
      const response = await authAPI.login({ emailOrUsername, password });
      setUser(response.user ?? null);
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err) || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) => {
    setLoading(true);
    try {
      const response = await authAPI.register(data);
      setUser(response.user ?? null);
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err) || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authAPI.logout();
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      console.error("Logout error:", err);
    } finally {
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
