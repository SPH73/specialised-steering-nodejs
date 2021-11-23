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

app.get('/enquiry', function (req, res) {
    res.render('enquiry');
});

app.post('/enquiry', function (req, res) {
    const enquiry = req.body;

    const filePath = path.join(__dirname, 'data', 'enquiry.json');
    const fileData = fs.readFileSync(filePath);
    const existingEnquiries = JSON.parse(fileData);
    existingEnquiries.push(enquiry);

    fs.writeFileSync(filePath, JSON.stringify(existingEnquiries));

    res.redirect('/confirm');
});

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

app.get('/dashboard', function (req, res) {
    const messagesFilePath = path.join(__dirname, 'data', 'message.json');
    const messagesFileData = fs.readFileSync(messagesFilePath);
    const storedMessages = JSON.parse(messagesFileData);

    const enquiriesFilePath = path.join(__dirname, 'data', 'enquiry.json');
    const enquiriesFileData = fs.readFileSync(enquiriesFilePath);
    const storedEnquiries = JSON.parse(enquiriesFileData);

    res.render('dashboard', {
        numberOfMessages: storedMessages.length,
        numberOfEnquiries: storedEnquiries.length,
    });
});

app.get('/about', function (req, res) {
    res.render('about');
});

app.get('/our-work', function (req, res) {
    // route for dynamic content
    res.render('our-work');
});

app.get('/register', function (req, res) {
    res.render('register');
});

app.get('/login', function (req, res) {
    res.render('login');
});

app.get('/disclaimer', function (req, res) {
    res.render('login');
});

app.get('/terms', function (req, res) {
    res.render('terms-of-sale');
});

// app.post('/store-enquiry', function (req, res) {
//     const enquiry = req.body;

//     const filePath = path.join(__dirname, 'data', 'enquiry.json');
//     const fileData = fs.readFileSync(filePath);
//     const existingEnquiries = JSON.parse(fileData);
//     existingEnquiries.push(enquiry);

//     fs.writeFileSync(filePath, JSON.stringify(existingEnquiries));

//     res.send('<h1>Request sent!</h1>');
// });

// app.get('/enquiries', function (req, res) {
//     const filePath = path.join(__dirname, 'data', 'enquiry.json');

//     const fileData = fs.readFileSync(filePath);
//     const storedEnquiries = JSON.parse(fileData);

//     let responseData = '<ol>';

//     for (const enquiry of storedEnquiries) {
//         responseData +=
//             '<li><p>Date: ' +
//             enquiry.posted +
//             '</p><p>Name: ' +
//             enquiry.name +
//             '</p><p>Email: ' +
//             enquiry.email +
//             '</p><p>Message: ' +
//             enquiry.message +
//             '</p></li>';
//     }

//     responseData += '</ol>';

//     res.send(responseData);
// });

// app.post('/store-message', function (req, res) {
//     const message = req.body;

//     const filePath = path.join(__dirname, 'data', 'message.json');
//     const fileData = fs.readFileSync(filePath);
//     const existingMessages = JSON.parse(fileData);
//     existingMessages.push(message);

//     fs.writeFileSync(filePath, JSON.stringify(existingMessages));

//     res.send('<h1>Message saved!</h1>');
// });

// app.get('/messages', function (req, res) {
//     const filePath = path.join(__dirname, 'data', 'message.json');

//     const fileData = fs.readFileSync(filePath);
//     const storedMessages = JSON.parse(fileData);

//     let responseData = '<ol>';

//     for (const message of storedMessages) {
//         responseData +=
//             '<li><p>Date: ' +
//             message.posted +
//             '</p><p>Name: ' +
//             message.name +
//             '</p><p>Email: ' +
//             message.email +
//             '</p><p>Message: ' +
//             message.message +
//             '</p></li>';
//     }

//     responseData += '</ol>';

//     res.send(responseData);
// });

app.listen(3000);
