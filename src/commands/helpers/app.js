const payload = require('./payload')

module.exports.getData = (repoOrFile) => {
  let data = { keys: {} }

  payload.addVariables(
    data, 'hydrates', 'share', 'tag', 'debug', 'private', 'pull', 'zip'
  )

  payload.addVariables(
    data.keys, 'android-key:android', 'windows-key:windows', 'ios-key:ios', 'winphone-key:winphone'
  )

  return data
}
