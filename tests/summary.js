import 'should'
import createSummary from '../src/summary'

const weather = {
  summary: 'Heavy rain throughout the day.',
  low: 66,
  high: 77
}

const schedules = [{
  'name': 'heather',
  'events': []
}, {
  'name': 'richard',
  'events': [{
    'date': '2015-12-26T15:00:00-06:00',
    'time': '3PM',
    'summary': 'This is a test'
  }]
}]

describe('Summary', () => {
  it('should create summaries correctly', () => {
    const summary = createSummary(weather, schedules)
    summary.should.equal('Good morning. Today\'s weather is Heavy rain throughout the day., the low is 66, and the high is 77. richard has "This is a test" at 3PM')
  })
})
