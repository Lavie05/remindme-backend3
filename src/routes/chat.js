// src/routes/chat.js
import express from "express";

const router = express.Router();

// مثال على POST endpoint بسيط
router.post("/", (req, res) => {
  // هنا ممكن تستقبل رسالة من المستخدم وترد عليها
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  // رد تجريبي
  res.json({ reply: `You sent: ${message}` });
});

export default router;