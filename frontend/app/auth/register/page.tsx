"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash, FaCamera } from "react-icons/fa";

import Auth from "../page"; // chỉnh lại nếu layout Auth ở chỗ khác

interface RegisterInput {
  name: string;
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // State cho avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RegisterInput>();

  // Handler cho việc chọn avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Tạo preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  // Handler để mở file picker
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: RegisterInput) => {
    try {
      setLoading(true);
      setServerError(null);

      // Sử dụng FormData để gửi cả file avatar
      const formData = new FormData();
      formData.append("fullName", data.name);
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);

      // Thêm avatar nếu có
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          // KHÔNG set Content-Type header khi gửi FormData, browser sẽ tự set
          credentials: "include", // QUAN TRỌNG: để browser nhận httpOnly cookie
          body: formData,
        }
      );

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.message || "Register failed");
        return;
      }

      // Đăng ký thành công, token đã nằm trong cookie httpOnly
      // Tuỳ bạn muốn redirect đi đâu
      router.push("/auth/login"); // hoặc "/"
    } catch (error) {
      console.error(error);
      setServerError("Cannot connect to server");
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
            Create a new account
          </h2>

          {/* Avatar Upload - Hình tròn, ở trên cùng */}
          <div className="flex flex-col items-center mb-2">
            <div
              onClick={handleAvatarClick}
              className="relative w-24 h-24 rounded-full border-2 border-dashed border-gray-300 
                cursor-pointer hover:border-blue-500 transition-colors overflow-hidden
                flex items-center justify-center bg-gray-50 group"
            >
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400 group-hover:text-blue-500 transition-colors">
                  <FaCamera className="text-2xl mb-1" />
                  <span className="text-xs">Add Photo</span>
                </div>
              )}
              {/* Overlay khi hover nếu đã có ảnh */}
              {avatarPreview && (
                <div
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                  transition-opacity flex items-center justify-center"
                >
                  <FaCamera className="text-white text-xl" />
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <span className="text-xs text-gray-500 mt-1">Avatar</span>
          </div>

          {/* Lỗi từ server */}
          {serverError && (
            <div className="w-full p-2 text-sm rounded-md bg-red-100 text-red-700">
              {serverError}
            </div>
          )}

          {/* Full name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="nameInput" className="font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              {...register("name", { required: "Full name is required" })}
              id="nameInput"
              placeholder="Your full name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500 
                placeholder:text-gray-400"
            />
            {errors.name && (
              <span className="text-red-500 text-sm">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="usernameInput"
              className="font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              {...register("username", {
                required: "Username is required",
                pattern: {
                  value: /^[a-zA-Z0-9_]{3,16}$/,
                  message: "3–16 characters, letters, numbers, underscore",
                },
              })}
              id="usernameInput"
              placeholder="yourusername"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500 
                placeholder:text-gray-400"
            />
            {errors.username && (
              <span className="text-red-500 text-sm">
                {errors.username.message}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label htmlFor="emailInput" className="font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email format",
                },
              })}
              id="emailInput"
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500 
                placeholder:text-gray-400"
            />
            {errors.email && (
              <span className="text-red-500 text-sm">
                {errors.email.message}
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
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                    message:
                      "At least 8 characters, include a number and a letter",
                  },
                })}
                id="passwordInput"
                placeholder="Enter password"
                autoComplete="new-password"
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 
                  placeholder:text-gray-400"
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
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

          {/* Confirm password */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="passwordConfirmInput"
              className="font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPasswordConfirm ? "text" : "password"}
                {...register("password_confirmation", {
                  required: "Password confirmation is required",
                  validate: (value) =>
                    value === getValues("password") || "Passwords do not match",
                })}
                id="passwordConfirmInput"
                placeholder="Repeat password"
                autoComplete="new-password"
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 
                  placeholder:text-gray-400"
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              >
                {showPasswordConfirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.password_confirmation && (
              <span className="text-red-500 text-sm">
                {errors.password_confirmation.message}
              </span>
            )}
          </div>

          {/* Submit */}
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
            {loading ? "Processing..." : "Register"}
          </button>

          {/* Link sang login */}
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-700 font-medium">
                Login
              </Link>
            </span>
          </div>
        </form>
      </div>
    </Auth>
  );
}
