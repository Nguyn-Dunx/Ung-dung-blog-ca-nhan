import { notFound } from 'next/navigation';
import { Post } from '@/lib/types';
import PostDetailClient from '@/components/posts/PostDetailClient';

async function fetchPost(id: string): Promise<Post | null> {
  try {
    const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await fetchPost(id);

  if (!post) {
    notFound();
  }

  return <PostDetailClient post={post} />;
}