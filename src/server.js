require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// استيراد الروتات
const chatRoute = require("./routes/chat");
const authRoute = require("./routes/auth");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// الروتات الأساسية - تأكد أن الملفات المصدرة هي Functions
if (chatRoute) app.use("/chat", chatRoute);
if (authRoute) app.use("/auth", authRoute);

app.get("/", (req, res) => res.send("RemindME Backend Running"));

// الاتصال بـ MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/remindme";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));