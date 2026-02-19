require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express(); // ✅ تم تعريف app أولاً

// استيراد الروتات
const chatRoute = require("./routes/chat");
const authRoute = require("./routes/auth");

// ✅ إعدادات CORS
app.use(cors({
  origin: 'https://remindme-isra-app.onrender.com', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// ✅ الروتات الأساسية مع إضافة /api لتتطابق مع الفرونت-إند
if (chatRoute) app.use("/api/chat", chatRoute);
if (authRoute) app.use("/api/auth", authRoute);

app.get("/", (req, res) => res.send("RemindME Backend Running"));

// الاتصال بـ MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/remindme";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));