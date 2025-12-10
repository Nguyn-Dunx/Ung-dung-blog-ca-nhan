const Post = require("../models/Post");
// Import thêm cloudinary nếu cần dùng hàm xóa ảnh cũ
const cloudinary = require("cloudinary").v2;

const createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    // --- XỬ LÝ TAGS ---
    let tags = [];
    if (req.body.tags) {
      // Nếu tags là 1 chuỗi (VD: "Shark, Tech"), ta tách nó ra
      if (typeof req.body.tags === "string") {
        // split(','): Tách chuỗi dựa vào dấu phẩy
        // map(t => t.trim()): Xóa khoảng trắng thừa ở đầu/cuối mỗi từ
        tags = req.body.tags.split(",").map((tag) => tag.trim());
      } else {
        tags = req.body.tags; // Trường hợp frontend gửi mảng sẵn
      }
    }
    // ------------------

    // Kiểm tra xem có file được upload không (do Multer xử lý)
    let imageUrl = "";
    let imageId = "";

    if (req.file) {
      imageUrl = req.file.path; // Link ảnh trên Cloudinary
      imageId = req.file.filename;
    }
    const post = await Post.create({
      title,
      content,
      tags, // Lưu ý: Nếu gửi dạng form-data, tags có thể cần parse lại từ string sang array
      image: imageUrl,
      imageId: imageId,
      author: req.user.id,
    });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

// lấy list các bài POST (Sắp xếp bài mới nhất lên đầu.) + phân trang + Tìm kiếm & Loại bỏ nội dung dài
const getPosts = async (req, res, next) => {
  try {
    // 1. Lấy tham số từ Query String (VD: ?page=1&limit=10&search=hanoi&tag=tech)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const tag = req.query.tag || "";

    // 2. Xây dựng bộ lọc (Filter)
    const query = {};

    // Tìm kiếm theo Title (không phân biệt hoa thường - regex 'i')
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // Lọc theo Tag (nếu có)
    if (tag) {
      query.tags = { $in: [tag] };
    }

    // 3. Tính toán phân trang
    const skip = (page - 1) * limit;

    // 4. Thực hiện Query song song: Đếm tổng số bài & Lấy danh sách bài
    // Promise.all giúp chạy 2 lệnh cùng lúc để nhanh hơn
    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate("author", "username fullName email avatar") // Lấy info tác giả
        .sort({ createdAt: -1 }) // Bài mới nhất lên đầu
        .skip(skip) // Bỏ qua các bài trang trước
        .limit(limit) // Giới hạn số bài lấy về
        .select("-content"), // [QUAN TRỌNG] Loại bỏ nội dung bài viết để nhẹ API | select all ngoại trừ content

      Post.countDocuments(query), // Đếm tổng số bài thỏa mãn điều kiện
    ]);

    // 5. Trả về kết quả kèm thông tin phân trang
    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        totalRows: total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getPost = async (req, res, next) => {
  try {
    // Tìm bài viết và tăng view lên 1 luôn
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } }, //Tăng views thêm 1
      { new: true } //Trả về dữ liệu mới sau khi tăng (thay vì dữ liệu cũ)
    ).populate("author", "username fullName email avatar");

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

    // Xử lý logic update ảnh mới
    // if (req.file) {
    //   // (Optional) Xóa ảnh cũ trên Cloudinary để tiết kiệm dung lượng
    //   if (post.imageId) {
    //     await cloudinary.uploader.destroy(post.imageId);
    //   }
    //   post.image = req.file.path;
    //   post.imageId = req.file.filename;
    // }

    if (req.file) {
      console.log("Ảnh cũ ID:", post.imageId); // <--- LOG 1: Xem ID cũ là gì?

      if (post.imageId) {
        const result = await cloudinary.uploader.destroy(post.imageId);
        console.log("Kết quả xóa:", result); // <--- LOG 2: Xem Cloudinary trả lời gì?
      } else {
        console.log("Không tìm thấy imageId để xóa!"); // <--- Khả năng cao nó hiện dòng này
      }

      post.image = req.file.path;
      post.imageId = req.file.filename;
    }

    post.title = req.body.title ?? post.title; // ko có thì gắn cái cũ
    post.content = req.body.content ?? post.content;

    // 3. --- XỬ LÝ TAGS (MỚI) ---
    if (req.body.tags) {
      // Nếu gửi dạng chuỗi "Shark, Tech" -> Tách thành mảng
      if (typeof req.body.tags === "string") {
        post.tags = req.body.tags.split(",").map((tag) => tag.trim());
      } else {
        // Nếu gửi dạng mảng (ít gặp với form-data đơn giản) thì lấy luôn
        post.tags = req.body.tags;
      }
    }

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

    // Xóa ảnh trên cloud
    if (post.imageId) {
      await cloudinary.uploader.destroy(post.imageId);
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    next(err);
  }
};

const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Kiểm tra xem user hiện tại đã like bài này chưa
    // req.user.id lấy từ middleware verifyToken
    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      // Nếu đã like rồi thì -> UNLIKE (Xóa user id khỏi mảng)
      post.likes.pull(req.user.id);
    } else {
      // Nếu chưa like thì -> LIKE (Thêm user id vào mảng)
      post.likes.push(req.user.id);
    }

    await post.save();

    // Trả về danh sách like mới và số lượng like để Frontend cập nhật
    res.json({
      likes: post.likes,
      likeCount: post.likes.length,
      isLiked: !isLiked, // Trả về trạng thái mới (true: vừa like, false: vừa unlike)
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
};
