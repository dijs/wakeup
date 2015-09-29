var express = require('express');

var app = express();

app.use('/audio', express.static(__dirname + '/audio'));

module.exports = function (port, callback) {
  app.listen(port, callback);
};
