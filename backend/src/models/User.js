const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true, // Nên bắt buộc nhập để profile đầy đủ
      trim: true,
      maxlength: 50, // Giới hạn độ dài để tránh spam tên quá dài
    },
    username: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    avatar: {
      type: String, // Lưu đường dẫn (URL) của ảnh
      default:
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png", // Ảnh mặc định nếu user chưa up
      trim: true,
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true } //time create , update
);

module.exports = mongoose.model("User", userSchema);
