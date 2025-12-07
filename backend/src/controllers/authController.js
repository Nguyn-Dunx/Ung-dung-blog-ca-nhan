// 1. Đổi bcrypt thành bcryptjs cho khớp với thư viện đã cài
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// --- HÀM ĐĂNG KÝ ---
const register = async (req, res, next) => {
  try {
    const { username, email, password, fullName, avatar } = req.body;
    if (!username || !email || !password || !fullName)
      return res.status(400).json({ message: "Missing fields" });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashed,
      fullName,
      avatar: avatar || undefined, // Nếu không có avatar gửi lên, Mongoose sẽ tự lấy default
    });

    // Tạo token ngay khi đăng ký
    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

    // Cấu hình cookie an toàn hơn
    res.cookie("token", token, {
      httpOnly: true, // Quan trọng: JS ở client không đọc được (chống XSS)
      secure: false, // false nếu chạy localhost (http), true nếu chạy https (deploy)
      sameSite: "strict", // Chống CSRF cơ bản
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày (tính bằng mili giây)
    });

    res.status(201).json({
      message: "User created",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// --- HÀM ĐĂNG NHẬP ---
const login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password)
      return res.status(400).json({ message: "Missing fields" });

    // Cho phép đăng nhập bằng cả Email hoặc Username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });
    //tạo token
    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d", //thời hạn token
    });

    // Cấu hình cookie an toàn hơn
    res.cookie("token", token, {
      httpOnly: true, // Quan trọng: JS ở client không đọc được (chống XSS)
      secure: false, // false nếu chạy localhost (http), true nếu chạy https (deploy)
      sameSite: "strict", // Chống CSRF cơ bản
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày (tính bằng mili giây)
    });

    res.json({
      message: "Login success",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};
// --- HÀM ĐĂNG XUẤT ---
const logout = (req, res) => {
  res.clearCookie("token"); // Xóa cookie tên là "token"
  res.status(200).json({ message: "Logged out successfully" });
};

// --- HÀM LẤY DANH SÁCH ---
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// --- QUÊN MẬT KHẨU ---
const forgetPassword = async (req, res, next) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ username và gmail để lấy lại mật khẩu",
      });
    }
    // kiểm tra user trong Database khớp cả username VÀ email
    const user = await User.findOne({ username, email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Thông tin tài khoản hoặc email không chính xác" });
    }
    // tạo pwd tạm thời       // Math.random() tạo số, toString(36) chuyển sang chữ+số, slice(-8) lấy 8 ký tự cuối
    const temporaryPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);

    // Mã hóa
    const hashedTempPassword = await bcrypt.hash(temporaryPassword, 10);

    // Lưu mật khẩu đã mã hóa vào DB
    user.password = hashedTempPassword;
    await user.save();

    // Phản hồi lại Client (Trong thực tế, bạn sẽ gửi password này qua Email thay vì trả về JSON)
    res.status(200).json({
      message: "Mật khẩu tạm thời đã được tạo thành công",
      tempPassword: temporaryPassword, // Chỉ dùng để test, thực tế không nên trả về đây
      note: "Hãy dùng mật khẩu tạm thời này để đăng nhập và đổi lại mật khẩu mới ngay.",
    });
  } catch (error) {
    next(error);
  }
};
// --- HÀM ĐỔI MẬT KHẨU (THÊM MỚI) ---
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 1. Kiểm tra input
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập mật khẩu cũ và mật khẩu mới" });
    }

    // 2. Lấy ID từ middleware (file authMiddleware.js bạn vừa gửi đã gán req.user)
    const userId = req.user.id;

    // 3. Tìm user
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    // 4. So sánh mật khẩu cũ
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });
    }

    // 5. Hash mật khẩu mới và lưu
    const hashedNew = await bcrypt.hash(newPassword, 10);
    user.password = hashedNew;
    await user.save();

    res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    next(err);
  }
};

// --- QUAN TRỌNG: EXPORT TẤT CẢ Ở CUỐI CÙNG ---
module.exports = {
  register,
  login,
  getAllUsers,
  changePassword,
  forgetPassword,
  logout,
};
