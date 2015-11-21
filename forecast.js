var ForecastIo = require('forecastio');
var getConfig = require('./config.js');

function forecast(callback) {
  var config = getConfig();
  var forecastIo = new ForecastIo(config.forecastIoApiKey);
  forecastIo.forecast(config.forecastIoLat, config.forecastIoLon, function (err, data) {
    if (err) {
      return callback(err);
    }
    callback(null, {
      summary: data.daily.data[0].summary,
      low: data.daily.data[0].temperatureMin | 0,
      high: data.daily.data[0].temperatureMax | 0
    });
  });
}

module.exports = forecast;
