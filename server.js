const express = require('express');
const { Client } = require("@gradio/client");
require('dotenv').config();

const app = express();
const PORT = 3000;
const API_KEY = process.env.API_KEY;

// Middleware to parse JSON body
app.use(express.json());

// Simple API Key authentication middleware
const authenticateAPIKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || apiKey !== API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
    }
    next();
};

// The main proxy endpoint
app.post('/api/chat', authenticateAPIKey, async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Bad Request: "message" field is required in the request body' });
    }

    try {
        // Connect to the Gradio client
        const client = await Client.connect("mr4425390/deepseek-ai-DeepSeek-V3");
        
        // Predict with the message
        const result = await client.predict("/chat", { 		
            message: message, 
        });

        // The result.data is an array, we return the first element which is the response
        res.json({ 
            status: 'success',
            response: result.data[0] 
        });

    } catch (error) {
        console.error("Gradio Client Error:", error);
        res.status(500).json({ error: 'Internal Server Error: Failed to connect or predict with Gradio client' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
