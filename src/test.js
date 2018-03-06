import wakeUp from './alarm'
import server from './server'
import getConfig from './config.js'

const log = require('debug')('WakeUp:Test')

getConfig().then(config => {
  log(config)
  server(() => {
    log(`Started server@http://localhost:${config.port}`)
    wakeUp().catch(err => {
      log(err)
    })
  })
})
