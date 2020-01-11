import fs from 'fs'
import readline from 'readline'
import google from 'googleapis'
import googleAuth from 'google-auth-library'

const log = require('debug')('WakeUp:Calendar')

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
    const credentials = JSON.parse(token);
    // Make sure the token has not expired
    if (Date.now() > credentials.expiry_date) {
      return getNewToken(oauth2Client, callback) 
    }
    oauth2Client.credentials = credentials
    return callback(oauth2Client)
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
  log('Token stored to ' + TOKEN_PATH)
}

function getNewToken(oauth2Client, callback) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  })
  log('Authorize this app by visiting this url: ', authUrl)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  rl.question('Enter the code from that page here: ', code => {
    rl.close()
    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        log('Error while trying to retrieve access token', err)
        return
      }
      oauth2Client.credentials = token
      storeToken(token)
      callback(oauth2Client)
      return
    })
  })
}

export default function (callback) {
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    log('Read client secrets')
    if (err) {
      log('Error loading client secret file: ' + err)
      log('Create your own client_secret.json file: https://github.com/jay0lee/GAM/wiki/CreatingClientSecretsFile');
      log('Rename and move client secret file to wakeup directory');
      return callback(null, null, new Error('Could not load client file for calendar fetching'))
    }
    authorize(JSON.parse(content), function (auth) {
      return callback(auth, google.calendar('v3'))
    })
  })
}
