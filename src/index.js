import 'babel/polyfill'

import schedule from 'node-schedule'
import wakeUp from './alarm'
import server from './server'
import getConfig from './config.js'

let currentJob = null

function scheduleAlarm(pattern) {
  currentJob = schedule.scheduleJob(pattern, wakeUp)
}

async function started() {
  const {port, cronPattern} = await getConfig()
  console.log('Started server http://localhost:' + port)
  scheduleAlarm(cronPattern)
}

async function updated() {
  console.log('Re-scheduling alarm job')
  currentJob.cancel()
  const {cronPattern} = await getConfig()
  scheduleAlarm(cronPattern)
}

// TODO: Make PORT changeable
getConfig().then(config => {
  server(config.port, started, updated)
})
