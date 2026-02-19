const express = require("express");
const router = express.Router();
const User = require("../models/User");

// --- 1. عملية إنشاء حساب جديد (Register) ---
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // التحقق من أن المستخدم غير موجود مسبقاً
        const existingUser = await User.findOne({ email: email.trim() });
        if (existingUser) {
            return res.status(400).json({ error: "هذا البريد الإلكتروني مسجل بالفعل" });
        }

        const newUser = new User({ 
            username: username.trim(), 
            email: email.trim(), 
            password: password // تأكدي من عدم وجود مسافات هنا
        });

        await newUser.save();
        res.status(201).json({ message: "User created successfully!" }); 

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "فشل إنشاء الحساب" });
    }
});

// --- 2. عملية تسجيل الدخول (Login) ---
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // البحث عن المستخدم وتجهيز البيانات للمقارنة
        const user = await User.findOne({ email: email.trim() });

        if (!user) {
            return res.status(401).json({ error: "البريد الإلكتروني غير مسجل" });
        }

        // مقارنة كلمة المرور (تأكدي من مطابقتها لما في Compass)
        if (user.password !== password) {
            return res.status(401).json({ error: "كلمة المرور غير صحيحة" });
        }

        // إذا كانت البيانات صحيحة
        res.status(200).json({ 
            message: "تم تسجيل الدخول بنجاح",
            user: { username: user.username, email: user.email }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
});

module.exports = router;