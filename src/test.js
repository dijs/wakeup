import wakeUp from './alarm'
import server from './server'
import getConfig from './config.js'

const log = require('debug')('test')

console.log('hello');

getConfig().then(config => {
  log(config)
  server(config.port, () => {
    log(`Started server@http://localhost:${config.port}`)
    wakeUp().catch(err => {
      log(err)
    })
  })
})
