// read and write data

const fs = require('fs');
const path = require('path');

// ___ MESSAGES ___
// get the file path to the data file to store the new form data
const messagesPath = path.join(__dirname, '..', '/data', 'message.json');

function getStoredMessages() {
    // read the data file
    const fileData = fs.readFileSync(messagesPath);
    // convert the data file to a JS array
    const storedMessages = JSON.parse(fileData);

    return storedMessages;
}
// convert back to raw data to store the updated contents back into the file
function storeMessages(messages) {
    fs.writeFileSync(messagesPath, JSON.stringify(messages));
}

// ___ ENQUIRIES ___
// get the file to read and write to
const enquiriesPath = path.join(__dirname, '..', '/data', 'enquiry.json');

function getStoredEnquiries() {
    const fileData = fs.readFileSync(enquiriesPath);

    const storedEnquiries = JSON.parse(fileData);

    return storedEnquiries;
}

function storeEnquiries(enquiries) {
    fs.writeFileSync(enquiriesPath, JSON.stringify(enquiries));
}

// ___ REPAIRS-LIST ___
const repairsPath = path.join(__dirname, '..', '/data', 'repair-list.json');

function getFeaturedRepairs() {
    const fileData = fs.readFileSync(repairsPath);

    const storedRepairs = JSON.parse(fileData);

    return storedRepairs;
}

module.exports = {
    getStoredMessages: getStoredMessages,
    getStoredEnquires: getStoredEnquiries,
    getFeaturedRepairs: getFeaturedRepairs,
    storeMessages: storeMessages,
    storeEnquiries: storeEnquiries,
};
