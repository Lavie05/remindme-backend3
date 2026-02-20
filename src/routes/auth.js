import express from "express";
import User from "../models/User.js"; // تأكدي من إضافة .js في النهاية
import jwt from "jsonwebtoken";

const router = express.Router();

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
        
        const token = createToken(user._id);
        res.status(201).json({ 
            message: "User created successfully!", 
            token, 
            username: user.username 
        }); 

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

export default router; // تأكدي أن هذا هو السطر الأخير