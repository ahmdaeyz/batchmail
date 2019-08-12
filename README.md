# batchmail
Automates Emailing Events' attendees for GDG Damanhour 
### Getting it to work : 
##### - Go to your Google Developer [Console](https://console.developers.google.com) 
##### - Create a Project and enable The Gmail API for it.
##### - Go to Credentials (in the List to left) 
##### - Click on Create Credentials and Choose OAuth Client ID from the Drop down 
##### - Download the credentials json file and rename it to "client_id.json"
##### - Clone The Repo and move the json to its directory 
##### - Run 'npm install' to get the dependencies 
##### - NOW you are good to go !

### What you need to know : 
##### - Email adresses are expected to be in a csv file (most likely generated from a docs document from a google forms outputed sheet) 
##### - Email body can be (and should) in html 
##### - Failures are reported instantly to the console just like successes
### Important Links :
[Quick Start Tutorial](https://developers.google.com/gmail/api/quickstart/nodejs)</br>
[Gmail API Reference](https://developers.google.com/gmail/api/v1/reference/)
