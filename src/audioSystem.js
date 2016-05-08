import 'babel-polyfill'
import sonos from 'sonos'

const log = require('debug')('AudioSystem')

function findPlayer() {
  return new Promise(resolve => {
    let called = false
    log('Searching for sonos systems')
    const search = sonos.search(player => {
      if (!called) {
        called = true
        log(`Found sonos system @ ${player.host}`)
        resolve(player)
      }
      search.socket.close()
    })
  })
}

// TODO: Only sonos right now, but maybe more later...
export default function () {
  return new Promise(resolve => {
    findPlayer().then(player => {
      function queueNext(uri, metadata) {
        return new Promise((queueResolve, reject) => {
          player.queueNext({
            uri,
            metadata,
          }, err => {
            if (err) {
              reject(err)
            } else {
              queueResolve()
            }
          })
        })
      }

      function play() {
        return new Promise((playResolve, reject) => {
          player.play(err => {
            if (err) {
              reject(err)
            } else {
              playResolve()
            }
          })
        })
      }

      function setVolume(volume) {
        return new Promise((volumeResolve, reject) => {
          player.setVolume(volume, err => {
            if (err) {
              reject(err)
            } else {
              volumeResolve()
            }
          })
        })
      }

      function description() {
        return new Promise((descriptionResolve, reject) => {
          player.deviceDescription((err, data) => {
            if (err) {
              reject(err)
            } else {
              descriptionResolve(data)
            }
          })
        })
      }

      function state() {
        return new Promise((stateResolve, reject) => {
          player.getCurrentState((err, data) => {
            if (err) {
              reject(err)
            } else {
              stateResolve(data)
            }
          })
        })
      }

      function info() {
        return new Promise(infoResolve => {
          return Promise
            .all([description(), state()])
            .then(([_description, _state]) => {
              infoResolve({
                name: _description.friendlyName,
                room: _description.roomName,
                state: _state,
              })
            })
        })
      }

      resolve({
        queueNext,
        play,
        setVolume,
        info,
      })
    })
  })
}
