import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { Post } from '@/lib/types';
import EditPostForm from '@/components/posts/EditPostForm';

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

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  const { id } = await params;
  const post = await fetchPost(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Post</h1>
        <EditPostForm post={post} />
      </div>
    </div>
  );
}