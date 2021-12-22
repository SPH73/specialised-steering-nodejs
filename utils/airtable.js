const Airtable = require('airtable');

Airtable.configure({
    endpointUrl: process.env.AT_ENDPOINT,
    apiKey: process.env.AT_API_KEY,
});

module.exports = { Airtable };
