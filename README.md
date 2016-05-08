# Wake Up

##### Digital Assistant Alarm System

### Installation

```shell
git clone https://github.com/dijs/wakeup wakeup
cd wakeup
npm install
npm run compile
```

### Gathering config data

Follow the steps here to create your own client_secret.json file https://github.com/jay0lee/GAM/wiki/Creating-client_secrets.json-and-oauth2service.json
- Download the JSON
- Rename to client_secret.json
- Move it to the wakeup directory

Sign up for a https://forecast.io API key
You must also get the latitude and longitude of your location
After getting these values, enter them into the config.json

In order to get daily schedules, add your names and id's(emails) to the calendars config property.

You will need authorization for the Ivona service to use TTS, go here get access https://www.ivona.com/us/about-us/text-to-speech/
Once delivered, please add to config.json

You can add a mp3 song file to the audio directory in order to start your morning with a favorite song.
Remember to also add the "song" filename property to the config

You can add a "hueUser" to the configuration if you want the alarm to slowly dim on your Phillips Hue lights.

You can add a sonos radio station to your config as well to start it playing after the summary is spoken.
You will need to find and add the radioUri and radioMetadata for the sonos station to the config. This is not easy, I found it using wireshark and watching sonos packets... If someone knows a better way, PLEASE tell me.

```shell
npm rum authorize-calendar
npm start
```

And if something doesn't work correctly, please use the logger to get more information.
Set the debugging ENV variable and restart, like so:

```shell
export DEBUG="*"
npm start
```
