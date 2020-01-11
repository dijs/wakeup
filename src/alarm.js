import 'babel-polyfill'
import fs from 'fs'
import generateSummaryAudio from './generateSummaryAudio'
import getForecast from './forecast'
import ip from './ip'
import dimAllLights from './lights'
import getSchedules from './schedules'
// import duration from './duration'
import summary from './summary'
import findAudioSystem from './audioSystem'
import getConfig from './config'

const log = require('debug')('WakeUp:Alarm')

const SUMMARY_FILE = 'todays_summary.mp3'

const now = () => +new Date()

// TODO: Use module for this
const timeout = millis => new Promise(resolve => setTimeout(resolve, millis))

// TODO: Move into another file
function makeSummary() {
  log('Fetching forecast and schedules')
  let weather = undefined
  let schedules = undefined
  return getForecast()
    .then(x => {
      weather = x
      return getSchedules()
    })
    .then(x => {
      schedules = x
    })
    .catch(err => {
      log(err)
      log('Continuing summary duration calculating')
    })
    .then(() => {
      const summaryText = summary(weather, schedules)
      log('Created summary', summaryText)
      log('Converting summary to speech')
      return generateSummaryAudio(summaryText, SUMMARY_FILE)
    })
    // .then(() => log('Fetching duration of summary'))
    // .then(() => duration(`${__dirname}/../audio/${SUMMARY_FILE}`))
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
    if (config.song && fs.existsSync(`${__dirname}/../audio/${config.song}`)) {
      log('Setting song volume')
      return setVolume(config.songVolume || config.volume || 50)
        .then(() => log(`Queuing song: ${config.song} @ ${AUDIO_PATH + config.song}`))
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
        .then(() => setVolume(config.radioVolume || config.volume || 50))
        .then(() => log('Starting radio'))
        .then(() => queueNext(config.radioUri, config.radioMetadata))
        .then(() => play())
    }
    return Promise.resolve()
  }

  // TODO: Make async
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
    .then(() => setVolume(config.summaryVolume || config.volume || 50))
    .then(() => log('Playing today\'s summary'))
    .then(() => queueNext(AUDIO_PATH + SUMMARY_FILE))
    .then(() => play())
    .then(() => log(`Should be saying summary (${summaryDuration} sec)`))
    .then(() => timeout(summaryDuration * 1000))
    .then(() => playRadio())
    .then(() => log('done'))
    .catch(err => {
      const errorFile = `alarm-service.error-${Date.now()}.txt`;
      fs.writeFileSync(errorFile, err.stack);
      log(`Error in alarm services (full error in "${errorFile}")`, err.message);
    })
}

export default function () {
  log('Gathering data for alarm');
  let config = null
  let player = null
  let summaryDuration = 30
  return getConfig()
    .then(x => {
      config = x
      return findAudioSystem();
    })
    .then(x => {
      player = x
      return makeSummary();
    })
    .then(() => alarm(config, player, summaryDuration))
    .catch(err => log('Could not finish gathering data for alarm', err))
}
