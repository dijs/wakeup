import 'babel/polyfill'
import fs from 'fs-promise'
import {extend} from 'lodash'

async function readJson(path) {
  const json = await fs.readFile(path)
  return JSON.parse(json.toString())
}

export default async function () {
  const config = await readJson('./config.json')
  const optionsExist = await fs.exists('./options.json')
  if (optionsExist) {
    const options = await readJson('./options.json')
    return extend(config, options)
  } else {
    return config
  }
}
