var sonos = require('sonos');
var async = require('async');

var tts = require('./tts');
var forecast = require('./forecast');
var ip = require('./ip');
var lights = require('./lights');
var config = require('./config.json')

var AUDIO_PATH = 'http://' + ip().address + ':' + config.port + '/audio/';

function findSonos(callback) {
  var called = false;
  var search = sonos.search(function (device) {
    if (!called) {
      called = true;
      callback(null, device);
    }
    search.socket.close();
  });
}

function playRadio(player, uri, metadata, callback) {
  player.queueNext({
    uri: uri,
    metadata: metadata
  }, function (err, result) {
    if (err) {
      callback(err);
    } else {
      player.play(function (err) {
        if (err) {
          callback(err);
        } else {
          callback(null);
        }
      });
    }
  });
}

module.exports = function wakeUp(callback) {
  var startedAlarm;
  console.log('Searching for sonos');
  findSonos(function (err, player) {
    console.log('Found player at ' + player.host);
    async.waterfall([
      function (cb) {
        player.queueNext(AUDIO_PATH + config.song, cb);
      },
      function (err, cb) {
        startedAlarm = +new Date();
        console.log('Started alarm at: ' + startedAlarm);
        player.play(function () {
          cb();
        });
      },
      function (cb) {
        console.log('Fetching forecast');
        forecast(cb);
      },
      function (weather, cb) {
        console.log('Fetching TTS');
        tts(
          'Good morning. Today\'s weather is ' + weather.summary + ', the low is ' + weather.low + ', and the high is ' + weather.high,
          'weather.mp3',
          function () {
            cb();
          }
        );
      },
      function (cb) {
        lights(cb);
      },
      function (cb) {
        var playedAlarm = +new Date() - startedAlarm;
        var alarmTimeLeft = Math.max(0, config.minAlarmTime - playedAlarm);
        console.log('Alarm time left: ' + alarmTimeLeft);
        setTimeout(cb, alarmTimeLeft);
      },
      function (cb) {
        console.log('Playing weather');
        player.queueNext(AUDIO_PATH + 'weather.mp3', cb);
      },
      function (playing, cb) {
        player.play(function () {
          cb();
        });
      },
      function (cb) {
        console.log('Should be saying weather');
        setTimeout(cb, config.weatherTime);
      },
      function (cb) {
        console.log('Start playing radio');
        playRadio(player, config.radioUri, config.radioMetadata, cb)
      }
    ], callback);
  });
};
