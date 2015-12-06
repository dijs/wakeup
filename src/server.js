
import express from 'express'
import fs from 'node-fs-extra'
import bodyParser from 'body-parser'
import wakeUp from './alarm'
import findAudioSystem from './audioSystem'

let jsonParser = bodyParser.json()
let urlencodedParser = bodyParser.urlencoded({
  extended: false
})

const OPTIONS_PATH = __dirname + '/../options.json'

export default function (port, started, updated) {

  let app = express()

  app.use(jsonParser)
  app.use(urlencodedParser)
  app.use('/audio', express.static(__dirname + '/../audio'))
  app.use('/', express.static(__dirname + '/../options'))

  app.get('/info', (req, res) => {
    findAudioSystem().then(system => {
      system.info().then(info => {
        res.json(info)
      })
    })
  })

  app.get('/options', function (req, res, next) {
    fs.readJson(OPTIONS_PATH, function (err, json) {
      if (err) {
        return next(err)
      }
      return res.json(json)
    })
  })
  app.post('/options', function (req, res) {
    var options = JSON.parse(req.body.json)
    var oldOptions = fs.readJsonSync(OPTIONS_PATH)
    var cronPatternChanged = options.cronPattern !== oldOptions.cronPattern
    fs.writeJsonSync(OPTIONS_PATH, options)
    if (cronPatternChanged) {
      updated()
    }
    return res.sendStatus(200)
  })
  app.post('/test', function (req, res) {
    wakeUp()
    return res.sendStatus(200)
  })

  app.listen(port, started)

}
