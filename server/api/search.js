const express = require('express');
const cors = require('cors');
const TavilyService = require('../services/tavilyService');
const GroqService = require('../services/groqService');

const router = express.Router();

// Enable CORS for all routes
router.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

router.post('/', async (req, res) => {
  try {
    const { query, options } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid query. Please provide a non-empty search query.' 
      });
    }

    const tavilyService = new TavilyService(process.env.TAVILY_API_KEY);
    const groqService = new GroqService(process.env.GROQ_API_KEY);

    const searchResults = await tavilyService.search(query.trim(), options);

    if (options?.generateAnswer) {
      const aiResponse = await groqService.generateAnswer(searchResults, query.trim());
      searchResults.aiAnswer = aiResponse;
    }

    return res.json(searchResults);
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
