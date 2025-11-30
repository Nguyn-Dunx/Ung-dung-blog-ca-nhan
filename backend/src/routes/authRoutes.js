const express = require("express");
const router = express.Router();
// 1. Import Middleware (đường dẫn tùy vào cấu trúc folder của bạn)
const { verifyToken } = require("../middlewares/authMiddleware");

// 2. Import Controller
const {
  register,
  getAllUsers,
  login,
  changePassword,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

router.get("/users", getAllUsers);
// Route Đổi mật khẩu (BẮT BUỘC phải có verifyToken đứng trước)
router.post("/change-password", verifyToken, changePassword);

module.exports = router;
