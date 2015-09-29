var schedule = require('node-schedule');
var wakeUp = require('./alarm');
var server = require('./server');
var config = require('./config.json')

server(config.port, function () {
  console.log('Started server @ http://localhost:' + config.port);
  schedule.scheduleJob(config.cronPattern, wakeUp);
});
