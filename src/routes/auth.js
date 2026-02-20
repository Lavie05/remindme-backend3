const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken"); // تأكدي من تثبيتها: npm install jsonwebtoken

// دالة مساعدة لإنشاء التوكن
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// --- 1. عملية إنشاء حساب جديد (Register) ---
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const existingUser = await User.findOne({ email: email.trim() });
        if (existingUser) {
            return res.status(400).json({ error: "هذا البريد الإلكتروني مسجل بالفعل" });
        }

        const newUser = new User({ 
            username: username.trim(), 
            email: email.trim(), 
            password: password 
        });

        const user = await newUser.save();
        
        // ✅ إضافة توكن ليتمكن المستخدم من الدخول فوراً
        const token = createToken(user._id);
        res.status(201).json({ message: "User created successfully!", token, username: user.username }); 

    } catch (error) {
        res.status(500).json({ error: "فشل إنشاء الحساب" });
    }
});

// --- 2. عملية تسجيل الدخول (Login) ---
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.trim() });

        if (!user || user.password !== password) {
            return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
        }

        // ✅ توليد توكن عند تسجيل الدخول
        const token = createToken(user._id);
        res.status(200).json({ 
            message: "تم تسجيل الدخول بنجاح",
            token,
            user: { username: user.username, email: user.email }
        });

    } catch (error) {
        res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
});

module.exports = router;