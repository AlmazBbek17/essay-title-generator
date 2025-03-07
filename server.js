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
                'HTTP-Referer': 'https://essay-title-generator.up.railway.app',
                'X-Title': 'Essay Title Generator',
                'Content-Type': 'application/json',
                'OR-Organization': 'essay-title-generator'
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
                }]
            })
        });

        console.log('API Response status:', response.status);

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