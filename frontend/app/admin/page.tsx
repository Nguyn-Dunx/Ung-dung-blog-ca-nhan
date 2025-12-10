import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AdminDashboardClient from "../../components/admin/AdminDashboardClient";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  // Fetch user profile from backend to check role
  let userId: string | null = null;
  let userRole: string = "user";

  try {
    const response = await fetch("http://localhost:5000/api/auth/profile", {
      headers: {
        Cookie: cookieStore.toString(),
      },
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      const user = data.user || data;
      userId = user._id || null;
      userRole = user.role || "user";
    } else {
      redirect("/auth/login");
    }
  } catch (err) {
    console.error("Failed to fetch user profile:", err);
    redirect("/auth/login");
  }

  // Only allow admin access
  if (userRole !== "admin") {
    redirect("/dashboard");
  }

  return <AdminDashboardClient userId={userId} />;
}
