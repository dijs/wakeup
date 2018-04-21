import getCalendarApi from './calendar'

getCalendarApi((x, y, err) => {
	if (!err) {
		console.log('You are authorized now')
	}
})
