const express = require("express");
const router = express.Router();
const {
  verifyToken,
  canPost,
  isAdmin,
} = require("../middlewares/authMiddleware");
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  getAdminPosts,
  restorePost,
  forceDeletePost,
} = require("../controllers/postController");
const commentRoutes = require("./commentRoutes");
const upload = require("../middlewares/upload");

// Public routes
router.get("/", getPosts);

// Admin routes
router.get("/admin", verifyToken, isAdmin, getAdminPosts);
router.get("/:id", getPost);

// Authenticated routes - canPost chặn guest tạo/sửa bài
router.post("/", verifyToken, canPost, upload.single("image"), createPost);
router.put("/:id", verifyToken, canPost, upload.single("image"), updatePost);
router.delete("/:id", verifyToken, deletePost);

// Admin restore / permanent delete
router.put("/:id/restore", verifyToken, isAdmin, restorePost);
router.delete("/:id/force", verifyToken, isAdmin, forceDeletePost);

// Like - cho phép tất cả user đã đăng nhập (kể cả guest)
router.put("/:id/like", verifyToken, likePost);

// Nested comment routes
router.use("/:postId/comments", commentRoutes);

module.exports = router;
