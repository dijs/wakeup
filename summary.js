module.exports = function (weather, schedules) {
  var scheduleText = schedules.filter(function (schedule) {
      return schedule.events > 0;
    })
    .map(function (schedule) {
      var eventsText = schedule.events.map(function (event) {
        return event.summary + ' at ' + event.time;
      }).join(' and ');
      return schedule.name + ' has ' + eventsText;
    }).join(' and ');
  var weatherText = 'Good morning. Today\'s weather is ' + weather.summary +
    ', the low is ' + weather.low + ', and the high is ' + weather.high + '.';
  return weatherText + (scheduleText.length > 0 ? ' ' + scheduleText : '');
};
