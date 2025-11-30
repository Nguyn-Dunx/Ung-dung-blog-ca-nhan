const Post = require("../models/Post");

const createPost = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;
    const post = await Post.create({
      title,
      content,
      tags,
      author: req.user.id,
    });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

// lấy list các bài POST (Sắp xếp bài mới nhất lên đầu.)
// Pagination & Search =======***THÊM SAU***=======
const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("author", "username email")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    next(err);
  }
};

const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "username email"
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    next(err);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // owner or admin
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }

    post.title = req.body.title ?? post.title;
    post.content = req.body.content ?? post.content;
    if (req.body.tags) post.tags = req.body.tags;
    await post.save();
    res.json(post);
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }

    await post.deleteOne(); // ERROR maybe
    res.json({ message: "Post deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPost, getPosts, getPost, updatePost, deletePost };
