const express = require('express');
const fs = require('fs');
const path = require('path');
const { title } = require('process');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(express.urlencoded({ extended: false }));

// ----HOME

app.get('/', function (req, res) {
    const meta = {
        title: 'SEGURO HYDRAULICS: Gauteng, South Africa - Service Worldwide',
        description:
            'We source hydraulic components for a wide range of industries and applications. We also service, test and repair components to OEM specification. View our range and examples of client work. We are here to help.',
    };
    const filePath = path.join(__dirname, 'data', 'repair-list.json');
    const fileData = fs.readFileSync(filePath);
    const repairs = JSON.parse(fileData);

    res.render('index', { meta: meta, repairs: repairs });
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

// ----ENQUIRY

app.get('/enquiry', function (req, res) {
    const meta = {
        title: 'HYDRAULIC COMPONENTS FOR MINING AND AGRICULTURAL MACHINERY AND TRUCKS',
        description:
            'We supply a wide range of industries with replacement hydraulic components from leading manufacturers. Fill out an enquiry form for the part you require and we will do our best to get you up and running again as soon as possible.',
    };
    res.render('enquiry', { meta: meta });
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
    const meta = {
        title: '',
        description: '',
    };
    res.render('contact', { meta: meta });
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
    const meta = {
        title: '',
        description: '',
    };
    res.render('confirm', { meta: meta });
});

// ----DYNAMIC PAGES----

// ----DASHBOARD

app.get('/dashboard', function (req, res) {
    const meta = {
        title: '',
        description: '',
    };
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
        meta: meta,
    });
});

app.get('/our-work', function (req, res) {
    const meta = {
        title: 'HYDRAULIC COMPONENT SERVICE EXCHANGE & REAIRS TO OEM SPEC',
        description:
            'We offer service exchange on some hydraulic components and repair all components to OEM specification on machinery and trucks for the mining and agricultural industries. Fill in a contact form if you need assistance on any hydraulic component for repair or servicing. Feel free to contact us with any related queries - we are always willing to offer expert advice.',
    };
    // route for dynamic content
    res.render('our-work', { meta: meta });
});

app.listen(3000);
