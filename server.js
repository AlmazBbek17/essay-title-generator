require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка CORS
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://writerai.me',
        'https://www.writerai.me',
        'https://writerai-production.up.railway.app'
    ],
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());
app.use(express.static('public'));

// Конфигурация API
const AI_API_KEY = process.env.AI_API_KEY;
const AI_API_URL = process.env.AI_API_URL;

// Вспомогательная функция для запросов к AI API
async function generateAIResponse(prompt, maxTokens = 500) {
    try {
        console.log('Sending request to AI API with prompt:', prompt);
        
        const response = await fetch(AI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_API_KEY}`
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a professional academic writer." },
                    { role: "user", content: prompt }
                ],
                max_tokens: maxTokens
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('AI API Error Response:', data);
            throw new Error(data.error?.message || 'AI API request failed');
        }

        if (!data.choices?.[0]?.message?.content) {
            console.error('Invalid AI API Response:', data);
            throw new Error('Invalid response from AI API');
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error('AI API Error:', error);
        throw new Error(`AI API Error: ${error.message}`);
    }
}

// API endpoints

// Генерация заголовков
app.post('/api/generate-titles', async (req, res) => {
    try {
        const { topic, type } = req.body;
        const prompt = `Generate 5 creative and engaging academic ${type} essay titles about "${topic}". Make them unique and specific.`;
        
        const response = await generateAIResponse(prompt, 200);
        const titles = response.split('\n').filter(title => title.trim());
        
        res.json({ titles });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate titles' });
    }
});

// Генерация тезисов
app.post('/api/generate-thesis', async (req, res) => {
    try {
        console.log('Received thesis generation request:', req.body);
        
        const { topic, type, keywords } = req.body;
        
        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        const prompt = `Generate 3 strong ${type || 'argumentative'} thesis statements about "${topic}"${
            keywords ? ` incorporating these keywords: ${keywords}` : ''
        }.`;

        console.log('Generated prompt:', prompt);
        
        const response = await generateAIResponse(prompt, 300);
        const theses = response.split('\n').filter(thesis => thesis.trim());
        
        if (!theses.length) {
            throw new Error('No thesis statements generated');
        }

        console.log('Generated theses:', theses);
        
        res.json({ theses });
    } catch (error) {
        console.error('Thesis generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate thesis',
            details: error.message
        });
    }
});

// Генерация введений
app.post('/api/generate-introduction', async (req, res) => {
    try {
        const { topic, thesis, style, length } = req.body;
        const prompt = `Write a ${length} ${style} introduction for an essay about "${topic}"${thesis ? ` with this thesis statement: "${thesis}"` : ''}.`;
        
        const response = await generateAIResponse(prompt, 400);
        const introductions = [response]; // В этом случае возвращаем одно введение
        
        res.json({ introductions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate introduction' });
    }
});

// Генерация заключений
app.post('/api/generate-conclusion', async (req, res) => {
    try {
        const { topic, mainPoints, thesis, style } = req.body;
        const prompt = `Write a ${style} conclusion for an essay about "${topic}"${thesis ? ` with this thesis: "${thesis}"` : ''}${mainPoints ? ` summarizing these main points: ${mainPoints}` : ''}.`;
        
        const response = await generateAIResponse(prompt, 400);
        const conclusions = [response]; // Возвращаем одно заключение
        
        res.json({ conclusions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate conclusion' });
    }
});

// Генерация полного эссе
app.post('/api/generate-essay', async (req, res) => {
    try {
        const { topic, type, wordCount, keyPoints, requirements, includeReferences, formalStyle } = req.body;
        
        const style = formalStyle ? 'formal academic' : 'standard';
        const prompt = `Write a ${wordCount}-word ${style} ${type} essay about "${topic}"${
            keyPoints ? ` covering these key points: ${keyPoints}` : ''
        }${requirements ? `. Additional requirements: ${requirements}` : ''
        }${includeReferences ? '. Include references in APA format.' : ''
        }`;

        const response = await generateAIResponse(prompt, 1500);
        res.json({ essay: response });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate essay' });
    }
});

// Обработка всех остальных запросов
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Глобальная обработка ошибок
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ 
        error: 'Something went wrong!',
        details: err.message 
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('AI API URL:', AI_API_URL);
    console.log('API Key configured:', !!AI_API_KEY);
}); 