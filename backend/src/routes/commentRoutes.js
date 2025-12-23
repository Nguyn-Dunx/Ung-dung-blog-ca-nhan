const express = require("express");
const router = express.Router({ mergeParams: true });
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");
const {
  addComment,
  getComments,
  getCommentsAdmin,
  deleteComment,
  getCommentHistory,
  updateComment,
} = require("../controllers/commentController");

// mounted at /api/posts/:postId/comments
router.get("/", getComments);
router.get("/admin", verifyToken, isAdmin, getCommentsAdmin);
router.get("/:id/history", getCommentHistory);
router.post("/", verifyToken, addComment);
router.delete("/:id", verifyToken, deleteComment);
router.put("/:id", verifyToken, updateComment);

module.exports = router;
