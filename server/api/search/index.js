const cors = require('../_cors');
const TavilyService = require('../../services/tavilyService');
const GroqService = require('../../services/groqService');
const dotenv = require('dotenv');

dotenv.config();

const tavilyService = new TavilyService(process.env.TAVILY_API_KEY);
const groqService = new GroqService(process.env.GROQ_API_KEY);

module.exports = async (req, res) => {
    // Handle CORS
    if (cors(req, res)) return;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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
};
