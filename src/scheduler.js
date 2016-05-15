require('source-map-support').install();

import { CronJob } from 'cron'
// import getConfig from './config.js'

const log = require('debug')('WakeUp:Scheduler')

let currentJob = null

// Default alarm time is every day at 6am CST
function createCronJob(onTick, cronTime = '0 0 6 * * *', timeZone = 'America/Chicago') {
  return new CronJob({
    cronTime,
    onTick,
    timeZone,
    start: true,
  })
}

function setupAlarmJob(onTick, config = {}) {
  currentJob = createCronJob(onTick, config.cronPattern, config.timeZone)
  return currentJob
}

function handleConfigUpdate(onTick, config) {
  log('Re-scheduling alarm job')
  currentJob.stop()
  currentJob = setupAlarmJob(onTick, config)
}

export default function (onTick) {
  log('Creating scheduler...')
  return {
    start: config => setupAlarmJob(onTick, config),
    update: config => handleConfigUpdate(onTick, config),
  }
}
