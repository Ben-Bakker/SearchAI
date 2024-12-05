export const config = {
  runtime: 'edge',
  regions: ['fra1']  // Deploy to Frankfurt for better latency from Europe
};

import TavilyService from '../services/tavilyService';
import GroqService from '../services/groqService';

export default async function handler(req) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const body = await req.json();
    const { query, options } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid query. Please provide a non-empty search query.' }), 
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const tavilyService = new TavilyService(process.env.TAVILY_API_KEY);
    const groqService = new GroqService(process.env.GROQ_API_KEY);

    const searchResults = await tavilyService.search(query.trim(), options);

    if (options?.generateAnswer) {
      const aiResponse = await groqService.generateAnswer(searchResults, query.trim());
      searchResults.aiAnswer = aiResponse;
    }

    return new Response(JSON.stringify(searchResults), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
