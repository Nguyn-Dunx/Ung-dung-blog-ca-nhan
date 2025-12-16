import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  /* 2. Cấu hình Rewrites (QUAN TRỌNG NHẤT ĐỂ FIX LOGIN) 
     Nó giúp Frontend gọi /api/... sẽ tự động nối sang Backend Render
     Cookie sẽ được tính là của Vercel -> Trình duyệt sẽ chịu lưu.
  */
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Khi code frontend gọi: /api/auth/login...
        destination: "https://ung-dung-blog-ca-nhan.onrender.com/api/:path*", // ...sẽ nối sang server Render
      },
    ];
  },
};

export default nextConfig;
