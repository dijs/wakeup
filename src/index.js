require('source-map-support').install();
import 'babel-polyfill'

import schedule from 'node-schedule'
import wakeUp from './alarm'
import server from './server'
import getConfig from './config.js'

const log = require('debug')('WakeUp:Index')

// TODO: Gross, think of a better way to do this
let currentJob = null

function scheduleAlarm(pattern) {
  currentJob = schedule.scheduleJob(pattern, wakeUp)
}

function started() {
  return getConfig().then(({ port, cronPattern }) => {
    log(`Started server http://localhost:${port}`)
    scheduleAlarm(cronPattern)
  })
}

function updated() {
  log('Re-scheduling alarm job')
  currentJob.cancel()
  return getConfig().then(({ cronPattern }) => {
    scheduleAlarm(cronPattern)
  });
}

// TODO: Make PORT changeable
getConfig().then(config => {
  server(config.port, started, updated)
}).catch(err => log(err))
