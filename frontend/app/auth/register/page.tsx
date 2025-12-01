"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import Auth from "../page"; // chỉnh path nếu không đúng

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

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RegisterInput>();

  const onSubmit = (data: RegisterInput) => {
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
            Create a new account
          </h2>

          {/* Name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="nameInput" className="font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              {...register("name", { required: "Full name is required" })}
              id="nameInput"
              placeholder="Your full name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
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

          {/* Password Confirmation */}
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
            className="w-full py-2 mt-2 bg-blue-600 text-white font-semibold 
              rounded-lg hover:bg-blue-700 active:scale-[0.98] transition"
          >
            Register
          </button>

          {/* Links */}
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
