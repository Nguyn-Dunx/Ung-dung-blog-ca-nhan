import LandingPageNavbar from "@/components/common/LandingPageNavbar";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

async function getCurrentUser() {
  const c = await cookies();
  const token = c.get("accessToken")?.value;
  if (!token) return null;

  type JwtPayload = { fullName?: string | null; avatar?: string | null } | null;
  const decoded = jwt.decode(token) as JwtPayload;
  return {
    name: decoded?.fullName ?? null,
    image: decoded?.avatar ?? null,
  };
}

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <>
      <LandingPageNavbar user={user} />
      <main className="min-h-screen pt-14">{children}</main>
    </>
  );
}
