const express = require("express");
const router = express.Router({ mergeParams: true });
const { verifyToken } = require("../middlewares/authMiddleware");
const {
  addComment,
  getComments,
  deleteComment,
  updateComment,
} = require("../controllers/commentController");

// mounted at /api/posts/:postId/comments
router.get("/", getComments);
router.post("/", verifyToken, addComment);
router.delete("/:id", verifyToken, deleteComment);
router.put("/:id", verifyToken, updateComment);

module.exports = router;
