import mongoose from "mongoose"; // تصحيح: استخدام import بدلاً من require

const TaskSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    text: { 
        type: String, 
        required: true 
    },
    priority: { 
        type: String, 
        enum: ["high", "medium", "low"], 
        default: "medium" 
    },
    time: { 
        type: String 
    },
    allReminders: {
        type: [Date], 
        default: []
    },
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// تصحيح: استخدام export default بدلً من module.exports
export default mongoose.model("Task", TaskSchema);
