require('source-map-support').install();

import wakeUp from './alarm'
import server from './server'
import createScheduler from './scheduler'

const log = require('debug')('WakeUp:Index')

const alarmScheduler = createScheduler(wakeUp)

// TODO: Make PORT changeable
server(
  alarmScheduler.start,
  alarmScheduler.update
).catch(err => log(err))
