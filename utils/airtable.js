const Airtable = require('airtable');

// Ensure dotenv is loaded (in case this module is loaded before app.js)
if (!process.env.AT_API_KEY) {
    require('dotenv').config();
}

// Log configuration for debugging (without exposing full key)
const apiKey = process.env.AT_API_KEY;
if (apiKey) {
    console.log('📊 Airtable config: API key length =', apiKey.length, 'starts with:', apiKey.substring(0, 10));
} else {
    console.error('❌ Airtable config: AT_API_KEY not found in environment');
}

Airtable.configure({
    endpointUrl: process.env.AT_ENDPOINT || 'https://api.airtable.com',
    apiKey: apiKey,
});

module.exports = { Airtable };
