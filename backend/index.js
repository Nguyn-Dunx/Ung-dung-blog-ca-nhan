// Đây là entry point file

require("dotenv").config();
const cookieParser = require("cookie-parser");
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");

const { connectDB } = require("./src/config/db");
const routes = require("./src/routes");

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet()); //bảo mật header
app.use(express.json()); //giúp server hiểu data JSON từ fontend
app.use(cookieParser()); // lưu token vào cookie
app.use(xss()); //Lọc sạch mã độc
app.use(morgan("dev")); //lưu lại log
// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN || "http://localhost:3000",
//     origin:
//       process.env.CORS_ORIGIN ||
//       "https://equivalve-subreputable-keiko.ngrok-free.dev",
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Cho phép Localhost
      "https://ung-dung-blog-ca-nhan-fit.vercel.app", // Cho phép Ngrok
      process.env.CORS_ORIGIN, // Cho phép thêm từ biến môi trường (nếu có)
    ].filter(Boolean), // Lọc bỏ giá trị null/undefined nếu biến env không tồn tại
    credentials: true,
  })
);

// Rate limiter (basic)     giới hạn spam (200rq/min)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
});
app.use(limiter);

// Routes (endpoint mặc định)
app.use("/api", routes);

// Error handler (last)
const { errorHandler } = require("./src/middlewares/errorMiddleware");
app.use(errorHandler);

// Start
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect DB", err);
    process.exit(1);
  });
