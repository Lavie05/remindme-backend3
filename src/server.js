require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// ✅ إعداد CORS بشكل يسمح بالوصول من أي مكان
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// 1️⃣ استيراد الروتات
const chatRoute = require("./routes/chat");
const authRoute = require("./routes/auth");
const taskRoute = require("./routes/tasks"); // الروت الجديد للمهام

// 2️⃣ تفعيل الروتات الأساسية
app.use("/api/chat", chatRoute);
app.use("/auth", authRoute);
app.use("/api/tasks", taskRoute); // ربط مسار المهام بالسيرفر

// Route اختبار للتأكد من أن السيرفر يعمل
app.get("/", (req, res) => {
  res.status(200).json({ message: "RemindME Backend is live and running!" });
});

// Middleware للتعامل مع الروابط غير الموجودة (404)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// 3️⃣ الاتصال بـ MongoDB
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not defined in environment variables");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// 4️⃣ تشغيل السيرفر
const PORT = process.env.PORT || 5000;
console.log(app._router.stack.filter(r => r.route).map(r => r.route.path));
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});