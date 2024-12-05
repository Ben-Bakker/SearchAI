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

    async generateAnswer(searchResults, userQuery) {
        try {
            // Prepare context from search results
            const context = searchResults.results
                .map(result => `${result.title}\n${result.content}`)
                .join('\n\n');

            const prompt = `Based on the following search results, please provide a comprehensive answer to the question: "${userQuery}"\n\nSearch Results:\n${context}\n\nAnswer:`;

            const response = await this.client.post('/chat/completions', {
                model: 'mixtral-8x7b-32768',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that provides accurate and concise answers based on search results. Always cite sources when possible.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
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
