const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.urlencoded({ extended: false }));

app.get('/', function (req, res) {
    res.send('<h1>Homepage</h1>');
});

app.get('/about', function (req, res) {
    res.send('<h1>About page</h1>');
});

app.get('/our-work', function (req, res) {
    res.send('<h1>Our Work page</h1>');
});

app.get('/register', function (req, res) {
    res.send('<h1>Register User</h1>');
});

app.get('/login', function (req, res) {
    res.send('<h1>login User</h1>');
});

app.get('/disclaimer', function (req, res) {
    res.send('<h1>Disclaimer</h1>');
});

app.get('/enquiry', function (req, res) {
    res.send(
        '<div><br><div><form action="/store-enquiry" method="POST"><br><div><input type="hidden" id="date" name="posted" value="date"</input><input type="text" name="name" placeholder="Your name"></div><div><input type="email" name="email" placeholder="Your email"><div><textarea type="text" name="message" placeholder="How can we help you?"></textarea></div><div><button>Submit</button></form></div></div> <script>const d = new Date(); document.getElementById("date").value = d.toISOString();</script>',
    );
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
    res.send(
        '<div><br><div><form action="/store-message" method="POST"><br><div><input type="hidden" id="date" name="posted" value="date"</input><input type="text" name="name" placeholder="Your name"></div><div><input type="email" name="email" placeholder="Your email"><div><textarea type="text" name="message" placeholder="How can we help you?"></textarea></div><div><button>Submit</button></form></div></div> <script>const d = new Date(); document.getElementById("date").value = d.toISOString();</script>',
    );
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
