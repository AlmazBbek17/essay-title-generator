# WriterAI

AI-powered writing tools for generating essay titles, thesis statements, introductions, conclusions, and full essays.

## Features

- Essay Title Generator
- Thesis Statement Generator
- Introduction Generator
- Conclusion Generator
- Full Essay Generator

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/writerai.git
cd writerai
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your API credentials:
```
AI_API_KEY=your_api_key_here
AI_API_URL=https://openrouter.ai/api/v1/chat/completions
PORT=3000
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Production

For production deployment:
```bash
npm start
```

## API Endpoints

- POST `/api/generate-titles` - Generate essay titles
- POST `/api/generate-thesis` - Generate thesis statements
- POST `/api/generate-introduction` - Generate essay introductions
- POST `/api/generate-conclusion` - Generate essay conclusions
- POST `/api/generate-essay` - Generate full essays

## Technologies

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- AI: OpenRouter API (GPT-3.5 Turbo)

## License

ISC 