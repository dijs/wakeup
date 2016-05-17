import express from 'express'
import fs from 'node-fs-extra'
import bodyParser from 'body-parser'
import wakeUp from './alarm'
import getConfig from './config'
import findAudioSystem from './audioSystem'

const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({
  extended: false,
})

const CONFIG_PATH = `${__dirname}/../config.json`

const log = require('debug')('WakeUp:Server')

export default function (started, updated) {
  const app = express()

  app.use(jsonParser)
  app.use(urlencodedParser)
  app.use('/audio', express.static(`${__dirname}/../audio`))
  app.use('/', express.static(`${__dirname}/../options`))

  app.get('/info', (req, res) => {
    findAudioSystem().then(system => {
      system.info().then(info => {
        log('Got audio system info', info)
        res.json(info)
      })
    })
  })

  app.get('/options', (req, res, next) => {
    getConfig()
      .then(config => res.json(config))
      .catch(err => next(err))
  })

  app.post('/options', (req, res) => {
    const options = JSON.parse(req.body.json)
    const config = fs.readJsonSync(CONFIG_PATH)
    const cronPatternChanged = options.cronPattern !== config.cronPattern
    const newConfig = Object.assign({}, config, options);
    fs.writeJsonSync(CONFIG_PATH, newConfig);
    if (cronPatternChanged) {
      updated(newConfig)
    }
    return res.sendStatus(200)
  })

  app.post('/test', (req, res) => {
    wakeUp()
    return res.sendStatus(200)
  })

  return getConfig().then(config => {
    const { port } = config;
    log(`Starting WakeUp server @ http://localhost:${port}`)
    app.listen(port, () => started(config))
  })
}
