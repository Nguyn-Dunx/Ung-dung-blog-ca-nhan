// app/api/auth/login/route.ts
import { NextResponse } from "next/server";

const API_BASE =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

interface AuthResponse {
  token?: string;
  message?: string;
  error?: string;
  [key: string]: unknown;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Gọi sang backend Node/Express: POST /auth/login
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as AuthResponse;

    // Backend báo lỗi hoặc không có token
    if (!res.ok || !data.token) {
      const msg = data.message || data.error || "Login failed";
      return NextResponse.json({ error: msg }, { status: res.status || 401 });
    }

    const token = data.token as string;

    // Trả JSON cho FE + set cookie JWT
    const response = NextResponse.json({ success: true });

    response.cookies.set("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
    });

    return response;
  } catch (err) {
    console.error("Login API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
