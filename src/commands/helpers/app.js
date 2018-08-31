const payload = require('./payload')

module.exports.getData = (repoOrFile) => {
  let data = { keys: {} }

  payload.addVariables(
    data, 'hydrates', 'share', 'tag', 'debug', 'private', 'pull', 'zip', 'android-phonegap:android_phonegap_version',
    'winphone-phonegap:winphone_phonegap_version', 'ios-phonegap:ios_phonegap_version', 'phonegap:phonegap_version'
  )

  payload.addVariables(
    data.keys, 'android-key:android', 'windows-key:windows', 'ios-key:ios', 'winphone-key:winphone'
  )

  return data
}
