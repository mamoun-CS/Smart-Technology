const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = process.env.GMAIL_CLIENT_ID  ;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET ;
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI ;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = ['https://mail.google.com/'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
});

console.log('\n============================================');
console.log('  Gmail OAuth2 Refresh Token Generator');
console.log('============================================\n');
console.log('1. Open this URL in your browser:\n');
console.log(authUrl);
console.log('\n2. Sign in with your Gmail account and authorize.');
console.log('3. Copy the authorization code from the redirect URL.\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Paste the authorization code here: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n============================================');
    console.log('  SUCCESS! Add this to your .env file:');
    console.log('============================================\n');
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}\n`);
  } catch (error) {
    console.error('Error getting tokens:', error.message);
  }
  rl.close();
});
