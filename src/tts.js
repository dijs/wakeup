import 'babel-polyfill'

import fs from 'fs'
import request from 'request'
import googleTTS from 'google-tts-api'

import getConfig from './config.js'

const log = require('debug')('WakeUp:TTS')

const maxFreeLength = 200

function createSpeech(text, path, lang = 'en', speed = 1) {
  log('Converting text to speech')
  return new Promise((resolve, reject) => {
    googleTTS(text.substring(0, maxFreeLength), lang, speed)
      .then(url => {
        const req = request(url);
        log('Generated URL', url)
        req.on('response', res => {
          res.pipe(fs.createWriteStream(path));
        })
        req.on('end', () => {
          resolve();
        })
        req.on('error', (err) => {
          log('Error while saving converted text to speech', err)
          reject(err);
        })
      })
      .catch(err => {
        log('Error while converting text to speech', err)
        reject(err)
      })
  })
}

export default function (text, path) {
  return getConfig()
    .then(() => {
      return createSpeech(text, path)
    })
}
