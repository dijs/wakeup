var schedule = require('node-schedule');
var wakeUp = require('./alarm');
var server = require('./server');
var getConfig = require('./config.js');
var currentJob;

function started() {
  var config = getConfig();
  console.log('Started server http://localhost:' + config.port);
  currentJob = schedule.scheduleJob(config.cronPattern, wakeUp);
}

function updated() {
  log('Re-scheduling alarm job');
  currentJob.cancel();
  var config = getConfig();
  currentJob = schedule.scheduleJob(config.cronPattern, wakeUp);
}

// TODO: Make this changeable
var initialPort = getConfig().port;
server(initialPort, started, updated);
