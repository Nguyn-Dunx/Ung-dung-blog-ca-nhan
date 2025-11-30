"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const LandingPageNavbar = () => {
  return (
    <header className="fixed  border-b-gray-200 border-b-2 top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center justify-between mx-auto px-20">
        {/* LOGO + SEARCH */}
        <div className="flex items-center gap-6">
          {/* LOGO */}
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

          {/* SEARCH BAR */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-[35vw] sm:w-[45vw] rounded-xl border border-gray-300 py-2 pl-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />

            {/* SEARCH ICON */}
            <div
              className="
                absolute right-1 top-1/2 -translate-y-1/2 
                p-2 rounded-xl cursor-pointer transition
                hover:bg-indigo-100
              "
            >
              {/* Bạn đặt icon vào đây, ví dụ HeroIcons */}
              <Image
                src={"/loupe.png"}
                alt="Search Icon"
                width={20}
                height={20}
              />
            </div>
          </div>
        </div>

        {/* MENU + BUTTON */}
        <div className="flex items-center gap-6">
          <Link
            href="/auth/login"
            className="font-medium text-gray-500 hidden text-center sm:inline-flex py-2"
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
        </div>
      </div>
    </header>
  );
};

export default LandingPageNavbar;
