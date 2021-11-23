const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(express.urlencoded({ extended: false }));

app.get('/', function (req, res) {
    res.render('index');
});

// ----HOME

app.post('/', function (req, res) {
    // get the form data
    const message = req.body;
    // get the file path to the data file to store the new form data
    const filePath = path.join(__dirname, 'data', 'message.json');
    // read the data file
    const fileData = fs.readFileSync(filePath);
    // convert the data file to a JS array
    const storedMessages = JSON.parse(fileData);
    // push the new form data into the array
    storedMessages.push(message);
    // convert it to raw data to send back to the file
    fs.writeFileSync(filePath, JSON.stringify(storedMessages));
    // send user to a different page to prevent the warning message and resubmission of the form data or invoke the success message on the form
    res.redirect('/confirm');
});

// ----ENQUIRY

app.get('/enquiry', function (req, res) {
    res.render('enquiry');
});

app.post('/enquiry', function (req, res) {
    const enquiry = req.body;

    const filePath = path.join(__dirname, 'data', 'enquiry.json');
    const fileData = fs.readFileSync(filePath);
    const storedEnquiries = JSON.parse(fileData);
    storedEnquiries.push(enquiry);

    fs.writeFileSync(filePath, JSON.stringify(storedEnquiries));

    res.redirect('/confirm');
});

// ----CONTACT

app.get('/contact', function (req, res) {
    res.render('contact');
});

app.post('/contact', function (req, res) {
    // get the form data
    const message = req.body;
    // get the file path to the data file to store the new form data
    const filePath = path.join(__dirname, 'data', 'message.json');
    // read the data file
    const fileData = fs.readFileSync(filePath);
    // convert the data file to a JS array
    const storedMessages = JSON.parse(fileData);
    // push the new form data into the array
    storedMessages.push(message);
    // convert it to raw data to send back to the file
    fs.writeFileSync(filePath, JSON.stringify(storedMessages));
    // send user to a different page to prevent the warning message and resubmission of the form data or invoke the success message on the form
    res.redirect('/confirm');
});

app.get('/confirm', function (req, res) {
    res.render('confirm');
});

// ----DYNAMIC PAGES----

// ----DASHBOARD

app.get('/dashboard', function (req, res) {
    const messagesFilePath = path.join(__dirname, 'data', 'message.json');
    const messagesFileData = fs.readFileSync(messagesFilePath);
    const storedMessages = JSON.parse(messagesFileData);

    const enquiriesFilePath = path.join(__dirname, 'data', 'enquiry.json');
    const enquiriesFileData = fs.readFileSync(enquiriesFilePath);
    const storedEnquiries = JSON.parse(enquiriesFileData);

    res.render('dashboard', {
        numberOfMessages: storedMessages.length,
        contacts: storedMessages,
        numberOfEnquiries: storedEnquiries.length,
        enquiries: storedEnquiries,
    });
});

app.get('/our-work', function (req, res) {
    // route for dynamic content
    res.render('our-work');
});

app.listen(3000);
