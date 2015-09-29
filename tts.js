var Ivona = require('ivona-node');
var fs = require('fs');
var config = require('./config.json')

var ivona = new Ivona(config.ivonaAuth);

function tts(text, filename, callback) {
  var stream = ivona.createVoice(text, config.ivonaSpeech);
  stream.pipe(fs.createWriteStream('./audio/' + filename));
  stream.on('end', function () {
    callback();
  });
  stream.on('close', function () {});
  stream.on('error', function (err) {
    console.log(err);
  });
};

module.exports = tts;
