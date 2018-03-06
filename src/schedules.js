// TODO: Rewrite this module...

import 'babel-polyfill'

import moment from 'moment'
import async from 'async'
import isError from 'lodash/isError'
import getCalendarApi from './calendar'

import getConfig from './config'

const log = require('debug')('WakeUp:Schedules')

function normalize(event) {
  const date = event.start.dateTime || event.start.date
  return {
    date,
    time: moment(date).format('hA'),
    summary: event.summary,
  }
}

function byToday(event) {
  return moment(event.date).isSame(moment().toDate(), 'day')
}

function getTodaysEvents(calendar, auth, calendarId, callback) {
  const now = moment().toDate()
  calendar.events.list({
    auth,
    calendarId,
    timeMin: now.toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, response) => {
    if (err) {
      log('The API returned an error:')
      log(err)
      return callback(err, [])
    }
    const events = response.items
    return callback(null, events.map(normalize).filter(byToday))
  })
}

function getSchedules(callback) {
  getConfig().then(config => {
    if (!config.calendars) {
      log('Warning: No calenders specified in config.json, using empty schedule')
      return callback(null, [])
    }
    // TODO: Need more logging here...
    log('Fetching Calendar API')
    return getCalendarApi((auth, calendar) => {
      if (isError(auth)) {
        return callback(auth)
      }
      log(`Fetching calendars for ${config.calendars.map(({ name }) => name).join(' and ')}`)
      async.map(config.calendars, (info, done) => {
        getTodaysEvents(calendar, auth, info.id, (err, events) => {
          done(err, {
            name: info.name,
            events,
          })
        })
      }, callback)
    })
  })
}

export default function () {
  return new Promise((resolve, reject) => {
    getSchedules((err, schedules) => {
      if (err) {
        return reject(err)
      }
      log('Fetched schedules', schedules)
      return resolve(schedules)
    })
  })
}
