my-dev-to/
├── public/ # Chứa ảnh, favicon, static files
├── src/
│ ├── app/ # CORE: Nơi chứa Routing
│ │ ├── layout.tsx # Root Layout (Html, Body, Global Font)
│ │ ├── globals.css # Global CSS
│ │ ├── error.tsx # Trang lỗi chung
│ │ │
│ │ │ # NHÓM 1: PUBLIC (Khách vãng lai & User đều xem được)
│ │ │ # URL: dev.to/
│ │ ├── (marketing)/ # Tên trong () không ảnh hưởng URL
│ │ │ ├── layout.tsx # Layout chung (Navbar đơn giản)
│ │ │ ├── page.tsx # Trang chủ (Homepage)
│ │ │ └── [slug]/ # Trang đọc bài viết (vd: dev.to/bai-viet-1)
│ │ │ └── page.tsx
│ │ │
│ │ │ # NHÓM 2: AUTHENTICATION (Trang đăng nhập/ký)
│ │ │ # URL: dev.to/login, dev.to/register
│ │ ├── (auth)/
│ │ │ ├── layout.tsx # Layout riêng (Không có Navbar/Footer rườm rà)
│ │ │ ├── login/
│ │ │ │ └── page.tsx
│ │ │ └── register/
│ │ │ └── page.tsx
│ │ │
│ │ │ # NHÓM 3: DASHBOARD / PROTECTED (Chỉ User đã đăng nhập)
│ │ │ # URL: dev.to/dashboard, dev.to/settings
│ │ ├── (dashboard)/
│ │ │ ├── layout.tsx # Layout phức tạp (Sidebar, User Menu, Nut 'Write Post')
│ │ │ ├── dashboard/ # Feed cá nhân
│ │ │ │ └── page.tsx
│ │ │ ├── settings/ # Cài đặt tài khoản
│ │ │ │ └── page.tsx
│ │ │ └── new/ # Trang viết bài mới
│ │ │ └── page.tsx
│ │ │
│ │ └── api/ # Backend API Routes (nếu cần)
│ │ └── auth/ # Xử lý login/logout API
│ │
│ ├── components/ # Các thành phần giao diện (UI)
│ │ ├── ui/ # Button, Input, Modal (nhỏ lẻ, tái sử dụng)
│ │ ├── layout/ # Header, Footer, Sidebar
│ │ └── features/ # ArticleCard, CommentSection, Editor
│ │
│ ├── lib/ # Cấu hình & Hàm tiện ích
│ │ ├── db.ts # Kết nối Database (Prisma/Mongoose)
│ │ ├── auth.ts # Cấu hình NextAuth.js / Logic check user
│ │ └── utils.ts # Hàm format ngày tháng, chuỗi
│ │
│ ├── types/ # TypeScript definitions
│ │ └── index.d.ts
│ │
│ └── middleware.ts # QUAN TRỌNG: "Cảnh sát" chặn cửa (Redirect logic)
│
├── .env.local # Biến môi trường (API Key, Secret)
├── next.config.js
└── package.json
