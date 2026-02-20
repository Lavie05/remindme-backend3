import express from "express";
import Task from "../models/Task.js"; // تأكدي من إضافة .js
import jwt from "jsonwebtoken";

const router = express.Router();

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
    } catch (err) { res.status(500).json({ error: "خطأ في جلب المهام" }); }
});

// 2. إضافة مهمة جديدة
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
    } catch (err) { res.status(500).json({ error: "فشل إضافة المهمة" }); }
});

// 3. مسار جلب إحصائيات المهام (محدث ليعمل لكل مستخدم على حدة)
router.get('/stats', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const totalTasks = await Task.countDocuments({ userId }); 
        const highPriority = await Task.countDocuments({ userId, priority: 'high' });
        const mediumPriority = await Task.countDocuments({ userId, priority: 'medium' });
        const lowPriority = await Task.countDocuments({ userId, priority: 'low' });

        res.json({
            total: totalTasks,
            high: highPriority,
            medium: mediumPriority,
            low: lowPriority
        });
    } catch (error) {
        res.status(500).json({ message: "خطأ في جلب الإحصائيات" });
    }
});

// 4. حذف مهمة
router.delete("/:id", auth, async (req, res) => {
    try {
        await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ msg: "Task deleted successfully" });
    } catch (err) { res.status(500).json({ error: "فشل حذف المهمة" }); }
});

export default router;