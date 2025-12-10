"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { Author } from "@/lib/types";

interface NavbarProps {
  user?: Author | null;
}

const LandingPageNavbar = ({ user: initialUser }: NavbarProps) => {
  const router = useRouter();
  const [user, setUser] = useState<Author | null | undefined>(initialUser);
  const [loading, setLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch user data on component mount or when initialUser changes
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/profile", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          const userObj = data.user || data;
          setUser({
            _id: userObj._id,
            username: userObj.username,
            email: userObj.email,
            fullName: userObj.fullName,
            avatar: userObj.avatar,
            role: userObj.role,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setUser(initialUser);
      }
    };

    // Only fetch if we don't have user or initialUser changed
    if (!user && !initialUser) {
      fetchUserData();
    } else if (initialUser && user?.username !== initialUser.username) {
      setUser(initialUser);
    }
  }, [initialUser]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

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
                <Link href="/posts/create" className="font-bold">
                  Create Post
                </Link>
              </Button>

              {user.role === "admin" && (
                <Button
                  asChild
                  variant="outline"
                  className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-4 py-2"
                >
                  <Link href="/admin" className="font-bold">
                    Admin
                  </Link>
                </Button>
              )}

              <div className="flex items-center gap-2" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center"
                  title="User menu"
                >
                  <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-300 bg-gray-200 flex items-center justify-center hover:border-indigo-600 transition-colors">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullName || user.username}
                        className="object-cover h-full w-full"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement!.innerHTML = `<span class="text-lg font-semibold text-gray-600">${(
                            user.fullName || user.username
                          )
                            .charAt(0)
                            .toUpperCase()}</span>`;
                        }}
                      />
                    ) : (
                      <span className="text-lg font-semibold text-gray-600">
                        {(user.fullName || user.username)
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                </button>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="absolute top-14 right-20 bg-white rounded-lg shadow-lg border border-gray-200 w-48 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.fullName || user.username}
                      </p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                    <nav className="py-2">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                        onClick={() => setShowUserMenu(false)}
                      >
                        📊 Dashboard
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Cài đặt
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleLogout();
                        }}
                        disabled={loading}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </nav>
                  </div>
                )}
              </div>
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
