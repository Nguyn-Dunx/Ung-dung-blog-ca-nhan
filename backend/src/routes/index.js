const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const postRoutes = require("./postRoutes");

// const commentRoutes = require("./commentRoutes");

router.use("/auth", authRoutes);
router.use("/posts", postRoutes);

// // nest comments under posts
// router.use("/posts/:postId/comments", commentRoutes);

module.exports = router;
