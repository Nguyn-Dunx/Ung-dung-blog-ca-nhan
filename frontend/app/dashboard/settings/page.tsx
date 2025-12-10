import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ChangePasswordClient from "@/components/dashboard/ChangePasswordClient";

export default async function SettingsPage() {
  // Check if user is logged in
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Cài đặt tài khoản
          </h1>
          <p className="text-gray-600 mt-2">
            Quản lý mật khẩu và các cài đặt bảo mật của bạn
          </p>
        </div>

        <ChangePasswordClient />
      </div>
    </div>
  );
}
