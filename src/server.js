import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { YoutubeTranscript } from 'youtube-transcript';

// استيراد المسارات (تأكدي من وجود الملفات في مجلد routes)
import chatRoute from "./routes/chat.js";
import authRoute from "./routes/auth.js";
import taskRoute from "./routes/tasks.js";

const app = express();

// --- 1. الإعدادات (Middleware) ---
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// --- 2. مسار اليوتيوب (YouTube Transcript) ---
app.post('/api/ai/youtube-text', async (req, res) => {
    const { videoUrl } = req.body;
    if (!videoUrl) return res.status(400).json({ error: "رابط الفيديو مطلوب" });

    try {
        console.log("Fetching transcript for:", videoUrl);
        const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
        const fullText = transcript.map(t => t.text).join(' ');
        res.json({ text: fullText });
    } catch (error) {
        console.error("YouTube Error:", error.message);
        res.status(500).json({ error: "فشل استخراج النص. تأكد من وجود ترجمة مصاحبة للفيديو (CC)." });
    }
});

// --- 3. ربط المسارات (Routes) ---
app.use("/auth", authRoute);           // مسارات التسجيل والدخول
app.use("/api/tasks", taskRoute);     // مسارات المهام
app.use("/api/chat", chatRoute);       // مسارات الشات (إن وجدت)

// --- 4. فحص السيرفر ---
app.get("/", (req, res) => {
    res.json({ message: "Server is Live! 🚀" });
});

// --- 5. الاتصال بـ MongoDB والتشغيل ---
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
    })
    .catch(err => console.error("❌ DB Connection Error:", err));