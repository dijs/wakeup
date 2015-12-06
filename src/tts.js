import 'babel/polyfill'
import Ivona from 'ivona-node'
import fs from 'fs'
import getConfig from './config.js'

// TODO: Maybe convert stream to promise here.
function createSpeech(text, filename, ivonaAuth, ivonaSpeech) {
  return new Promise((resolve, reject) => {
    const ivona = new Ivona(ivonaAuth)
    const stream = ivona.createVoice(text, ivonaSpeech)
    stream.pipe(fs.createWriteStream('./audio/' + filename))
    stream.on('end', () => resolve())
    stream.on('close', () => {})
    stream.on('error', err => reject(err))
  })
}

export default function (text, filename) {
  return getConfig()
    .then(({ivonaAuth, ivonaSpeech}) => {
      return createSpeech(text, filename, ivonaAuth, ivonaSpeech)
    })
}
