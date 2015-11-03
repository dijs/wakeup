var wakeUp = require('./alarm');
var server = require('./server');
var config = require('./config.json')

server(config.port, function () {
  console.log('Started server@http://localhost:' + config.port);
  wakeUp(function (err) {
    if (err) {
      console.log(err);
    }
  });
});
