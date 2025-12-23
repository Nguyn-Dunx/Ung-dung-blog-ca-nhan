const mongoose = require("mongoose");

const commentEditHistorySchema = new mongoose.Schema(
  {
    content: { type: String, required: true, trim: true },
    editedAt: { type: Date, required: true },
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
    isEdited: {
      type: Boolean,
      default: false,
    },

    // Lưu lịch sử các lần chỉnh sửa (mọi người đều xem được qua API public)
    editHistory: {
      type: [commentEditHistorySchema],
      default: [],
    },

    // Soft delete
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
