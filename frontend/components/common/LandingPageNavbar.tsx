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
    <header className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 backdrop-blur-sm">
      <div className="container mx-auto h-14 flex items-center justify-between px-4 md:px-10 lg:px-20">
        {/* LEFT: LOGO + SEARCH */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/Logo.png"
              alt="logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
          </Link>

          {/* Search */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search..."
              className="w-[30vw] md:w-[35vw] lg:w-[40vw] rounded-lg border border-gray-300 py-2 pl-3 pr-10 
              focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-md cursor-pointer">
              <Image src="/loupe.png" alt="search" width={18} height={18} />
            </div>
          </div>
        </div>

        {/* RIGHT: USER MENU */}
        <div className="flex items-center gap-3">
          {user ? (
            // Logged-in
            <>
              <Link
                href="/dashboard"
                className="hidden sm:inline text-gray-600 hover:text-indigo-600 font-medium"
              >
                Dashboard
              </Link>

              <Link href="/dashboard" className="flex items-center">
                <div className="h-9 w-9 rounded-full overflow-hidden border border-gray-300">
                  <Image
                    src={user.image || "/default-avatar.png"}
                    alt={user.name || "User Avatar"}
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </div>
              </Link>
            </>
          ) : (
            // Guest
            <>
              <Link
                href="/auth/login"
                className="text-gray-600 font-medium hover:text-indigo-600 hidden sm:block"
              >
                Login
              </Link>

              <Button
                asChild
                variant="outline"
                className="border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white px-3 py-1.5 text-sm"
              >
                <Link href="/auth/register">Create account</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default LandingPageNavbar;
