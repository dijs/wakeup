import 'babel-polyfill'
import hue from 'node-hue-api'
import getConfig from './config.js'

const log = require('debug')('WakeUp:Lights')

const HueApi = hue.HueApi
const lightState = hue.lightState

function createSlowDimState(lightLevel) {
  return lightState.create()
    .on()
    .brightness(lightLevel)
    .transition(5000)
}

function dimAllLights(api, lightLevel) {
  const dimState = createSlowDimState(lightLevel)
  return api.lights().then(res => {
    return Promise.all(res.lights.map(light => {
      return api.setLightState(light.id, dimState)
    }))
  })
}

function getApi(hueUser) {
  return hue.nupnpSearch()
    .then(bridges => new HueApi(bridges[0].ipaddress, hueUser));
}

// TODO: Maybe add get config var to ease the promise chain here...
export default function () {
  return getConfig().then(config => {
    if (!config.hueUser) {
      log('Warning: No Phillips Hue username (hueUser) specified in config, skipping')
      return Promise.resolve()
    }
    return getApi(config.hueUser)
      .then(api => dimAllLights(api, config.lightLevel))
      .catch(err => {
        log('Could not get hue API user', err);
        return Promise.resolve()
      })
  })
}

// Functions for setting up the lights

// function displayResult (result) {
//   console.log(JSON.stringify(result, null, 3))
// }
//
// function displayError (err) {
//   console.log(err.stack)
// }
//
// async function registerUser(api) {
//   const bridges = await hue.nupnpSearch()
//   return api.registerUser(bridges[0].ipaddress, null, 'Jarvis')
// }
