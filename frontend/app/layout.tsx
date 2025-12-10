import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LandingPageNavbar from "@/components/common/LandingPageNavbar";
import { AuthProvider } from "@/contexts/AuthContext";
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal Blog - Share Your Stories",
  description: "A minimalist blog platform for sharing your thoughts and stories",
  icons: {
    icon: "/Logo.png",
  },
};

interface AppJwtPayload extends JwtPayload {
  id?: string;
  fullName?: string;
  avatar?: string;
  username?: string;
}

interface NavbarUser {
  _id: string;
  username: string;
  fullName?: string;
  avatar?: string;
}

async function getCurrentUser(): Promise<NavbarUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.decode(token) as AppJwtPayload | null;
    if (!decoded) return null;

    return {
      _id: decoded.id || '',
      username: decoded.username || '',
      fullName: decoded.fullName || undefined,
      avatar: decoded.avatar || undefined,
    };
  } catch (err) {
    console.error("Failed to decode JWT:", err);
    return null;
  }
}

// 3. Layout cũng phải là ASYNC để await được getCurrentUser
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <AuthProvider initialUser={user}>
          <LandingPageNavbar user={user} />
          <main className="min-h-screen pt-14">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
