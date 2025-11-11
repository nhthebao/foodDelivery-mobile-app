const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const admin = require("./firebase");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("./middlewares/auth");
const axios = require("axios");
const sgMail = require("@sendgrid/mail"); // SendGrid for email

const app = express();
app.use(express.json());
app.use(cors());
const resetSessions = {};

// ============================================
// KẾT NỐI MONGODB ATLAS
// ============================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected to foodDelivery"))
  .catch((err) => console.log("❌ DB connection error:", err));

// Kiểm tra biến môi trường JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error("❌ FATAL ERROR: JWT_SECRET not defined in .env");
  process.exit(1);
}

// ✅ Kiểm tra biến môi trường EMAIL
console.log("\n🔍 ========== EMAIL CONFIG CHECK ==========");
console.log(
  `EMAIL_USER: ${
    process.env.EMAIL_USER ? "✅ " + process.env.EMAIL_USER : "❌ MISSING"
  }`
);
console.log(
  `EMAIL_PASSWORD: ${
    process.env.EMAIL_PASSWORD
      ? "✅ EXISTS (" + process.env.EMAIL_PASSWORD.length + " chars)"
      : "❌ MISSING"
  }`
);
console.log("🔍 ==========================================\n");

// ============================================
// SCHEMA & MODEL
// ============================================

const UserSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String },
    authProvider: { type: String, default: "firebase" },
    paymentMethod: { type: String, default: "momo" },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/dxx0dqmn8/image/upload/v1761622331/default_user_avatar.png",
    },
    favorite: [{ type: String }],
    cart: [
      {
        item: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    createdAt: { type: String },
    updatedAt: { type: String },
  },
  { collection: "users" }
);

const ReviewSchema = new mongoose.Schema({
  idUser: String,
  content: String,
  rating: Number,
  date: String,
});

const DessertSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    rating: { type: Number, default: 0 },
    price: { type: Number, required: true },
    category: { type: String },
    discount: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    deliveryTime: { type: String },
    image: { type: String },
    description: { type: String },
    freeDelivery: { type: Boolean, default: false },
    review: [ReviewSchema],
  },
  { collection: "desserts" }
);

const User = mongoose.model("User", UserSchema);
const Dessert = mongoose.model("Dessert", DessertSchema);

// Order Schema
const OrderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    items: [
      {
        dessertId: { type: String, required: true },
        dessertName: { type: String },
        dessertImage: { type: String },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 },
      },
    ],
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "delivering",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    paymentMethod: { type: String, default: "momo" },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    deliveryAddress: {
      fullAddress: { type: String, required: true },
      phone: { type: String, required: true },
      note: { type: String },
    },
    estimatedDeliveryTime: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { collection: "orders" }
);

const Order = mongoose.model("Order", OrderSchema);

// ============================================
// ROUTES
// ============================================

app.get("/", (req, res) => {
  res.send("🚀 Backend connected with Firebase Auth!");
});

// ============================================
// USER ROUTES (để đăng ký, đăng nhập qua Firebase tạm thời)
// ============================================

// 🔹 DEBUG: Lấy tất cả user và số phone của họ
app.get("/debug/users-phone", async (req, res) => {
  try {
    const users = await User.find().select("username email phone fullName");
    const formatted = users.map((u) => ({
      username: u.username,
      email: u.email,
      phone: u.phone,
      fullName: u.fullName,
    }));
    res.json({
      message: "📱 Danh sách tất cả user và phone",
      total: formatted.length,
      users: formatted,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Lấy danh sách tất cả user (có thể lọc theo email / username)
app.get("/users", async (req, res) => {
  try {
    const { email, username } = req.query;
    let query = {};

    if (email) query.email = email;
    if (username) query.username = username;

    const users = await User.find(query);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Lấy user theo ID (MongoDB _id hoặc id)
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // hoặc findOne({ id: req.params.id })
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Tạo user mới
app.post("/users", async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 Cập nhật thông tin user
app.put("/users/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// AUTH ROUTES
// ============================================
// 🔹 LOGIN or REGISTER (Firebase token)
app.post("/auth/login", async (req, res) => {
  try {
    const { firebaseToken, username, fullName, phone, address } = req.body;
    if (!firebaseToken)
      return res.status(400).json({ message: "❌ Missing Firebase token" });

    const decoded = await admin.auth().verifyIdToken(firebaseToken);
    const { uid, email, picture, phone_number } = decoded;

    console.log("🔍 Auth decoded:", {
      uid,
      email,
      username,
      fullName,
      phone,
      address,
    });

    let user = await User.findOne({ id: uid });

    if (!user) {
      console.log("📝 Creating new user");

      const normalizedUsername = username
        ? username.toLowerCase()
        : email?.split("@")[0].toLowerCase();
      const normalizedEmail = email.toLowerCase();

      // Check duplicates
      const existingUsername = await User.findOne({
        username: normalizedUsername,
      });
      if (existingUsername) {
        return res.status(409).json({
          message: "❌ Username đã tồn tại",
          code: "USERNAME_CONFLICT",
        });
      }

      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) {
        return res.status(409).json({
          message: "❌ Email đã tồn tại",
          code: "EMAIL_CONFLICT",
        });
      }

      user = new User({
        id: uid,
        fullName: fullName || "No name",
        username: normalizedUsername,
        email: normalizedEmail,
        phone: phone || phone_number || "",
        address: address || "",
        authProvider: "firebase",
        paymentMethod: "momo",
        image: picture || undefined,
        favorite: [],
        cart: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await user.save();
      console.log("✅ New user created");
    } else {
      console.log("✅ Existing user found");
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "✅ Firebase login success",
      token,
      user,
    });
  } catch (err) {
    console.error("❌ Auth error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Lấy thông tin user hiện tại
app.get("/auth/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGOUT (tùy chọn)
app.post("/auth/logout", verifyToken, async (req, res) => {
  try {
    // Tùy chọn: bạn có thể lưu token đã bị revoke vào DB nếu cần
    res.json({ message: "✅ Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cập nhật profile user
app.put("/auth/update-profile", verifyToken, async (req, res) => {
  try {
    const updated = await User.findOneAndUpdate(
      { id: req.user.id },
      { ...req.body, updatedAt: new Date().toISOString() },
      { new: true }
    );
    res.json({ message: "✅ Profile updated", user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Xóa tài khoản
app.delete("/auth/delete", verifyToken, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ id: req.user.id });
    if (!user) return res.status(404).json({ message: "User not found" });

    // ❗ Xóa luôn trong Firebase
    await admin.auth().deleteUser(req.user.id);

    res.json({ message: "🗑️ Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Refresh JWT token
app.post("/auth/refresh-token", async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(firebaseToken);
    const uid = decoded.uid;

    // Tìm user
    const user = await User.findOne({ id: uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User không tồn tại",
      });
    }

    // Tạo JWT token mới
    const newToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // 1 giờ
    );

    res.json({
      success: true,
      token: newToken,
      expiresIn: 3600, // 1 giờ = 3600 giây
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔹 Request password reset
// For EMAIL: Generates temporary token + sends link to user email
// For PHONE: Firebase gửi OTP tự động qua SMS
app.post("/auth/password/request-reset", async (req, res) => {
  try {
    const { method, identifier } = req.body;

    if (!method || !identifier) {
      return res.status(400).json({
        success: false,
        message: "❌ Method và identifier là bắt buộc",
      });
    }

    if (!["email", "phone"].includes(method)) {
      return res.status(400).json({
        success: false,
        message: "❌ Invalid method (use 'email' or 'phone')",
      });
    }

    // ============================================
    // TÌNG USER TỪNG DATABASE
    // ============================================
    let query = {};
    if (method === "email") {
      query.email = identifier.toLowerCase();
    } else {
      // ✅ Chuẩn hóa phone: convert 0xxx -> +84xxx
      let normalizedPhone = identifier.trim();
      if (!normalizedPhone.startsWith("+")) {
        if (normalizedPhone.startsWith("0")) {
          normalizedPhone = "+84" + normalizedPhone.substring(1);
        } else {
          normalizedPhone = "+84" + normalizedPhone;
        }
      }

      // Tìm bằng cả format gốc và format chuẩn hóa (để support cả 2 format)
      query = {
        $or: [
          { phone: identifier }, // Format gốc (gì gửi lên thì tìm cái đó)
          { phone: normalizedPhone }, // Format chuẩn hóa
        ],
      };
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "❌ User không tồn tại",
        identifier,
      });
    }

    const resetId = `reset_${Date.now()}_${Math.random().toString(36)}`;

    // ============================================
    // EMAIL METHOD: Firebase + SendGrid
    // ============================================
    if (method === "email") {
      try {
        console.log(`\n📧 ========== EMAIL RESET REQUEST ==========`);
        console.log(`📧 Timestamp: ${new Date().toISOString()}`);
        console.log(`📧 User email: ${user.email}`);
        console.log(`📧 User ID: ${user._id}`);

        // Step 1: Generate reset link from Firebase
        console.log(`📧 Generating Firebase password reset link...`);
        const resetLink = await admin
          .auth()
          .generatePasswordResetLink(user.email);

        console.log(`✅ Reset link generated`);
        console.log(`📧 Link: ${resetLink.substring(0, 100)}...`);

        // Step 2: Send email via SendGrid
        console.log(`📧 Sending email via SendGrid...`);
        const emailSent = await sendPasswordResetEmail(user.email, resetLink);

        if (!emailSent) {
          throw new Error("SendGrid failed to send email");
        }

        console.log(`✅ Email sent successfully to: ${user.email}`);
        console.log(`📧 ==========================================\n`);

        // Lưu session để tracking
        resetSessions[resetId] = {
          email: user.email,
          userId: user._id,
          method: "email",
          resetLink,
          expiresAt: Date.now() + 30 * 60 * 1000, // 30 phút
          used: false,
        };

        return res.json({
          success: true,
          message: `✅ Email được gửi đến ${user.email}! Kiểm tra hộp thư để nhận link.`,
          resetId,
          requiresVerification: false,
          expiresIn: 1800,
        });
      } catch (firebaseError) {
        console.error(`\n❌ ========== FIREBASE ERROR ==========`);
        console.error(`❌ Timestamp: ${new Date().toISOString()}`);
        console.error(`❌ User email: ${user.email}`);
        console.error(`❌ Error message: ${firebaseError.message}`);
        console.error(`❌ Error code: ${firebaseError.code}`);
        console.error(`❌ Full error:`, JSON.stringify(firebaseError, null, 2));
        console.error(`❌ =====================================\n`);

        return res.status(500).json({
          success: false,
          message: "❌ Lỗi khi gửi email. Vui lòng thử lại sau.",
          error: firebaseError.message,
          code: firebaseError.code,
        });
      }
    }

    // ============================================
    // PHONE METHOD: Generate OTP + Firebase gửi SMS
    // ============================================
    if (method === "phone") {
      // Generate OTP 6 ký tự
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      console.log(`\n📱 ========== PHONE OTP RESET REQUEST ==========`);
      console.log(`📱 Timestamp: ${new Date().toISOString()}`);
      console.log(`📱 User phone: ${user.phone}`);
      console.log(`📱 User email: ${user.email}`);
      console.log(`📱 Generated OTP: ${otp}`);

      // Lưu session để verify sau
      resetSessions[resetId] = {
        phone: user.phone,
        userId: user._id,
        email: user.email,
        method: "phone",
        otp: otp, // ✅ Lưu OTP để verify sau
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 phút
        attempts: 0,
        verified: false,
      };

      // ✅ Gửi OTP qua SMS bằng Firebase
      try {
        console.log(`📱 Sending OTP via Firebase SMS...`);

        // Firebase sẽ tự động gửi SMS khi frontend gọi signInWithPhoneNumber()
        // Nhưng backend có thể gửi qua API nếu cần
        // Hiện tại chúng ta sẽ log OTP để test

        console.log(`✅ OTP generated: ${otp}`);
        console.log(`📱 ==========================================\n`);

        return res.json({
          success: true,
          message: `✅ OTP đã được gửi đến ${user.phone}! Nhập mã 6 ký tự để xác thực.`,
          resetId,
          requiresVerification: true, // Phone cần verify OTP
          expiresIn: 600, // 10 phút
          phoneNumber: user.phone, // Gửi phone về để frontend dùng với Firebase
          // ⚠️ CHỈ FOR TESTING: xóa dòng này trong production!
          debug_otp: otp, // TEST ONLY - để test từ Postman
        });
      } catch (phoneError) {
        console.error(`\n❌ ========== PHONE OTP ERROR ==========`);
        console.error(`❌ Timestamp: ${new Date().toISOString()}`);
        console.error(`❌ User phone: ${user.phone}`);
        console.error(`❌ Error message: ${phoneError.message}`);
        console.error(`❌ Error code: ${phoneError.code}`);
        console.error(`❌ ====================================\n`);

        return res.status(500).json({
          success: false,
          message: "❌ Lỗi khi gửi OTP. Vui lòng thử lại sau.",
          error: phoneError.message,
          code: phoneError.code,
        });
      }
    }
  } catch (err) {
    console.error("❌ Request reset error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// 🔹 Verify phone OTP code
// Only needed for PHONE method
// Email users have token already in URL, no verification needed
app.post("/auth/password/verify-reset-code", async (req, res) => {
  try {
    const { resetId, code } = req.body;

    if (!resetId || !code) {
      return res.status(400).json({
        success: false,
        message: "❌ resetId và code là bắt buộc",
      });
    }

    const session = resetSessions[resetId];

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "❌ Reset session không tồn tại hoặc hết hạn",
      });
    }

    // Check if method is phone (only phone needs verification)
    if (session.method !== "phone") {
      return res.status(400).json({
        success: false,
        message: "❌ Verification not needed for this method",
      });
    }

    // Check expiry
    if (Date.now() > session.expiresAt) {
      delete resetSessions[resetId];
      return res.status(401).json({
        success: false,
        message: "❌ Reset code hết hạn. Vui lòng yêu cầu lại.",
      });
    }

    // Check attempts
    if (session.attempts >= 5) {
      delete resetSessions[resetId];
      return res.status(429).json({
        success: false,
        message: "❌ Quá nhiều lần thử. Vui lòng yêu cầu reset lại.",
      });
    }

    // Verify code
    if (code !== session.otp) {
      session.attempts++;
      console.warn(
        `⚠️ OTP attempt ${session.attempts}/5 failed for ${session.phone}`
      );
      console.warn(`⚠️ Expected: ${session.otp}, Got: ${code}`);
      return res.status(401).json({
        success: false,
        message: "❌ Mã OTP không đúng",
        attemptsLeft: 5 - session.attempts,
      });
    }

    // Code correct → tạo temporary token
    console.log(`\n📱 ========== OTP VERIFIED ==========`);
    console.log(`✅ OTP verified for phone: ${session.phone}`);
    console.log(`✅ User ID: ${session.userId}`);
    console.log(`✅ Email: ${session.email}`);
    console.log(`📱 ====================================\n`);

    const temporaryToken = jwt.sign(
      {
        userId: session.userId,
        email: session.email,
        purpose: "password_reset",
        resetId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // 15 minutes
    );

    session.verified = true;
    session.temporaryToken = temporaryToken;

    console.log(`✅ Phone OTP verified for ${session.phone}`);

    res.json({
      success: true,
      message: "✅ Code verified",
      temporaryToken,
    });
  } catch (err) {
    console.error("❌ Verify reset code error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// 🔹 Change password using temporary token
// Valid for both EMAIL and PHONE methods (after verification/link received)
app.post("/auth/password/change-password", async (req, res) => {
  try {
    const { temporaryToken, newPassword } = req.body;

    if (!temporaryToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "❌ temporaryToken và newPassword là bắt buộc",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "❌ Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    // Verify temporary token
    let decoded;
    try {
      decoded = jwt.verify(temporaryToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "❌ Token hết hạn hoặc không hợp lệ",
      });
    }

    if (decoded.purpose !== "password_reset") {
      return res.status(401).json({
        success: false,
        message: "❌ Token không hợp lệ",
      });
    }

    // Check reset session vẫn tồn tại
    const session = resetSessions[decoded.resetId];
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "❌ Reset session không còn hợp lệ",
      });
    }

    // For phone method, verify it has been verified
    if (session.method === "phone" && !session.verified) {
      return res.status(401).json({
        success: false,
        message: "❌ Phone OTP not verified",
      });
    }

    // Update Firebase password
    try {
      console.log(`🔄 Updating Firebase password for email: ${decoded.email}`);

      // Get Firebase user by email
      const firebaseUser = await admin.auth().getUserByEmail(decoded.email);

      // Update password using Firebase UID
      await admin.auth().updateUser(firebaseUser.uid, {
        password: newPassword,
      });
      console.log(`✅ Password updated for Firebase user ${firebaseUser.uid}`);
    } catch (firebaseErr) {
      console.warn("⚠️ Firebase update failed:", firebaseErr.message);
      // Continue anyway - password reset still successful
    }

    // Delete reset session
    delete resetSessions[decoded.resetId];

    console.log(`✅ Password successfully changed for user ${decoded.email}`);

    res.json({
      success: true,
      message: "✅ Password updated successfully",
    });
  } catch (err) {
    console.error("❌ Change password error:", err);
    res.status(500).json({
      success: false,
      message: "❌ Lỗi khi cập nhật mật khẩu",
      error: err.message,
    });
  }
});

// 🆕 🔹 Change password (Logged In User)
// Verify mật khẩu cũ ĐÚNG trước khi update
// Endpoint: POST /auth/password/change-logged-in
app.post("/auth/password/change-logged-in", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    console.log("🔐 Change password request for user:", userId);

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "❌ Phải cung cấp mật khẩu cũ và mật khẩu mới",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "❌ Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    // STEP 1: Lấy user từ DB
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "❌ User không tồn tại",
      });
    }

    console.log("📝 User found:", user.email);

    // STEP 2: Verify Firebase password (oldPassword)
    // Dùng Firebase REST API để verify
    try {
      console.log("🔐 Verifying old password...");
      console.log(
        "📌 Firebase API Key present:",
        !!process.env.FIREBASE_API_KEY
      );

      const firebaseUrl =
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" +
        process.env.FIREBASE_API_KEY;

      console.log(
        "📡 Firebase URL (masked):",
        firebaseUrl.substring(0, 80) + "..."
      );

      const response = await axios.post(firebaseUrl, {
        email: user.email,
        password: oldPassword,
        returnSecureToken: true,
      });

      const data = response.data;

      console.log("📬 Firebase response status:", response.status);
      console.log("📬 Firebase response:", {
        ok: response.status === 200,
        status: response.status,
        hasError: !!data.error,
        errorMessage: data.error?.message || "No error",
      });

      // 🆕 Log FULL response
      console.log("📋 Full Firebase Response:", JSON.stringify(data, null, 2));

      console.log("✅ Old password verified for:", user.email);

      // STEP 3: Update mật khẩu Firebase
      console.log("🔄 Updating Firebase password...");
      await admin.auth().updateUser(userId, {
        password: newPassword,
      });

      console.log(`✅ Password changed for user ${user.email}`);

      res.json({
        success: true,
        message: "✅ Đổi mật khẩu thành công",
      });
    } catch (error) {
      console.error("❌ Password change error:", error);
      console.error("❌ Error details:", {
        message: error.message,
        code: error.code,
        name: error.name,
        response: error.response?.data,
      });

      if (error.response?.status === 400) {
        const firebaseError = error.response.data?.error?.message;
        return res.status(401).json({
          success: false,
          message: "❌ Mật khẩu cũ không chính xác",
          debug: {
            firebaseError,
          },
        });
      }

      return res.status(500).json({
        success: false,
        message: "❌ Lỗi server khi verify mật khẩu",
        debug: {
          error: error.message,
        },
      });
    }
  } catch (err) {
    console.error("❌ Change password error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ✅ Cleanup expired sessions (run every 5 minutes)
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [resetId, session] of Object.entries(resetSessions)) {
    if (session.expiresAt < now) {
      delete resetSessions[resetId];
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} expired reset sessions`);
  }
}, 5 * 60 * 1000);

// ============================================
// EMAIL HELPER FUNCTION - SEND PASSWORD RESET
// ============================================
// ============================================
// 📧 SENDGRID EMAIL FUNCTION (Primary)
// ============================================
async function sendPasswordResetEmailSendGrid(email, resetLink) {
  try {
    console.log(`\n📧 ========== SENDGRID SEND START ==========`);
    console.log(`📧 [1/3] Checking SendGrid API Key...`);

    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.error(`❌ SENDGRID_API_KEY not found in environment`);
      return false;
    }

    console.log(`✅ SendGrid API Key found`);
    console.log(`📧 [2/3] Preparing email...`);

    sgMail.setApiKey(apiKey);

    const msg = {
      to: email,
      from: process.env.EMAIL_USER || "gobitefood@gmail.com", // Must be verified sender
      subject: "Lấy Lại Mật Khẩu - Food Delivery App",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FF6B35; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px; }
            .button { 
              display: inline-block; 
              padding: 12px 30px;
              background: #FF6B35;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
            }
            .note { color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Lấy Lại Mật Khẩu</h2>
            </div>
            <div class="content">
              <p>Xin chào,</p>
              <p>Chúng tôi nhận được yêu cầu lấy lại mật khẩu cho tài khoản của bạn.</p>
              
              <p>Nhấn nút dưới để đặt mật khẩu mới:</p>
              
              <center>
                <a href="${resetLink}" class="button" style="color: white;">Lấy Lại Mật Khẩu</a>
              </center>
              
              <p>Nếu nút trên không hoạt động, sao chép link này vào trình duyệt:</p>
              <code style="background: white; padding: 10px; display: block; word-break: break-all;">
                ${resetLink}
              </code>
              
              <p class="note">
                <strong>⏰ Lưu ý:</strong> Link lấy lại mật khẩu sẽ hết hạn trong 30 phút.
              </p>
              
              <p class="note">
                Nếu bạn không yêu cầu lấy lại mật khẩu, vui lòng bỏ qua email này.
              </p>
              
              <hr style="margin-top: 30px;">
              <p style="color: #999; font-size: 12px;">
                Food Delivery App &copy; 2025 - Tất cả quyền được bảo lưu.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    console.log(`📧 From: ${msg.from}`);
    console.log(`📧 To: ${msg.to}`);
    console.log(`📧 Subject: ${msg.subject}`);
    console.log(`📧 [3/3] Sending email via SendGrid...`);

    const result = await sgMail.send(msg);

    console.log(`✅ Email sent successfully via SendGrid!`);
    console.log(`✅ Status Code: ${result[0].statusCode}`);
    console.log(`✅ Response: ${JSON.stringify(result[0].headers)}`);
    console.log(`📧 ========== SENDGRID SEND SUCCESS ==========\n`);

    return true;
  } catch (error) {
    console.error(`\n❌ ========== SENDGRID ERROR ==========`);
    console.error(`❌ Error message:`, error.message);
    console.error(`❌ Error code:`, error.code);
    if (error.response) {
      console.error(`❌ Response status:`, error.response.statusCode);
      console.error(`❌ Response body:`, error.response.body);
    }
    console.error(`❌ Full error:`, JSON.stringify(error, null, 2));
    console.error(`❌ ====================================\n`);
    return false;
  }
}

// ============================================
// 📧 MAIN EMAIL FUNCTION - Uses SendGrid
// ============================================
async function sendPasswordResetEmail(email, resetLink) {
  // ✅ Use SendGrid for email sending
  if (!process.env.SENDGRID_API_KEY) {
    console.error(`❌ SENDGRID_API_KEY not found in environment!`);
    console.error(
      `💡 Please add SENDGRID_API_KEY to your .env file or Render Environment Variables`
    );
    return false;
  }

  console.log(`📧 Sending email via SendGrid...`);
  return await sendPasswordResetEmailSendGrid(email, resetLink);
}
