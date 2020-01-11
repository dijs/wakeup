import 'babel-polyfill'

import util from 'util'
import mkdirp from 'mkdirp'
import tts from './tts'

const exec = util.promisify(require('child_process').exec);

const log = require('debug')('WakeUp:SummaryAudio')

const maxFreeLength = 200

export default function generateSummaryAudio(text, filename) {
  mkdirp.sync('./audio')
  const parts = Math.ceil(text.length / maxFreeLength)
  const partials = []
  log('Generating', parts, 'partials for summary audio')
  for (let i = 0; i < parts; i++) {
    const start = i * maxFreeLength
    const partial = text.substring(start, start + maxFreeLength)
    // TODO: Deal with spacing later...
    partials.push(partial)
  }
  const partFilenames = partials.map((_, i) => `audio/part${i}.mp3`)
  return Promise.all(partials.map((t, i) => tts(t, partFilenames[i]))).then(() => {
    const command = `ffmpeg -i "concat:${partFilenames.join('|')}" -acodec copy audio/${filename}`
    return exec(command)
  })
}
