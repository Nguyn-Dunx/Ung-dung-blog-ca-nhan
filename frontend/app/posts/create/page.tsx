import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import CreatePostForm from "@/components/posts/CreatePostForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function CreatePostPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  // Fetch user profile to check role
  let userRole = "user";
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
      {
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    if (response.ok) {
      const data = await response.json();
      userRole = data.user?.role || data.role || "user";
    }
  } catch (err) {
    console.error("Failed to fetch user profile:", err);
  }

  // Nếu là guest, hiển thị thông báo
  if (userRole === "guest") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Cần nâng cấp tài khoản
                </h1>
                <p className="text-gray-600 max-w-md">
                  Tài khoản{" "}
                  <span className="font-semibold text-orange-600">Guest</span>{" "}
                  của bạn chỉ có thể xem bài viết, bình luận và thích bài viết.
                  Để đăng bài viết mới, vui lòng liên hệ Admin để được nâng cấp
                  lên tài khoản{" "}
                  <span className="font-semibold text-blue-600">User</span>.
                </p>
                <div className="flex gap-4 mt-4">
                  <Button asChild variant="outline">
                    <Link href="/">Quay về trang chủ</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/dashboard">Xem Dashboard</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Create New Post
        </h1>
        <CreatePostForm />
      </div>
    </div>
  );
}
