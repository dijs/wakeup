import 'babel-polyfill'

import ForecastIo from 'forecastio'
import getConfig from './config.js'

const log = require('debug')('WakeUp:Forecast')

function toCelsius(f) {
  return (f - 32) * 0.5556
}

export default function () {
  return new Promise((resolve, reject) => {
    getConfig().then(config => {
      const { forecastIoApiKey, forecastIoLat, forecastIoLon, metric = false } = config
      const forecastIo = new ForecastIo(forecastIoApiKey)
      log(`Fetching forecast for (${forecastIoLat}, ${forecastIoLon})`)
      forecastIo.forecast(forecastIoLat, forecastIoLon, (err, data) => {
        if (err) {
          log('Error occurred', err)
          return reject(err)
        }
        const { summary, temperatureMin, temperatureMax } = data.daily.data[0]
        let low = temperatureMin | 0
        let high = temperatureMax | 0
        if (metric) {
          low = toCelsius(low)
          high = toCelsius(high)
        }
        const forecast = {
          summary,
          low: low.toFixed(0),
          high: high.toFixed(0),
        }
        log('Fetched forcast', forecast)
        return resolve(forecast)
      })
    })
  })
}
