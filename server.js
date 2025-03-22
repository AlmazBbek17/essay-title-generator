require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка лимита запросов
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100 // лимит 100 запросов на IP
});

// Применяем лимит запросов
app.use('/api/', limiter);

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

// Проверка наличия необходимых переменных окружения
if (!AI_API_KEY || !AI_API_URL) {
    console.error('Missing required environment variables');
    process.exit(1);
}

// Middleware для проверки запросов
const validateRequest = (req, res, next) => {
    const { topic, type } = req.body;
    
    if (!topic || topic.trim().length === 0) {
        return res.status(400).json({ 
            error: 'Topic is required',
            details: 'Please provide a non-empty topic'
        });
    }
    
    if (topic.length > 500) {
        return res.status(400).json({ 
            error: 'Topic too long',
            details: 'Topic should be less than 500 characters'
        });
    }
    
    next();
};

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
                max_tokens: maxTokens,
                temperature: 0.7,
                top_p: 1,
                frequency_penalty: 0.5,
                presence_penalty: 0.5
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('AI API Error Response:', errorData);
            throw new Error(errorData.error?.message || 'AI API request failed');
        }

        const data = await response.json();
        
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
app.post('/api/generate-titles', validateRequest, async (req, res) => {
    try {
        const { topic, type = 'academic' } = req.body;
        const prompt = `Generate 5 creative and engaging ${type} essay titles about "${topic}". Make them unique and specific.`;
        
        const response = await generateAIResponse(prompt, 200);
        const titles = response.split('\n').filter(title => title.trim());
        
        if (titles.length === 0) {
            throw new Error('No titles generated');
        }
        
        res.json({ 
            success: true,
            titles,
            count: titles.length
        });
    } catch (error) {
        console.error('Title generation error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to generate titles',
            details: error.message
        });
    }
});

// Генерация тезисов
app.post('/api/generate-thesis', validateRequest, async (req, res) => {
    try {
        const { topic, type = 'argumentative', keywords } = req.body;
        
        const prompt = `Generate 3 strong ${type} thesis statements about "${topic}"${
            keywords ? ` incorporating these keywords: ${keywords}` : ''
        }.`;
        
        const response = await generateAIResponse(prompt, 300);
        const theses = response.split('\n').filter(thesis => thesis.trim());
        
        if (theses.length === 0) {
            throw new Error('No thesis statements generated');
        }
        
        res.json({ 
            success: true,
            theses,
            count: theses.length
        });
    } catch (error) {
        console.error('Thesis generation error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to generate thesis',
            details: error.message
        });
    }
});

// Генерация введений
app.post('/api/generate-introduction', validateRequest, async (req, res) => {
    try {
        const { topic, thesis, style = 'academic', length = 'medium' } = req.body;
        const prompt = `Write a ${length} ${style} introduction for an essay about "${topic}"${
            thesis ? ` with this thesis statement: "${thesis}"` : ''
        }. Make it engaging and hook the reader from the first sentence.`;
        
        const response = await generateAIResponse(prompt, 400);
        
        res.json({ 
            success: true,
            introduction: response
        });
    } catch (error) {
        console.error('Introduction generation error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to generate introduction',
            details: error.message
        });
    }
});

// Генерация заключений
app.post('/api/generate-conclusion', validateRequest, async (req, res) => {
    try {
        const { topic, mainPoints, thesis, style = 'academic' } = req.body;
        const prompt = `Write a ${style} conclusion for an essay about "${topic}"${
            thesis ? ` with this thesis: "${thesis}"` : ''
        }${mainPoints ? ` summarizing these main points: ${mainPoints}` : ''
        }. Make it impactful and memorable.`;
        
        const response = await generateAIResponse(prompt, 400);
        
        res.json({ 
            success: true,
            conclusion: response
        });
    } catch (error) {
        console.error('Conclusion generation error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to generate conclusion',
            details: error.message
        });
    }
});

// Генерация полного эссе
app.post('/api/generate-essay', validateRequest, async (req, res) => {
    try {
        const { 
            topic, 
            type = 'academic', 
            wordCount = 1000, 
            keyPoints, 
            requirements, 
            includeReferences = false, 
            formalStyle = true 
        } = req.body;
        
        const style = formalStyle ? 'formal academic' : 'standard';
        const prompt = `Write a ${wordCount}-word ${style} ${type} essay about "${topic}"${
            keyPoints ? ` covering these key points: ${keyPoints}` : ''
        }${requirements ? `. Additional requirements: ${requirements}` : ''
        }${includeReferences ? '. Include references in APA format.' : ''
        }. Ensure proper structure with introduction, body paragraphs, and conclusion.`;

        const response = await generateAIResponse(prompt, 1500);
        
        res.json({ 
            success: true,
            essay: response,
            wordCount: response.split(/\s+/).length
        });
    } catch (error) {
        console.error('Essay generation error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to generate essay',
            details: error.message
        });
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
        success: false,
        error: 'Something went wrong!',
        details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('AI API URL configured:', !!AI_API_URL);
    console.log('API Key configured:', !!AI_API_KEY);
}); 