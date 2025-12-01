"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import Auth from "../page"; // chỉnh path nếu Auth không đúng

interface LoginInput {
  identifier: string; // email hoặc username
  password: string;
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>();

  const onSubmit = (data: LoginInput) => {
    console.log(data);
  };

  return (
    <Auth>
      <div className="flex flex-col justify-start px-6 pt-6 w-full">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 w-full"
        >
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">
            Sign in to your account
          </h2>

          {/* Email or Username */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="identifierInput"
              className="font-medium text-gray-700"
            >
              Email or Username
            </label>

            <input
              type="text"
              {...register("identifier", {
                required: "Email or Username is required",
              })}
              id="identifierInput"
              placeholder="you@example.com or yourusername"
              autoComplete="username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500 
                placeholder:text-gray-400"
            />

            {errors.identifier && (
              <span className="text-red-500 text-sm">
                {errors.identifier.message}
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
                      "Password must be at least 8 characters, include a number and a letter",
                  },
                })}
                id="passwordInput"
                placeholder="Enter your password"
                autoComplete="current-password"
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

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2 mt-2 bg-blue-600 text-white font-semibold 
              rounded-lg hover:bg-blue-700 active:scale-[0.98] transition"
          >
            Login
          </button>

          {/* Links */}
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">
              Don’t have an account?{" "}
              <Link href="/auth/register" className="text-blue-700 font-medium">
                Register
              </Link>
            </span>

            <Link href="/change-password" className="text-blue-700 font-medium">
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </Auth>
  );
}
