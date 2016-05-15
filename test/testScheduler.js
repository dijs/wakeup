import 'should'
import lolex from 'lolex';
import createScheduler from '../src/scheduler'

describe('Scheduler', () => {
  it('should trigger tick on given time', (done) => {
    const clock = lolex.install(undefined, new Date('May 14, 2016 14:00:00'))
    // By default the scheduler will run the next 6am morning
    const job = createScheduler(() => {
      new Date().toString().should.equal('Sun May 15 2016 06:00:00 GMT-0500 (CDT)')
      clock.uninstall()
      job.stop()
      done()
    }).start()
    clock.next()
  })

  it('should be able to update', (done) => {
    const clock = lolex.install(undefined, new Date('May 14, 2016 14:00:00'))
    let job
    const scheduler = createScheduler(() => {
      new Date().toString().should.equal('Sun May 15 2016 08:00:00 GMT-0500 (CDT)')
      clock.uninstall()
      job.stop()
      job = null
      done()
    })
    job = scheduler.start()
    clock.tick(1000)
    scheduler.update({
      cronPattern: '0 0 8 * * *',
    })
    clock.next()
  })
})
