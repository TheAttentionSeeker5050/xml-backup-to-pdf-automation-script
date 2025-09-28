# Text XML to PDF converter

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

# The backup xml file source
This project doesnt include the sms xml file backup. You can import this from your android phone using this guide: https://techwiser.com/how-to-save-and-export-text-messages-from-android/#Viewing-Messages-on-the-Computer
Remember for this to work it has to be renamed to sms-data.xml

# Web browser version
We also have a web browser version of this script, in case installing node.js is not an option, you can run it from your web browser. Simply go to the folder 'bundle' inside the folder containing this file then double click on index.html. If it ask you which program to run it on, pick your web browser of preference. This browser version was tested on Brave, so by extension it should also work with Google Chrome, Chromium and Microsoft Edge.
