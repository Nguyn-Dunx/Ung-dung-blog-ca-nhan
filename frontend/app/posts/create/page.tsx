import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import CreatePostForm from '@/components/posts/CreatePostForm';

export default async function CreatePostPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Post</h1>
        <CreatePostForm />
      </div>
    </div>
  );
}
