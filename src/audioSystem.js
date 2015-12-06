import 'babel/polyfill'

import sonos from 'sonos'

function findPlayer() {
  return new Promise(resolve => {
    let called = false
    let search = sonos.search(player => {
      if (!called) {
        called = true
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
        return new Promise((resolve, reject) => {
          player.queueNext({
            uri: uri,
            metadata: metadata
          }, err => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        })
      }

      function play() {
        return new Promise((resolve, reject) => {
          player.play(err => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        })
      }

      function setVolume(volume) {
        return new Promise((resolve, reject) => {
          player.setVolume(volume, err => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        })
      }

      function description() {
        return new Promise((resolve, reject) => {
          player.deviceDescription((err, data) => {
            if (err) {
              reject(err)
            } else {
              resolve(data)
            }
          })
        })
      }

      function state() {
        return new Promise((resolve, reject) => {
          player.getCurrentState((err, data) => {
            if (err) {
              reject(err)
            } else {
              resolve(data)
            }
          })
        })
      }

      function info() {
        return new Promise(resolve => {
          return Promise
            .all([description(), state()])
            .then(([description, state]) => {
              resolve({
                name: description.friendlyName,
                room: description.roomName,
                state
              })
            })
        })
      }

      resolve({
        queueNext,
        play,
        setVolume,
        info
      })

    })
  })
}
