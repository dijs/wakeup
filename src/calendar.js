import fs from 'fs'
import readline from 'readline'
import google from 'googleapis'
import googleAuth from 'google-auth-library'

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
const HOME_DIR = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
const TOKEN_DIR = HOME_DIR + '/.credentials/'
const TOKEN_PATH = TOKEN_DIR + 'calendar-wakeup.json'

function authorize(credentials, callback) {
  const clientSecret = credentials.installed.client_secret
  const clientId = credentials.installed.client_id
  const redirectUrl = credentials.installed.redirect_uris[0]
  const auth = new googleAuth()
  let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl)
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      return getNewToken(oauth2Client, callback)
    }
    oauth2Client.credentials = JSON.parse(token)
    return callback(oauth2Client)
  })
}

function getNewToken(oauth2Client, callback) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  })
  console.log('Authorize this app by visiting this url: ', authUrl)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.question('Enter the code from that page here: ', code => {
    rl.close()
    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        console.log('Error while trying to retrieve access token', err)
        return
      }
      oauth2Client.credentials = token
      storeToken(token)
      return callback(oauth2Client)
    })
  })
}

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR)
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err
    }
  }
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token))
  console.log('Token stored to ' + TOKEN_PATH)
}

export default function (callback) {
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err)
      console.log('Create your own client_secret.json file: https://github.com/jay0lee/GAM/wiki/Creating-client_secrets.json-and-oauth2service.json');
      console.log('Rename and move client secret file to wakeup directory');
      return callback(new Error('Could not load client file for calendar fetching'))
    }
    authorize(JSON.parse(content), function (auth) {
      return callback(auth, google.calendar('v3'))
    })
  })
}
