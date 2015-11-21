var hue = require('node-hue-api');
var Promise = require('bluebird');

var getConfig = require('./config.js');

var HueApi = hue.HueApi;
var lightState = hue.lightState;
var api;

var getApi = function (hueUser) {
  return hue.nupnpSearch().then(function (bridges) {
    api = new HueApi(bridges[0].ipaddress, hueUser);
    return api;
  });
}

var findLights = function (api) {
  return api.lights();
};

function state(api) {
  return api.fullState();
}

function createSlowDimState(lightLevel) {
  return lightState.create()
    .on()
    .brightness(lightLevel)
    .transition(5000);
}

function dimAllLights(lightLevel) {
  var state = createSlowDimState(lightLevel);
  return function (lights) {
    return Promise.all(lights.lights.map(function (light) {
      return api.setLightState(light.id, state);
    }));
  };
}

function turnOnLights(callback) {
  var config = getConfig();
  getApi(config.hueUser)
    .then(findLights)
    .then(dimAllLights(config.lightLevel))
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
