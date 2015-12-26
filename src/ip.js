import os from 'os'
import {
  chain, identity
}
from 'lodash'

function byNonInternal(iface) {
  return !iface.internal
}

function byV4(iface) {
  return iface.family === 'IPv4'
}

function getIp() {
  return chain(os.networkInterfaces())
    .map(identity)
    .flatten()
    .filter(byNonInternal)
    .filter(byV4)
    .first()
    .value()
    .address
}

export default function () {
  return getIp() || 'localhost'
}
