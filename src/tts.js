import 'babel-polyfill'

import fs from 'fs'
import mkdirp from 'mkdirp'
import request from 'request'
import googleTTS from 'google-tts-api'

import getConfig from './config.js'

const log = require('debug')('WakeUp:TTS')

function createSpeech(text, filename, lang = 'en', speed = 1) {
  log('Converting text to speech')
  mkdirp.sync('./audio')
  const path = `./audio/${filename}`;
  return new Promise((resolve, reject) => {
    googleTTS(text, lang, speed)
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

export default function (text, filename) {
  return getConfig()
    .then(() => {
      return createSpeech(text, filename)
    })
}
