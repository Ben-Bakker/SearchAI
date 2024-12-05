const axios = require('axios');

class GroqService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.groq.com/openai/v1';
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('GroqService initialized');
    }

    async validateApiKey() {
        try {
            console.log('Validating Groq API key...');
            const response = await this.client.post('/chat/completions', {
                model: 'mixtral-8x7b-32768',
                messages: [
                    {
                        role: 'user',
                        content: 'Hello'
                    }
                ]
            });
            console.log('Groq API validation response:', response.status);
            return response.status === 200;
        } catch (error) {
            console.error('Groq API key validation failed:', error.message);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
            return false;
        }
    }

    async generateAnswer(searchResults, query) {
        try {
            const systemPrompt = `You are a helpful AI assistant that generates comprehensive answers based on search results. 
            ALWAYS respond in Russian language.
            Follow these rules:
            1. Analyze all search results carefully
            2. Provide a detailed but concise answer in Russian
            3. Focus on accuracy and relevance
            4. If the information is not sufficient, state this clearly
            5. Cite sources when appropriate
            6. Keep a neutral and professional tone`;

            const messages = [
              {
                role: "system",
                content: systemPrompt
              },
              {
                role: "user",
                content: `Search results:\n${searchResults.results.map(result => 
                  `Title: ${result.title}\nContent: ${result.content}\nURL: ${result.url}\n---\n`
                ).join('\n')}\n\nBased on these search results, please provide a comprehensive answer in Russian to the query: "${query}"`
              }
            ];

            const response = await this.client.post('/chat/completions', {
                model: 'mixtral-8x7b-32768',
                messages,
                temperature: 0.7,
                max_tokens: 1000
            });

            return {
                answer: response.data.choices[0].message.content,
                model: response.data.model,
                sources: searchResults.results.map(result => ({
                    title: result.title,
                    url: result.url
                }))
            };
        } catch (error) {
            console.error('Error generating answer:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
            throw new Error('Failed to generate answer: ' + (error.response?.data?.error || error.message));
        }
    }
}

module.exports = GroqService;
