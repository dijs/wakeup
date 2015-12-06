import 'babel/polyfill'

import ForecastIo from 'forecastio'
import getConfig from './config.js'

export default function () {
  return new Promise((resolve, reject) => {
    getConfig().then(config => {
      const forecastIo = new ForecastIo(config.forecastIoApiKey)
      forecastIo.forecast(config.forecastIoLat, config.forecastIoLon, (err, data) => {
        if (err) {
          return reject(err)
        }
        const {summary, temperatureMin, temperatureMax} = data.daily.data[0]
        const low = temperatureMin | 0
        const high = temperatureMax | 0
        return resolve({
          summary,
          low,
          high
        })
      })
    })
  })
}
