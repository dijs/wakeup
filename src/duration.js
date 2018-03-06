import 'babel-polyfill'

import {createReadStream} from 'fs'
import mm from 'musicmetadata'

const log = require('debug')('WakeUp:Duration')

export default function (path) {
  return new Promise((resolve, reject) => {
    mm(createReadStream(path), {
      duration: true
    }, function (err, metadata) {
      if (err) {
        log('Could not calculate duration of file', err)
        // TODO: Calculate by length of text
        log('Using default of 10 seconds')
        return resolve(10)
      }
      return resolve(metadata.duration)
    })
  })
}
