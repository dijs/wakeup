var sonos = require('sonos');
var async = require('async');

var tts = require('./tts');
var forecast = require('./forecast');
var ip = require('./ip');
var lights = require('./lights');
var getSchedules = require('./schedules');
var duration = require('./duration');
var summary = require('./summary');
var getConfig = require('./config.js');

var VERBOSE = true;
var SUMMARY_FILE = 'todays_summary.mp3';

function log(obj) {
  if (VERBOSE) {
    console.log(obj);
  }
}

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
  var config = getConfig();
  if (config.off === true) {
    return;
  }
  var AUDIO_PATH = 'http://' + ip().address + ':' + config.port + '/audio/';
  var startedAlarm;
  log('Searching for sonos');
  findSonos(function (err, player) {
    log('Found player at ' + player.host);
    async.waterfall([
      function (cb) {
        log('Setting song volume');
        player.setVolume(config.songVolume, cb)
      },
      function (err, cb) {
        player.queueNext(AUDIO_PATH + config.song, cb);
      },
      function (err, cb) {
        startedAlarm = +new Date();
        log('Started alarm at: ' + startedAlarm);
        player.play(function () {
          cb();
        });
      },
      function (cb) {
        log('Fetching forecast');
        forecast(cb);
      },
      function (weather, cb) {
        log('Fetching schedules');
        getSchedules(function (err, schedules) {
          cb(err, weather, schedules)
        });
      },
      function (weather, schedules, cb) {
        var summaryText = summary(weather, schedules);
        log('Fetching TTS');
        tts(
          summaryText,
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
        log('Alarm time left: ' + alarmTimeLeft);
        setTimeout(cb, alarmTimeLeft);
      },
      function (cb) {
        log('Setting summary volume');
        player.setVolume(config.summaryVolume, cb)
      },
      function (err, cb) {
        log('Playing today\'s summary');
        player.queueNext(AUDIO_PATH + SUMMARY_FILE, cb);
      },
      function (playing, cb) {
        player.play(function () {
          cb();
        });
      },
      function (cb) {
        duration(__dirname + '/audio/' + SUMMARY_FILE, cb);
      },
      function (seconds, cb) {
        seconds = Math.round(seconds) + 3;
        log('Should be saying summary (' + seconds + ' sec)');
        setTimeout(cb, seconds * 1000);
      },
      function (cb) {
        log('Setting radio volume');
        player.setVolume(config.radioVolume, cb)
      },
      function (err, cb) {
        log('Starting radio');
        playRadio(player, config.radioUri, config.radioMetadata, cb)
      }
    ], callback);
  });
};
