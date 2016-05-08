export default function (weather, schedules) {
  const scheduleText = schedules.filter(schedule => {
    return schedule.events.length > 0
  })
    .map(schedule => {
      const eventsText = schedule.events.map(event => {
        return `"${event.summary}" at ${event.time}`
      }).join(' and ')
      return `${schedule.name} has ${eventsText}`
    }).join(' and ')
  const weatherText = `Good morning. Today's weather is ${weather.summary},\
 the low is ${weather.low}, and the high is ${weather.high}.`
  return weatherText + (scheduleText.length > 0 ? ` ${scheduleText}` : '')
}
