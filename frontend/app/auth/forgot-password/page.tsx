"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Auth from "../page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface ForgotPasswordInput {
  username: string;
  email: string;
}

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>();

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setTempPassword(null);

      const res = await fetch(
        "http://localhost:5000/api/auth/forget-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: data.username,
            email: data.email,
          }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        const errorMessage = json.message || "Failed to reset password";
        setError(errorMessage);
        return;
      }

      // Temporary password has been created
      setSuccess(json.message || "Temporary password created successfully");
      setTempPassword(json.tempPassword || "Check your terminal/email");

      // Show success message for 5 seconds then redirect
      setTimeout(() => {
        router.push("/auth/login");
      }, 5000);
    } catch (error) {
      console.error("Forgot Password Error:", error);
      setError("Cannot connect to server. Please try again later.");
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
            Forgot Password
          </h2>
          <p className="text-sm text-gray-600 text-center mb-4">
            Enter your username and email to reset your password
          </p>

          {/* Error Alert */}
          {error && (
            <div className="w-full p-3 rounded-md bg-red-100 text-red-700 border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-800">{success}</p>
                    {tempPassword && (
                      <div className="mt-3 bg-white p-3 rounded border border-green-200">
                        <p className="text-xs text-gray-600 mb-1">
                          Temporary Password:
                        </p>
                        <p className="font-mono text-sm font-bold text-green-700 break-all">
                          {tempPassword}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Use this password to login, then change it to a new
                          one.
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-green-700 mt-3">
                      Redirecting to login in 5 seconds...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Username */}
          {!success && (
            <>
              <div className="flex flex-col gap-1">
                <Label htmlFor="username" className="font-medium text-gray-700">
                  Username
                </Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  {...register("username", {
                    required: "Username is required",
                  })}
                  disabled={loading}
                />
                {errors.username && (
                  <span className="text-red-500 text-sm">
                    {errors.username.message}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="email" className="font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email format",
                    },
                  })}
                  disabled={loading}
                />
                {errors.email && (
                  <span className="text-red-500 text-sm">
                    {errors.email.message}
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
                {loading ? "Processing..." : "Get Temporary Password"}
              </button>
            </>
          )}

          {/* Links */}
          {!success && (
            <div className="flex items-center justify-center gap-2 text-sm mt-4">
              <span className="text-gray-600">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-700 font-medium hover:underline"
                >
                  Login
                </Link>
              </span>
            </div>
          )}
        </form>
      </div>
    </Auth>
  );
}
