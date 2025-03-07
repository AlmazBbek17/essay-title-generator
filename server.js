const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Раздача статических файлов
app.use(express.static('public'));

// API эндпоинт
app.post('/api/generate-titles', async (req, res) => {
    try {
        const { topic, essayType, subject } = req.body;
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.AI_API_KEY}`,
                'HTTP-Referer': 'https://essay-title-generator.com', // Можно изменить на ваш домен
                'X-Title': 'Essay Title Generator', // Название вашего сайта
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-lite-001",
                messages: [{
                    role: "system",
                    content: "You are a helpful assistant that generates creative and academic essay titles."
                }, {
                    role: "user",
                    content: `Generate 5 creative and academic essay titles for the following parameters:
                    Topic: ${topic}
                    Type: ${essayType || 'any'}
                    Subject: ${subject || 'general'}
                    
                    Please provide only the titles, numbered 1-5, without any additional text.`
                }],
                // Оптимальные параметры для Gemini
                temperature: 0.6,      // Медианное значение для баланса креативности
                top_p: 1,             // Стандартное значение
                repetition_penalty: 1, // Стандартное значение для избежания повторений
            })
        });

        const data = await response.json();
        const titles = data.choices[0].message.content
            .split('\n')
            .filter(title => title.trim())
            .map(title => title.replace(/^\d+\.\s*/, ''));
            
        res.json({ titles });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate titles' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 