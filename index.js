const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const Base64 = require("js-base64").Base64;
const mimemessage = require("mimemessage");
const csv = require("csv-parser");
var colors = require('colors');

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";

// Load client secrets from a local file.
fs.readFile("client_id.json", (err, content) => {
  if (err) return console.log(colors.red("Error loading client secret file:"), err);
  // Authorize a client with credentials, then call the Gmail API.
  authorize(JSON.parse(content), batchSend);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES
  });
  console.log(colors.gray("Authorize this app by visiting this url:"), authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question(colors.green("Enter the code from that page here: "), code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) return console.error(err);
        console.log(colors.underline("Token stored to"), TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function batchSend(auth) {
  let failed = [];
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question(colors.green("Enter path to csv file of submissions: "), path => {
    const submissions = [];
    fs.createReadStream(path)
      .pipe(csv())
      .on("data", data => submissions.push(data))
      .on("end", () => {
        Ask(["Enter Email subject: ", "Enter path to Email body: "]).then(answers => {
          fs.readFile(answers[1],'utf8',(err,data)=>{
              if (err) throw err;
              submissions.forEach(submission => {
                sendMessage(
                  auth,
                  { body: data, subject: answers[0] },
                  submission.email,
                  failed
                );
              });
              if(failed.length>0){
                console.log(failed);
              }
          });  
        });
      });
      
    rl.close();
  });
  
}
function sendMessage(auth, email, recipient, failed) {
  const gmail = google.gmail({ version: "v1", auth });
  var base64EncodedEmail = Base64.encodeURI(
    createMessage(email.body, recipient, email.subject)
  );
  var request = gmail.users.messages
    .send({
      userId: "me",
      resource: {
        raw: base64EncodedEmail
      }
    })
    
    .then(() => {
      console.log(colors.cyan(`Successfully Sent to ${recipient}`));
    })
    .catch(err => {
        failed.push(recipient);
        console.log(colors.red(`Couldn't send to ${recipient}`));  
      });
}
function createMessage(messageText, reciepent, subject) {
  let mimeMsg = mimemessage.factory({
    contentType: "text/html;charset=utf-8",
    body: messageText
  });
  mimeMsg.header("to", reciepent);
  mimeMsg.header("subject", subject);

  return mimeMsg.toString();
}
const AskQuestion = (rl, question) => {
  return new Promise(resolve => {
    rl.question(colors.green(question), answer => {
      resolve(answer);
    });
  });
};

const Ask = function(questions) {
  return new Promise(async resolve => {
    let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    let results = [];
    for (let i = 0; i < questions.length; i++) {
      const result = await AskQuestion(rl, questions[i]);
      results.push(result);
    }
    rl.close();
    resolve(results);
  });
};
