import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import chatRoute from "./routes/chat.js";
import authRoute from "./routes/auth.js";
import taskRoute from "./routes/tasks.js";

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/api/chat", chatRoute);
app.use("/auth", authRoute);
app.use("/api/tasks", taskRoute);

app.get("/", (req, res) => {
  res.status(200).json({ message: "RemindME Backend is live and running!" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});