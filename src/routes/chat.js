import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE_URL from './config';
import './Register.css'; // نفس CSS للـ glass style
import { FaPaperPlane } from 'react-icons/fa';

const Chat = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [responseData, setResponseData] = useState(null);

    const handleSend = async () => {
        if (!text.trim()) {
            toast.error("⚠️ أدخل نص المهمة أولاً");
            return;
        }

        setLoading(true);
        setResponseData(null);

        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/chat/smart-schedule`, {
                text
            });

            setResponseData(data);
            toast.success("✨ المهمة جُمعت وجدولت بنجاح!");
        } catch (err) {
            console.error(err.response?.data || err.message);
            toast.error("❌ فشل إرسال المهمة. حاول مرة أخرى");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modern-container" style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
                <h2>💬 ذكاء التذكيرات الذكي</h2>
                <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>اكتب المهمة وسأقوم بجدولتها لك تلقائياً</p>

                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="اكتب المهمة هنا..."
                    rows={4}
                    style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                />

                <button
                    onClick={handleSend}
                    disabled={loading}
                    className="glow-button"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                >
                    {loading ? "جاري المعالجة..." : <>جدول المهمة <FaPaperPlane /></>}
                </button>
<ul>
    {responseData.schedule.map((date, index) => (
        <li key={index} style={{ listStyle: 'none', marginBottom: '5px' }}>
            📅 {new Date(date).toLocaleString('ar-EG', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                hour: '2-digit', 
                minute: '2-digit' 
            })}
        </li>
    ))}
</ul>
                {responseData && (
                    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', background: 'rgba(255,255,255,0.05)' }}>
                        <h3>📝 المهمة:</h3>
                        <p>{responseData.task}</p>
                        <h3>⏰ مواعيد التذكير:</h3>
                        <ul>
                            {responseData.schedule.map((date, index) => (
                                <li key={index}>{new Date(date).toLocaleString()}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;