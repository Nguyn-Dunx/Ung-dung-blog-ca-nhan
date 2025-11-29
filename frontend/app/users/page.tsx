// app/users/page.tsx
type User = {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

// Hàm gọi fetch dùng native fetch của Next.js
async function getUsers(): Promise<User[]> {
  const res = await fetch(`http://localhost:5000/api/auth/users`, {
    // Hoặc ghi thẳng "http://localhost:3000/api/users" nếu đang dev
    // cache: "no-store", // nếu muốn luôn lấy data mới
    next: { revalidate: 60 }, // nếu muốn ISR, 60s revalidate
  });

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await res.json();
  return data;
}

// Server Component
export default async function UsersPage() {
  const users = await getUsers();

  // Nếu biết chắc chỉ có 1 user như JSON bạn đưa:
  // const user = users[0];

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-full max-w-xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-white mb-6">User List</h1>

        <div className="space-y-4">
          {users.map((user) => (
            <article
              key={user._id}
              className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-white">
                  {user.username}
                </h2>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/40">
                  {user.role}
                </span>
              </div>

              <p className="text-sm text-slate-300">
                Email: <span className="font-mono">{user.email}</span>
              </p>

              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                <span>
                  Created at: {new Date(user.createdAt).toLocaleString()}
                </span>
                <span>
                  Updated at: {new Date(user.updatedAt).toLocaleString()}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
