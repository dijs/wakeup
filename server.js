var express = require('express');
var fs = require('node-fs-extra');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({
  extended: false
});
var wakeUp = require('./alarm');

function updateOptions(options, callback) {
  return fs.writeJson('./options.json', options, callback);
}

module.exports = function (port, started, updated) {

  var app = express();
  app.use(jsonParser);
  app.use(urlencodedParser);
  app.use('/audio', express.static(__dirname + '/audio'));
  app.use('/', express.static(__dirname + '/options'));
  app.get('/options', function (req, res, next) {
    fs.readJson('./options.json', function (err, json) {
      if (err) {
        return next(err);
      }
      return res.json(json);
    });
  });
  app.post('/options', function (req, res, next) {
    var options = JSON.parse(req.body.json);
    updateOptions(options, function (err) {
      if (err) {
        return next(err);
      } else {
        updated();
        return res.sendStatus(200);
      }
    });
  });
  app.post('/test', function (req, res) {
    wakeUp();
    return res.sendStatus(200);
  });

  app.listen(port, started);

};
