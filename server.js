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
        
        console.log('Generating titles for:', { topic, essayType, subject });

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.AI_API_KEY}`,
                'HTTP-Referer': 'https://essay-title-generator.com',
                'X-Title': 'Essay Title Generator',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-lite-001",
                messages: [{
                    role: "user",
                    content: `Generate 5 creative and academic essay titles for the following parameters:
                    Topic: ${topic}
                    Type: ${essayType || 'any'}
                    Subject: ${subject || 'general'}
                    
                    Please provide only the titles, numbered 1-5, without any additional text.`
                }],
                temperature: 0.7,
                max_tokens: 200
            })
        });

        console.log('API Response status:', response.status);

        const data = await response.json();
        console.log('API Response data:', data);

        // Проверяем структуру ответа
        if (data.error) {
            throw new Error(`API Error: ${JSON.stringify(data.error)}`);
        }

        let titles;
        if (data.choices && data.choices[0] && data.choices[0].message) {
            titles = data.choices[0].message.content
                .split('\n')
                .filter(title => title.trim())
                .map(title => title.replace(/^\d+\.\s*/, ''));
        } else if (data.choices && data.choices[0] && data.choices[0].text) {
            titles = data.choices[0].text
                .split('\n')
                .filter(title => title.trim())
                .map(title => title.replace(/^\d+\.\s*/, ''));
        } else {
            throw new Error('Unexpected API response format: ' + JSON.stringify(data));
        }

        if (titles.length === 0) {
            throw new Error('No titles generated');
        }

        res.json({ titles });
    } catch (error) {
        console.error('Error details:', error);
        res.status(500).json({ 
            error: 'Failed to generate titles',
            details: error.message,
            stack: error.stack
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 