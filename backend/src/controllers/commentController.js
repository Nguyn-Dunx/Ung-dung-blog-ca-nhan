const Comment = require("../models/Comment");
const Post = require("../models/Post");

const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;

    // 1. Kiểm tra Post tồn tại
    const post = await Post.findById(postId);
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
    const comments = await Comment.find({ post: req.params.postId })
      // Lấy thêm fullName và avatar để hiển thị cho đẹp
      .populate("user", "username fullName avatar")
      .sort({ createdAt: -1 }); // Mới nhất lên đầu
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    // Lưu ý: ID ở đây là ID của Comment, không phải Post
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Logic phân quyền:
    // Cho phép xóa nếu: (Là người viết comment đó) HOẶC (Là Admin)
    if (comment.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not allowed to delete this comment" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
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
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    //  Kiểm tra quyền: CHỈ CHO PHÉP NGƯỜI VIẾT CMT SỬA
    if (comment.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền sửa bình luận này" });
    }

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
  deleteComment,
  updateComment,
};
