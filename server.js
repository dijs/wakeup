var express = require('express');
var fs = require('node-fs-extra');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({
  extended: false
});
var wakeUp = require('./alarm');
var OPTIONS_PATH = __dirname + '/options.json';

module.exports = function (port, started, updated) {

  var app = express();
  app.use(jsonParser);
  app.use(urlencodedParser);
  app.use('/audio', express.static(__dirname + '/audio'));
  app.use('/', express.static(__dirname + '/options'));
  app.get('/options', function (req, res, next) {
    fs.readJson(OPTIONS_PATH, function (err, json) {
      if (err) {
        return next(err);
      }
      return res.json(json);
    });
  });
  app.post('/options', function (req, res, next) {
    var options = JSON.parse(req.body.json);
    var oldOptions = fs.readJsonSync(OPTIONS_PATH);
    var cronPatternChanged = options.cronPattern !== oldOptions.cronPattern;
    fs.writeJsonSync(OPTIONS_PATH, options);
    if (cronPatternChanged) {
      updated();
    }
    return res.sendStatus(200);
  });
  app.post('/test', function (req, res) {
    wakeUp();
    return res.sendStatus(200);
  });

  app.listen(port, started);

};
