const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.static('public'));

// app.use(express.urlencoded({ extended: false }));

app.get('/', function (req, res) {
    const htmlFilePath = path.join(__dirname, 'views', 'index.html');
    res.sendFile(htmlFilePath);
});

app.get('/about', function (req, res) {
    const htmlFilePath = path.join(__dirname, 'views', 'about.html');
    res.sendFile(htmlFilePath);
});

app.get('/our-work', function (req, res) {
    // route for dynamic content
    const htmlFilePath = path.join(__dirname, 'views', 'our-work.html');
    res.sendFile(htmlFilePath);
});

app.get('/register', function (req, res) {
    const htmlFilePath = path.join(__dirname, 'views', 'register.html');
    res.sendFile(htmlFilePath);
});

app.get('/login', function (req, res) {
    const htmlFilePath = path.join(__dirname, 'views', 'login.html');
    res.sendFile(htmlFilePath);
});

app.get('/disclaimer', function (req, res) {
    const htmlFilePath = path.join(__dirname, 'views', 'disclaimer.html');
    res.sendFile(htmlFilePath);
});

app.get('/terms', function (req, res) {
    const htmlFilePath = path.join(__dirname, 'views', 'terms-of-sale.html');
    res.sendFile(htmlFilePath);
});

app.get('/enquiry', function (req, res) {
    const htmlFilePath = path.join(__dirname, 'views', 'enquiry.html');
    res.sendFile(htmlFilePath);
});

app.post('/store-enquiry', function (req, res) {
    const enquiry = req.body;

    const filePath = path.join(__dirname, 'data', 'enquiry.json');
    const fileData = fs.readFileSync(filePath);
    const existingEnquiries = JSON.parse(fileData);
    existingEnquiries.push(enquiry);

    fs.writeFileSync(filePath, JSON.stringify(existingEnquiries));

    res.send('<h1>Request sent!</h1>');
});

app.get('/enquiries', function (req, res) {
    const filePath = path.join(__dirname, 'data', 'enquiry.json');

    const fileData = fs.readFileSync(filePath);
    const existingEnquiries = JSON.parse(fileData);

    let responseData = '<ol>';

    for (const enquiry of existingEnquiries) {
        responseData +=
            '<li><p>Date: ' +
            enquiry.posted +
            '</p><p>Name: ' +
            enquiry.name +
            '</p><p>Email: ' +
            enquiry.email +
            '</p><p>Message: ' +
            enquiry.message +
            '</p></li>';
    }

    responseData += '</ol>';

    res.send(responseData);
});

app.get('/contact', function (req, res) {
    const htmlFilePath = path.join(__dirname, 'views', 'contact.html');
    res.sendFile(htmlFilePath);
});
app.post('/store-message', function (req, res) {
    const message = req.body;

    const filePath = path.join(__dirname, 'data', 'message.json');
    const fileData = fs.readFileSync(filePath);
    const existingMessages = JSON.parse(fileData);
    existingMessages.push(message);

    fs.writeFileSync(filePath, JSON.stringify(existingMessages));

    res.send('<h1>Message saved!</h1>');
});

app.get('/messages', function (req, res) {
    const filePath = path.join(__dirname, 'data', 'message.json');

    const fileData = fs.readFileSync(filePath);
    const existingMessages = JSON.parse(fileData);

    let responseData = '<ol>';

    for (const message of existingMessages) {
        responseData +=
            '<li><p>Date: ' +
            message.posted +
            '</p><p>Name: ' +
            message.name +
            '</p><p>Email: ' +
            message.email +
            '</p><p>Message: ' +
            message.message +
            '</p></li>';
    }

    responseData += '</ol>';

    res.send(responseData);
});

app.listen(3000);
