const axios = require('axios');

class TavilyService {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('Tavily API key is required');
        }
        this.apiKey = apiKey;
        this.baseURL = 'https://api.tavily.com';
        console.log('TavilyService initialized');
    }

    /**
     * Validates the API key by making a test search request
     */
    async validateApiKey() {
        try {
            console.log('Validating Tavily API key...');
            const response = await axios.post(`${this.baseURL}/search`, {
                api_key: this.apiKey,
                query: "test",
                max_results: 1
            });
            console.log('API key validation successful');
            return true;
        } catch (error) {
            console.error('API key validation error:', {
                message: error.message,
                response: error.response?.data
            });
            throw error;
        }
    }

    /**
     * Removes duplicate results based on URL and content similarity
     */
    #removeDuplicates(results) {
        const seen = new Set();
        return results.filter(result => {
            const key = result.url + result.content.substring(0, 100);
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    /**
     * Formats search results into a consistent structure
     */
    #formatResults(results) {
        return results.map(result => ({
            title: result.title || 'No title',
            content: result.content || 'No content available',
            url: result.url,
            score: result.score || 0,
            published_date: result.published_date || null
        }));
    }

    /**
     * Performs a search query and returns structured results
     */
    async search(query, options = {}) {
        try {
            console.log('Starting search with query:', query);
            console.log('Search options:', options);

            const defaultOptions = {
                max_results: 5,
                search_depth: "advanced",
                include_domains: [],
                exclude_domains: []
            };

            const searchOptions = { ...defaultOptions, ...options };

            const response = await axios.post(`${this.baseURL}/search`, {
                api_key: this.apiKey,
                query,
                ...searchOptions
            });

            console.log('Raw search response:', response.data);

            if (!response.data.results) {
                console.error('Invalid response format:', response.data);
                throw new Error('Invalid response format from Tavily API');
            }

            const cleanResults = this.#removeDuplicates(response.data.results);
            const formattedResults = this.#formatResults(cleanResults);

            console.log('Processed results count:', formattedResults.length);
            return { results: formattedResults };

        } catch (error) {
            console.error('Search error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    }
}

module.exports = TavilyService;
