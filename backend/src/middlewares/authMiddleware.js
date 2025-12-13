const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Xác thực (Authentication) đăng nhập thành công
const verifyToken = async (req, res, next) => {
  try {
    // CÁCH CŨ: Lấy từ Header
    // const authHeader = req.headers.authorization || "";
    // const token = authHeader.startsWith("Bearer ")
    //   ? authHeader.split(" ")[1]
    //   : null;
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // attach user info to req
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    res.clearCookie("token");
    return res
      .status(401)
      .json({ message: "Unauthorized", error: err.message });
  }
};

// Phân quyền (Authorization) role = ?
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ message: "Require admin role" });
};

// Kiểm tra có quyền đăng bài không (user hoặc admin, không phải guest)
const canPost = (req, res, next) => {
  if (req.user && (req.user.role === "user" || req.user.role === "admin")) {
    return next();
  }
  return res.status(403).json({
    message:
      "Tài khoản Guest không được phép đăng bài. Vui lòng liên hệ Admin để nâng cấp tài khoản.",
  });
};

module.exports = { verifyToken, isAdmin, canPost };
