const payload = require('./payload')
const merge = require('../../util/misc').merge
const path = require('path')
const fs = require('fs')

module.exports.getData = (repoOrFile) => {
  let data = { keys: {} }

  if (repoOrFile) {
    try {
      let file = path.resolve(path.join(repoOrFile, '.pgbrc'))
      pgb.opts.variables = merge(JSON.parse(fs.readFileSync(file, 'utf8')), pgb.opts.variables)
      pgb.debug(`reading ${file}`)
    } catch (e) {
      if (e.name === 'SyntaxError') {
        throw new Error('invalid json in .pgbrc file')
      }
    }
  }

  payload.addVariables(
    data, 'hydrates', 'share', 'tag', 'debug', 'private', 'pull', 'zip', 'android-phonegap:android_phonegap_version',
    'winphone-phonegap:winphone_phonegap_version', 'ios-phonegap:ios_phonegap_version', 'phonegap:phonegap_version'
  )

  payload.addVariables(
    data.keys, 'android-key:android', 'windows-key:windows', 'ios-key:ios', 'winphone-key:winphone'
  )

  data.ignore = pgb.opts.variables.ignore || []

  return data
}
