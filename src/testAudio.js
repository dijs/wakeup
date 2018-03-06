const { DeviceDiscovery } = require('sonos')

console.log('Searching for sonos devices');
DeviceDiscovery((device) => {
  console.log('found device at ' + device.host)
  // mute every device...
  device.setMuted(true)
    .then(`${device.host} now muted`)
})