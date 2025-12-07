// lib/types.ts
export type Author = {
  _id: string;
  username: string;
  fullName?: string;
  email?: string;
  avatar?: string;
};

export type Post = {
  _id: string;
  title: string;
  createdAt: string;
  author: Author;
};
