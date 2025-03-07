const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fetch = require('node-fetch');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Обновляем раздачу статических файлов
app.use('/', express.static('public'));
app.use('/title-generator', express.static('public/title-generator'));
app.use('/thesis-generator', express.static('public/thesis-generator'));
app.use('/introduction-generator', express.static('public/introduction-generator'));
app.use('/conclusion-generator', express.static('public/conclusion-generator'));
app.use('/essay-generator', express.static('public/essay-generator'));

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
                'HTTP-Referer': 'https://writerai.me',
                'X-Title': 'WriterAI - AI Writing Tools',
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

// Новый эндпоинт для генератора тезисов
app.post('/api/generate-thesis', validateInput, async (req, res) => {
    try {
        const { topic, type, keywords } = req.body;
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.AI_API_KEY}`,
                'HTTP-Referer': 'https://writerai.me',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-lite-001",
                messages: [{
                    role: "user",
                    content: `Generate a strong thesis statement for:
                    Topic: ${topic}
                    Type: ${type}
                    Keywords: ${keywords}`
                }]
            })
        });

        // Обработка ответа...
        const data = await response.json();
        res.json({ thesis: data.choices[0].message.content });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate thesis' });
    }
});

// Эндпоинт для генерации введения
app.post('/api/generate-introduction', validateInput, async (req, res) => {
    try {
        const { topic, thesis, style, length } = req.body;
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.AI_API_KEY}`,
                'HTTP-Referer': 'https://writerai.me',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-lite-001",
                messages: [{
                    role: "user",
                    content: `Generate an essay introduction with these parameters:
                    Topic: ${topic}
                    Thesis: ${thesis || 'Not provided'}
                    Style: ${style}
                    Length: ${length}
                    
                    Make it engaging and appropriate for academic writing.`
                }]
            })
        });

        const data = await response.json();
        res.json({ introduction: data.choices[0].message.content });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate introduction' });
    }
});

// Эндпоинт для генерации заключения
app.post('/api/generate-conclusion', validateInput, async (req, res) => {
    try {
        const { topic, mainPoints, thesis, style } = req.body;
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.AI_API_KEY}`,
                'HTTP-Referer': 'https://writerai.me',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-lite-001",
                messages: [{
                    role: "user",
                    content: `Generate an essay conclusion with these parameters:
                    Topic: ${topic}
                    Main Points: ${mainPoints || 'Not provided'}
                    Thesis: ${thesis || 'Not provided'}
                    Style: ${style}
                    
                    Summarize the main points and reinforce the thesis.`
                }]
            })
        });

        const data = await response.json();
        res.json({ conclusion: data.choices[0].message.content });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate conclusion' });
    }
});

// Эндпоинт для генерации полного эссе
app.post('/api/generate-essay', validateInput, async (req, res) => {
    try {
        const { 
            topic, 
            type, 
            wordCount, 
            keyPoints, 
            requirements,
            includeReferences,
            formalStyle 
        } = req.body;
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.AI_API_KEY}`,
                'HTTP-Referer': 'https://writerai.me',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-lite-001",
                messages: [{
                    role: "user",
                    content: `Generate a complete ${type} essay with these parameters:
                    Topic: ${topic}
                    Word Count: ${wordCount}
                    Key Points: ${keyPoints || 'Not specified'}
                    Special Requirements: ${requirements || 'None'}
                    Style: ${formalStyle ? 'Formal Academic' : 'Standard'}
                    Include References: ${includeReferences ? 'Yes' : 'No'}
                    
                    Format the essay with clear paragraphs and proper structure.`
                }]
            })
        });

        const data = await response.json();
        res.json({ essay: data.choices[0].message.content });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate essay' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 