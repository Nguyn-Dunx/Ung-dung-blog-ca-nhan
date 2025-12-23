const Comment = require("../models/Comment");
const Post = require("../models/Post");

const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;

    // 1. Kiểm tra Post tồn tại
    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) return res.status(404).json({ message: "Post not found" });

    // 2. Tạo comment
    const newComment = await Comment.create({
      post: postId,
      user: req.user.id, // Lấy từ Cookie
      content,
    });

    // 3. QUAN TRỌNG: Populate ngay để trả về frontend có tên + avatar luôn
    await newComment.populate("user", "username fullName avatar");

    res.status(201).json(newComment);
  } catch (err) {
    next(err);
  }
};

const getComments = async (req, res, next) => {
  try {
    // Optional safety: if post is deleted, treat as not found
    const post = await Post.findOne({
      _id: req.params.postId,
      isDeleted: false,
    });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comments = await Comment.find({
      post: req.params.postId,
      isDeleted: false,
    })
      // Lấy thêm fullName và avatar để hiển thị cho đẹp
      .populate("user", "username fullName avatar")
      .sort({ createdAt: -1 }); // Mới nhất lên đầu
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

// --- ADMIN: GET COMMENTS (INCLUDE DELETED) ---
// GET /api/posts/:postId/comments/admin
const getCommentsAdmin = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.postId,
      isDeleted: false,
    });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comments = await Comment.find({ post: req.params.postId })
      .populate("user", "username fullName avatar")
      .populate("deletedBy", "username fullName avatar")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    // Lưu ý: ID ở đây là ID của Comment, không phải Post
    const comment = await Comment.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Lấy thông tin bài viết để kiểm tra tác giả
    const post = await Post.findById(comment.post);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Logic phân quyền xóa comment:
    // Cho phép xóa nếu:
    // 1. Là người viết comment đó
    // 2. Là Admin
    // 3. Là tác giả của bài viết (chủ bài viết có quyền xóa comment trong bài của mình)
    const isCommentOwner = comment.user.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    const isPostAuthor = post.author.toString() === req.user.id;

    if (!isCommentOwner && !isAdmin && !isPostAuthor) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa bình luận này" });
    }

    // Soft delete
    comment.isDeleted = true;
    comment.deletedAt = new Date();
    comment.deletedBy = req.user.id;
    await comment.save();

    res.json({ message: "Comment deleted (soft)" });
  } catch (err) {
    next(err);
  }
};

// --- PUBLIC: XEM LỊCH SỬ CHỈNH SỬA COMMENT ---
// GET /api/posts/:postId/comments/:id/history
const getCommentHistory = async (req, res, next) => {
  try {
    const { postId, id: commentId } = req.params;

    const comment = await Comment.findOne({
      _id: commentId,
      post: postId,
      isDeleted: false,
    }).populate("editHistory.editedBy", "username fullName avatar");

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Trả newest-first cho dễ xem
    const history = Array.isArray(comment.editHistory)
      ? [...comment.editHistory].sort(
          (a, b) => new Date(b.editedAt) - new Date(a.editedAt)
        )
      : [];

    res.json(history);
  } catch (err) {
    next(err);
  }
};

// ---  SỬA COMMENT ---
const updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const commentId = req.params.id; // Lấy ID comment từ URL

    //  Kiểm tra đầu vào
    if (!content) {
      return res.status(400).json({ message: "Nội dung không được để trống" });
    }

    //  Tìm comment trong DB
    const comment = await Comment.findOne({ _id: commentId, isDeleted: false });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    //  Kiểm tra quyền: CHỈ CHO PHÉP NGƯỜI VIẾT CMT SỬA
    if (comment.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền sửa bình luận này" });
    }

    // Nếu nội dung không đổi thì trả luôn (tránh ghi history rỗng)
    if (comment.content === content) {
      await comment.populate("user", "username fullName avatar");
      return res.json(comment);
    }

    // Lưu lịch sử: lưu bản cũ trước khi ghi đè
    comment.editHistory = comment.editHistory || [];
    comment.editHistory.push({
      content: comment.content,
      editedAt: new Date(),
      editedBy: req.user.id,
    });

    //  Cập nhật và lưu
    comment.content = content;

    // Đánh dấu là đã chỉnh sửa để hiển thị "Đã chỉnh sửa" ở frontend
    comment.isEdited = true;

    await comment.save();

    // Populate lại thông tin user để trả về cho Frontend cập nhật giao diện ngay
    await comment.populate("user", "username fullName avatar");

    res.json(comment);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addComment,
  getComments,
  getCommentsAdmin,
  deleteComment,
  getCommentHistory,
  updateComment,
};
