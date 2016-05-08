import 'babel-polyfill'
import Ivona from 'ivona-node'
import fs from 'fs'
import getConfig from './config.js'
import mkdirp from 'mkdirp'

const log = require('debug')('WakeUp:TTS')

// TODO: Maybe convert stream to promise here.
function createSpeech(text, filename, ivonaAuth, ivonaSpeech) {
  return new Promise((resolve, reject) => {
    log('Converting text to speech')
    const ivona = new Ivona(ivonaAuth)
    const stream = ivona.createVoice(text, ivonaSpeech)
    mkdirp.sync('./audio')
    stream.pipe(fs.createWriteStream(`./audio/${filename}`))
    stream.on('end', () => resolve())
    stream.on('close', () => {})
    stream.on('error', err => {
      log('Error while converting:')
      log(err)
      reject(err)
    })
  })
}

export default function (text, filename) {
  return getConfig()
    .then(({ ivonaAuth, ivonaSpeech }) => {
      return createSpeech(text, filename, ivonaAuth, ivonaSpeech)
    })
}
