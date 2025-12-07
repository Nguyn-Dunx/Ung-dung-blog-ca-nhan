"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface NavbarUser {
  name?: string | null;
  image?: string | null;
}

interface NavbarProps {
  user?: NavbarUser | null;
}

const LandingPageNavbar = ({ user }: NavbarProps) => {
  return (
    <header className="fixed top-0 z-50 w-full bg-white border-b border-b-gray-200 shadow-sm">
      <div className="container flex h-14 items-center justify-between mx-auto px-20">
        {/* --- PHẦN 1: LOGO & SEARCH --- */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/Logo.png"
              alt="logo"
              width={48}
              height={48}
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
              priority
            />
          </Link>

          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-[35vw] sm:w-[45vw] rounded-xl border border-gray-300 py-2 pl-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 p-2 hover:bg-indigo-100 rounded-xl cursor-pointer">
              <Image
                src={"/loupe.png"}
                alt="Search Icon"
                width={20}
                height={20}
              />
            </div>
          </div>
        </div>

        {/* --- PHẦN 2: MENU BÊN PHẢI --- */}
        <div className="flex items-center gap-4">
          {user ? (
            // === ĐÃ ĐĂNG NHẬP ===
            <>
              <Button
                asChild
                variant="outline"
                className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2"
              >
                <Link href="/create-post" className="font-bold">
                  Create Post
                </Link>
              </Button>

              <Link href="/dashboard" className="ml-2">
                <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-300">
                  {/* Dùng <img> để tránh lỗi domain next/image */}
                  <img
                    src={user.image || "/default-avatar.png"}
                    alt={user.name || "User Avatar"}
                    className="object-cover h-full w-full"
                  />
                </div>
              </Link>
            </>
          ) : (
            // === KHÁCH (CHƯA LOGIN) ===
            <>
              <Link
                href="/auth/login"
                className="font-medium text-gray-500 hidden text-center sm:inline-flex py-2 hover:text-indigo-600"
              >
                Login
              </Link>

              <Button
                asChild
                variant="outline"
                className="border-2 border-indigo-600 bg-transparent text-black hover:bg-indigo-600 hover:text-white px-2 py-2"
              >
                <Link
                  href="/auth/register"
                  className="font-medium text-indigo-600 hidden text-center sm:inline-flex"
                >
                  Create account
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default LandingPageNavbar;
