import 'babel-polyfill'

import ForecastIo from 'forecastio'
import getConfig from './config.js'

const log = require('debug')('WakeUp:Forecast')

export default function () {
  return new Promise((resolve, reject) => {
    getConfig().then(config => {
      const { forecastIoApiKey, forecastIoLat, forecastIoLon } = config
      const forecastIo = new ForecastIo(forecastIoApiKey)
      log(`Fetching forecast for (${forecastIoLat}, ${forecastIoLon})`)
      forecastIo.forecast(forecastIoLat, forecastIoLon, (err, data) => {
        if (err) {
          log('Error occurred', err)
          return reject(err)
        }
        const { summary, temperatureMin, temperatureMax } = data.daily.data[0]
        const low = temperatureMin | 0
        const high = temperatureMax | 0
        const forecast = {
          summary,
          low,
          high,
        }
        log('Fetched forcast', forecast)
        return resolve(forecast)
      })
    })
  })
}
