var os = require('os');
var _ = require('lodash');

function byNonInternal(iface) {
  return !iface.internal;
}

function byV4(iface) {
  return iface.family === 'IPv4';
}

module.exports = function () {
  return _(os.networkInterfaces())
    .map(_.identity)
    .flatten()
    .filter(byNonInternal)
    .filter(byV4)
    .first();
}
