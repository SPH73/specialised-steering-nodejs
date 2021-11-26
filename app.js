const express = require('express');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');

const data = require('./utils/stored-data');

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
    const repairs = data.getFeaturedRepairs();

    res.render('index', { meta: meta, repairs: repairs });
});

app.post('/', function (req, res) {
    // get the form data
    const message = req.body;
    message.id = uuid.v4;
    // get the converted stored messages from the data file
    const messages = data.getStoredMessages();
    // push the new form data into the array
    messages.push(message);
    // convert it to raw data to send back to the data file
    data.storeMessages(messages);

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
    enquiry.id = uuid.v4;
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
        title: 'CONTACT US FOR ALL YOUR HYDRAULIC REPAIRS AND PART SERVICE EXCHANGE',
        description:
            'With our combined 40 years of experience, we offer an expert and professional service for all your hydraulic component requirements. Please contact us today to let us know how we can help get you back up and running.',
    };
    res.render('contact', { meta: meta });
});

app.post('/contact', function (req, res) {
    const message = req.body;
    message.id = uuid.v4;

    const messages = data.getStoredMessages();
    messages.push(message);
    data.storeMessages(messages);

    res.redirect('/confirm');
});

app.get('/confirm', function (req, res) {
    const meta = {
        title: '',
        description: '',
    };
    res.render('confirm');
});

// ----DYNAMIC PAGES----

// ----DASHBOARD

app.get('/dashboard', function (req, res) {
    const messages = data.getStoredMessages();
    const enquiries = data.getStoredEnquires();

    res.render('dashboard', {
        numberOfMessages: messages.length,
        messages: messages,
        numberOfEnquiries: enquiries.length,
        enquiries: enquiries,
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

app.get('/our-work/:id', function (req, res) {
    const meta = {
        title: 'HYDRAULIC COMPONENT SERVICE EXCHANGE & REAIRS TO OEM SPEC',
        description:
            'We offer service exchange on some hydraulic components and repair all components to OEM specification on machinery and trucks for the mining and agricultural industries. Fill in a contact form if you need assistance on any hydraulic component for repair or servicing. Feel free to contact us with any related queries - we are always willing to offer expert advice.',
    };
    const repairId = req.params.id;
    const repairs = data.getFeaturedRepairs();

    for (const repair of repairs) {
        if (repair.jobId === repairId) {
            return res.render('our-work-detail', {
                meta: meta,
                repair: repair,
            });
        }
    }
    res.render('404');
});

// handle Errors
app.use(function (req, res) {
    res.render('404');
});

app.use(function (error, req, res, next) {
    res.render('500');
});
app.listen(3000);
