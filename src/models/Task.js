const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
    // ربط المهمة بالمستخدم (ضروري جداً للأمان)
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    // نص المهمة أو الملخص القادم من AI
    text: { 
        type: String, 
        required: true 
    },
    // الأولوية: أضفت enum عشان نحصر الخيارات ونمنع الأخطاء
    priority: { 
        type: String, 
        enum: ["high", "medium", "low"], 
        default: "medium" 
    },
    // الوقت الأساسي للمهمة (مثلاً وقت الحصة أو الامتحان)
    time: { 
        type: String 
    },
    // --- حقول إضافية لدعم الـ AI و "منحنى النسيان" ---
    
    // قائمة بمواعيد التذكير (بعد ساعة، يوم، أسبوع)
    allReminders: {
        type: [Date], // مصفوفة تواريخ
        default: []
    },
    // حالة المهمة (هل أنجزها المستخدم أم لا)
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    },
    // تاريخ الإنشاء
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("Task", TaskSchema);