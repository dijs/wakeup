import wakeUp from './alarm'
import server from './server'
import getConfig from './config.js'

getConfig().then(config => {
  console.log(config)
  server(config.port, () => {
    console.log('Started server@http://localhost:' + config.port)
    wakeUp().catch(err => {
      console.log(err)
    })
  })
})
