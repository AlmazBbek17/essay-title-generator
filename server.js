const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fetch = require('node-fetch');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Раздача статических файлов
app.use(express.static('public'));

// Middleware для валидации
const validateInput = (req, res, next) => {
    const { topic } = req.body;
    if (!topic || topic.trim().length < 3) {
        return res.status(400).json({ 
            error: 'Topic must be at least 3 characters long' 
        });
    }
    next();
};

// API эндпоинт
app.post('/api/generate-titles', validateInput, async (req, res) => {
    try {
        const { topic, essayType, subject } = req.body;
        
        // Проверяем API ключ
        if (!process.env.AI_API_KEY) {
            throw new Error('API key is not configured');
        }
        console.log('API Key starts with:', process.env.AI_API_KEY.substring(0, 10) + '...');

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.AI_API_KEY}`,
                'HTTP-Referer': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-lite-001",
                messages: [{
                    role: "user",
                    content: `Generate 5 essay titles about: ${topic}`
                }]
            })
        });

        // Проверяем статус ответа
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API request failed: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log('API Response data:', data);

        if (!data.choices || !data.choices[0]) {
            throw new Error('Invalid API response: ' + JSON.stringify(data));
        }

        const titles = data.choices[0].message.content
            .split('\n')
            .filter(title => title.trim())
            .map(title => title.replace(/^\d+\.\s*/, ''));
            
        if (titles.length === 0) {
            throw new Error('No titles generated');
        }

        res.json({ titles });
    } catch (error) {
        console.error('Full error:', error);
        res.status(500).json({ 
            error: 'Failed to generate titles',
            details: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 