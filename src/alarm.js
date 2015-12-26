import 'babel/polyfill'
import tts from './tts'
import getForecast from './forecast'
import ip from './ip'
import dimAllLights from './lights'
import getSchedules from './schedules'
import duration from './duration'
import summary from './summary'
import findAudioSystem from './audioSystem'
import getConfig from './config'

const VERBOSE = true
const SUMMARY_FILE = 'todays_summary.mp3'

let log = obj => {
  if (VERBOSE) console.log(obj)
}

const now = () => +new Date()

// TODO: Use module for this
const timeout = millis => new Promise(resolve => setTimeout(resolve, millis))

export default async function () {

  const [config, player] = await Promise.all([getConfig(), findAudioSystem()])

  if (config.off === true) {
    return 'off'
  }

  const AUDIO_PATH = `http://${ip()}:${config.port}/audio/`

  const {
    setVolume, queueNext, play
  } = player

  log('Setting song volume')

  await setVolume(config.songVolume)
  await queueNext(AUDIO_PATH + config.song)
  await play()

  // TODO: Move this out into a timer handler...
  const startedAlarm = now()
  log('Started alarm at: ' + startedAlarm)

  log('Fetching forecast and schedules')
  const [weather, schedules] = await Promise.all([getForecast(), getSchedules()])
  const summaryText = summary(weather, schedules)

  log('Fetching TTS')
  await tts(summaryText, SUMMARY_FILE)

  log('Dimming lights on')

  await dimAllLights()

  const playedAlarm = now() - startedAlarm
  const alarmTimeLeft = Math.max(0, config.minAlarmTime - playedAlarm)
  log('Alarm time left: ' + alarmTimeLeft)
  await timeout(alarmTimeLeft)

  log('Setting summary volume')
  await setVolume(config.summaryVolume)

  log('Playing today\'s summary')
  await queueNext(AUDIO_PATH + SUMMARY_FILE)
  await play()

  log('Measuring summary duration')
  const seconds = await duration(__dirname + '/../audio/' + SUMMARY_FILE)

  log('Should be saying summary (' + seconds + ' sec)')
    // Add duration padding for radio to start
  await timeout(Math.round(seconds + 3) * 1000)

  log('Setting radio volume')
  await setVolume(config.radioVolume)

  log('Starting radio')
  await queueNext(config.radioUri, config.radioMetadata)
  await play()

}
