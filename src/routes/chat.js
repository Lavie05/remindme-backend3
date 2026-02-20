import express from "express";
import { YoutubeTranscript } from "youtube-transcript";
import axios from "axios";

const router = express.Router();

// 1. مسار تلخيص فيديوهات اليوتيوب
router.post("/summarize-youtube", async (req, res) => {
    const { videoUrl } = req.body;
    const apiKey = process.env.VITE_GEMINI_API_KEY; 

    if (!videoUrl) {
        return res.status(400).json({ error: "يرجى تزويد رابط الفيديو" });
    }

    try {
        const transcriptArr = await YoutubeTranscript.fetchTranscript(videoUrl);
        const fullText = transcriptArr.map(item => item.text).join(" ");

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

        if (response.data && response.data.candidates) {
            const summary = response.data.candidates[0].content.parts[0].text;
            res.json({ summary });
        } else {
            throw new Error("لم يتمكن Gemini من إنتاج تلخيص");
        }
    } catch (error) {
        console.error("YouTube Error:", error.message);
        res.status(500).json({ error: "فشل معالجة الفيديو. تأكد من وجود ترجمة (CC)." });
    }
});

// 2. مسار تحويل الصوت إلى مهمة ذكية
router.post("/voice-to-task", async (req, res) => {
    const { transcript } = req.body;
    const apiKey = process.env.VITE_GEMINI_API_KEY;

    if (!transcript) return res.status(400).json({ error: "لم يتم استلام نص" });

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [{
                    parts: [{
                        text: `حول النص التالي إلى مهمة مختصرة وحدد لها درجة أهمية (high, medium, low) بناءً على المحتوى. الرد يكون بصيغة JSON فقط كالتالي: {"text": "المهمة", "priority": "الأهمية"}. النص: ${transcript}`
                    }]
                }]
            }
        );

        // تنظيف الرد من أي علامات Markdown قد يضيفها الذكاء الاصطناعي
        let cleanJson = response.data.candidates[0].content.parts[0].text.replace(/```json|```/g, "");
        const aiResult = JSON.parse(cleanJson);
        res.json(aiResult);
    } catch (error) {
        console.error("Voice AI Error:", error.message);
        res.status(500).json({ error: "فشل تحليل الصوت ذكياً" });
    }
});

// 3. مسار الدردشة العامة
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
        res.status(500).json({ error: "فشل التواصل مع AI" });
    }
});

export default router;
//lulu