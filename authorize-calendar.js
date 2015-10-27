var getCalendarApi = require('./calendar')

getCalendarApi(function (auth, calendar) {
  console.log('You are authorized now');
});
