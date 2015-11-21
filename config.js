var fs = require('node-fs-extra');
var _ = require('lodash');

module.exports = function () {
  var config = fs.readJsonSync('./config.json', {
    throws: false
  });
  var optionsExist = fs.existsSync('./options.json');
  if (optionsExist) {
    var options = fs.readJsonSync('./options.json', {
      throws: false
    });
    return _.extend(config, options);
  } else {
    return config;
  }
};
