import 'babel-polyfill'

import {createReadStream} from 'fs'
import mm from 'musicmetadata'

export default function (path) {
  return new Promise((resolve, reject) => {
    mm(createReadStream(path), {
      duration: true
    }, function (err, metadata) {
      if (err) {
        return reject(err)
      }
      return resolve(metadata.duration)
    })
  })
}
