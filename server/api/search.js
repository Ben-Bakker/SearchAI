export const config = {
  runtime: 'edge',
  regions: ['fra1']  // Deploy to Frankfurt for better latency from Europe
};

import TavilyService from '../services/tavilyService';
import GroqService from '../services/groqService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}
