const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const TavilyService = require('./services/tavilyService');
const GroqService = require('./services/groqService');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Initialize services
const tavilyService = new TavilyService(process.env.TAVILY_API_KEY);
const groqService = new GroqService(process.env.GROQ_API_KEY);

// Validate API keys on startup
(async () => {
    try {
        const [tavilyValid, groqValid] = await Promise.all([
            tavilyService.validateApiKey(),
            groqService.validateApiKey()
        ]);

        if (!tavilyValid) {
            console.error('Invalid Tavily API key');
            process.exit(1);
        }
        console.log('Tavily API key validated successfully');

        if (!groqValid) {
            console.error('Invalid Groq API key');
            process.exit(1);
        }
        console.log('Groq API key validated successfully');
    } catch (error) {
        console.error('Failed to validate API keys:', error);
        process.exit(1);
    }
})();

// Log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.get('/api/health', (req, res) => {
    console.log('Health check endpoint called');
    res.json({ status: 'ok' });
});

// Search endpoint
app.post('/api/search', async (req, res) => {
    console.log('Received search request:', req.body);
    try {
        const { query, options } = req.body;
        
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            console.log('Invalid query received:', query);
            return res.status(400).json({ 
                error: 'Invalid query. Please provide a non-empty search query.' 
            });
        }

        console.log('Searching with query:', query.trim());
        const searchResults = await tavilyService.search(query.trim(), options);
        console.log('Search results received');

        // Generate AI answer if requested
        if (options?.generateAnswer) {
            console.log('Generating AI answer...');
            const aiResponse = await groqService.generateAnswer(searchResults, query.trim());
            searchResults.aiAnswer = aiResponse;
            console.log('AI answer generated');
        }

        res.json(searchResults);

    } catch (error) {
        console.error('Search error details:', error);
        res.status(error.response?.status || 500).json({ 
            error: error.message || 'Internal server error',
            details: error.response?.data || error.message
        });
    }
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`CORS enabled for origins: ${corsOptions.origin.join(', ')}`);
});
