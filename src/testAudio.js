import 'babel-polyfill'
import findAudioSystem from './audioSystem'
import getConfig from './config'
import ip from './ip'

const log = require('debug')('WakeUp:Test')

const SUMMARY_FILE = 'todays_summary.mp3'

let config

getConfig()
.then(x => {
  config = x
  return findAudioSystem();
})
.then(player => {

  const AUDIO_PATH = `http://${ip()}:${config.port}/audio/`

  Promise.resolve(log('Setting summary volume'))
    .then(() => player.setVolume(config.summaryVolume || config.volume || 50))
    .then(() => log('Playing today\'s summary'))
    .then(() => player.queueNext(AUDIO_PATH + SUMMARY_FILE))
    .then(() => player.play())
    
})
.catch(err => log('Test failed', err))
