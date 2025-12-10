const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
} = require("../controllers/postController");
const commentRoutes = require("./commentRoutes");
const upload = require("../middlewares/upload");

router.get("/", getPosts);
router.get("/:id", getPost);
router.post("/", verifyToken, upload.single("image"), createPost);
router.put("/:id", verifyToken, upload.single("image"), updatePost);
router.delete("/:id", verifyToken, deletePost);
router.put("/:id/like", verifyToken, likePost);

// Nested comment routes
router.use("/:postId/comments", commentRoutes);

module.exports = router;
