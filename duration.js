var fs = require('fs');
var mm = require('musicmetadata');

function duration(path, callback) {
  mm(fs.createReadStream(path), {
    duration: true
  }, function (err, metadata) {
    if (err) {
      return callback(err);
    }
    return callback(null, metadata.duration)
  });
}

module.exports = duration;
