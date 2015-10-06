var hue = require('node-hue-api');
var Promise = require('bluebird');

var config = require('./config.json');

var HueApi = hue.HueApi;
var lightState = hue.lightState;
var api;

var findLights = function (bridges) {
  api = new HueApi(bridges[0].ipaddress, config.hueUser);
  return api.lights();
};

function state(api) {
  return api.fullState();
}

function createSlowDimState() {
  return lightState.create()
    .on()
    .brightness(config.lightLevel)
    .transition(5000);
}

function dimAllLights(lights) {
  var state = createSlowDimState();
  return Promise.all(lights.lights.map(function (light) {
    return api.setLightState(light.id, state);
  }));
}

function turnOnLights(callback) {
  hue.nupnpSearch()
    .then(findLights)
    .then(dimAllLights)
    .then(function () {
      callback && callback();
    })
    .fail(function (err) {
      callback && callback(err);
    })
    .done();
}

module.exports = turnOnLights;

var displayResult = function (result) {
  console.log(JSON.stringify(result));
};

var displayError = function (err) {
  console.log(err.stack);
};

function registerUser(api) {
  return api.registerUser(bridge.ipaddress, null, 'Jarvis');
}
