import 'babel-polyfill'
import tts from './tts'
import getForecast from './forecast'
import ip from './ip'
import dimAllLights from './lights'
import getSchedules from './schedules'
import duration from './duration'
import summary from './summary'
import findAudioSystem from './audioSystem'
import getConfig from './config'

const log = require('debug')('WakeUp:Alarm')

const SUMMARY_FILE = 'todays_summary.mp3'

const now = () => +new Date()

// TODO: Use module for this
const timeout = millis => new Promise(resolve => setTimeout(resolve, millis))

// TODO: Move into another file
// returns duration and file
function fetchSummaryDuration() {
  log('Fetching forecast and schedules')
  return Promise.all([
    getForecast(),
    getSchedules(),
  ]).then(([weather, schedules]) => {
    const summaryText = summary(weather, schedules)
    log('Converting summary to speech')
    return tts(summaryText, SUMMARY_FILE)
    .then(() => log('Fetching duration of summary'))
    .then(() => duration(`${__dirname}/../audio/${SUMMARY_FILE}`))
  })
}

function alarm(config, player, summaryDuration) {
  if (config.off === true) {
    return 'off'
  }

  const AUDIO_PATH = `http://${ip()}:${config.port}/audio/`

  const {
    setVolume, queueNext, play,
  } = player

  function playSong() {
    if (config.song) {
      log('Setting song volume')
      return setVolume(config.songVolume)
        .then(() => log(`Queuing song: ${config.song}`))
        .then(() => queueNext(AUDIO_PATH + config.song))
        .then(() => log(`Playing song: ${config.song}`))
        .then(() => play())
    }
    log('Warning: No custom song set in config and added to audio directory')
    return Promise.resolve()
  }

  function playRadio() {
    if (config.radioUri) {
      return Promise.resolve()
        .then(() => log('Setting radio volume'))
        .then(() => setVolume(config.radioVolume))
        .then(() => log('Starting radio'))
        .then(() => queueNext(config.radioUri, config.radioMetadata))
        .then(() => play())
    }
    return Promise.resolve()
  }

  // TODO: Make promise chain nicer...
  // TODO: Move this out into a timer handler...
  const startedAlarm = now()
  log(`Started alarm at: ${startedAlarm}`)
  log('Setting song volume')
  return playSong()
    .then(() => log('Dimming lights on'))
    .then(() => dimAllLights())
    .then(() => {
      // TODO: This should be handled better, more external
      const playedAlarm = now() - startedAlarm
      const alarmTimeLeft = Math.max(0, config.minAlarmTime - playedAlarm)
      log(`Alarm time left: ${alarmTimeLeft}`)
      return timeout(alarmTimeLeft)
    })
    .then(() => log('Setting summary volume'))
    .then(() => setVolume(config.summaryVolume))
    .then(() => log('Playing today\'s summary'))
    .then(() => queueNext(AUDIO_PATH + SUMMARY_FILE))
    .then(() => play())
    .then(() => log(`Should be saying summary (${summaryDuration} sec)`))
    // TODO: Add duration padding for radio to start?
    .then(() => timeout(Math.round(summaryDuration + 3) * 1000))
    .then(() => playRadio())
    .then(() => log('done'))
}

export default function () {
  log('Gathering data for alarm');
  return Promise.all([getConfig(), findAudioSystem(), fetchSummaryDuration()])
    .then(([config, player, summaryDuration]) => {
      return alarm(config, player, summaryDuration)
    })
    .catch(err => log(err))
}
