import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { YoutubeTranscript } from 'youtube-transcript';
import chatRoute from "./routes/chat.js";
import authRoute from "./routes/auth.js";
import taskRoute from "./routes/tasks.js";

const app = express(); // تم التحريك للأعلى هنا

// إعدادات الـ CORS والـ JSON
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// --- مسار تلخيص اليوتيوب الذكي ---
app.post('/api/ai/youtube-text', async (req, res) => {
    const { videoUrl } = req.body;
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
        const fullText = transcript.map(t => t.text).join(' ');
        res.json({ text: fullText });
    } catch (error) {
        console.error("YouTube Error:", error);
        res.status(500).json({ error: "فشل استخراج نص الفيديو" });
    }
});

// المسارات الأخرى (Routes)
app.use("/api/chat", chatRoute);
app.use("/auth", authRoute);
app.use("/api/tasks", taskRoute);

app.get("/", (req, res) => {
  res.status(200).json({ message: "RemindME Backend is live and running!" });
});

// معالجة الخطأ 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// الاتصال بـ MongoDB
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI not defined");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });

// تشغيل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});