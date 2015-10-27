var moment = require('moment')
var async = require('async');
var getCalendarApi = require('./calendar')
var config = require('./config')

function normalize(event) {
  var date = event.start.dateTime || event.start.date;
  return {
    date: date,
    time: moment(date).format('hA'),
    summary: event.summary
  };
}

function byToday(event) {
  return moment(event.date).isSame(moment().toDate(), 'day');
}

function getTodaysEvents(calendar, auth, calendarId, callback) {
  var now = moment().toDate()
  calendar.events.list({
    auth: auth,
    calendarId: calendarId,
    timeMin: now.toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  }, function (err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return callback(err, []);
    }
    var events = response.items;
    callback(null, events.map(normalize).filter(byToday));
  });
}

function getSchedules(callback) {
  getCalendarApi(function (auth, calendar) {
    async.map(config.calendars, function (info, done) {
      getTodaysEvents(calendar, auth, info.id, function (err, events) {
        done(err, {
          name: info.name,
          events: events
        })
      });
    }, callback);
  });
}

module.exports = getSchedules
