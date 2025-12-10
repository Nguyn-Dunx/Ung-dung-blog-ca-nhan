import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Post } from "@/lib/types";
import PostDetailClient from "@/components/posts/PostDetailClient";

interface AppJwtPayload extends JwtPayload {
  id?: string;
}

async function fetchPost(id: string): Promise<Post | null> {
  try {
    const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await fetchPost(id);

  if (!post) {
    notFound();
  }

  // Get current user ID from token
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  let currentUserId: string | null = null;

  if (token) {
    try {
      const decoded = jwt.decode(token) as AppJwtPayload | null;
      currentUserId = decoded?.id || null;
    } catch (err) {
      console.error("Failed to decode JWT:", err);
    }
  }

  return <PostDetailClient post={post} currentUserId={currentUserId} />;
}
