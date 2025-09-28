// This parser code consist in the following components
// read the xml file data, which consist of multiple entries, first of sms and then of mms. 
// depending on which it is, the data will be stored differently in a formatted way

// Then after we get a structure we can work on, we are going to verbatim write a pdf file
// something like clyde said: this and that at 12:00 PM
// for mms, simmilar but more like oscar sent you a picture at 12:00 PM (maynbe ask the client if we should also embed the images or media in the pdf?)

// Part 1: Read, parse and store the XML file in a data structure
// const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
import { XMLParser, XMLBuilder, XMLValidator} from "fast-xml-parser";
import fs from 'fs';


// Part 1.1: Read and parse command line arguments
// Command line arguments will be the number that will be used to filter the sms/mms entries
// e.g. node index.js +11234567890
const contactArray = process.argv.slice(2).map(num => formatPhoneNumberFromCLIArgs(num).toLowerCase()); // convert to lowercase for easier comparison

const options = {
    ignoreAttributes: false,
    attributeNamePrefix : "@_",
    textNodeName : "#text",
    parseAttributeValue : true,
};

const XMLReadFile= fs.readFileSync('sms-data.xml', 'utf-8');
const parser = new XMLParser(options);
let parsedXmlOutput = parser.parse(XMLReadFile);


const smsEntries = Array.from(parsedXmlOutput.smses.sms);
const mmsEntries = Array.from(parsedXmlOutput.smses.mms);

// intermediate step: sort the entries of sms first by address then by date sent
smsEntries.sort((a, b) => {
    if (a['@_address'] < b['@_address']) return -1;
    if (a['@_address'] > b['@_address']) return 1;

    // if address is the same, sort by date sent
    if (a['@_date'] < b['@_date']) return -1;
    if (a['@_date'] > b['@_date']) return 1;
    // if both address and date sent are the same, return 1
    return 0;
});


// sort the mms entries by date sent
mmsEntries.sort((a, b) => {
    if (a['@_date'] < b['@_date']) return -1;
    if (a['@_date'] > b['@_date']) return 1;
    return 0;
});

// Part 2: Write the data structure to a PDF file

import PDFDocument from 'pdfkit';

// if received arguments, write to filtered-output.pdf
// else write to output.pdf
if (contactArray.length > 0) {
    // first delete the filtered-output.pdf if it exists
    if (fs.existsSync('filtered-output.pdf')) {
        fs.unlinkSync('filtered-output.pdf');
    }

    const doc = new PDFDocument;
    doc.pipe(fs.createWriteStream('filtered-output.pdf'));

    // first make a title
    createBigTitle(doc, "Filtered SMS and MMS Backup Report");
    createSubtitle(doc, `Filtered by phone numbers: ${contactArray.join(', ')}`);

    createTitle(doc, "SMS Entries");

    createMsgSeparator(doc);

    // filter sms entries and loop throught them to add to the pdf
    smsEntries
    .filter(sms => contactArray.includes(sms['@_address'].toString()) || contactArray.includes(sms['@_contact_name'].toString().toLowerCase()))
    .forEach((sms) => {
        createSMSEntry(doc, sms);
    });

    doc.end();

} else {
    // first delete the output.pdf if it exists
    if (fs.existsSync('output.pdf')) {
        fs.unlinkSync('output.pdf');
    }

    const doc = new PDFDocument;
    doc.pipe(fs.createWriteStream('output.pdf'));

    // first make a title
    createBigTitle(doc, "SMS and MMS Backup Report");

    createTitle(doc, "SMS Entries");

    createMsgSeparator(doc);

    // loop throught the sms to make the pdf entries

    smsEntries.forEach((sms) => {
        createSMSEntry(doc, sms);
    });

    doc.end();
}




// some reusable functions
function formatDate(timestamp) {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString(); // Format the date as per your requirement
}

function formatPhoneNumber(phoneNumber) {
    // Simple formatting: +1 (123) 456-7890
    // you receive the phone number as +11234567890

    // if item doesnt start with +1 or length is less than 12, return as is
    if (!phoneNumber.toString().startsWith('+1') || phoneNumber.toString().trim().length < 12) return phoneNumber;

    // remove spaces and non-digit characters
    let trimmedPhoneNumber = phoneNumber.toString().replace(/\D/g, ''); // the result is 11234567890
    
    return `+1 (${trimmedPhoneNumber.slice(1, 4)}) ${trimmedPhoneNumber.slice(4, 7)}-${trimmedPhoneNumber.slice(7, 11)} (${phoneNumber})`;
}

// format phone number from  altogether to 11234567890 format
function formatPhoneNumberFromCLIArgs(phoneNumber) {
    // if phone number has letters, return as is
    if (/[a-zA-Z]/.test(phoneNumber)) return phoneNumber;
    // params: phoneNumber in format 1234567890 or +11234567890
    // return: phoneNumber in format 11234567890
    let trimmedPhoneNumber = phoneNumber.toString().replace(/\D/g, ''); // remove non-digit characters

    if (trimmedPhoneNumber.length === 10) {
        return `1${trimmedPhoneNumber}`;
    } else if (trimmedPhoneNumber.startsWith('+1')) {
        return trimmedPhoneNumber.slice(1); // remove the + sign and just leave 1{trimmedPhoneNumber}
    }

    return trimmedPhoneNumber;
}

function createBigTitle(doc, title) {
    doc.fontSize(28).text(title, { align: 'center' });
    doc.moveDown();
}

function createTitle(doc, title) {
    doc.fontSize(16).text(title, { align: 'center' });
    doc.moveDown();
}

function createSubtitle(doc, subtitle) {
    doc.fontSize(12).text(subtitle, { align: 'left', fontWeight: '500' });
}

function createText(doc, text) {
    doc.fontSize(12).text(text, { align: 'left' });
}

function createMsgSeparator(doc) {
    doc.moveDown();
    doc.moveTo( 50, doc.y ).lineTo( doc.page.width - 50, doc.y ).stroke();
    doc.moveDown();
}




function createSMSEntry(doc, sms) {
    const nullValues = [null, undefined, "null", "undefined", ""];
    const phone = formatPhoneNumber(sms['@_address']);
    const body = sms['@_body'];
    const date = new Date(parseInt(sms['@_date'])).toLocaleString();
    const contact_name = sms['@_contact_name'] !== undefined ? sms['@_contact_name'] : sms['@_contact_name'] !== "(Unknown)" ? sms['@_contact_name'] : "Unknown Contact";
    const type = sms['@_type']; // 1 for received, 2 for sent
    const subject = nullValues.includes(sms['@_subject']) || sms['@_subject'].startsWith("proto:") ? "Empty Subject" : sms['@_subject'];

    if (subject !== "Empty Subject") {
        if (subject.length > 30) {
            createSubtitle(doc, `On subject: ${subject.slice(0, 30)}...`); // truncate if too long
        } else {
            createSubtitle(doc, `On subject: ${subject}`);
        }
    } 

    // now create the entry
    if (type === 1) {
        createSubtitle(doc, `${contact_name} with Phone number (${phone}) texted:`);
    } else if (type === 2) {
        createSubtitle(doc, `You texted to ${contact_name} with Phone number (${phone}):`);
    } else {
        createSubtitle(doc, `Other message type ${contact_name} with Phone number (${phone}):`);
    }
    
    createText(doc, `${body}`);
    createText(doc, `At: ${date}`);
    createMsgSeparator(doc);
}

// // import mms part parsing library if needed
// function createMMSEntry(doc, mms) {
//     const date = new Date(parseInt(mms['@_date'])).toLocaleString();
//     const contact_name = mms['@_contact_name'] !== undefined ? mms['@_contact_name'] : mms['@_contact_name'] !== "(Unknown)" ? mms['@_contact_name'] : "Unknown Contact";
//     const mmsParts = Array.isArray(mms.parts.part) ? mms.parts.part : [mms.parts.part];
//     const subject = mms['@_sub'] !== undefined ? mms['@_sub'] : "Empty Subject";
//     const address = formatPhoneNumber(mms['@_address']);
//     const msg_box = mms['@_msg_box']; // 1 for received, 2 for sent
//     const read_status = mms['@_read_status']; // 1 for read, 0 for unread
//     const m_type = mms['@_m_type']; // The type of message as defined in the MMS spec


//     // build the entry to the pdf
//     createSubtitle(doc, `On subject: ${subject}`);
//     if (msg_box === 1) {
//         createSubtitle(doc, `${contact_name} with Phone number (${address}) sent you an MMS:`);
//     } else if (msg_box === 2) {
//         createSubtitle(doc, `You sent an MMS to ${contact_name} with Phone number (${address}):`);
//     } else {
//         createSubtitle(doc, `Other message type ${contact_name} with Phone number (${address}):`);
//     }

//     createText(doc, `At: ${date}`);
//     createMsgSeparator(doc);
// }