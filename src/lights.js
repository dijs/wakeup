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

export function findBridges() {
  return hue.nupnpSearch();
}

function getApi(hueUser) {
  return findBridges()
    .then(bridges => new HueApi(bridges[0].ipaddress, hueUser));
}

export async function findLights() {
  const config = await getConfig();
  if (!config.hueUser) {
    return Promise.reject(new Error('You must register a Phillips Hue user first. Please visit /register-user'))
  }
  const api = await getApi(config.hueUser);
  return api.lights();
}

function dimAllLights(api, lightLevel) {
  const dimState = createSlowDimState(lightLevel)
  return api.lights().then(res => {
    return Promise.all(res.lights.map(light => {
      return api.setLightState(light.id, dimState)
    }))
  })
}

export async function registerUser() {
  const bridges = await findBridges();
  return new HueApi().registerUser(bridges[0].ipaddress, null, 'Jarvis')
}

export default function () {
  return getConfig().then(config => {
    if (!config.hueUser) {
      log('Warning: No Phillips Hue username (hueUser) specified in config, Please visit /register-user')
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
