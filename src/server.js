import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// استيراد الروتات (يجب إضافة .js في نهاية المسار عند استخدام ES Modules)
import chatRoute from "./routes/chat.js";
import authRoute from "./routes/auth.js";
import taskRoute from "./routes/tasks.js";

const app = express();

// ✅ إعداد CORS
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// 2️⃣ تفعيل الروتات
app.use("/api/chat", chatRoute);
app.use("/auth", authRoute);
app.use("/api/tasks", taskRoute);

// Route اختبار
app.get("/", (req, res) => {
  res.status(200).json({ message: "RemindME Backend is live and running!" });
});

// Middleware للتعامل مع الروابط غير الموجودة
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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});