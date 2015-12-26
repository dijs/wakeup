import 'babel/polyfill'
import hue from 'node-hue-api'
import getConfig from './config.js'

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

async function getApi (hueUser) {
  const bridges = await hue.nupnpSearch()
  return new HueApi(bridges[0].ipaddress, hueUser)
}

export default async function () {
  const config = await getConfig()
  const api = await getApi(config.hueUser)
  return dimAllLights(api, config.lightLevel)
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
