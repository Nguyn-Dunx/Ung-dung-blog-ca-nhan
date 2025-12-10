// src/lib/auth.ts
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";

interface AppJwtPayload extends JwtPayload {
  fullName?: string;
  avatar?: string;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  try {
    // Nếu có SECRET thì dùng jwt.verify(token, process.env.JWT_SECRET!)
    const decoded = jwt.decode(token) as AppJwtPayload | null;
    if (!decoded) return null;

    return {
      name: decoded.fullName || null,
      image: decoded.avatar || null,
    };
  } catch (err) {
    console.error("Failed to decode JWT:", err);
    return null;
  }
}
