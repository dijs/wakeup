var sonos = require('sonos');
var async = require('async');
var duration = require('mp3-duration');

var tts = require('./tts');
var forecast = require('./forecast');
var ip = require('./ip');
var lights = require('./lights');
var getSchedules = require('./schedules');
var config = require('./config.json');

var AUDIO_PATH = 'http://' + ip().address + ':' + config.port + '/audio/';
var SUMMARY_FILE = 'todays_summary.mp3';

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

// TODO: Make these promises for god sake
module.exports = function wakeUp(callback) {
  var startedAlarm;
  console.log('Searching for sonos');
  findSonos(function (err, player) {
    console.log('Found player at ' + player.host);
    async.waterfall([
      function (cb) {
        console.log('Setting volume');
        player.setVolume(config.volume, cb)
      },
      function (err, cb) {
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
        getSchedules(function (err, schedules) {
          cb(err, weather, schedules)
        });
      },
      function (weather, schedules, cb) {
        var scheduleText = schedules.map(function (schedule) {
          var eventsText = schedule.events.map(function (event) {
            return event.summary + ' at ' + event.time;
          }).join(' and ');
          return schedule.name + ' has ' + eventsText;
        }).join(' and ');
        var text = 'Good morning. Today\'s weather is ' + weather.summary +
          ', the low is ' + weather.low + ', and the high is ' + weather.high +
          '. For schedules today: ' + scheduleText;
        console.log('Fetching TTS');
        tts(
          text,
          SUMMARY_FILE,
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
        console.log('Playing today\'s summary');
        player.queueNext(AUDIO_PATH + SUMMARY_FILE, cb);
      },
      function (playing, cb) {
        player.play(function () {
          cb();
        });
      },
      function (cb) {
        duration(AUDIO_PATH + SUMMARY_FILE, cb);
      },
      function (seconds, cb) {
        console.log('Should be saying summary');
        setTimeout(cb, seconds * 1000);
      },
      function (cb) {
        console.log('Start playing radio');
        playRadio(player, config.radioUri, config.radioMetadata, cb)
      }
    ], callback);
  });
};
