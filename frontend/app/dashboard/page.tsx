import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardClient from "../../components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  // Fetch user profile from backend to get user info
  let userId: string | null = null;
  let userRole: string = "user";

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

  return <DashboardClient userId={userId} userRole={userRole} />;
}
