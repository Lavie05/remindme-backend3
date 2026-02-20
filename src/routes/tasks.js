const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const jwt = require("jsonwebtoken");

// Middleware للتحقق من التوكن واستخراج الـ User ID
const auth = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Access Denied" });
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) { res.status(400).json({ error: "Invalid Token" }); }
};

// 1. جلب مهام المستخدم الحالي فقط
router.get("/", auth, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) { res.status(500).json(err); }
});

// 2. إضافة مهمة جديدة يدوياً أو عبر AI
router.post("/add", auth, async (req, res) => {
    try {
        const newTask = new Task({
            userId: req.user.id,
            text: req.body.text,
            priority: req.body.priority || "medium",
            time: req.body.time || new Date().toLocaleTimeString()
        });
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (err) { res.status(500).json(err); }
});

// 3. حذف مهمة
router.delete("/:id", auth, async (req, res) => {
    try {
        await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ msg: "Task deleted successfully" });
    } catch (err) { res.status(500).json(err); }
});

module.exports = router;