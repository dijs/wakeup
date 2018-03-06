import 'babel-polyfill'
import { DeviceDiscovery as discoverDevices, Sonos } from 'sonos';

const log = require('debug')('WakeUp:AudioSystem')

function findPlayer(deviceIp) {
  if (deviceIp) {
    log(`Using ${deviceIp} for sonos IP`)
    return Promise.resolve(new Sonos(deviceIp))
  }
  return new Promise((resolve, reject) => {
    log('Searching for sonos systems')
    let found = false
    const search = discoverDevices(player => {
      log('Found possible device', player.host)
      player.deviceDescription()
        .then(({ friendlyName }) => !friendlyName.includes('BOOST'))
        .then(isSpeaker => {
          if (!found && isSpeaker) {
            found = true
            search.destroy()
            log(`Found sonos device @ ${player.host}`)
            resolve(player)
          }
        })
    })
    setTimeout(() => {
      if (!found) reject('Could not find sonos device')
    }, 10000)
  })
}

// TODO: Only sonos right now, but maybe more later...
export default function (deviceIp) {
  return new Promise((resolve, reject) => {
    findPlayer(deviceIp).then(player => {
      function queueNext(uri, metadata) {
        return player.flush().then(() => player.queue({
          uri,
          metadata,
        }));
      }

      function play() {
        return player.play()
      }

      function setVolume(volume) {
        return player.setVolume(volume)
      }

      function info() {
        return Promise
          .all([player.deviceDescription(), player.getCurrentState()])
          .then(([description, state]) => {
            return {
              name: description.friendlyName,
              room: description.roomName,
              state,
            }
          })
      }

      resolve({
        queueNext,
        play,
        setVolume,
        info,
      })
    }).catch(err => reject(err))
  })
}
