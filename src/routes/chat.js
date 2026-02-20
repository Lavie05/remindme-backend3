const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/smart-schedule", async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: "لا يوجد نص لتحليله" });
    }

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo-0125", // نسخة مستقرة وتدعم JSON mode
                messages: [
                    {
                        role: "system",
                        content: `أنت مساعد متخصص في "منحنى النسيان - Forgetting Curve". 
                        استخرج المهمة وحدد 3 مواعيد تذكير بصيغة ISO 8601 (الوقت الحالي هو: ${new Date().toISOString()}).
                        يجب أن يكون الرد JSON حصراً بهذا الشكل:
                        {
                          "task": "اسم المهمة",
                          "schedule": ["ISO_DATE_1", "ISO_DATE_2", "ISO_DATE_3"]
                        }`
                    },
                    {
                        role: "user",
                        content: `حلل النص التالي وجدوله تكرارياً: "${text}"`
                    }
                ],
                response_format: { type: "json_object" }, // إجبار الموديل على إرسال JSON
                temperature: 0.5
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // فحص الرد وتجنب أخطاء الـ Parsing
        const aiContent = response.data.choices[0].message.content;
        const aiData = JSON.parse(aiContent);
        
        res.json(aiData);

    } catch (error) {
        console.error("AI Error:", error.response?.data || error.message);
        res.status(500).json({ error: "فشل الذكاء الاصطناعي في تحليل البيانات" });
    }
});

module.exports = router;