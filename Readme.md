# Text XML to PDF converter
This project is based on a client job. He wanted me to build an automation script to convert his sms backups into a pdf file, and also add the ability to run this scripts with filters by contact or phone number (phone numbers or named as they appear on the phone's contact book). It is built on Nodejs 22 and also has a browser version, in case the user is not able to install node.js. Whith the browser version, the process is different. The user first has to manually upload the backup file to the browser, enter the contacts they want filtered out and then click to Generate PDF in the browser form. The browser then will trigger downloading of the new pdf file.

## How to run 
Before running this script, first install node.js through the following linux command

```bash
sudo apt update
sudo apt install nodejs

# OR

# Download and install n and Node.js:
curl -fsSL https://raw.githubusercontent.com/mklement0/n-install/stable/bin/n-install | bash -s 22
# Node.js already installs during n-install, but you can also install it manually:
#   n install 22
# Verify the Node.js version:
node -v # Should print "v22.20.0".
# Verify npm version:
npm -v # Should print "10.9.3".
```

Then from this directory path, run this command:

```bash
node index.js

# OR

# for if you want to filter by contact (Example: Mom, Joe, Daniel, etc how it is on your contact book, or their phone number altogether like 11234567890 or +11234567890)
node index.js {phone_or_contact_1} {phone_or_contact_2} {phone_or_contact_3} ...
```

## The backup xml file source
This project doesnt include the sms xml file backup. You can import this from your android phone using this guide: https://techwiser.com/how-to-save-and-export-text-messages-from-android/#Viewing-Messages-on-the-Computer
Remember for this to work it has to be in the root of this project and be renamed to sms-data.xml

## Web browser version
We also have a web browser version of this script, in case installing node.js is not an option, you can run it from your web browser. Simply go to the folder 'bundle' inside the folder containing this file then double click on index.html. If it ask you which program to run it on, pick your web browser of preference. This browser version was tested on Brave, so by extension it should also work with Google Chrome, Chromium and Microsoft Edge.
