"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Giả sử Auth layout của bạn nằm ở đây, nếu khác hãy sửa lại path
import Auth from "../page";

interface LoginInput {
  emailOrUsername: string;
  password: string;
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>();

  const onSubmit = async (data: LoginInput) => {
    try {
      setLoading(true);
      setServerError(null);

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // QUAN TRỌNG: Để server set cookie httpOnly vào trình duyệt
        credentials: "include",
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        // Lấy thông báo lỗi từ backend
        const errorMessage = json.message || json.error || "Login failed";
        setServerError(errorMessage);
        return;
      }

      // === THÀNH CÔNG ===

      // 1. Refresh router để Layout (Server Component) render lại và cập nhật Navbar
      router.refresh();

      // 2. Chuyển hướng về trang chủ
      router.push("/");
    } catch (error) {
      console.error("Login Error:", error);
      setServerError("Cannot connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Auth>
      <div className="flex flex-col justify-start px-6 pt-6 w-full">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 w-full"
        >
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">
            Login to your account
          </h2>

          {/* Hiển thị lỗi Server nếu có */}
          {serverError && (
            <div className="w-full p-2 text-sm rounded-md bg-red-100 text-red-700 border border-red-200">
              {serverError}
            </div>
          )}

          {/* Email or Username */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="emailOrUsername"
              className="font-medium text-gray-700"
            >
              Email or Username
            </label>
            <input
              type="text"
              {...register("emailOrUsername", {
                required: "Email or username is required",
              })}
              id="emailOrUsername"
              placeholder="you@example.com or yourusername"
              autoComplete="username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500 
                placeholder:text-gray-400"
            />
            {errors.emailOrUsername && (
              <span className="text-red-500 text-sm">
                {errors.emailOrUsername.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="passwordInput"
              className="font-medium text-gray-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                })}
                id="passwordInput"
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 
                  placeholder:text-gray-400"
              />

              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 transition"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {errors.password && (
              <span className="text-red-500 text-sm">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-2 bg-blue-600 text-white font-semibold 
              rounded-lg hover:bg-blue-700 active:scale-[0.98] transition
              disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {loading ? "Processing..." : "Login"}
          </button>

          {/* Links */}
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="text-blue-700 font-medium hover:underline"
              >
                Register
              </Link>
            </span>

            <Link
              href="/auth/forgot-password"
              className="text-blue-700 font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </Auth>
  );
}
