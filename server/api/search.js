const TavilyService = require('../services/tavilyService');
const GroqService = require('../services/groqService');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize services
const tavilyService = new TavilyService(process.env.TAVILY_API_KEY);
const groqService = new GroqService(process.env.GROQ_API_KEY);

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', 'https://search-ai-l3g1.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Handle POST request
    if (req.method === 'POST') {
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
            console.error('Search error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
