const express = require("express");
const router = express.Router();
// 1. Import Middleware (đường dẫn tùy vào cấu trúc folder của bạn)
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload"); // Import upload middleware cho avatar

// 2. Import Controller
const {
  register,
  getAllUsers,
  login,
  changePassword,
  forgetPassword,
  logout,
  getCurrentUser,
  setUserRole,
  deleteUser,
} = require("../controllers/authController");

// --- PUBLIC ROUTES ---
// upload.single("avatar") - cho phép upload 1 file với field name là "avatar"
router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forget-password", forgetPassword);

// --- AUTHENTICATED ROUTES ---
router.get("/profile", verifyToken, getCurrentUser);
router.post("/change-password", verifyToken, changePassword);

// --- ADMIN ROUTES ---
router.get("/users", verifyToken, isAdmin, getAllUsers); // Chỉ admin mới xem được danh sách users
router.put("/users/:userId/role", verifyToken, isAdmin, setUserRole); // Admin set role
router.delete("/users/:userId", verifyToken, isAdmin, deleteUser); // Admin xóa user

module.exports = router;
