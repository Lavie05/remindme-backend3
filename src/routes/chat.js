import express from "express";
import { YoutubeTranscript } from "youtube-transcript";
import axios from "axios";

const router = express.Router();

// مسار تلخيص فيديوهات اليوتيوب
router.post("/summarize-youtube", async (req, res) => {
    const { videoUrl } = req.body;
    // التأكد من أن المفتاح موجود في متغيرات البيئة بـ Render
    const apiKey = process.env.VITE_GEMINI_API_KEY; 

    if (!videoUrl) {
        return res.status(400).json({ error: "يرجى تزويد رابط الفيديو" });
    }

    try {
        // 1. جلب نص الفيديو (Transcript)
        const transcriptArr = await YoutubeTranscript.fetchTranscript(videoUrl);
        const fullText = transcriptArr.map(item => item.text).join(" ");

        // 2. إرسال النص لـ Gemini للتلخيص
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [{
                    parts: [{
                        text: `أنت مساعد ذكي. قم بتلخيص النص التالي المستخرج من فيديو يوتيوب بشكل نقاط مهام (Tasks) واضحة ومنظمة بالعربية: ${fullText}`
                    }]
                }]
            }
        );

        // التحقق من وجود رد من الذكاء الاصطناعي
        if (response.data && response.data.candidates) {
            const summary = response.data.candidates[0].content.parts[0].text;
            res.json({ summary });
        } else {
            throw new Error("لم يتمكن Gemini من إنتاج تلخيص");
        }

    } catch (error) {
        console.error("YouTube/AI Error:", error.message);
        res.status(500).json({ 
            error: "فشل في معالجة الفيديو. تأكد أن الفيديو يحتوي على ترجمة (Subtitles) مفعلة." 
        });
    }
});

// مسار إضافي للدردشة العامة (اختياري)
router.post("/ask", async (req, res) => {
    const { message } = req.body;
    const apiKey = process.env.VITE_GEMINI_API_KEY;

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [{ parts: [{ text: message }] }]
            }
        );
        const reply = response.data.candidates[0].content.parts[0].text;
        res.json({ reply });
    } catch (error) {
        res.status(500).json({ error: "فشل في التواصل مع الذكاء الاصطناعي" });
    }
});

export default router;