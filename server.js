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
        
        // Здесь будет ваш код для работы с AI API
        const response = await fetch('YOUR_AI_API_ENDPOINT', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.AI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ topic, essayType, subject })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate titles' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 