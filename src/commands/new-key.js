const has = require('./helpers/validators')
const payload = require('./helpers/payload')
const unlockKey = require('./helpers/unlock-key')
const merge = require('../util/misc').merge
const complete = require('./helpers/complete')

module.exports = () => {
  let data = { data: {} }

  has.args(1)
  has.signed_in()
  let platform = has.key_platform(pgb.opts.commands[1], true)

  const validateVariables = () => {
    if (platform === 'android') return android()
    else if (platform === 'windows') return windows()
    else if (platform === 'ios') return ios()
    else return winphone()
  }

  const android = () => {
    has.variables('title', 'alias', 'key')
    payload.addFiles(data, 'key:keystore')
    payload.addVariables(data.data, 'title', 'alias', 'default')
  }

  const windows = () => {
    has.variables('title', 'key')
    payload.addFiles(data, 'key:keystore')
    payload.addVariables(data.data, 'title', 'default')
  }

  const ios = () => {
    has.variables('title', 'key', 'profile')
    payload.addFiles(data, 'key:cert', 'profile')
    payload.addVariables(data.data, 'title', 'default')
  }

  const winphone = () => {
    has.variables('title', 'publisher_id')
    if (!pgb.opts.variables.publisher_id.match(/[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}/)) {
      throw new Error('invalid publisher id')
    }
    payload.addVariables(data.data, 'title', 'publisher_id', 'default')
  }

  validateVariables()

  let unlock = Promise.resolve()
  if (!pgb.opts.nounlock && platform !== 'winphone') {
    unlock = unlockKey(platform)
      .then(passwords => { data.data = merge(passwords, data.data) })
  }

  return unlock
    .then(() => pgb.api.addKey(platform, data))
    .then(key => pgb.print({
      pretty: `${pgb.colours.bold(platform)} key ${pgb.colours.bold(key.id)} added`,
      json: key,
      bare: key.id
    }))
}

module.exports.completion = () => complete.platform(true)
