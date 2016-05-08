import 'babel-polyfill'
import { readFile, exists, writeFile } from 'fs-promise'
import { extend } from 'lodash'

const log = require('debug')('WakeUp:Config')

// TODO: Move this to JSON and link to default config in documentation and errors
const defaultConfig = {
  forecastIoApiKey: '',
  forecastIoLat: 0,
  forecastIoLon: 0,
  ivonaAuth: {
    accessKey: '',
    secretKey: '',
  },
  ivonaSpeech: {
    body: {
      voice: {
        name: 'Emma',
        language: 'en-GB',
        gender: 'Female',
      },
    },
  },
  port: 8081,
  cronPattern: '0 0 6 * * *', // 6am every morning
  minAlarmTime: 5000,
  lightLevel: 30,
  songVolume: 50,
  summaryVolume: 50,
  radioVolume: 50,
  calendars: [{
    name: 'John Smith',
    id: 'john.smith@domain.com',
  }],
}

function readJson(path) {
  return readFile(path).then(json => JSON.parse(json.toString()))
}

export default function () {
  // TODO: Add option for selecting an object variable path
  return Promise.all([exists('./config.json'), exists('./options.json')])
  .then(([configExists, optionsExist]) => {
    if (!configExists) {
      log('Configuration doesn\'t exist, creating a default one for you');
      log('Remember to update the properties! - https://github.com/dijs/wakeup');
      return writeFile('./config.json', JSON.stringify(defaultConfig, null, '\t'))
       .then(() => Promise.reject('Cannot start with default config'))
    }
    return readJson('./config.json').then(config => {
      if (optionsExist) {
        return readJson('./options.json').then(options => extend(config, options))
      }
      return config
    })
  })
}
