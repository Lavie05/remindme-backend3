const express = require("express");
const router = express.Router();
const axios = require("axios"); // تأكدي من عمل npm install axios

// روت استقبال النص وجدولته ذكياً
router.post("/smart-schedule", async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: "لا يوجد نص لتحليله" });
    }

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `أنت مساعد ذكي متخصص في الذاكرة البشرية. 
                        مهمتك هي استخراج المهمة من النص وتحديد 3 مواعيد تذكير لها بناءً على منحنى النسيان (بعد ساعة، بعد 24 ساعة، بعد أسبوع). 
                        أخرج النتيجة بتنسيق JSON حصراً كالتالي:
                        {
                          "task": "اسم المهمة المستخرجة",
                          "schedule": ["تاريخ/وقت 1", "تاريخ/وقت 2", "تاريخ/وقت 3"]
                        }`
                    },
                    {
                        role: "user",
                        content: `حلل هذا النص: "${text}"`
                    }
                ],
                temperature: 0.7
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, // نستخدم المفتاح من ملف .env
                    "Content-Type": "application/json"
                }
            }
        );

        // إرسال الخطة الذكية للفرونت-إند
        const aiData = JSON.parse(response.data.choices[0].message.content);
        res.json(aiData);

    } catch (error) {
        console.error("OpenAI Error:", error.response?.data || error.message);
        res.status(500).json({ error: "فشل الذكاء الاصطناعي في جدولة التذكير" });
    }
});

module.exports = router;